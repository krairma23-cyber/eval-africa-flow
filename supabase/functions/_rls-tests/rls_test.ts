/**
 * Tests d'intégration RLS — EvalScol
 *
 * Provisionne une école de test + 5 utilisateurs (un par rôle métier) puis
 * vérifie que chaque rôle ne peut lire/modifier que les données prévues
 * sur les tables critiques :
 *   schools, profiles, user_subscriptions, pmes, students, teachers,
 *   payment_transactions, inscriptions
 *
 * Mapping rôles métier → app_role réel en base :
 *   - Admin / Directeur  → admin
 *   - Enseignant         → teacher
 *   - Secrétaire         → moderator   (rôle le plus proche existant)
 *   - Parent             → aucun rôle, lié via students.parent_email
 *
 * Lancement : supabase--test_edge_functions { functions: ["_rls-tests"] }
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type RoleKey = "admin" | "directeur" | "enseignant" | "secretaire" | "parent";

interface TestUser {
  email: string;
  password: string;
  user_id: string;
  client: SupabaseClient;
}

interface Fixtures {
  school_id: string;
  other_school_id: string;
  student_id: string;
  other_student_id: string;
  teacher_id: string;
  users: Record<RoleKey, TestUser>;
}

const PWD = "Test1234!Rls";
const ts = Date.now();
const tag = `rls_${ts}`;

async function createUser(email: string, appRole: string | null, schoolId: string | null) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PWD,
    email_confirm: true,
  });
  if (error) throw error;
  const user_id = data.user!.id;

  // Profile
  await admin.from("profiles").upsert({
    user_id,
    school_id: schoolId,
    first_name: email.split("@")[0],
    last_name: "Test",
    user_type: "client",
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  // Role (skip parent)
  if (appRole) {
    await admin.from("user_roles").insert({ user_id, role: appRole }).select();
  }

  // Anon client signed in as this user
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signErr } = await client.auth.signInWithPassword({ email, password: PWD });
  if (signErr) throw new Error(`signin ${email}: ${signErr.message}`);

  return { email, password: PWD, user_id, client } as TestUser;
}

async function setup(): Promise<Fixtures> {
  // Two schools to validate cross-tenant isolation
  const { data: schoolA, error: sErr } = await admin.from("schools").insert({
    name: `${tag}_school_A`,
    code: `${tag}_A`,
    join_code: `${tag.slice(0, 8)}A`,
  }).select("id").single();
  if (sErr) throw sErr;

  const { data: schoolB } = await admin.from("schools").insert({
    name: `${tag}_school_B`,
    code: `${tag}_B`,
    join_code: `${tag.slice(0, 8)}B`,
  }).select("id").single();

  const school_id = schoolA!.id;
  const other_school_id = schoolB!.id;

  const users: Record<RoleKey, TestUser> = {
    admin: await createUser(`${tag}_admin@test.local`, "admin", school_id),
    directeur: await createUser(`${tag}_dir@test.local`, "admin", school_id),
    enseignant: await createUser(`${tag}_ens@test.local`, "teacher", school_id),
    secretaire: await createUser(`${tag}_sec@test.local`, "moderator", school_id),
    parent: await createUser(`${tag}_par@test.local`, null, null),
  };

  // Teacher row linked to the enseignant user
  const { data: teacher } = await admin.from("teachers").insert({
    school_id,
    user_id: users.enseignant.user_id,
    teacher_number: `T${ts}`,
    first_name: "Ens",
    last_name: "Test",
    email: users.enseignant.email,
  }).select("id").single();

  // Students — one in school A linked to parent, one in school B
  const { data: studentA } = await admin.from("students").insert({
    school_id,
    student_number: `S${ts}A`,
    first_name: "Eleve",
    last_name: "A",
    parent_email: users.parent.email,
    tuition_fee: 100000,
    amount_paid: 0,
  }).select("id").single();

  const { data: studentB } = await admin.from("students").insert({
    school_id: other_school_id,
    student_number: `S${ts}B`,
    first_name: "Eleve",
    last_name: "B",
    tuition_fee: 100000,
    amount_paid: 0,
  }).select("id").single();

  return {
    school_id,
    other_school_id,
    teacher_id: teacher!.id,
    student_id: studentA!.id,
    other_student_id: studentB!.id,
    users,
  };
}

async function teardown(f: Fixtures) {
  // Cascade-friendly cleanup
  await admin.from("teachers").delete().eq("school_id", f.school_id);
  await admin.from("students").delete().in("school_id", [f.school_id, f.other_school_id]);
  await admin.from("user_roles").delete().in(
    "user_id",
    Object.values(f.users).map((u) => u.user_id),
  );
  await admin.from("profiles").delete().in(
    "user_id",
    Object.values(f.users).map((u) => u.user_id),
  );
  await admin.from("schools").delete().in("id", [f.school_id, f.other_school_id]);
  for (const u of Object.values(f.users)) {
    await admin.auth.admin.deleteUser(u.user_id).catch(() => {});
  }
}

// Helper: assert a select returns N rows (or 0 / blocked)
async function expectRowCount(
  client: SupabaseClient,
  table: string,
  filters: Record<string, unknown>,
  expected: number,
  label: string,
) {
  let q = client.from(table).select("*", { count: "exact", head: false });
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v as never);
  const { data, error, count } = await q;
  assert(!error, `[${label}] unexpected error: ${error?.message}`);
  assertEquals(count ?? data?.length ?? 0, expected, `[${label}] row count`);
}

async function expectMutationBlocked(
  promise: Promise<{ error: unknown }>,
  label: string,
) {
  const { error } = await promise;
  assert(error, `[${label}] expected mutation to be blocked but it succeeded`);
}

// ─────────────────────────────────────────────────────────────────────────
// Test cases
// ─────────────────────────────────────────────────────────────────────────

let F: Fixtures;

Deno.test("RLS suite", async (t) => {
  F = await setup();

  try {
    // ───────── schools ─────────
    await t.step("schools: admin sees only its own school", async () => {
      const { data } = await F.users.admin.client.from("schools").select("id");
      const ids = (data ?? []).map((r: { id: string }) => r.id);
      assert(ids.includes(F.school_id), "admin should see own school");
      assert(!ids.includes(F.other_school_id), "admin must NOT see other school");
    });

    await t.step("schools: enseignant sees only its school", async () => {
      const { data } = await F.users.enseignant.client.from("schools").select("id");
      const ids = (data ?? []).map((r: { id: string }) => r.id);
      assert(!ids.includes(F.other_school_id), "teacher cross-tenant leak");
    });

    await t.step("schools: parent sees no school (no profile.school_id)", async () => {
      const { data } = await F.users.parent.client.from("schools").select("id");
      assertEquals((data ?? []).length, 0, "parent should not see schools");
    });

    await t.step("schools: INSERT/UPDATE blocked for everyone", async () => {
      for (const role of ["admin", "directeur", "enseignant", "secretaire", "parent"] as RoleKey[]) {
        await expectMutationBlocked(
          F.users[role].client.from("schools").insert({
            name: "hack", code: "x", join_code: "y",
          }) as unknown as Promise<{ error: unknown }>,
          `${role} insert school`,
        );
        await expectMutationBlocked(
          F.users[role].client.from("schools").update({ name: "pwned" }).eq("id", F.school_id) as unknown as Promise<{ error: unknown }>,
          `${role} update school`,
        );
      }
    });

    // ───────── user_subscriptions ─────────
    await t.step("user_subscriptions: each user sees only own row", async () => {
      // seed one subscription per user
      for (const u of Object.values(F.users)) {
        await admin.from("user_subscriptions").upsert({
          user_id: u.user_id, status: "active",
        }, { onConflict: "user_id" });
      }
      for (const role of ["admin", "enseignant", "secretaire", "parent"] as RoleKey[]) {
        const { data } = await F.users[role].client.from("user_subscriptions").select("user_id");
        const ids = (data ?? []).map((r: { user_id: string }) => r.user_id);
        assertEquals(ids.length, 1, `${role} should see exactly own row`);
        assertEquals(ids[0], F.users[role].user_id);
      }
    });

    await t.step("user_subscriptions: INSERT blocked client-side", async () => {
      await expectMutationBlocked(
        F.users.parent.client.from("user_subscriptions").insert({
          user_id: F.users.parent.user_id, status: "active",
        }) as unknown as Promise<{ error: unknown }>,
        "parent insert subscription",
      );
    });

    // ───────── students ─────────
    await t.step("students: admin sees only own school students", async () => {
      const { data } = await F.users.admin.client.from("students").select("id, school_id");
      const rows = (data ?? []) as Array<{ id: string; school_id: string }>;
      assert(rows.every((r) => r.school_id === F.school_id), "admin cross-school leak on students");
      assert(rows.some((r) => r.id === F.student_id), "admin missing own student");
    });

    await t.step("students: enseignant can read school students", async () => {
      const { data, error } = await F.users.enseignant.client.from("students").select("id");
      assert(!error, error?.message);
      assert((data ?? []).some((r: { id: string }) => r.id === F.student_id));
    });

    await t.step("students: parent cannot read arbitrary students of other school", async () => {
      const { data } = await F.users.parent.client.from("students").select("id").eq("id", F.other_student_id);
      assertEquals((data ?? []).length, 0, "parent must not see foreign student");
    });

    await t.step("students: enseignant cannot DELETE", async () => {
      await expectMutationBlocked(
        F.users.enseignant.client.from("students").delete().eq("id", F.student_id) as unknown as Promise<{ error: unknown }>,
        "enseignant delete student",
      );
    });

    // ───────── teachers ─────────
    await t.step("teachers: enseignant can update only own basic info", async () => {
      const { error } = await F.users.enseignant.client
        .from("teachers")
        .update({ phone: "+225000000" })
        .eq("id", F.teacher_id);
      assert(!error, `enseignant update self failed: ${error?.message}`);

      // Cannot change school_id
      const { error: badErr } = await F.users.enseignant.client
        .from("teachers")
        .update({ school_id: F.other_school_id })
        .eq("id", F.teacher_id);
      assert(badErr, "enseignant should not be able to switch school_id");
    });

    await t.step("teachers: parent cannot read teachers of foreign school", async () => {
      const { data } = await F.users.parent.client.from("teachers").select("id");
      const ids = (data ?? []).map((r: { id: string }) => r.id);
      assert(!ids.includes(F.teacher_id), "parent leaking teacher data");
    });

    // ───────── payment_transactions ─────────
    await t.step("payment_transactions: scoped to own school", async () => {
      await admin.from("payment_transactions").insert({
        student_id: F.student_id,
        amount: 5000,
        reference: `${tag}_pay`,
        status: "success",
      });
      const { data: aData } = await F.users.admin.client
        .from("payment_transactions").select("id, student_id");
      assert((aData ?? []).length >= 1, "admin should see own school payments");

      // Create a payment in the other school via service role
      const { data: stuB } = await admin.from("students").select("id").eq("id", F.other_student_id).single();
      await admin.from("payment_transactions").insert({
        student_id: stuB!.id,
        amount: 9999,
        reference: `${tag}_pay_B`,
        status: "success",
      });
      const { data: aData2 } = await F.users.admin.client
        .from("payment_transactions").select("reference");
      const refs = (aData2 ?? []).map((r: { reference: string }) => r.reference);
      assert(!refs.includes(`${tag}_pay_B`), "admin leaked cross-school payment");
    });

    // ───────── inscriptions ─────────
    await t.step("inscriptions: admin only SELECT", async () => {
      const { error } = await F.users.admin.client.from("inscriptions").select("id").limit(1);
      assert(!error, `admin select inscriptions: ${error?.message}`);

      const { data } = await F.users.parent.client.from("inscriptions").select("id");
      assertEquals((data ?? []).length, 0, "parent should not read inscriptions");
    });

    // ───────── pmes ─────────
    await t.step("pmes: only owner reads/updates own PME", async () => {
      const { data: pme } = await admin.from("pmes").insert({
        user_id: F.users.admin.user_id,
        nom: `${tag}_pme`,
      }).select("id").single();

      const { data: ownView } = await F.users.admin.client.from("pmes").select("id").eq("id", pme!.id);
      assertEquals((ownView ?? []).length, 1);

      const { data: otherView } = await F.users.parent.client.from("pmes").select("id").eq("id", pme!.id);
      assertEquals((otherView ?? []).length, 0, "non-owner must not read PME");

      await admin.from("pmes").delete().eq("id", pme!.id);
    });
  } finally {
    await teardown(F);
  }
});
