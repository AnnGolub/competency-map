ALTER TABLE public.item_scores
  ADD COLUMN IF NOT EXISTS final_score numeric;

ALTER TABLE public.item_scores
  DROP CONSTRAINT IF EXISTS item_scores_final_score_check;

ALTER TABLE public.item_scores
  ADD CONSTRAINT item_scores_final_score_check
  CHECK (final_score IS NULL OR (final_score >= 1.0 AND final_score <= 4.0));
