CREATE TABLE public.self_review_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id uuid NOT NULL REFERENCES public.designers (id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz
);

CREATE INDEX idx_self_review_tokens_designer_id ON public.self_review_tokens (designer_id);
CREATE INDEX idx_self_review_tokens_token ON public.self_review_tokens (token);

ALTER TABLE public.self_review_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_review_tokens_admin_all"
  ON public.self_review_tokens
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
