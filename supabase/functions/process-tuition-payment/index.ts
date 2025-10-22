import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        }
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || paystackData.data.status !== 'success') {
      console.error('Payment verification failed:', paystackData);
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
      console.error('Failed to create transaction record:', transactionError);
      // Don't fail the whole operation if transaction logging fails
    }

    console.log(`Tuition payment processed for student ${studentId}: ${amount} FCFA`);

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
    console.error('Error processing tuition payment:', error);
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
