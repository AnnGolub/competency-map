-- competency_items: expected per role (if not applied yet)
ALTER TABLE public.competency_items
  ADD COLUMN IF NOT EXISTS expected_junior numeric,
  ADD COLUMN IF NOT EXISTS expected_middle numeric,
  ADD COLUMN IF NOT EXISTS expected_senior numeric,
  ADD COLUMN IF NOT EXISTS expected_lead numeric;

-- item_scores: scores at sub-item level
CREATE TABLE public.item_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES public.designers (id) ON DELETE CASCADE,
  competency_item_id uuid NOT NULL REFERENCES public.competency_items (id) ON DELETE CASCADE,
  score numeric,
  self_score numeric,
  reviewed_by uuid REFERENCES public.users (id) ON DELETE RESTRICT,
  reviewed_at timestamptz,
  UNIQUE (designer_id, competency_item_id),
  CONSTRAINT item_scores_score_check
    CHECK (score IS NULL OR (score >= 1.0 AND score <= 4.0)),
  CONSTRAINT item_scores_self_score_check
    CHECK (self_score IS NULL OR (self_score >= 1.0 AND self_score <= 4.0))
);

CREATE INDEX idx_item_scores_designer_id ON public.item_scores (designer_id);
CREATE INDEX idx_item_scores_competency_item_id ON public.item_scores (competency_item_id);
CREATE INDEX idx_item_scores_reviewed_by ON public.item_scores (reviewed_by);

ALTER TABLE public.item_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_scores_select_lead_or_admin"
  ON public.item_scores FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "item_scores_insert_lead_or_admin"
  ON public.item_scores FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "item_scores_update_lead_or_admin"
  ON public.item_scores FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "item_scores_delete_lead_or_admin"
  ON public.item_scores FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "item_scores_select_own_designer"
  ON public.item_scores FOR SELECT
  TO authenticated
  USING (public.is_own_designer(designer_id));

CREATE POLICY "item_scores_insert_own_designer"
  ON public.item_scores FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_designer(designer_id));

CREATE POLICY "item_scores_update_own_designer"
  ON public.item_scores FOR UPDATE
  TO authenticated
  USING (public.is_own_designer(designer_id))
  WITH CHECK (public.is_own_designer(designer_id));
