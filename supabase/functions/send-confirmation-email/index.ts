import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailData {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify hook secret for security — fail closed if secret is missing
  const hookSecret = req.headers.get('x-webhook-secret');
  const expectedSecret = Deno.env.get('SUPABASE_AUTH_HOOK_SECRET');

  if (!expectedSecret) {
    console.error("[send-confirmation-email] SUPABASE_AUTH_HOOK_SECRET not configured");
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (hookSecret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload: ConfirmationEmailData = await req.json();
    console.log("Email type:", payload.email_data.email_action_type);

    const { user, email_data } = payload;
    const confirmationLink = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    let subject = "Confirmez votre inscription à EvalScol";
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 EvalScol Africa</h1>
            </div>
            <div class="content">
              <h2>Bienvenue sur EvalScol !</h2>
              <p>Merci de vous être inscrit sur notre plateforme de gestion scolaire.</p>
              <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center;">
                <a href="${confirmationLink}" class="button">
                  ✅ Confirmer mon compte
                </a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <span style="color: #667eea; word-break: break-all;">${confirmationLink}</span>
              </p>
              <p style="color: #888; font-size: 12px; margin-top: 30px;">
                Si vous n'avez pas créé de compte sur EvalScol, vous pouvez ignorer cet email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EvalScol Africa - Plateforme de gestion scolaire</p>
              <p>📞 Support: +225 0101821329 / 0707041903 | 📧 evalscolafrica@siteteck.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Modify for password reset
    if (email_data.email_action_type === "recovery") {
      subject = "Réinitialisation de votre mot de passe - EvalScol";
      html = html.replace(
        "Bienvenue sur EvalScol !",
        "Réinitialisation de mot de passe"
      );
      html = html.replace(
        "Merci de vous être inscrit sur notre plateforme de gestion scolaire.",
        "Vous avez demandé à réinitialiser votre mot de passe."
      );
      html = html.replace(
        "Pour activer votre compte",
        "Pour réinitialiser votre mot de passe"
      );
      html = html.replace(
        "✅ Confirmer mon compte",
        "🔑 Réinitialiser mon mot de passe"
      );
    }

    console.log("Sending email to:", user.email);

    const { data, error } = await resend.emails.send({
      from: "EvalScol <onboarding@resend.dev>",
      to: [user.email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("✅ Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
