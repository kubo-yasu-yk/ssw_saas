-- ============================================
-- インデックス
-- ============================================

CREATE INDEX IF NOT EXISTS idx_foreigners_company_id ON foreigners(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_foreigner_id ON documents(foreigner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_id ON activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
