import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_TOKEN = Deno.env.get("BACKUP_CRON_TOKEN") ?? "";
const BUCKET = "school-backups";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type Rows = Record<string, unknown>[];

async function selectIn(table: string, column: string, values: string[]): Promise<Rows> {
  if (values.length === 0) return [];
  const out: Rows = [];
  for (let i = 0; i < values.length; i += 200) {
    const chunk = values.slice(i, i + 200);
    const { data, error } = await admin.from(table).select("*").in(column, chunk);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...((data ?? []) as Rows));
  }
  return out;
}

async function selectBySchool(table: string, schoolId: string): Promise<Rows> {
  const { data, error } = await admin.from(table).select("*").eq("school_id", schoolId);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as Rows;
}

const ids = (rows: Rows, key = "id") =>
  rows.map((r) => r[key]).filter((v): v is string => typeof v === "string");

async function buildSnapshot(schoolId: string) {
  const dump: Record<string, Rows> = {};

  const { data: school } = await admin.from("schools").select("*").eq("id", schoolId).maybeSingle();
  dump.schools = school ? [school as Record<string, unknown>] : [];

  for (const t of [
    "academic_years",
    "programs",
    "campuses",
    "subjects",
    "terms",
    "assessment_types",
    "students",
    "teachers",
    "accounting_categories",
    "accounting_entries",
  ]) {
    dump[t] = await selectBySchool(t, schoolId);
  }

  dump.grade_levels = await selectIn("grade_levels", "program_id", ids(dump.programs));
  dump.classrooms = await selectIn("classrooms", "campus_id", ids(dump.campuses));

  const classroomIds = ids(dump.classrooms);
  dump.classroom_subjects = await selectIn("classroom_subjects", "classroom_id", classroomIds);
  dump.enrollments = await selectIn("enrollments", "classroom_id", classroomIds);
  dump.schedules = await selectIn("schedules", "classroom_id", classroomIds);
  dump.report_cards = await selectIn("report_cards", "classroom_id", classroomIds);
  dump.student_attendance = await selectIn("student_attendance", "classroom_id", classroomIds);

  dump.assessments = await selectIn(
    "assessments",
    "classroom_subject_id",
    ids(dump.classroom_subjects),
  );
  dump.assessment_results = await selectIn("assessment_results", "assessment_id", ids(dump.assessments));
  dump.teacher_attendance = await selectIn("teacher_attendance", "teacher_id", ids(dump.teachers));

  const rowCount = Object.values(dump).reduce((n, rows) => n + rows.length, 0);
  return { dump, rowCount, tablesCount: Object.keys(dump).length };
}

async function schoolRetention(schoolId: string): Promise<{ retention: number; auto: boolean }> {
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id")
    .eq("school_id", schoolId);
  const userIds = (profiles ?? []).map((p) => p.user_id as string);
  if (userIds.length === 0) return { retention: 365, auto: true };

  const { data: prefs } = await admin
    .from("user_preferences")
    .select("auto_backup, data_retention")
    .in("user_id", userIds);

  const rows = prefs ?? [];
  if (rows.length === 0) return { retention: 365, auto: true };

  const auto = rows.some((r) => (r as any).auto_backup !== false);
  const retentions = rows
    .map((r) => parseInt(String((r as any).data_retention ?? "365"), 10))
    .filter((n) => !Number.isNaN(n));
  const retention = retentions.includes(-1) ? -1 : Math.max(365, ...retentions, 0);
  return { retention, auto };
}

async function purgeExpired(schoolId: string) {
  const nowIso = new Date().toISOString();
  const { data: expired } = await admin
    .from("school_backups")
    .select("id, file_path")
    .eq("school_id", schoolId)
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);

  const rows = expired ?? [];
  if (rows.length === 0) return 0;

  await admin.storage.from(BUCKET).remove(rows.map((r) => r.file_path as string));
  await admin
    .from("school_backups")
    .delete()
    .in("id", rows.map((r) => r.id as string));
  return rows.length;
}

async function backupSchool(schoolId: string, source: "cron" | "manual") {
  const { retention, auto } = await schoolRetention(schoolId);
  if (source === "cron" && !auto) {
    return { schoolId, skipped: true, reason: "auto_backup disabled" };
  }

  try {
    const { dump, rowCount, tablesCount } = await buildSnapshot(schoolId);
    const payload = JSON.stringify(
      { school_id: schoolId, generated_at: new Date().toISOString(), version: 1, data: dump },
      null,
      2,
    );
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `${schoolId}/backup-${stamp}.json`;

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(filePath, new Blob([payload], { type: "application/json" }), {
        contentType: "application/json",
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    const expiresAt =
      retention === -1
        ? null
        : new Date(Date.now() + retention * 86400000).toISOString();

    const { error: insErr } = await admin.from("school_backups").insert({
      school_id: schoolId,
      file_path: filePath,
      size_bytes: new TextEncoder().encode(payload).length,
      row_count: rowCount,
      tables_count: tablesCount,
      status: "success",
      trigger_source: source,
      retention_days: retention,
      expires_at: expiresAt,
    });
    if (insErr) throw new Error(insErr.message);

    const purged = await purgeExpired(schoolId);
    return { schoolId, ok: true, rowCount, tablesCount, filePath, purged };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    await admin.from("school_backups").insert({
      school_id: schoolId,
      file_path: "",
      status: "error",
      error_message: message,
      trigger_source: source,
      retention_days: retention,
    });
    return { schoolId, ok: false, error: message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const cronHeader = req.headers.get("x-cron-token") ?? "";
    const isCron = CRON_TOKEN.length > 0 && cronHeader === CRON_TOKEN;

    if (isCron) {
      const { data: schools } = await admin.from("schools").select("id");
      const results = [];
      for (const s of schools ?? []) {
        results.push(await backupSchool(s.id as string, "cron"));
      }
      return json({ mode: "cron", count: results.length, results });
    }

    // Manual run: requires an authenticated school admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Non authentifié" }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Non authentifié" }, 401);
    const userId = userData.user.id;

    const { data: profile } = await admin
      .from("profiles")
      .select("school_id")
      .eq("user_id", userId)
      .maybeSingle();
    const schoolId = profile?.school_id as string | undefined;
    if (!schoolId) return json({ error: "Aucun établissement associé" }, 400);

    const { data: isAdmin } = await admin.rpc("is_school_admin", {
      p_school_id: schoolId,
      p_user_id: userId,
    });
    if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

    const result = await backupSchool(schoolId, "manual");
    return json(result, result.ok === false ? 500 : 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return json({ error: message }, 500);
  }
});
