import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { Resend } from "npm:resend@4.0.0";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("report_card"),
    student_id: z.string().uuid(),
    term_id: z.string().uuid(),
    average: z.number().min(0).max(20),
    rank: z.number().int().min(1).max(10000).optional(),
    total: z.number().int().min(1).max(10000).optional(),
  }),
  z.object({ action: z.literal("absence"), student_id: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  z.object({ action: z.literal("fee_reminder"), student_ids: z.array(z.string().uuid()).min(1).max(500) }),
]);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

function layout(schoolName: string, parentName: string | null, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1f2937">
    <h2 style="color:#0f2a5c">${esc(schoolName)}</h2>
    <p>Bonjour ${esc(parentName || "cher parent")},</p>
    ${body}
    <p style="margin-top:28px">Cordialement,<br/>L'administration de ${esc(schoolName)}</p>
    <p style="font-size:12px;color:#6b7280">Message envoyé via EvalScol Africa. Pour toute question, contactez directement l'établissement.</p></div>`;
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
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const roleSet = new Set((roles ?? []).map((r) => r.role));
    const isAdmin = roleSet.has("admin") || roleSet.has("super_admin");
    if (!isAdmin && !roleSet.has("teacher")) return json({ error: "Accès réservé au personnel" }, 403);
    if (body.action === "fee_reminder" && !isAdmin) return json({ error: "Réservé aux administrateurs" }, 403);

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "Service email non configuré" }, 500);
    const resend = new Resend(key);
    const { data: school } = await admin.from("schools").select("name").eq("id", schoolId).single();
    const schoolName = school?.name ?? "Votre école";

    const send = async (to: string, subject: string, html: string) => {
      const { error } = await resend.emails.send({ from: "EvalScol Africa <support@siteteck.com>", to: [to], subject, html });
      if (error) console.error("resend error", error);
      return !error;
    };

    const ids = body.action === "fee_reminder" ? body.student_ids : [body.student_id];
    const { data: students, error: sErr } = await admin.from("students")
      .select("id, first_name, last_name, parent_name, parent_email, tuition_fee, amount_paid, payment_status, payment_due_date")
      .in("id", ids).eq("school_id", schoolId);
    if (sErr) throw sErr;
    if (!students?.length) return json({ error: "Élève introuvable" }, 404);

    if (body.action === "fee_reminder") {
      let sent = 0, skipped = 0;
      for (const s of students) {
        const due = (s.tuition_fee ?? 0) - (s.amount_paid ?? 0);
        if (!s.parent_email || due <= 0 || s.payment_status === "paid") { skipped++; continue; }
        const dueDate = s.payment_due_date ? new Date(s.payment_due_date).toLocaleDateString("fr-FR") : null;
        const ok = await send(s.parent_email, `Rappel : frais de scolarité de ${s.first_name} ${s.last_name}`,
          layout(schoolName, s.parent_name, `<p>Nous vous rappelons qu'il reste un solde à régler pour la scolarité de <strong>${esc(s.first_name)} ${esc(s.last_name)}</strong>.</p>
          <table style="border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:4px 12px 4px 0">Frais de scolarité</td><td><strong>${fcfa(s.tuition_fee ?? 0)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0">Déjà payé</td><td>${fcfa(s.amount_paid ?? 0)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0">Reste à payer</td><td style="color:#b91c1c"><strong>${fcfa(due)}</strong></td></tr>
            ${dueDate ? `<tr><td style="padding:4px 12px 4px 0">Échéance</td><td>${dueDate}</td></tr>` : ""}
          </table>
          <p>Vous pouvez régler par Mobile Money ou carte depuis votre portail parent, ou directement auprès de l'établissement.</p>`));
        ok ? sent++ : skipped++;
      }
      return json({ success: true, sent, skipped });
    }

    const s = students[0];
    if (!s.parent_email) return json({ error: "Aucun email parent pour cet élève", no_email: true }, 422);

    if (body.action === "absence") {
      const { data: att } = await admin.from("student_attendance").select("status")
        .eq("student_id", s.id).eq("date", body.date).maybeSingle();
      if (att?.status !== "absent") return json({ error: "Aucune absence enregistrée à cette date" }, 404);
      const d = new Date(body.date + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const ok = await send(s.parent_email, `Absence de ${s.first_name} ${s.last_name}`,
        layout(schoolName, s.parent_name, `<p>Nous vous informons que <strong>${esc(s.first_name)} ${esc(s.last_name)}</strong> a été noté(e) <strong>absent(e)</strong> le ${d}.</p>
        <p>Si cette absence est justifiée, merci de prendre contact avec l'établissement.</p>`));
      return json({ success: ok, sent: ok ? 1 : 0 });
    }

    // report_card
    const { data: term } = await admin.from("terms").select("name").eq("id", body.term_id).maybeSingle();
    const rankLine = body.rank && body.total ? `<p>Rang : <strong>${body.rank}${body.rank === 1 ? "er" : "e"}</strong> sur ${body.total} élèves.</p>` : "";
    const ok = await send(s.parent_email, `Bulletin disponible : ${s.first_name} ${s.last_name}`,
      layout(schoolName, s.parent_name, `<p>Le bulletin de <strong>${esc(s.first_name)} ${esc(s.last_name)}</strong> pour la période <strong>${esc(term?.name ?? "en cours")}</strong> est disponible.</p>
      <p>Moyenne générale : <strong>${body.average.toFixed(2)}/20</strong></p>${rankLine}
      <p>Connectez-vous à votre portail parent EvalScol Africa pour consulter le détail des notes.</p>`));
    return json({ success: ok, sent: ok ? 1 : 0 });
  } catch (e) {
    console.error("parent-notify error", e instanceof Error ? e.message : e);
    return json({ error: "Erreur serveur" }, 500);
  }
});
