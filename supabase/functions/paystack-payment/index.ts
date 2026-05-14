import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PaymentSchema = z.object({
  email: z.string().email().max(254),
  amount: z.number().positive().max(100000000), // 100M FCFA max
  planId: z.string().uuid(),
  planName: z.string().min(1).max(100),
  phone_number: z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid phone number format").optional(),
  callback_url: z.string().url().max(500).optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const body = await req.json();
    
    // Validate input with Zod
    let validated;
    try {
      validated = PaymentSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.issues);
        return new Response(
          JSON.stringify({ 
            error: 'Validation failed', 
            issues: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    const { email, amount, planId, planName, phone_number, callback_url } = validated;

    // Initialize payment with Paystack
    // For XOF (West African CFA franc), Paystack expects amounts in kobo (minor units)
    // 1 FCFA = 100 kobo, so multiply by 100
    const amountInKobo = Math.round(amount * 100);
    
    const paymentBody: any = {
      email,
      amount: amountInKobo,
      currency: 'XOF',
      callback_url: callback_url || `${req.headers.get('origin')}/billing?payment=success`,
      channels: ['card', 'mobile_money'], // Enable cards and mobile money (Orange, MTN, Moov)
      metadata: {
        plan_id: planId,
        plan_name: planName,
        custom_fields: [
          {
            display_name: "Plan",
            variable_name: "plan_name",
            value: planName
          }
        ]
      }
    };

    // Add phone number if provided (not stored, only for this transaction)
    if (phone_number) {
      paymentBody.metadata.phone_last_4 = phone_number.slice(-4);
    }
    
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody)
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack error:', paystackData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment initialization failed', 
          details: paystackData.message 
        }),
        { status: paystackResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment initialized successfully:', paystackData.data.reference);

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
