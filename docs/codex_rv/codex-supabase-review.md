# Supabase連携コードレビュー依頼

## 目的
Supabaseバックエンドとの連携が正常に動作しているか、認証・CRUD操作・エラーハンドリングの観点からコードレビューを実施。特に「画面側がローカルstateのみでSupabaseに反映されない」問題の再発防止と、認証フローの安定性を確認したい。

## 対象プロジェクト
- フロントエンド: React + TypeScript + Vite
- バックエンド: Supabase (PostgreSQL + Auth + RLS)
- 状態管理: React Context + useReducer
- 認証: Supabase Auth
- データベース: PostgreSQL (Supabase)

## レビュー対象ファイル（重要度順）

### 1. 認証・セッション管理
- `frontend/src/state/auth/AuthContext.tsx` - 認証状態管理
- `frontend/src/pages/Login.tsx` - ログイン画面
- `frontend/src/App.tsx` - ルーティング・認証ガード

### 2. データ取得・CRUD操作
- `frontend/src/state/app/AppStateContext.tsx` - アプリ状態管理・初期データロード
- `frontend/src/api/*.service.ts` - Supabase API呼び出し
- `frontend/src/api/mappers/*.ts` - データ変換

### 3. 画面コンポーネント（CRUD操作）
- `frontend/src/pages/ForeignerListPage.tsx` - 外国人一覧・追加
- `frontend/src/pages/DocumentListPage.tsx` - 書類一覧・削除
- `frontend/src/pages/ResidenceStatusForm.tsx` - 書類作成
- `frontend/src/pages/CompanyInfoPage.tsx` - 会社情報更新

### 4. 設定・接続
- `frontend/src/lib/supabase.ts` - Supabaseクライアント設定
- `frontend/.env.local` - 環境変数（URL/Anon Key）

## 技術的懸念事項

### 1. 認証フローの安定性
- `onAuthStateChange` の適切な購読・解除
- `isInitializing` の状態管理
- セッション失効時の処理
- プロフィール取得失敗時のフォールバック

### 2. データ同期の一貫性
- 画面操作 → Supabase API → ローカルstate更新の流れ
- オプティミスティックUI更新の実装
- エラー時のロールバック処理
- 同時実行制御（重複リクエスト防止）

### 3. エラーハンドリング
- ネットワークエラー・認証エラー・RLS拒否の区別
- ユーザーへの適切なエラー表示
- ログ出力の充実度

### 4. パフォーマンス・UX
- 初期ロード時のデータ取得戦略
- ローディング状態の表示
- キャッシュ戦略

## 過去の問題と修正内容

### 問題1: 画面側がローカルstateのみ更新
- **問題**: 画面側が `dispatch({ type: 'ADD_*' })` でローカルstateのみ更新
- **修正**: `actions.createForeigner/createDocument/updateCompany` 経由でSupabase連携

### 問題2: 未認証時の初期データロードで例外発生
- **問題**: 未認証時の初期データロードで例外発生
- **修正**: セッション確認後にロード、認証イベント連動

## 期待する回答形式

### 1. Critical Issues（即座に修正が必要）
- セキュリティリスク
- データ不整合の可能性
- 認証バイパスのリスク

### 2. Warning Issues（修正推奨）
- パフォーマンス問題
- エラーハンドリング不備
- ユーザビリティ問題

### 3. Suggestions（改善提案）
- コード品質向上
- 保守性向上
- テスト容易性

### 4. Good Practices（良い実装）
- 適切な設計パターン
- セキュリティベストプラクティス

## 特に確認してほしい観点

- 認証状態とデータ取得の同期（認証完了 → データロード）
- CRUD操作の一貫性（画面操作 → Supabase → state更新）
- エラー時の適切なフォールバック
- セッション管理の堅牢性
- RLSポリシーとの整合性
