
-- ===== 1. services: restrict SELECT to org members =====
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;

CREATE POLICY "Org members can view their services"
ON public.services
FOR SELECT
TO authenticated
USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- ===== 2. Realtime channel authorization for support chat =====
-- Topic format used by the client: 'user:<uid>:chat:<session_id>'
-- Allow subscribers only if they own the referenced support_chat_session, or are admins.
DROP POLICY IF EXISTS "Support chat session owners or admins can subscribe" ON realtime.messages;

CREATE POLICY "Support chat session owners or admins can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (
    -- Topic shape: user:<auth.uid()>:chat:<session uuid>
    realtime.topic() LIKE ('user:' || (auth.uid())::text || ':chat:%')
    AND EXISTS (
      SELECT 1 FROM public.support_chat_sessions s
      WHERE s.id::text = split_part(realtime.topic(), ':', 4)
        AND s.user_id = auth.uid()
    )
  )
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND realtime.topic() LIKE 'admin:chat:%'
  )
);
