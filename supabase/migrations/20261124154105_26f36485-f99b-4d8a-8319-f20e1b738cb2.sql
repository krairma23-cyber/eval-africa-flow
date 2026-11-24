ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_user_id uuid;

CREATE OR REPLACE FUNCTION public.calculate_school_excellence(p_term_number integer)
RETURNS TABLE (
  school_id uuid,
  school_name text,
  country text,
  city text,
  academic_year_name text,
  term_number integer,
  is_annual boolean,
  pedagogical_score numeric,
  bulletin_score numeric,
  parent_score numeric,
  total_score numeric,
  success_rate numeric,
  bulletin_rate numeric,
  parent_rate numeric,
  result_count integer,
  on_time_reports integer,
  expected_reports integer,
  active_parents integer,
  parent_accounts integer,
  global_rank integer,
  country_rank integer,
  total_schools integer,
  country_schools integer,
  calculated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_term_number NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Le trimestre doit être compris entre 1 et 3';
  END IF;

  RETURN QUERY
  WITH selected_year AS (
    SELECT ay.name
    FROM public.academic_years ay
    WHERE EXISTS (
      SELECT 1 FROM public.terms t
      WHERE t.academic_year_id = ay.id AND t.term_number = p_term_number
    )
    GROUP BY ay.name
    ORDER BY max(ay.end_date) DESC
    LIMIT 1
  ),
  school_years AS (
    SELECT ay.id AS academic_year_id, ay.school_id, ay.name, ay.start_date, ay.end_date
    FROM public.academic_years ay
    JOIN selected_year sy ON sy.name = ay.name
  ),
  scope_terms AS (
    SELECT t.id, t.school_id, t.academic_year_id, t.start_date, t.end_date, t.term_number
    FROM public.terms t
    JOIN selected_year sy ON sy.name = (
      SELECT ay.name FROM public.academic_years ay WHERE ay.id = t.academic_year_id
    )
    WHERE (p_term_number = 3 OR t.term_number = p_term_number)
  ),
  school_periods AS (
    SELECT st.school_id, min(st.start_date) AS start_date, max(st.end_date) AS end_date
    FROM scope_terms st
    GROUP BY st.school_id
  ),
  evaluation_metrics AS (
    SELECT
      st.school_id,
      count(ar.id)::integer AS result_count,
      count(ar.id) FILTER (
        WHERE a.max_score > 0 AND ar.score >= (a.max_score / 2)
      )::integer AS passed_count
    FROM scope_terms st
    LEFT JOIN public.assessments a ON a.term_id = st.id
    LEFT JOIN public.assessment_results ar
      ON ar.assessment_id = a.id
      AND ar.score IS NOT NULL
      AND coalesce(ar.is_absent, false) = false
    GROUP BY st.school_id
  ),
  reporting_metrics AS (
    SELECT
      st.school_id,
      count(rc.id)::integer AS generated_reports,
      count(rc.id) FILTER (
        WHERE rc.generated_at IS NOT NULL AND rc.generated_at::date <= st.end_date + 7
      )::integer AS on_time_reports
    FROM scope_terms st
    LEFT JOIN public.report_cards rc ON rc.term_id = st.id
    GROUP BY st.school_id
  ),
  term_metrics AS (
    SELECT st.school_id, count(*)::integer AS term_count
    FROM scope_terms st
    GROUP BY st.school_id
  ),
  enrollment_metrics AS (
    SELECT ay.school_id, count(e.id)::integer AS enrollment_count
    FROM school_years ay
    LEFT JOIN public.enrollments e
      ON e.academic_year_id = ay.academic_year_id AND coalesce(e.status, 'active') = 'active'
    GROUP BY ay.school_id
  ),
  parent_ids AS (
    SELECT s.school_id, s.parent_user_id AS user_id
    FROM public.students s
    WHERE s.parent_user_id IS NOT NULL
    UNION
    SELECT p.school_id, p.user_id
    FROM public.profiles p
    WHERE p.user_type = 'parent' AND p.school_id IS NOT NULL
  ),
  parent_metrics AS (
    SELECT
      pi.school_id,
      count(*)::integer AS parent_accounts,
      count(*) FILTER (
        WHERE sp.start_date IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.user_activity_logs ual
          WHERE ual.user_id = pi.user_id
            AND ual.action_type IN ('USER_LOGIN', 'PARENT_PORTAL_VIEW')
            AND ual.created_at >= sp.start_date::timestamp with time zone
            AND ual.created_at < (sp.end_date + 1)::timestamp with time zone
        )
      )::integer AS active_parents
    FROM parent_ids pi
    LEFT JOIN school_periods sp ON sp.school_id = pi.school_id
    GROUP BY pi.school_id
  ),
  base AS (
    SELECT
      s.id AS school_id,
      s.name AS school_name,
      coalesce(nullif(btrim(s.country), ''), 'Non renseigné') AS country,
      s.city,
      (SELECT sy.name FROM selected_year sy) AS academic_year_name,
      p_term_number AS term_number,
      (p_term_number = 3) AS is_annual,
      coalesce(em.result_count, 0)::integer AS result_count,
      coalesce(em.passed_count, 0)::integer AS passed_count,
      coalesce(rm.generated_reports, 0)::integer AS generated_reports,
      coalesce(rm.on_time_reports, 0)::integer AS on_time_reports,
      greatest(
        coalesce(enm.enrollment_count, 0) * coalesce(tm.term_count, 0),
        coalesce(rm.generated_reports, 0)
      )::integer AS expected_reports,
      coalesce(pm.active_parents, 0)::integer AS active_parents,
      coalesce(pm.parent_accounts, 0)::integer AS parent_accounts
    FROM public.schools s
    LEFT JOIN evaluation_metrics em ON em.school_id = s.id
    LEFT JOIN reporting_metrics rm ON rm.school_id = s.id
    LEFT JOIN term_metrics tm ON tm.school_id = s.id
    LEFT JOIN enrollment_metrics enm ON enm.school_id = s.id
    LEFT JOIN parent_metrics pm ON pm.school_id = s.id
  ),
  rates AS (
    SELECT
      b.*,
      CASE WHEN b.result_count > 0
        THEN round((100.0 * b.passed_count / b.result_count)::numeric, 2)
        ELSE 0::numeric END AS success_rate,
      CASE WHEN b.expected_reports > 0
        THEN round((100.0 * b.on_time_reports / b.expected_reports)::numeric, 2)
        ELSE 0::numeric END AS bulletin_rate,
      CASE WHEN b.parent_accounts > 0
        THEN round((100.0 * b.active_parents / b.parent_accounts)::numeric, 2)
        ELSE 0::numeric END AS parent_rate
    FROM base b
  ),
  scores AS (
    SELECT
      r.*,
      round((0.50 * r.success_rate)::numeric, 2) AS pedagogical_score,
      round((0.25 * r.bulletin_rate)::numeric, 2) AS bulletin_score,
      round((0.25 * r.parent_rate)::numeric, 2) AS parent_score
    FROM rates r
  ),
  totals AS (
    SELECT
      sc.*,
      (sc.pedagogical_score + sc.bulletin_score + sc.parent_score)::numeric AS total_score
    FROM scores sc
  ),
  ranked AS (
    SELECT
      t.*,
      row_number() OVER (
        ORDER BY t.total_score DESC, t.pedagogical_score DESC, t.bulletin_score DESC,
          t.parent_score DESC, lower(t.school_name), t.school_id
      )::integer AS global_rank,
      row_number() OVER (
        PARTITION BY lower(t.country)
        ORDER BY t.total_score DESC, t.pedagogical_score DESC, t.bulletin_score DESC,
          t.parent_score DESC, lower(t.school_name), t.school_id
      )::integer AS country_rank,
      count(*) OVER ()::integer AS total_schools,
      count(*) OVER (PARTITION BY lower(t.country))::integer AS country_schools
    FROM totals t
  )
  SELECT
    r.school_id, r.school_name, r.country, r.city, r.academic_year_name,
    r.term_number, r.is_annual, r.pedagogical_score, r.bulletin_score,
    r.parent_score, r.total_score, r.success_rate, r.bulletin_rate, r.parent_rate,
    r.result_count, r.on_time_reports, r.expected_reports, r.active_parents,
    r.parent_accounts, r.global_rank, r.country_rank, r.total_schools,
    r.country_schools, now() AS calculated_at
  FROM ranked r;
END;
$$;

REVOKE ALL ON FUNCTION public.calculate_school_excellence(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_school_excellence(integer) TO service_role;

CREATE TABLE public.school_excellence_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_name text NOT NULL,
  term_number integer NOT NULL,
  is_annual boolean NOT NULL DEFAULT false,
  pedagogical_score numeric NOT NULL DEFAULT 0,
  bulletin_score numeric NOT NULL DEFAULT 0,
  parent_score numeric NOT NULL DEFAULT 0,
  total_score numeric NOT NULL DEFAULT 0,
  success_rate numeric NOT NULL DEFAULT 0,
  bulletin_rate numeric NOT NULL DEFAULT 0,
  parent_rate numeric NOT NULL DEFAULT 0,
  result_count integer NOT NULL DEFAULT 0,
  on_time_reports integer NOT NULL DEFAULT 0,
  expected_reports integer NOT NULL DEFAULT 0,
  active_parents integer NOT NULL DEFAULT 0,
  parent_accounts integer NOT NULL DEFAULT 0,
  global_rank integer NOT NULL,
  country_rank integer NOT NULL,
  total_schools integer NOT NULL,
  country_schools integer NOT NULL,
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (school_id, academic_year_name, term_number)
);

GRANT SELECT ON public.school_excellence_scores TO authenticated;
GRANT ALL ON public.school_excellence_scores TO service_role;
ALTER TABLE public.school_excellence_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School directors can read their own excellence score"
ON public.school_excellence_scores FOR SELECT TO authenticated
USING (public.is_school_admin(school_id, auth.uid()));

CREATE TRIGGER update_school_excellence_scores_updated_at
BEFORE UPDATE ON public.school_excellence_scores
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.excellence_public_top10 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_name text NOT NULL,
  term_number integer NOT NULL,
  is_annual boolean NOT NULL DEFAULT false,
  scope_key text NOT NULL,
  scope_country text,
  rank integer NOT NULL,
  school_name text NOT NULL,
  country text NOT NULL,
  city text,
  score numeric NOT NULL,
  calculated_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (academic_year_name, term_number, scope_key, rank)
);

GRANT SELECT ON public.excellence_public_top10 TO anon, authenticated;
GRANT ALL ON public.excellence_public_top10 TO service_role;
ALTER TABLE public.excellence_public_top10 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read the published excellence Top 10"
ON public.excellence_public_top10 FOR SELECT TO anon, authenticated
USING (true);

CREATE TRIGGER update_excellence_public_top10_updated_at
BEFORE UPDATE ON public.excellence_public_top10
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.refresh_school_excellence_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_term integer;
BEGIN
  FOR v_term IN 1..3 LOOP
    DELETE FROM public.excellence_public_top10 WHERE term_number = v_term;
    DELETE FROM public.school_excellence_scores WHERE term_number = v_term;

    INSERT INTO public.school_excellence_scores (
      school_id, academic_year_name, term_number, is_annual,
      pedagogical_score, bulletin_score, parent_score, total_score,
      success_rate, bulletin_rate, parent_rate, result_count,
      on_time_reports, expected_reports, active_parents, parent_accounts,
      global_rank, country_rank, total_schools, country_schools, calculated_at
    )
    SELECT
      r.school_id, r.academic_year_name, r.term_number, r.is_annual,
      r.pedagogical_score, r.bulletin_score, r.parent_score, r.total_score,
      r.success_rate, r.bulletin_rate, r.parent_rate, r.result_count,
      r.on_time_reports, r.expected_reports, r.active_parents, r.parent_accounts,
      r.global_rank, r.country_rank, r.total_schools, r.country_schools, r.calculated_at
    FROM public.calculate_school_excellence(v_term) r
    WHERE r.academic_year_name IS NOT NULL;

    INSERT INTO public.excellence_public_top10 (
      academic_year_name, term_number, is_annual, scope_key, scope_country,
      rank, school_name, country, city, score, calculated_at
    )
    SELECT
      s.academic_year_name, s.term_number, s.is_annual, 'ALL', NULL,
      s.global_rank, sc.name, coalesce(nullif(btrim(sc.country), ''), 'Non renseigné'),
      sc.city, s.total_score, s.calculated_at
    FROM public.school_excellence_scores s
    JOIN public.schools sc ON sc.id = s.school_id
    WHERE s.term_number = v_term AND s.global_rank <= 10;

    INSERT INTO public.excellence_public_top10 (
      academic_year_name, term_number, is_annual, scope_key, scope_country,
      rank, school_name, country, city, score, calculated_at
    )
    SELECT
      s.academic_year_name, s.term_number, s.is_annual,
      'COUNTRY:' || lower(coalesce(nullif(btrim(sc.country), ''), 'Non renseigné')),
      coalesce(nullif(btrim(sc.country), ''), 'Non renseigné'),
      s.country_rank, sc.name,
      coalesce(nullif(btrim(sc.country), ''), 'Non renseigné'),
      sc.city, s.total_score, s.calculated_at
    FROM public.school_excellence_scores s
    JOIN public.schools sc ON sc.id = s.school_id
    WHERE s.term_number = v_term AND s.country_rank <= 10;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_school_excellence_scores() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_school_excellence_scores() TO service_role;

SELECT public.refresh_school_excellence_scores();

CREATE OR REPLACE FUNCTION public.get_public_excellence_top10(
  p_term_number integer,
  p_country text DEFAULT NULL
)
RETURNS TABLE (
  school_name text,
  country text,
  city text,
  rank integer,
  score numeric,
  academic_year_name text,
  term_number integer,
  is_annual boolean,
  calculated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.school_name, p.country, p.city, p.rank, p.score,
    p.academic_year_name, p.term_number, p.is_annual, p.calculated_at
  FROM public.excellence_public_top10 p
  WHERE p.term_number = p_term_number
    AND p.scope_key = CASE
      WHEN p_country IS NULL THEN 'ALL'
      ELSE 'COUNTRY:' || lower(btrim(p_country))
    END
  ORDER BY p.rank
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.get_public_excellence_countries()
RETURNS TABLE (country text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT p.scope_country AS country
  FROM public.excellence_public_top10 p
  WHERE p.scope_country IS NOT NULL
  ORDER BY country;
$$;

CREATE OR REPLACE FUNCTION public.get_my_school_excellence(p_term_number integer)
RETURNS TABLE (
  school_name text,
  country text,
  city text,
  academic_year_name text,
  term_number integer,
  is_annual boolean,
  pedagogical_score numeric,
  bulletin_score numeric,
  parent_score numeric,
  total_score numeric,
  success_rate numeric,
  bulletin_rate numeric,
  parent_rate numeric,
  result_count integer,
  on_time_reports integer,
  expected_reports integer,
  active_parents integer,
  parent_accounts integer,
  global_rank integer,
  country_rank integer,
  total_schools integer,
  country_schools integer,
  calculated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    sc.name AS school_name,
    coalesce(nullif(btrim(sc.country), ''), 'Non renseigné') AS country,
    sc.city,
    s.academic_year_name, s.term_number, s.is_annual,
    s.pedagogical_score, s.bulletin_score, s.parent_score, s.total_score,
    s.success_rate, s.bulletin_rate, s.parent_rate, s.result_count,
    s.on_time_reports, s.expected_reports, s.active_parents, s.parent_accounts,
    s.global_rank, s.country_rank, s.total_schools, s.country_schools, s.calculated_at
  FROM public.school_excellence_scores s
  JOIN public.schools sc ON sc.id = s.school_id
  WHERE s.term_number = p_term_number
    AND s.school_id = public.get_user_school_id()
    AND public.is_school_admin(s.school_id, auth.uid())
  LIMIT 1;
$$;

SELECT cron.schedule(
  'refresh-school-excellence-scores-nightly',
  '15 4 * * *',
  $$SELECT public.refresh_school_excellence_scores();$$
);