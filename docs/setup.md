# Supabase バックエンド セットアップ手順書

このドキュメントでは、特定技能外国人管理システムのバックエンドとしてSupabaseをセットアップする手順を説明します。  
プロトタイプ段階では **Supabase プロジェクトを「開発（ステージング兼用）」と「本番」の 2 つ用意** する想定です。以下の手順は次の順番で実行してください。

1. まず開発用 Supabase プロジェクトに対してすべての手順（1〜7章）を実施し、動作を確認する  
2. 問題がなければ本番 Supabase プロジェクトにも **1〜3章と5章** を適用する  
   - `supabase/seed.sql`（第4章）は開発データを投入するためのもので、本番では実行しない  
3. 以降、スキーマや RLS を変更する際も同じ流れで「開発で検証 → 本番へ反映」する

## 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [データベーススキーマの作成](#2-データベーススキーマの作成)
3. [Row Level Security (RLS) の設定](#3-row-level-security-rls-の設定)
4. [初期データの投入](#4-初期データの投入)
5. [認証ユーザーの作成](#5-認証ユーザーの作成)
6. [フロントエンドの設定](#6-フロントエンドの設定)
7. [動作確認](#7-動作確認)
8. [トラブルシューティング](#8-トラブルシューティング)

---

## 1. Supabaseプロジェクトの作成

### 1.1 アカウント作成とログイン

1. [Supabase](https://supabase.com) にアクセス
2. **Start your project** をクリックしてアカウントを作成（GitHub連携推奨）
3. ダッシュボードにログイン

### 1.2 新規プロジェクトの作成

1. ダッシュボードで **New Project** をクリック
2. 以下の情報を入力：
   - **Name**: `ssw-saas` （任意の名前）
   - **Database Password**: 安全なパスワードを生成（後で必要になるので保存）
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本からのアクセスが最も速い）
   - **Pricing Plan**: `Free` を選択
3. **Create new project** をクリック
4. プロジェクトの初期化が完了するまで待機（1〜2分）

### 1.3 APIキーの取得

1. プロジェクトダッシュボードで **Settings** → **API** に移動
2. 以下の情報をコピーして保存：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 2. データベーススキーマの作成

### 📝 ファイル構成について

`supabase/` ディレクトリには以下のファイルがあります：

- **統合版ファイル**（SQL Editor用）:
  - `schema.sql` - テーブル、トリガー、インデックスの統合版
  - `rls_policies.sql` - RLSポリシーの統合版
  - `seed.sql` - 初期データ

- **個別ファイル**（開発用）:
  - `schema/tables.sql`, `schema/triggers.sql`, `schema/indexes.sql`
  - `policies/companies.sql`, `policies/foreigners.sql`, など

**このセットアップでは統合版ファイル**を使用します。Supabase SQL Editor では `\ir` コマンドが使えないため、統合版が推奨です。

---

### 2.1 SQL Editorを開く

1. 左サイドバーの **SQL Editor** をクリック
2. **New query** をクリック

### 2.2 スキーマとトリガーの実行

1. `supabase/schema.sql` ファイルの内容をコピー
   - このファイルには、テーブル定義・トリガー・インデックスがすべて含まれています
   - Supabase SQL Editor で実行できるように統合されています
2. SQL Editorにペースト
3. **Run** ボタン（または `Cmd/Ctrl + Enter`）をクリックして実行
4. 成功メッセージが表示されることを確認
   - "Success. No rows returned" のようなメッセージが表示されればOK

### 2.3 テーブルの確認

1. 左サイドバーの **Table Editor** をクリック
2. 以下のテーブルが作成されていることを確認：
   - `companies`
   - `foreigners`
   - `documents`
   - `activity_logs`
   - `profiles`

---

## 3. Row Level Security (RLS) の設定

### 3.1 RLSポリシーの実行

1. **SQL Editor** に戻る
2. **New query** をクリック
3. `supabase/rls_policies.sql` ファイルの内容をコピー
   - このファイルには、全テーブルのRLS有効化とポリシー定義がすべて含まれています
   - 会社ごとにデータを分離するマルチテナント対応のポリシーです
4. SQL Editorにペースト
5. **Run** をクリックして実行
6. 成功メッセージが表示されることを確認

### 3.2 RLSの確認

1. **Table Editor** → 任意のテーブルを選択
2. 右上の **RLS** タブをクリック
3. 各テーブルでRLSが **Enabled** になっていることを確認
4. 設定されたポリシーの一覧が表示されることを確認

---

## 4. 初期データの投入

### 4.1 初期データの実行

1. **SQL Editor** で **New query** をクリック
2. `supabase/seed.sql` ファイルの内容をコピー
3. SQL Editorにペースト
4. **Run** をクリックして実行

⚠️ **警告**: このスクリプトは既存のデータをすべて削除します。本番環境では実行しないでください。

### 4.2 データの確認

1. **Table Editor** を開く
2. 各テーブルにデータが追加されていることを確認：
   - `companies`: 1件（サンプル受入機関株式会社）
   - `foreigners`: 3件（田中 太郎、佐藤 花子、グエン ティン）
   - `documents`: 3件
   - `activity_logs`: 3件

---

## 5. 認証ユーザーの作成

### 5.1 ユーザーの手動作成

1. **Authentication** → **Users** に移動
2. **Add user** → **Create new user** をクリック
3. 以下の情報を入力：
   - **Email**: `admin@example.com`
   - **Password**: `password123`（または任意の安全なパスワード）
   - **Auto Confirm User**: チェックを入れる
4. **Create user** をクリック
5. 作成されたユーザーの **UID** をコピーして保存

### 5.2 プロフィールの作成

1. **SQL Editor** で **New query** をクリック
2. 以下のSQLを貼り付け（`<USER_ID>`を先ほどコピーしたUIDに置き換え）：

```sql
INSERT INTO profiles (id, email, name, role, company_id)
VALUES (
  '<USER_ID>'::uuid,  -- 作成したユーザーのUID
  'admin@example.com',
  '管理者',
  'admin',
  'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid
);
```

3. **Run** をクリックして実行

### 5.3 プロフィールの確認

1. **Table Editor** → **profiles** を開く
2. 作成したユーザーのプロフィールが表示されることを確認

---

## 6. フロントエンドの設定

### 6.1 環境変数の設定

1. `frontend/env.example` を `frontend/.env.local` にコピー

```bash
cp frontend/env.example frontend/.env.local
```

2. `.env.local` を開いて、取得したSupabaseの情報を設定：

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # 手順1.3で取得したURL
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 手順1.3で取得したAnon Key
```

### 6.2 依存パッケージのインストール

すでに `@supabase/supabase-js` がインストールされていることを確認：

```bash
cd frontend
npm install
```

### 6.3 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

---

## 7. 動作確認

### 7.1 ログイン

1. ログインページで以下の情報を入力：
   - **Email**: `admin@example.com`
   - **Password**: `password123` （または設定したパスワード）
2. **ログイン** をクリック
3. ダッシュボードにリダイレクトされることを確認

### 7.2 データの表示確認

1. **特定技能外国人一覧** に3名のデータが表示されることを確認
2. **書類一覧** に3件の書類が表示されることを確認
3. **ダッシュボード** にアクティビティログが表示されることを確認

### 7.3 データの作成・更新・削除

1. 新しい外国人データを追加
2. 書類を作成
3. 会社情報を更新
4. すべての操作がSupabaseに保存されることを確認

### 7.4 Supabaseでデータ確認

1. Supabase の **Table Editor** でデータが更新されていることを確認
2. リアルタイムで反映されていることを確認

---

## 8. トラブルシューティング

### 問題: ログインできない

**原因と対処法**:

1. **ユーザーが作成されていない**
   - 手順5.1を確認してユーザーを作成
   - `Auto Confirm User` にチェックが入っているか確認

2. **プロフィールが作成されていない**
   - 手順5.2を確認してプロフィールを作成
   - `profiles` テーブルにレコードがあるか確認

3. **環境変数が正しくない**
   - `.env.local` のURLとAnon Keyを再確認
   - 開発サーバーを再起動

### 問題: データが表示されない

**原因と対処法**:

1. **RLSポリシーが正しく設定されていない**
   - 手順3を再実行
   - ポリシーが有効になっているか確認

2. **初期データが投入されていない**
   - 手順4を実行
   - `Table Editor` でデータを確認

3. **ブラウザのコンソールエラーを確認**
   - F12 で開発者ツールを開く
   - Console タブでエラーメッセージを確認

### 問題: "User not found" エラー

**原因**: プロフィールが作成されていない

**対処法**:
- 手順5.2を実行してプロフィールを作成
- `profiles` テーブルの `id` がAuthenticationの `UID` と一致しているか確認

### 問題: CORS エラー

**原因**: SupabaseのCORS設定

**対処法**:
- 通常、Supabaseは自動的にCORSを許可します
- それでも問題がある場合は、Supabaseのサポートに問い合わせ

---

## 本番デプロイ

### Vercelへのデプロイ

1. Vercelプロジェクトの **Settings** → **Environment Variables** に移動
2. 以下の環境変数を追加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. デプロイ

### セキュリティのベストプラクティス

- **Anon Key** は公開されても安全ですが、RLSポリシーが正しく設定されていることを確認
- 本番環境では、Supabaseの **Database Settings** でバックアップを有効化
- Supabaseの **Auth Settings** で許可するドメインを制限

---

## まとめ

これでSupabaseバックエンドのセットアップは完了です！

- ✅ データベーススキーマ作成
- ✅ RLSポリシー設定
- ✅ 初期データ投入
- ✅ 認証ユーザー作成
- ✅ フロントエンド統合

問題が発生した場合は、[Supabaseドキュメント](https://supabase.com/docs)を参照してください。
