-- ============================================
-- Activity Logs テーブル ポリシー
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON activity_logs;
CREATE POLICY "Authenticated users can view activity logs"
  ON activity_logs FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON activity_logs;
CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));
