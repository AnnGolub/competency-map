ALTER TABLE public.competencies
  ADD COLUMN IF NOT EXISTS expected_junior numeric,
  ADD COLUMN IF NOT EXISTS expected_middle numeric;

UPDATE public.competencies
SET
  expected_junior = COALESCE(expected_junior, GREATEST(1, expected_senior - 0.5)),
  expected_middle = COALESCE(
    expected_middle,
    ROUND((expected_senior + expected_lead) / 2, 1)
  )
WHERE expected_junior IS NULL OR expected_middle IS NULL;

ALTER TABLE public.competencies
  ALTER COLUMN expected_junior SET NOT NULL,
  ALTER COLUMN expected_middle SET NOT NULL;
