
- Teacher onboarding uses per-person invitations (`teacher_invitations`, edge functions `teacher-invite` / `teacher-invite-accept`, hashed tokens); shared school join codes are disabled — why: traceable, revocable access.
- Multi-school teachers: `school_memberships` lists schools, `profiles.school_id` is the active school switched only via `set_active_school` — why: keeps all existing RLS based on `get_user_school_id()` working.
