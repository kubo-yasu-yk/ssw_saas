-- ============================================
-- Foreigners テーブル ポリシー
-- ============================================

DROP POLICY IF EXISTS "Users can view foreigners in their company" ON foreigners;
CREATE POLICY "Users can view foreigners in their company"
  ON foreigners FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert foreigners in their company" ON foreigners;
CREATE POLICY "Users can insert foreigners in their company"
  ON foreigners FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update foreigners in their company" ON foreigners;
CREATE POLICY "Users can update foreigners in their company"
  ON foreigners FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete foreigners in their company" ON foreigners;
CREATE POLICY "Users can delete foreigners in their company"
  ON foreigners FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));
