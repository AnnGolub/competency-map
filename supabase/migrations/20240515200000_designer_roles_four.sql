ALTER TABLE public.designers
  DROP CONSTRAINT IF EXISTS designers_role_check;

ALTER TABLE public.designers
  ADD CONSTRAINT designers_role_check
  CHECK (role IN ('junior', 'middle', 'senior', 'lead'));
