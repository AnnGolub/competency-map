ALTER TABLE public.competencies
  ADD COLUMN IF NOT EXISTS expected_pre_lead numeric,
  ADD COLUMN IF NOT EXISTS indicators_1 text,
  ADD COLUMN IF NOT EXISTS indicators_2 text,
  ADD COLUMN IF NOT EXISTS indicators_3 text,
  ADD COLUMN IF NOT EXISTS indicators_4 text;

UPDATE public.competencies
SET
  expected_pre_lead = COALESCE(expected_pre_lead, expected_senior)
WHERE expected_pre_lead IS NULL;

ALTER TABLE public.competencies
  ALTER COLUMN expected_pre_lead SET NOT NULL;
