import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for payment reference
const ProcessPaymentSchema = z.object({
  reference: z.string()
    .min(10, "Reference too short")
    .max(100, "Reference too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid reference format")
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!paystackSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate input with Zod
    let validated;
    try {
      const body = await req.json();
      validated = ProcessPaymentSchema.parse(body);
    } catch (validationError) {
      console.error('[process-tuition-payment] Validation error:', validationError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: validationError instanceof z.ZodError 
            ? validationError.errors.map(e => e.message).join(', ')
            : 'Validation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference } = validated;

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        }
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || paystackData.data.status !== 'success') {
      console.error('[process-tuition-payment] Payment verification failed:', paystackData.message);
      return new Response(
        JSON.stringify({ 
          error: 'Payment verification failed', 
          details: paystackData.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = paystackData.data;
    const metadata = paymentData.metadata;
    const studentId = metadata.student_id;
    const amount = paymentData.amount / 100; // Convert from kobo to FCFA

    // Fetch current student payment info
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('tuition_fee, amount_paid, payment_status')
      .eq('id', studentId)
      .single();

    if (fetchError || !student) {
      throw new Error('Student not found');
    }

    // Calculate new amount paid
    const currentAmountPaid = student.amount_paid || 0;
    const newAmountPaid = currentAmountPaid + amount;
    const tuitionFee = student.tuition_fee || 0;

    // Determine new payment status
    let newPaymentStatus = 'unpaid';
    if (newAmountPaid >= tuitionFee && tuitionFee > 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partial';
    }

    // Update student payment record
    const { error: updateError } = await supabase
      .from('students')
      .update({
        amount_paid: newAmountPaid,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (updateError) {
      throw new Error(`Failed to update student payment: ${updateError.message}`);
    }

    // Create payment transaction record
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        student_id: studentId,
        amount: amount,
        payment_reference: reference,
        payment_method: 'mobile_money',
        payment_date: paymentData.paid_at,
        parent_email: paymentData.customer.email,
        parent_name: metadata.parent_name,
        status: 'completed',
        metadata: metadata
      });

    if (transactionError) {
      console.error('[process-tuition-payment] Failed to create transaction record:', transactionError.message);
      // Don't fail the whole operation if transaction logging fails
    }

    console.log(`[process-tuition-payment] Tuition payment processed for student ${studentId}: ${amount} FCFA`);

    return new Response(
      JSON.stringify({
        success: true,
        student_id: studentId,
        amount_paid: amount,
        new_total_paid: newAmountPaid,
        payment_status: newPaymentStatus,
        remaining_balance: Math.max(0, tuitionFee - newAmountPaid),
        receipt_url: paymentData.receipt_url || null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[process-tuition-payment] Error processing tuition payment:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'An error occurred while processing the payment'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
