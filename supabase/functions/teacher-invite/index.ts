import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { Resend } from "npm:resend@4.0.0";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    email: z.string().trim().email().max(255),
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    origin: z.string().url().max(200),
  }),
  z.object({ action: z.literal("resend"), invitation_id: z.string().uuid(), origin: z.string().url().max(200) }),
  z.object({ action: z.literal("revoke"), invitation_id: z.string().uuid() }),
]);

const ALLOWED_ORIGINS = [
  "https://evalscolafrica.siteteck.com",
  "https://evalscol-africa.lovable.app",
];
function safeOrigin(o: string) {
  if (ALLOWED_ORIGINS.includes(o) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(o) || /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(o) || o.startsWith("http://localhost")) return o;
  return ALLOWED_ORIGINS[0];
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function newToken() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

async function sendEmail(to: string, firstName: string, schoolName: string, link: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const { error } = await new Resend(key).emails.send({
    from: "EvalScol Africa <evalscolafrica@siteteck.com>",
    to: [to],
    subject: `Invitation à rejoindre ${schoolName} sur EvalScol Africa`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
      <h2>Bonjour ${esc(firstName)},</h2>
      <p>L'établissement <strong>${esc(schoolName)}</strong> vous invite à rejoindre son espace enseignant sur EvalScol Africa.</p>
      <p style="text-align:center;margin:32px 0"><a href="${link}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Accepter l'invitation</a></p>
      <p>Ce lien est personnel et valable 7 jours.</p>
      <p style="font-size:12px;color:#666">Si le bouton ne fonctionne pas, copiez ce lien : ${link}</p></div>`,
  });
  return !error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json({ error: "Non autorisé" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Données invalides", details: parsed.error.flatten().fieldErrors }, 400);
    const body = parsed.data;

    const { data: profile } = await admin.from("profiles").select("school_id").eq("user_id", user.id).maybeSingle();
    const schoolId = profile?.school_id;
    if (!schoolId) return json({ error: "Aucune école associée" }, 403);
    const { data: isAdmin } = await admin.rpc("is_school_admin", { p_school_id: schoolId, p_user_id: user.id });
    if (!isAdmin) return json({ error: "Réservé aux administrateurs" }, 403);
    const { data: school } = await admin.from("schools").select("name").eq("id", schoolId).single();
    const schoolName = school?.name ?? "votre école";

    if (body.action === "revoke") {
      const { error } = await admin.from("teacher_invitations").update({ status: "revoked" })
        .eq("id", body.invitation_id).eq("school_id", schoolId).eq("status", "pending");
      if (error) throw error;
      return json({ success: true });
    }

    const raw = newToken();
    const hash = await sha256(raw);
    const expires = new Date(Date.now() + 7 * 864e5).toISOString();
    let inv: { id: string; email: string; first_name: string };

    if (body.action === "create") {
      const email = body.email.toLowerCase();
      await admin.from("teacher_invitations").update({ status: "revoked" })
        .eq("school_id", schoolId).eq("email", email).eq("status", "pending");
      const { data, error } = await admin.from("teacher_invitations").insert({
        school_id: schoolId, email, first_name: body.first_name, last_name: body.last_name,
        token_hash: hash, invited_by: user.id, expires_at: expires,
      }).select("id,email,first_name").single();
      if (error) throw error;
      inv = data;
    } else {
      const { data, error } = await admin.from("teacher_invitations")
        .update({ token_hash: hash, expires_at: expires, status: "pending" })
        .eq("id", body.invitation_id).eq("school_id", schoolId).in("status", ["pending", "expired"])
        .select("id,email,first_name").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Invitation introuvable ou déjà utilisée" }, 404);
      inv = data;
    }

    const link = `${safeOrigin(body.origin)}/invitation/${raw}`;
    const emailSent = await sendEmail(inv.email, inv.first_name, schoolName, link);
    return json({ success: true, invitation_id: inv.id, link, email_sent: emailSent });
  } catch (e) {
    console.error("teacher-invite error", e instanceof Error ? e.message : e);
    return json({ error: "Erreur serveur" }, 500);
  }
});
