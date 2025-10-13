-- ============================================
-- Documents テーブル ポリシー
-- ============================================

DROP POLICY IF EXISTS "Users can view documents in their company" ON documents;
CREATE POLICY "Users can view documents in their company"
  ON documents FOR SELECT
  USING (foreigner_id IN (
    SELECT f.id FROM foreigners f
    INNER JOIN profiles p ON f.company_id = p.company_id
    WHERE p.id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert documents in their company" ON documents;
CREATE POLICY "Users can insert documents in their company"
  ON documents FOR INSERT
  WITH CHECK (foreigner_id IN (
    SELECT f.id FROM foreigners f
    INNER JOIN profiles p ON f.company_id = p.company_id
    WHERE p.id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update documents in their company" ON documents;
CREATE POLICY "Users can update documents in their company"
  ON documents FOR UPDATE
  USING (foreigner_id IN (
    SELECT f.id FROM foreigners f
    INNER JOIN profiles p ON f.company_id = p.company_id
    WHERE p.id = auth.uid()
  ))
  WITH CHECK (foreigner_id IN (
    SELECT f.id FROM foreigners f
    INNER JOIN profiles p ON f.company_id = p.company_id
    WHERE p.id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete documents in their company" ON documents;
CREATE POLICY "Users can delete documents in their company"
  ON documents FOR DELETE
  USING (foreigner_id IN (
    SELECT f.id FROM foreigners f
    INNER JOIN profiles p ON f.company_id = p.company_id
    WHERE p.id = auth.uid()
  ));
