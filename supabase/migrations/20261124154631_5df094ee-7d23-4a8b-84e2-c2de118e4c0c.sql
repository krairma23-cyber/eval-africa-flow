DROP POLICY IF EXISTS "Anyone can read the published excellence Top 10" ON public.excellence_public_top10;

CREATE POLICY "Anyone can read only published Top 10 rows"
ON public.excellence_public_top10 FOR SELECT TO anon, authenticated
USING (rank BETWEEN 1 AND 10 AND term_number BETWEEN 1 AND 3);