-- ============================================
-- 初期データ投入（開発/テスト用）
-- ============================================

-- 既存データを削除（開発環境のみ）
-- 本番環境では実行しないこと！
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE foreigners CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE companies CASCADE;

-- ============================================
-- Companies データ
-- ============================================

INSERT INTO companies (id, name, address, representative, phone, registration_number, created_at, updated_at)
VALUES (
  'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
  'サンプル受入機関株式会社',
  '東京都千代田区丸の内1-1-1',
  '山田 太郎',
  '03-1234-5678',
  '1234567890123',
  '2024-01-01 00:00:00+09',
  '2024-01-01 00:00:00+09'
);

-- ============================================
-- Foreigners データ
-- ============================================

INSERT INTO foreigners (id, company_id, name, name_kana, nationality, birth_date, passport_number, residence_status, residence_period, work_category, notes, created_at, updated_at)
VALUES 
  (
    'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    '田中 太郎',
    'たなか たろう',
    'ベトナム',
    '1995-04-10',
    'AB1234567',
    '特定技能1号',
    '1年',
    '飲食料品製造業',
    '日本語教育: JLPT N3 相当',
    '2024-01-01 00:00:00+09',
    '2024-01-01 00:00:00+09'
  ),
  (
    'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    '佐藤 花子',
    'さとう はなこ',
    'インドネシア',
    '1998-12-01',
    'CD7654321',
    '特定技能1号',
    '1年',
    '外食業',
    NULL,
    '2024-01-02 00:00:00+09',
    '2024-01-02 00:00:00+09'
  ),
  (
    'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    'グエン ティン',
    'ぐえん てぃん',
    'ベトナム',
    '1997-07-21',
    'EF2468101',
    '特定技能2号',
    '2年',
    '介護',
    NULL,
    '2024-01-03 00:00:00+09',
    '2024-01-03 00:00:00+09'
  );

-- ============================================
-- Documents データ
-- ============================================

INSERT INTO documents (id, type, title, status, foreigner_id, data, created_at, updated_at)
VALUES 
  (
    'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1'::uuid,
    'residence_status',
    '在留資格認定証明書交付申請書',
    'submitted',
    'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,
    '{"name": "田中 太郎", "nationality": "ベトナム", "residenceStatus": "特定技能1号"}'::jsonb,
    '2024-01-12 00:00:00+09',
    '2024-01-15 00:00:00+09'
  ),
  (
    'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2'::uuid,
    'interview_report',
    '定期面談報告書',
    'approved',
    'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2'::uuid,
    '{"interviewer": "管理者", "summary": "業務状況を確認し、特記事項なし。"}'::jsonb,
    '2024-01-08 00:00:00+09',
    '2024-01-10 00:00:00+09'
  ),
  (
    'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3'::uuid,
    'period_extension',
    '在留期間更新許可申請書',
    'draft',
    'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3'::uuid,
    '{}'::jsonb,
    '2024-02-01 00:00:00+09',
    '2024-02-01 00:00:00+09'
  );

-- ============================================
-- Activity Logs データ
-- ============================================

INSERT INTO activity_logs (id, company_id, message, created_at)
VALUES 
  (
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    '田中 太郎さんの在留資格認定証明書交付申請を提出しました。',
    '2024-01-15 10:30:00+09'
  ),
  (
    'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    '佐藤 花子さんの定期面談報告書を承認しました。',
    '2024-01-12 14:20:00+09'
  ),
  (
    'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid,
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
    'グエン ティンさんの在留期間更新を下書き保存しました。',
    '2024-02-01 09:10:00+09'
  );

-- ============================================
-- 注意: Profiles データは認証後に手動で作成
-- ============================================
-- Supabase Authentication で以下のユーザーを作成してください：
-- Email: admin@example.com
-- Password: password123
--
-- その後、以下のSQLで profiles レコードを作成：
-- INSERT INTO profiles (id, email, name, role, company_id)
-- VALUES (
--   '<auth.users.id>'::uuid,  -- Supabase Auth で作成されたユーザーIDを指定
--   'admin@example.com',
--   '管理者',
--   'admin',
--   'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid
-- );
