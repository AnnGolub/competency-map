-- Allow authenticated users to read their own row (for role checks after login)
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
