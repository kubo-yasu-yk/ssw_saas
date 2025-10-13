-- ============================================
-- Companies テーブル ポリシー
-- ============================================

DROP POLICY IF EXISTS "Users can view their company" ON companies;
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their company" ON companies;
CREATE POLICY "Users can update their company"
  ON companies FOR UPDATE
  USING (id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));
