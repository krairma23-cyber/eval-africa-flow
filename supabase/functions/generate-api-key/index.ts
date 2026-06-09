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
    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Require admin role (matches RLS on api_keys)
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id, _role: 'admin'
    });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's school_id from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('school_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.school_id) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found or no school associated' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check how many keys created in last hour
    const { data: recentKeys, error: rateLimitError } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (recentKeys && recentKeys.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 keys per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check total keys for school (max 20)
    const { data: schoolKeys, error: schoolKeysError } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('is_active', true);

    if (schoolKeysError) {
      console.error('School keys check error:', schoolKeysError);
    } else if (schoolKeys && schoolKeys.length >= 20) {
      return new Response(
        JSON.stringify({ error: 'Maximum API keys limit reached for your school (20).' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { name } = await req.json();
    if (!name || name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Key name is required (min 3 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure API key
    const timestamp = Date.now();
    const randomPart = crypto.randomUUID().replace(/-/g, '');
    const fullKey = `eval_sk_${randomPart}_${timestamp}`;
    const keyPrefix = `eval_sk_${randomPart.substring(0, 8)}`;

    // Hash the key for storage (using Web Crypto API)
    const encoder = new TextEncoder();
    const data = encoder.encode(fullKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: newKey, error: insertError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        name: name.trim(),
        user_id: user.id,
        school_id: profile.school_id,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log to comprehensive audit
    await supabaseAdmin.from('comprehensive_audit_logs').insert({
      user_id: user.id,
      action: 'API_KEY_GENERATED',
      resource_type: 'api_keys',
      resource_id: newKey.id,
      request_data: { name: name.trim(), school_id: profile.school_id },
      response_data: { key_id: newKey.id, key_prefix: keyPrefix },
      success: true,
    });


    // Return the full key ONCE (it won't be retrievable later)
    return new Response(
      JSON.stringify({ 
        key: fullKey,
        key_id: newKey.id,
        name: newKey.name,
        key_prefix: keyPrefix,
        message: 'Save this key securely. It will not be shown again.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});