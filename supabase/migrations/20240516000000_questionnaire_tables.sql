CREATE TABLE public.questionnaire_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES public.designers (id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questionnaire_links_designer_id
  ON public.questionnaire_links (designer_id);

CREATE TABLE public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_link_id uuid NOT NULL REFERENCES public.questionnaire_links (id) ON DELETE CASCADE,
  designer_id uuid NOT NULL REFERENCES public.designers (id) ON DELETE CASCADE,
  respondent_name text,
  context text NOT NULL,
  mentorship_followup text,
  processes_followup text,
  communication_followup text,
  start_doing text NOT NULL,
  stop_doing text NOT NULL,
  continue_doing text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questionnaire_responses_link_id
  ON public.questionnaire_responses (questionnaire_link_id);

CREATE INDEX idx_questionnaire_responses_designer_id
  ON public.questionnaire_responses (designer_id);

CREATE TABLE public.questionnaire_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.questionnaire_responses (id) ON DELETE CASCADE,
  question_key text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questionnaire_answers_score_check
    CHECK (score >= 1 AND score <= 10),
  CONSTRAINT questionnaire_answers_response_id_question_key_key
    UNIQUE (response_id, question_key)
);

CREATE INDEX idx_questionnaire_answers_response_id
  ON public.questionnaire_answers (response_id);

ALTER TABLE public.questionnaire_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaire_links_select_lead_or_admin"
  ON public.questionnaire_links FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "questionnaire_links_insert_lead_or_admin"
  ON public.questionnaire_links FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_links_update_lead_or_admin"
  ON public.questionnaire_links FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_links_delete_lead_or_admin"
  ON public.questionnaire_links FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "questionnaire_responses_select_lead_or_admin"
  ON public.questionnaire_responses FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "questionnaire_responses_insert_lead_or_admin"
  ON public.questionnaire_responses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_responses_update_lead_or_admin"
  ON public.questionnaire_responses FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_responses_delete_lead_or_admin"
  ON public.questionnaire_responses FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "questionnaire_answers_select_lead_or_admin"
  ON public.questionnaire_answers FOR SELECT
  TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "questionnaire_answers_insert_lead_or_admin"
  ON public.questionnaire_answers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_answers_update_lead_or_admin"
  ON public.questionnaire_answers FOR UPDATE
  TO authenticated
  USING (public.is_lead_or_admin())
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "questionnaire_answers_delete_lead_or_admin"
  ON public.questionnaire_answers FOR DELETE
  TO authenticated
  USING (public.is_lead_or_admin());
