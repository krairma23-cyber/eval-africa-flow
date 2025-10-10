import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  email: string;
  amount: number;
  planId: string;
  planName: string;
  callback_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const { email, amount, planId, planName, callback_url } = await req.json() as PaymentRequest;

    // Validate input
    if (!email || !amount || !planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, amount, planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize payment with Paystack
    // For XOF (West African CFA franc), Paystack expects amounts in kobo (minor units)
    // 1 FCFA = 100 kobo, so multiply by 100
    const amountInKobo = Math.round(amount * 100);
    
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency: 'XOF', // West African CFA franc
        callback_url: callback_url || `${req.headers.get('origin')}/billing?payment=success`,
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
      })
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
