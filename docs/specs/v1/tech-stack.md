# 技術スタック概要

本ドキュメントは `README.md`、`frontend/package.json`、`supabase/` 配下の設定、および `frontend/src` の実装をもとに、特定技能在留資格管理システムの技術スタックを整理したものです。

## システム全体構成
- **フロントエンド**: Vite + React + TypeScript による SPA。shadcn/ui / Tailwind で UI を構築し、React Router で画面遷移を管理。
- **バックエンド**: Supabase（PostgreSQL + Auth + Storage）を採用し、`schema.sql`・`rls_policies.sql` でデータモデルと RLS を定義。
- **インフラ**: Vercel でフロントエンドをホストし、Preview／Production の環境分離を実施。Supabase は開発・本番の 2 プロジェクト運用。

## フロントエンド
- **フレームワーク / ツール**  
  - `react@18`, `react-dom@18`: UI レンダリング。  
  - `vite@5` + `@vitejs/plugin-react`: 開発サーバーとビルド。`vite-tsconfig-paths` でエイリアス解決。  
  - `typescript@5`: 型定義。`src/types` 配下にドメイン型を集中管理。
- **UI / スタイリング**  
  - `tailwindcss@3`, `tailwind-merge`, `clsx`, `class-variance-authority`: ユーティリティクラス駆動のデザイン。  
  - `shadcn/ui` コンポーネント群 (`frontend/src/components/ui/*`) と `@radix-ui/react-*` (Dialog, DropdownMenu, Select, Toast など) を活用し、アクセシビリティを担保。  
  - `lucide-react`: アイコンセット。
- **フォーム / バリデーション**  
  - `react-hook-form`, `@hookform/resolvers`, `zod`: 各種フォームでのバリデーションと型安全な入力 (`pages/*Form.tsx`, `ForeignerListPage.tsx` など)。
- **状態管理 / データアクセス**  
  - React Context による状態管理 (`frontend/src/state/*`, `context/AppStateContext.tsx`)。  
  - `frontend/src/api/*.service.ts` にビジネスロジック層を配置し、`services/supabase/client.ts` 経由で Supabase と通信。  
  - `api/mappers/*` で snake_case ⇔ camelCase 変換を実装し、API 応答を UI フレンドリーな形に整形。
- **ユーティリティ**  
  - `react-router-dom@6`: ルーティング（`App.tsx` でページ構成）。  
  - `jspdf`, `html2canvas`: 書類の PDF 出力機能の基盤（現状はモック）。  
  - `tailwindcss-animate`: アニメーションユーティリティ。

## バックエンド（Supabase）
- **データストア**: PostgreSQL。`supabase/schema.sql` で `companies`, `foreigners`, `documents`, `activity_logs`, `profiles` を定義し、トリガーで `updated_at` を更新。
- **セキュリティ**: `supabase/rls_policies.sql` により全テーブルで RLS を有効化。ユーザーの `company_id` 単位でアクセス制御。  
- **認証**: Supabase Auth（メール／パスワード）。`frontend/src/state/auth/AuthContext.tsx` でサインイン・サインアウト・セッション維持を実装。
- **シード**: 開発向けに `supabase/seed.sql` でテストデータを投入。TRUNCATE を含むため本番では未使用。
- **拡張性**: Supabase Storage や Edge Functions との連携余地を残した状態。

## インフラ・デプロイ
- **Vercel**  
  - `vercel.json` に SPA ルーティングの rewrite 設定を記述。  
  - Preview デプロイと Production デプロイを使い分け、環境変数で接続先 Supabase を切り替え。  
- **環境変数管理**  
  - `frontend/env.example` を基に `.env.local`（ローカル）と Vercel の環境変数を設定。  
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` が最低限必要。

## 開発フロー / ツール
- npm scripts: `dev`, `build`, `preview`。`frontend/` 直下で実行。
- Supabase CLI または Web Console を用いたスキーマ反映、RLS 設定、データ投入。
- `docs/environment-setup.md` と `docs/setup.md` に環境構築・運用手順を明記。

## 今後の技術検討
- PDF 出力や帳票生成の本実装に向け、`jspdf` の設定や Supabase Storage 連携を検証。
- Activity Log の分析や通知連携に向けた Supabase Functions / Webhook の導入余地。
- テスト戦略（React Testing Library など）の導入検討。現状テストセットアップは未実施。
