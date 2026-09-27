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

    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

    // Idempotency is enforced atomically by apply_tuition_payment (UNIQUE payment_reference)

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
    const metadata = paymentData.metadata || {};
    // SECURITY: only accept tuition payments in XOF bound to a student
    if (paymentData.currency !== 'XOF' || metadata.payment_type !== 'tuition_fee' || !metadata.student_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment metadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const studentId = metadata.student_id;
    const amount = paymentData.amount / 100; // Convert from kobo to FCFA

    // Fetch current student payment info
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('tuition_fee, amount_paid, payment_status, school_id, parent_email')
      .eq('id', studentId)
      .single();

    if (fetchError || !student) {
      throw new Error('Student not found');
    }

    // Authorization: caller must be school admin of student's school OR the parent on record
    const { data: callerProfile } = await supabase
      .from('profiles').select('school_id').eq('user_id', caller.id).maybeSingle();
    const { data: isAdminData } = await supabase.rpc('has_role', {
      _user_id: caller.id, _role: 'admin'
    });
    const callerEmail = (caller.email || '').toLowerCase();
    const studentParentEmail = (student.parent_email || '').toLowerCase();
    const isAuthorized =
      (isAdminData === true && callerProfile?.school_id === student.school_id) ||
      (!!callerEmail && !!studentParentEmail && callerEmail === studentParentEmail);

    if (!isAuthorized) {
      console.error('[process-tuition-payment] Unauthorized caller for student', { caller: caller.id, studentId });
      return new Response(
        JSON.stringify({ error: 'Forbidden: not authorized for this student' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: atomic apply (insert transaction first => replay fails on UNIQUE, then SQL increment)
    const { data: applied, error: applyErr } = await supabase.rpc('apply_tuition_payment', {
      p_reference: reference,
      p_student_id: studentId,
      p_amount: amount,
      p_paid_at: paymentData.paid_at,
      p_parent_email: paymentData.customer?.email || '',
      p_parent_name: metadata.parent_name || 'Unknown',
      p_metadata: metadata,
    });

    if (applyErr) {
      const dup = (applyErr as any).code === '23505';
      console.error('[process-tuition-payment] apply_tuition_payment failed:', applyErr.message);
      return new Response(
        JSON.stringify({ error: dup ? 'Payment reference already processed' : 'Failed to apply payment' }),
        { status: dup ? 409 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const row = Array.isArray(applied) ? applied[0] : applied;
    const newAmountPaid = Number(row?.new_total ?? 0);
    const tuitionFee = Number(row?.tuition ?? student.tuition_fee ?? 0);

    return new Response(
      JSON.stringify({
        success: true,
        student_id: studentId,
        amount_paid: amount,
        new_total_paid: newAmountPaid,
        payment_status: row?.new_status,
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
