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

    const { payment_reference, plan_id, user_id, billing_period } = await req.json();

    console.log('Activating subscription:', { user_id, plan_id, payment_reference, billing_period });

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

    console.log('Expected amount:', expectedAmount, 'XOF');

    // If it's a paid plan, verify payment with Paystack
    if (expectedAmount > 0 && payment_reference) {
      console.log('Verifying payment with Paystack:', payment_reference);
      
      const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      if (!paystackSecretKey) {
        console.error('PAYSTACK_SECRET_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'Payment system not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paystackVerification = await fetch(
        `https://api.paystack.co/transaction/verify/${payment_reference}`,
        {
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`
          }
        }
      );

      const paymentData = await paystackVerification.json();
      console.log('Paystack verification response:', paymentData);

    // CRITICAL: Verify payment was successful
    if (!paymentData.status || paymentData.data?.status !== 'success') {
      console.error('Payment not verified:', paymentData);
      return new Response(
        JSON.stringify({ error: 'Payment not verified', details: paymentData }),
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
        JSON.stringify({ 
          error: 'Amount mismatch', 
          expected: expectedAmount, 
          received: paymentData.data.amount / 100
        }),
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
        payment_reference: payment_reference || null,
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
        JSON.stringify({ error: 'Failed to activate subscription', details: subscriptionError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription activated successfully:', subscription);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription,
        message: 'Subscription activated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in activate-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
