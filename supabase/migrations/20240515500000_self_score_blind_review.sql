-- designers: email for linking auth users
ALTER TABLE public.designers
  ADD COLUMN IF NOT EXISTS email text;

CREATE UNIQUE INDEX IF NOT EXISTS designers_email_unique_lower
  ON public.designers (lower(email))
  WHERE email IS NOT NULL;

-- scores: self-assessment and nullable lead review fields
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS self_score numeric;

ALTER TABLE public.scores
  DROP CONSTRAINT IF EXISTS scores_score_check;

ALTER TABLE public.scores
  ADD CONSTRAINT scores_score_check
  CHECK (score IS NULL OR (score >= 1.0 AND score <= 4.0));

ALTER TABLE public.scores
  ADD CONSTRAINT scores_self_score_check
  CHECK (self_score IS NULL OR (self_score >= 1.0 AND self_score <= 4.0));

ALTER TABLE public.scores
  ALTER COLUMN score DROP NOT NULL;

ALTER TABLE public.scores
  ALTER COLUMN reviewed_by DROP NOT NULL;

ALTER TABLE public.scores
  ALTER COLUMN reviewed_at DROP NOT NULL;

ALTER TABLE public.scores
  ALTER COLUMN comment DROP NOT NULL;

ALTER TABLE public.scores
  ALTER COLUMN comment SET DEFAULT '';

-- Admin check (лид = admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Designer linked to current auth user by email
CREATE OR REPLACE FUNCTION public.is_own_designer(designer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.designers d
    WHERE d.id = designer_id
      AND d.email IS NOT NULL
      AND lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- designers: designer reads own row
CREATE POLICY "designers_select_own"
  ON public.designers
  FOR SELECT
  TO authenticated
  USING (public.is_own_designer(id));

-- scores: designer reads/updates own scores
CREATE POLICY "scores_select_own_designer"
  ON public.scores
  FOR SELECT
  TO authenticated
  USING (public.is_own_designer(designer_id));

CREATE POLICY "scores_insert_own_designer"
  ON public.scores
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_designer(designer_id));

CREATE POLICY "scores_update_own_designer"
  ON public.scores
  FOR UPDATE
  TO authenticated
  USING (public.is_own_designer(designer_id))
  WITH CHECK (public.is_own_designer(designer_id));
