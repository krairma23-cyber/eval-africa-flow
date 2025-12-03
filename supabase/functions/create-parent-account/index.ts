import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateParentRequest {
  student_id: string;
  parent_name: string;
  parent_email: string;
  student_name: string;
  school_name: string;
  school_id: string;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify caller is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateParentRequest = await req.json();
    const { student_id, parent_name, parent_email, student_name, school_name, school_id } = body;

    // Validate required fields
    if (!student_id || !parent_email || !student_name) {
      return new Response(
        JSON.stringify({ error: "Données manquantes: student_id, parent_email, et student_name sont requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === parent_email);

    let parentUserId: string;
    let tempPassword: string | null = null;
    let isNewUser = false;

    if (existingUser) {
      parentUserId = existingUser.id;
      console.log("Parent account already exists:", parentUserId);
    } else {
      // Generate temporary password
      tempPassword = generatePassword();
      isNewUser = true;

      // Create parent user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: parent_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: parent_name || `Parent de ${student_name}`,
          user_type: "parent",
        }
      });

      if (createError) {
        console.error("Error creating parent user:", createError);
        return new Response(
          JSON.stringify({ error: `Impossible de créer le compte parent: ${createError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      parentUserId = newUser.user.id;
      console.log("Created parent user:", parentUserId);

      // Create parent profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: parentUserId,
          user_id: parentUserId,
          full_name: parent_name || `Parent de ${student_name}`,
          user_type: "parent",
          school_id: school_id,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Assign parent role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: parentUserId,
          role: "parent",
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
      }
    }

    // Update student with parent_user_id if column exists
    const { error: updateStudentError } = await supabaseAdmin
      .from("students")
      .update({ parent_user_id: parentUserId })
      .eq("id", student_id);

    if (updateStudentError) {
      console.log("Note: Could not update student with parent_user_id:", updateStudentError.message);
    }

    // Send welcome email with credentials if new user
    if (isNewUser && tempPassword && resend) {
      const portalUrl = `${req.headers.get("origin") || "https://evalscol.com"}/parent`;
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .credentials { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; padding: 20px; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 EvalScol Africa</h1>
                <p style="margin: 0; opacity: 0.9;">Portail Parent</p>
              </div>
              <div class="content">
                <h2>Bienvenue sur le Portail Parent !</h2>
                <p>Cher(e) <strong>${parent_name || "Parent"}</strong>,</p>
                <p>L'école <strong>${school_name || "votre école"}</strong> vous donne accès au portail parent EvalScol pour suivre la scolarité de <strong>${student_name}</strong>.</p>
                
                <div class="credentials">
                  <h3 style="margin-top: 0;">📋 Vos identifiants de connexion</h3>
                  <p><strong>Email :</strong> ${parent_email}</p>
                  <p><strong>Mot de passe temporaire :</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${tempPassword}</code></p>
                </div>

                <div style="text-align: center;">
                  <a href="${portalUrl}" class="button">
                    🔑 Accéder au Portail Parent
                  </a>
                </div>

                <div class="warning">
                  <strong>⚠️ Important :</strong> Pour votre sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.
                </div>

                <h3>Que pouvez-vous faire sur le portail ?</h3>
                <ul>
                  <li>📊 Consulter les notes et bulletins</li>
                  <li>📅 Voir l'emploi du temps</li>
                  <li>📝 Suivre les absences</li>
                  <li>💳 Payer les frais de scolarité en ligne</li>
                  <li>📱 Recevoir des notifications importantes</li>
                </ul>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} EvalScol Africa - Plateforme de gestion scolaire</p>
                <p>📞 Support: +225 0707041904 | 📧 support@evalscol.com</p>
                <p style="font-size: 11px; color: #999;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        const { error: emailError } = await resend.emails.send({
          from: "EvalScol <onboarding@resend.dev>",
          to: [parent_email],
          subject: `🎓 Accès Portail Parent - ${student_name} - ${school_name || "EvalScol"}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error("Error sending email:", emailError);
        } else {
          console.log("Welcome email sent to:", parent_email);
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        parent_user_id: parentUserId,
        is_new_user: isNewUser,
        email_sent: isNewUser && !!tempPassword,
        message: isNewUser 
          ? "Compte parent créé et email envoyé avec les identifiants" 
          : "Parent déjà inscrit, liaison avec l'élève effectuée"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in create-parent-account:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
