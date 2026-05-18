-- Explicit read access for admin (app uses users.role = 'admin' for review UI)
CREATE POLICY "competency_items_select_admin"
  ON public.competency_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- item_scores: same for admin-led review reads
CREATE POLICY "item_scores_select_admin"
  ON public.item_scores
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "item_scores_insert_admin"
  ON public.item_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "item_scores_update_admin"
  ON public.item_scores
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "item_scores_delete_admin"
  ON public.item_scores
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
