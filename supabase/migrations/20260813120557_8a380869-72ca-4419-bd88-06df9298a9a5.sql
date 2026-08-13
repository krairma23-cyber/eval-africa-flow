
-- Support chat is a platform-wide (cross-tenant) resource: restrict admin access to super admins only
DROP POLICY IF EXISTS "Support chat session owners or admins can subscribe" ON realtime.messages;
CREATE POLICY "Support chat session owners or super admins can subscribe"
ON realtime.messages FOR SELECT TO authenticated
USING (
  (
    realtime.topic() LIKE ('user:' || auth.uid()::text || ':chat:%')
    AND EXISTS (
      SELECT 1 FROM public.support_chat_sessions s
      WHERE s.id::text = split_part(realtime.topic(), ':', 4)
        AND s.user_id = auth.uid()
    )
  )
  OR (public.is_super_admin(auth.uid()) AND realtime.topic() LIKE 'admin:chat:%')
);

DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.support_chat_messages;
CREATE POLICY "Users can view messages in their sessions"
ON public.support_chat_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_chat_sessions s
    WHERE s.id = support_chat_messages.session_id
      AND (s.user_id = auth.uid() OR public.is_super_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins can send messages" ON public.support_chat_messages;
CREATE POLICY "Super admins can send messages"
ON public.support_chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can send messages in their sessions" ON public.support_chat_messages;
CREATE POLICY "Users can send messages in their sessions"
ON public.support_chat_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.support_chat_sessions s
    WHERE s.id = support_chat_messages.session_id
      AND s.user_id = auth.uid()
  )
);
