# Supabase バックエンド実装プラン

## 実装状況: ✅ 完了

このドキュメントは、特定技能外国人管理システムのSupabaseバックエンド統合の実装プランです。

---

## 1. Supabaseプロジェクトのセットアップ

### Supabaseプロジェクト作成 ⏳ ユーザー作業

- [ ] Supabase（https://supabase.com）でアカウント作成/ログイン
- [ ] 新規プロジェクトを作成（リージョン: 東京推奨）
- [ ] プロジェクトURLとanon keyを取得

### 環境変数設定 ⏳ ユーザー作業

`frontend/.env.local`を作成：

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 2. データベーススキーマ設計 ✅ 完了

### 作成済みファイル

- ✅ `supabase/schema.sql` - テーブル定義とトリガー
- ✅ `supabase/rls_policies.sql` - Row Level Securityポリシー
- ✅ `supabase/seed.sql` - 初期データ

### テーブル構成

#### `companies`テーブル
- 受入機関の基本情報
- id, name, address, representative, phone, registration_number

#### `foreigners`テーブル
- 特定技能外国人の情報
- id, company_id, name, name_kana, nationality, birth_date, passport_number
- residence_status, residence_period, work_category, notes

#### `documents`テーブル
- 申請書類の管理
- id, type, title, status, foreigner_id, data (JSONB)

#### `activity_logs`テーブル
- システムアクティビティログ
- id, message, created_at

#### `profiles`テーブル（ユーザープロフィール）
- 認証ユーザーの情報
- id (auth.users参照), email, name, role, company_id

### トリガー（updated_atの自動更新）

すべてのテーブルに`update_updated_at()`トリガー関数を設定済み

---

## 3. Row Level Security (RLS)の設定 ✅ 完了

各テーブルでRLSを有効化し、ユーザーは自分の会社のデータのみアクセス可能：

- ✅ すべてのテーブルでRLS有効化
- ✅ profiles: 自分のプロフィールのみアクセス可能
- ✅ companies: 自分の会社のみアクセス可能
- ✅ foreigners: 自分の会社の外国人データのみアクセス可能
- ✅ documents: 自分の会社の書類のみアクセス可能
- ✅ activity_logs: 認証済みユーザー全員がアクセス可能

---

## 4. フロントエンド統合 ✅ 完了

### パッケージインストール ✅

```bash
cd frontend
npm install @supabase/supabase-js
```

### Supabaseクライアント作成 ✅

- ✅ `frontend/src/services/supabase/client.ts` を作成
  - 環境変数からURL/Anon Key取得
  - セッション永続化設定
- ✅ `frontend/src/services/supabase/types.ts` を作成
  - データベース型定義（全テーブル）

### 認証機能の実装 ✅

- ✅ `frontend/src/state/auth/AuthContext.tsx` を完全リライト
  - `supabase.auth.signInWithPassword()` でログイン
  - `supabase.auth.signOut()` でログアウト
  - `supabase.auth.onAuthStateChange()` でセッション管理
  - プロフィール情報の自動取得

### データフェッチ機能の実装 ✅

`frontend/src/api/` 配下に各エンティティ用のAPIサービスを作成：

- ✅ `foreigners.service.ts` - 外国人データのCRUD
  - getForeigners, getForeignerById, createForeigner, updateForeigner, deleteForeigner

- ✅ `documents.service.ts` - 書類データのCRUD
  - getDocuments, getDocumentById, getDocumentsByForeignerId
  - createDocument, updateDocument, updateDocumentStatus, deleteDocument

- ✅ `company.service.ts` - 会社情報の取得・更新
  - getCompany, getCompanyById, updateCompany

- ✅ `activity-logs.service.ts` - アクティビティログの取得・作成
  - getActivityLogs, createActivityLog

- ✅ `mappers/` - データ変換層
  - `foreigners.ts`, `documents.ts`, `company.ts`, `activityLogs.ts`
  - snake_case ⇔ camelCase の変換を担当

- ✅ `index.ts` - APIモジュールのエクスポート

### AppStateContextの修正 ✅

`frontend/src/state/app/AppStateContext.tsx` を修正：

- ✅ 初期ロード時にSupabaseからデータ取得
- ✅ CUD操作時にSupabaseへ保存
- ✅ オプティミスティックUIの実装
- ✅ ロールバック機能の追加
- ✅ 新しいアクション関数の追加
  - createForeigner, updateForeigner, deleteForeigner
  - createDocument, updateDocument, updateDocumentStatus, deleteDocument
  - updateCompany, createActivity

`frontend/src/state/shared/apiExecutor.ts` を作成：

- ✅ API実行の共通ロジックを抽象化
- ✅ オプティミスティックUI、エラーハンドリング、ロールバックを統一

---

## 5. 初期データの投入 ✅ 完了

Supabase SQL Editorで実行するSQLファイルを作成：

- ✅ `supabase/seed.sql`
  - サンプル会社データ（1件）
  - サンプル外国人データ（3件）
  - サンプル書類データ（3件）
  - サンプルアクティビティログ（3件）

---

## 6. 認証機能のテスト ⏳ ユーザー作業

- [ ] Supabase Authenticationで手動でユーザーを作成（email: admin@example.com）
- [ ] `profiles`テーブルに対応するプロフィールを作成
- [ ] ログイン/ログアウトの動作確認

---

## 7. ドキュメント作成 ✅ 完了

- ✅ `SUPABASE_SETUP.md` - 詳細なセットアップ手順書
  - Supabaseプロジェクト作成
  - データベーススキーマ実行
  - RLS設定
  - 初期データ投入
  - 認証ユーザー作成
  - フロントエンド設定
  - 動作確認
  - トラブルシューティング

- ✅ `README.md` の更新
  - 技術スタックにSupabaseを追加
  - ディレクトリ構成の更新
  - セットアップ手順の全面改訂
  - デプロイ手順の更新

- ✅ `frontend/env.example` - 環境変数サンプル

---

## 実装の優先順位

1. ✅ Supabaseプロジェクト作成と環境変数設定（SQLファイル準備完了）
2. ✅ データベーススキーマ作成（schema.sql作成完了）
3. ✅ 初期データ投入とRLS設定（seed.sql, rls_policies.sql作成完了）
4. ✅ フロントエンド: Supabaseクライアント作成
5. ✅ フロントエンド: 認証機能の実装
6. ✅ フロントエンド: データフェッチAPIの実装
7. ✅ フロントエンド: AppStateContextの修正
8. ⏳ 動作確認とデバッグ（ユーザー作業）

---

## メリット

- ✅ **高速実装**: バックエンドコードをほぼ書かずに完全なAPI
- ✅ **型安全**: TypeScriptで完全型付け
- ✅ **セキュリティ**: RLSで行レベルのアクセス制御
- ✅ **スケーラブル**: PostgreSQLベースで本番運用も可能
- ✅ **無料枠**: 開発には十分な無料プランあり
- ✅ **リアルタイム**: Supabaseのリアルタイム機能に対応可能

---

## 次のステップ（ユーザー作業）

1. **Supabaseプロジェクトを作成**
   - https://supabase.com でアカウント作成
   - 新規プロジェクトを作成（リージョン: 東京）

2. **SQLファイルを実行**
   - Supabase SQL Editorで以下を順番に実行：
     1. `supabase/schema.sql`
     2. `supabase/rls_policies.sql`
     3. `supabase/seed.sql`

3. **認証ユーザーを作成**
   - Supabase Authentication → Users → Add user
   - Email: admin@example.com
   - Password: password123
   - Auto Confirm User: チェック
   - profiles テーブルにプロフィールを作成

4. **環境変数を設定**
   - `frontend/env.example` を `frontend/.env.local` にコピー
   - VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定

5. **開発サーバーを起動**
   ```bash
   cd frontend
   npm run dev
   ```

6. **動作確認**
   - ログイン
   - データの表示確認
   - CRUD操作のテスト

詳細は **SUPABASE_SETUP.md** を参照してください。

---

## 実装完了チェックリスト

### バックエンド（Supabase）
- [x] データベーススキーマファイル作成
- [x] RLSポリシーファイル作成
- [x] 初期データファイル作成
- [ ] Supabaseプロジェクト作成（ユーザー作業）
- [ ] SQLファイルの実行（ユーザー作業）

### フロントエンド
- [x] @supabase/supabase-js インストール
- [x] Supabaseクライアント作成
- [x] 認証機能統合
- [x] API モジュール実装（foreigners, documents, company, activities）
- [x] AppStateContext統合
- [x] 環境変数サンプル作成

### ドキュメント
- [x] SUPABASE_SETUP.md 作成
- [x] README.md 更新
- [x] env.example 作成
- [x] IMPLEMENTATION_PLAN.md 作成（このファイル）

### テスト・動作確認
- [ ] 認証ユーザー作成（ユーザー作業）
- [ ] ログイン/ログアウトテスト（ユーザー作業）
- [ ] データCRUD操作テスト（ユーザー作業）

---

## トラブルシューティング

問題が発生した場合は、以下を参照してください：

1. **SUPABASE_SETUP.md** のトラブルシューティングセクション
2. [Supabase公式ドキュメント](https://supabase.com/docs)
3. [Supabase Discord コミュニティ](https://discord.supabase.com)

---

**実装日**: 2025年10月13日  
**ステータス**: フロントエンド実装完了 / バックエンドセットアップ待ち

