-- ============================================
-- Row Level Security (RLS) ポリシー設定
-- ============================================
-- このファイルは Supabase SQL Editor で直接実行できます
--
-- 注意: 個別ファイル（policies/*.sql）も保持していますが、
--      Supabase SQL Editor では \ir コマンドが使えないため、
--      このファイルにすべて統合しています。
-- ============================================

-- ============================================
-- RLS 有効化設定
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreigners ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles テーブル ポリシー
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
