import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VerifySchema = z.object({
  reference: z.string()
    .min(10, "Reference too short")
    .max(100, "Reference too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid reference format"),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    let validated;
    try {
      const body = await req.json();
      validated = VerifySchema.parse(body);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: validationError instanceof z.ZodError
            ? validationError.errors.map(e => e.message).join(', ')
            : 'Validation failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference } = validated;

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${paystackSecretKey}` },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('[paystack-verify] Verification failed');
      return new Response(
        JSON.stringify({
          error: 'Payment verification failed',
          details: paystackData.message,
        }),
        { status: paystackResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paystackData.data.status,
        amount: paystackData.data.amount / 100,
        customer: paystackData.data.customer,
        metadata: paystackData.data.metadata,
        paid_at: paystackData.data.paid_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[paystack-verify] Internal error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
