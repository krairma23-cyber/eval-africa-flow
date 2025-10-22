import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TuitionPaymentRequest {
  student_id: string;
  amount: number;
  parent_email: string;
  parent_name: string;
  phone_number?: string;
  callback_url?: string;
}

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

    const { student_id, amount, parent_email, parent_name, phone_number, callback_url } = 
      await req.json() as TuitionPaymentRequest;

    // Validate input
    if (!student_id || !amount || !parent_email || !parent_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_id, amount, parent_email, parent_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch student information
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, tuition_fee, amount_paid, classroom_id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
