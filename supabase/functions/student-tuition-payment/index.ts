import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TuitionPaymentSchema = z.object({
  student_id: z.string().uuid(),
  amount: z.number().positive().max(100000000), // 100M FCFA max
  parent_email: z.string().email().max(254),
  parent_name: z.string().min(1).max(100),
  phone_number: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
  callback_url: z.string().url().max(500).optional()
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

    const body = await req.json();
    
    // Validate input with Zod
    let validated;
    try {
      validated = TuitionPaymentSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

    const { student_id, amount, parent_email, parent_name, phone_number, callback_url } = validated;

    // Fetch student information
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, tuition_fee, amount_paid, classroom_id, school_id, parent_email')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is admin of the student's school OR the parent of this student
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: caller.id, _role: 'admin'
    });
    const callerEmail = (caller.email || '').toLowerCase();
    const studentParentEmail = (student.parent_email || '').toLowerCase();
    let allowed = false;
    if (isAdmin) {
      const { data: callerProfile } = await supabase
        .from('profiles').select('school_id').eq('user_id', caller.id).maybeSingle();
      allowed = callerProfile?.school_id === student.school_id;
    }
    if (!allowed && callerEmail && callerEmail === studentParentEmail) {
      allowed = true;
    }
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize payment with Paystack
    const amountInKobo = Math.round(amount * 100);
    
    const paymentBody: any = {
      email: parent_email,
      amount: amountInKobo,
      currency: 'XOF',
      callback_url: callback_url || `${req.headers.get('origin')}/parent-portal?payment=success`,
      metadata: {
        student_id: student_id,
        student_name: `${student.first_name} ${student.last_name}`,
        parent_name: parent_name,
        payment_type: 'tuition_fee',
        custom_fields: [
          {
            display_name: "Type de paiement",
            variable_name: "payment_type",
            value: "Frais de scolarité"
          },
          {
            display_name: "Élève",
            variable_name: "student_name",
            value: `${student.first_name} ${student.last_name}`
          },
          {
            display_name: "Parent",
            variable_name: "parent_name",
            value: parent_name
          }
        ]
      }
    };

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

    console.log('Tuition payment initialized:', paystackData.data.reference);

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        student: {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`
        }
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
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
