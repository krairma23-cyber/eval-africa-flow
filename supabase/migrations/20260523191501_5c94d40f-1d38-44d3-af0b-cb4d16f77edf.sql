
-- 1) Organizations: restrict SELECT to org members
CREATE POLICY "Members can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (public.is_org_member(id, auth.uid()));

-- 2) Webhooks: enforce school scoping for admins
DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhooks;

CREATE POLICY "Admins can manage webhooks in their school"
ON public.webhooks
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND public.user_belongs_to_school(school_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND public.user_belongs_to_school(school_id)
);
