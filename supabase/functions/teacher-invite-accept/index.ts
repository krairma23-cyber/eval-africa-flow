import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Token = z.string().min(20).max(100).regex(/^[A-Za-z0-9_-]+$/);
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("preview"), token: Token }),
  z.object({ action: z.literal("signup"), token: Token, password: z.string().min(8).max(72) }),
  z.object({ action: z.literal("join"), token: Token }),
]);

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function attach(admin: SupabaseClient, userId: string, inv: any, setActive: boolean) {
  await admin.from("school_memberships").upsert(
    { user_id: userId, school_id: inv.school_id, role: "teacher" }, { onConflict: "user_id,school_id" });
  await admin.from("user_roles").upsert({ user_id: userId, role: "teacher" }, { onConflict: "user_id,role" });
  const { data: profile } = await admin.from("profiles").select("school_id").eq("user_id", userId).maybeSingle();
  if (!profile) {
    await admin.from("profiles").insert({ user_id: userId, first_name: inv.first_name, last_name: inv.last_name, school_id: inv.school_id });
  } else if (setActive || !profile.school_id) {
    await admin.from("profiles").update({ school_id: inv.school_id }).eq("user_id", userId);
  }
  const { data: existingTeacher } = await admin.from("teachers").select("id")
    .eq("school_id", inv.school_id).or(`user_id.eq.${userId},email.eq.${inv.email}`).maybeSingle();
  if (existingTeacher) {
    await admin.from("teachers").update({ user_id: userId }).eq("id", existingTeacher.id);
  } else {
    await admin.from("teachers").insert({
      school_id: inv.school_id, user_id: userId, email: inv.email,
      first_name: inv.first_name, last_name: inv.last_name,
      teacher_number: `ENS-${Date.now().toString(36).toUpperCase()}`,
      hire_date: new Date().toISOString().slice(0, 10),
    });
  }
  await admin.from("teacher_invitations").update({ status: "accepted", accepted_at: new Date().toISOString(), accepted_by: userId }).eq("id", inv.id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Lien invalide" }, 400);
    const body = parsed.data;

    const { data: inv } = await admin.from("teacher_invitations")
      .select("id,school_id,email,first_name,last_name,status,expires_at,schools(name)")
      .eq("token_hash", await sha256(body.token)).maybeSingle();
    if (!inv) return json({ error: "Invitation introuvable" }, 404);
    if (inv.status === "pending" && new Date(inv.expires_at) < new Date()) {
      await admin.from("teacher_invitations").update({ status: "expired" }).eq("id", inv.id);
      inv.status = "expired";
    }
    if (inv.status !== "pending") return json({ error: `Invitation ${inv.status === "accepted" ? "déjà utilisée" : inv.status === "expired" ? "expirée" : "annulée"}`, status: inv.status }, 410);

    // @ts-ignore joined relation
    const schoolName = inv.schools?.name ?? "";

    if (body.action === "preview") {
      let hasAccount = false;
      for (let page = 1; page <= 20 && !hasAccount; page++) {
        const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (!data?.users?.length) break;
        hasAccount = data.users.some((u) => u.email?.toLowerCase() === inv.email);
        if (data.users.length < 1000) break;
      }
      return json({ school_name: schoolName, email: inv.email, first_name: inv.first_name, last_name: inv.last_name, has_account: hasAccount });
    }

    if (body.action === "signup") {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: inv.email, password: body.password, email_confirm: true,
        user_metadata: { first_name: inv.first_name, last_name: inv.last_name, full_name: `${inv.first_name} ${inv.last_name}` },
      });
      if (error || !created.user) {
        if (error?.message?.toLowerCase().includes("already")) return json({ error: "Un compte existe déjà avec cet email. Connectez-vous.", has_account: true }, 409);
        throw error;
      }
      // handle_new_user created a profile with no school & role 'user'; attach now
      await attach(admin, created.user.id, inv, true);
      await admin.from("profiles").update({ onboarding_completed: true }).eq("user_id", created.user.id);
      return json({ success: true, email: inv.email });
    }

    // join (existing account)
    const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Connexion requise" }, 401);
    if (user.email?.toLowerCase() !== inv.email) return json({ error: `Cette invitation est destinée à ${inv.email}. Connectez-vous avec cette adresse.` }, 403);
    await attach(admin, user.id, inv, true);
    return json({ success: true, school_name: schoolName });
  } catch (e) {
    console.error("teacher-invite-accept error", e instanceof Error ? e.message : e);
    return json({ error: "Erreur serveur" }, 500);
  }
});
