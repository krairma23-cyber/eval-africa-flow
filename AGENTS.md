
- Teacher onboarding uses per-person invitations (`teacher_invitations`, edge functions `teacher-invite` / `teacher-invite-accept`, hashed tokens); shared school join codes are disabled — why: traceable, revocable access.
- Multi-school teachers: `school_memberships` lists schools, `profiles.school_id` is the active school switched only via `set_active_school` — why: keeps all existing RLS based on `get_user_school_id()` working.

- Run `scripts/test-rls.sh` (supabase/tests/rls_school_isolation.sql) after any RLS change; add new school-scoped tables to its lists — why: catches cross-school data leaks automatically.
- Platform-wide data (support chats, FAQs) is managed only by `is_super_admin`, never by the school `admin` role — why: `admin` is per-school.
