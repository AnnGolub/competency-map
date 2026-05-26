ALTER TABLE public.questionnaire_responses
  ALTER COLUMN start_doing DROP NOT NULL,
  ALTER COLUMN stop_doing DROP NOT NULL,
  ALTER COLUMN continue_doing DROP NOT NULL;

ALTER TABLE public.questionnaire_answers
  ADD COLUMN IF NOT EXISTS text_answer text;

ALTER TABLE public.questionnaire_answers
  ALTER COLUMN score DROP NOT NULL;

ALTER TABLE public.questionnaire_answers
  DROP CONSTRAINT IF EXISTS questionnaire_answers_score_check;

ALTER TABLE public.questionnaire_answers
  ADD CONSTRAINT questionnaire_answers_score_check
  CHECK (score IS NULL OR (score >= 1 AND score <= 10));

ALTER TABLE public.questionnaire_answers
  ADD CONSTRAINT questionnaire_answers_value_check
  CHECK (num_nonnulls(score, text_answer) = 1);
