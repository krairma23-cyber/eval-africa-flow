DROP POLICY "Users can view their own chat sessions" ON public.support_chat_sessions;
DROP POLICY "Users can update their own chat sessions" ON public.support_chat_sessions;
CREATE POLICY "Users can view their own chat sessions" ON public.support_chat_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "Users can update their own chat sessions" ON public.support_chat_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

DROP POLICY "Only admins can insert FAQs" ON public.support_faqs;
DROP POLICY "Only admins can update FAQs" ON public.support_faqs;
DROP POLICY "Only admins can delete FAQs" ON public.support_faqs;
CREATE POLICY "Only super admins can insert FAQs" ON public.support_faqs FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Only super admins can update FAQs" ON public.support_faqs FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Only super admins can delete FAQs" ON public.support_faqs FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));