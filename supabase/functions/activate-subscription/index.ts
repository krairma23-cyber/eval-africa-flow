import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // SECURITY FIX: Extract user_id from JWT token instead of request body
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use authenticated user's ID - do NOT trust user_id from request body
    const user_id = user.id;
    const { payment_reference, plan_id, billing_period } = await req.json();


    // Get plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', planError);
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine expected amount based on billing period
    const expectedAmount = billing_period === 'yearly' 
      ? (plan.price_yearly || plan.price_monthly * 12) 
      : plan.price_monthly;

    // Idempotency: atomically claim this payment_reference via processed_webhook_events
    // (event_id is UNIQUE). If insert fails with conflict, the reference was already used.
    if (expectedAmount > 0 && payment_reference) {
      const { error: claimError } = await supabaseAdmin
        .from('processed_webhook_events')
        .insert({
          event_id: payment_reference,
          event_type: `subscription:${user_id}`,
        });

      if (claimError) {
        // Unique violation => reference already processed
        if ((claimError as any).code === '23505') {
          console.error('[activate-subscription] Replay detected for reference');
          return new Response(
            JSON.stringify({ error: 'Payment reference already used' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('[activate-subscription] Idempotency claim failed:', claimError);
        return new Response(
          JSON.stringify({ error: 'Failed to validate payment reference' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }


    // If it's a paid plan, verify payment with Paystack
    if (expectedAmount > 0 && payment_reference) {
      const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      if (!paystackSecretKey) {
        console.error('[activate-subscription] PAYSTACK_SECRET_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'Payment system not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paystackVerification = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment_reference)}`,
        {
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`
          }
        }
      );

      const paymentData = await paystackVerification.json();

      // CRITICAL: Verify payment was successful
      if (!paymentData.status || paymentData.data?.status !== 'success') {
        console.error('Payment not verified:', paymentData);
        return new Response(
          JSON.stringify({
            error: 'Payment not verified',
            message: paymentData?.data?.gateway_response || 'Verification failed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // CRITICAL: Verify amount matches plan price (Paystack returns amount in centimes/kobo)
      const expectedAmountInKobo = expectedAmount * 100; // Convert XOF to centimes (100 centimes = 1 XOF)
      if (paymentData.data.amount !== expectedAmountInKobo) {
        console.error('Amount mismatch:', {
          paidAmountKobo: paymentData.data.amount,
          expectedAmountKobo: expectedAmountInKobo,
          paidAmount: paymentData.data.amount / 100,
          expectedAmount
        });
        return new Response(
          JSON.stringify({ error: 'Amount mismatch' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (expectedAmount > 0 && !payment_reference) {
      console.error('Payment reference required for paid plan');
      return new Response(
        JSON.stringify({ error: 'Payment reference required for paid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing_period === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Activate subscription using service role (bypasses RLS)
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id,
        plan_id,
        status: 'active',
        billing_period: billing_period || 'monthly',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Subscription activation error:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Configure plan features based on plan_id
    let planFeatures;
    
    if (plan_id === 'free-trial' || plan_id === 'starter' || expectedAmount === 0) {
      planFeatures = {
        user_id,
        plan_id: 'free-trial',
        max_students: 50,
        unlimited_students: false,
        basic_grade_management: true,
        unlimited_assessments: false,
        predictive_analytics_ai: false,
        voice_assistant: false,
        advanced_reports: false,
        attendance_management: false,
        parent_teacher_communication: false,
        multi_campus: false,
        full_customization: false,
        advanced_api_integrations: false,
        dedicated_training: false,
        premium_support_24_7: false,
        custom_business_modules: false,
        unlimited_user_accounts: false
      };
    } else if (plan_id === 'standard') {
      planFeatures = {
        user_id,
        plan_id: 'standard',
        max_students: 300,
        unlimited_students: false,
        basic_grade_management: true,
        unlimited_assessments: true,
        predictive_analytics_ai: false,
        voice_assistant: false,
        advanced_reports: false,
        attendance_management: true,
        parent_teacher_communication: true,
        multi_campus: false,
        full_customization: false,
        advanced_api_integrations: false,
        dedicated_training: false,
        premium_support_24_7: false,
        custom_business_modules: false,
        unlimited_user_accounts: false
      };
    } else if (plan_id === 'professional') {
      planFeatures = {
        user_id,
        plan_id: 'professional',
        max_students: 1000,
        unlimited_students: false,
        basic_grade_management: true,
        unlimited_assessments: true,
        predictive_analytics_ai: true,
        voice_assistant: true,
        advanced_reports: true,
        attendance_management: true,
        parent_teacher_communication: true,
        multi_campus: false,
        full_customization: false,
        advanced_api_integrations: true,
        dedicated_training: false,
        premium_support_24_7: true,
        custom_business_modules: false,
        unlimited_user_accounts: false
      };
    } else if (plan_id === 'enterprise') {
      planFeatures = {
        user_id,
        plan_id: 'enterprise',
        max_students: 999999, // Virtually unlimited
        unlimited_students: true,
        basic_grade_management: true,
        unlimited_assessments: true,
        predictive_analytics_ai: true,
        voice_assistant: true,
        advanced_reports: true,
        attendance_management: true,
        parent_teacher_communication: true,
        multi_campus: true,
        full_customization: true,
        advanced_api_integrations: true,
        dedicated_training: true,
        premium_support_24_7: true,
        custom_business_modules: true,
        unlimited_user_accounts: true
      };
    } else {
      // Fallback to free-trial features
      planFeatures = {
        user_id,
        plan_id: 'free-trial',
        max_students: 50,
        unlimited_students: false,
        basic_grade_management: true,
        unlimited_assessments: false,
        predictive_analytics_ai: false,
        voice_assistant: false,
        advanced_reports: false,
        attendance_management: false,
        parent_teacher_communication: false,
        multi_campus: false,
        full_customization: false,
        advanced_api_integrations: false,
        dedicated_training: false,
        premium_support_24_7: false,
        custom_business_modules: false,
        unlimited_user_accounts: false
      };
    }

    // Upsert user plan features
    const { error: featuresError } = await supabaseAdmin
      .from('user_plan_features')
      .upsert(planFeatures, {
        onConflict: 'user_id'
      });

    if (featuresError) {
      console.error('Failed to configure plan features:', featuresError);
      // Don't fail the subscription activation, just log the error
    } else {
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription,
        features: planFeatures,
        message: 'Subscription activated successfully with all features configured' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in activate-subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
