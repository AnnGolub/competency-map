-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- designers
CREATE TABLE public.designers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('senior', 'lead')),
  direction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- competencies
CREATE TABLE public.competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block text NOT NULL CHECK (block IN ('leadership', 'hard', 'soft')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  expected_senior numeric NOT NULL,
  expected_lead numeric NOT NULL
);

-- competency_items
CREATE TABLE public.competency_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid NOT NULL REFERENCES public.competencies (id) ON DELETE CASCADE,
  text text NOT NULL,
  only_lead boolean NOT NULL DEFAULT false
);

-- users (linked to Supabase Auth)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('lead', 'admin'))
);

-- scores
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES public.designers (id) ON DELETE CASCADE,
  competency_id uuid NOT NULL REFERENCES public.competencies (id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 1.0 AND score <= 4.0),
  comment text NOT NULL DEFAULT '',
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  UNIQUE (designer_id, competency_id)
);

-- Indexes
CREATE INDEX idx_competency_items_competency_id ON public.competency_items (competency_id);
CREATE INDEX idx_scores_designer_id ON public.scores (designer_id);
CREATE INDEX idx_scores_competency_id ON public.scores (competency_id);
CREATE INDEX idx_scores_reviewed_by ON public.scores (reviewed_by);
CREATE INDEX idx_users_role ON public.users (role);

-- RLS helper: authenticated user with role lead or admin
CREATE OR REPLACE FUNCTION public.is_lead_or_admin()
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
      AND role IN ('lead', 'admin')
  );
$$;

-- Enable RLS
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- designers policies
CREATE POLICY "designers_select_lead_or_admin"
  ON public.designers FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "designers_insert_lead_or_admin"
  ON public.designers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "designers_update_lead_or_admin"
  ON public.designers FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "designers_delete_lead_or_admin"
  ON public.designers FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

-- competencies policies
CREATE POLICY "competencies_select_lead_or_admin"
  ON public.competencies FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "competencies_insert_lead_or_admin"
  ON public.competencies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "competencies_update_lead_or_admin"
  ON public.competencies FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "competencies_delete_lead_or_admin"
  ON public.competencies FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

-- competency_items policies
CREATE POLICY "competency_items_select_lead_or_admin"
  ON public.competency_items FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "competency_items_insert_lead_or_admin"
  ON public.competency_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "competency_items_update_lead_or_admin"
  ON public.competency_items FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "competency_items_delete_lead_or_admin"
  ON public.competency_items FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

-- users policies
CREATE POLICY "users_select_lead_or_admin"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "users_insert_lead_or_admin"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "users_update_lead_or_admin"
  ON public.users FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "users_delete_lead_or_admin"
  ON public.users FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

-- scores policies
CREATE POLICY "scores_select_lead_or_admin"
  ON public.scores FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "scores_insert_lead_or_admin"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "scores_update_lead_or_admin"
  ON public.scores FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "scores_delete_lead_or_admin"
  ON public.scores FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());