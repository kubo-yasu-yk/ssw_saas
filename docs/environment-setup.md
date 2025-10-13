# 環境設計ガイド（開発／本番）

特定技能在留資格管理システムをローカル開発から本番運用まで安定して運用するための環境設計をまとめます。フロントエンドは Vercel、バックエンドは Supabase を前提としています。

---

## 1. 環境一覧

| 環境 | 目的 | フロントエンド | バックエンド (Supabase) | 主な利用者 |
| --- | --- | --- | --- | --- |
| ローカル開発 | 日常の実装・ユニットテスト | `npm run dev` (Vite) | 開発専用 Supabase プロジェクト (ステージング兼用) or Supabase CLI | 開発者 |
| プレビュー | 動作確認・コードレビュー | Vercel Preview Deployment | 開発用 Supabase プロジェクト (本番と分離) | 開発者・レビュアー・QA |
| 本番 | 実運用 | Vercel Production | 本番 Supabase プロジェクト | エンドユーザー・管理者 |

---

## 2. 開発環境の設定

### 2.1 Supabase（開発／ステージング兼用）
- プロトタイプ段階では **開発／ステージング共有の Supabase プロジェクト** を 1 つ用意し、実装中のスキーマやデータを本番から切り離す。
- スキーマ変更や seed の適用はこの開発 Supabase 上で検証し、問題がなければ本番プロジェクトへ反映する。
- Supabase CLI (`supabase start`) を併用すると、ローカル Docker 上で Supabase を起動して検証することも可能。

### 2.2 フロントエンド（ローカル／Vercel Preview）
- ローカル `.env.local` に開発用 Supabase の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を記載して `npm run dev` で実行。
- Vercel Preview (ブランチデプロイ) の環境変数に、開発 Supabase の URL／anon key を設定しておく。
- Build 設定は Root Directory `frontend`、Build Command `npm run build`、Install Command `npm install` を使用する。

---

## 3. 本番環境の設定

### 3.1 Supabase（本番）
1. `supabase/schema.sql`・`supabase/rls_policies.sql` を適用（SQL Editor や CLI を利用）。SQL Editor では `schema/*.sql` や `policies/*.sql` を順番に実行する。
2. 開発 Supabase 上で確認済みの変更のみを本番へ反映する。
3. 認証ユーザー（`profiles`）や初期データは手動で登録する（`seed.sql` は TRUNCATE を含むため本番では使用しない）。

### 3.2 フロントエンド（Vercel Production）
- `Settings → Environment Variables` で Scope を `Production` に設定し、本番 Supabase の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を登録。
- Build 設定は開発環境と同じく Root Directory `frontend`、Build Command `npm run build`、Install Command `npm install` を使用する。
- 古い Production Overrides が残っている場合は、新しい本番デプロイを作成して設定を上書きする。

---

## 4. 運用フロー

1. **ローカル開発**  
   - `.env.local` の Supabase 開発用キーで `npm run dev`。
   - Supabase CLI や開発用プロジェクトで挙動確認。

2. **機能確認 (Preview)**  
   - ブランチを push すると Vercel が Preview デプロイを生成。
   - Preview ではステージング Supabase へ接続。レビュー・QA を実施。

3. **本番リリース**  
   - 問題なければ PR を `main` にマージ → Vercel が Production デプロイを実行。
   - 本番 Supabase のデータ整備（初期データ、ユーザー作成など）を確認。

---

## 5. 注意事項

- `supabase/seed.sql` は TRUNCATE を含むため本番環境では実行しない。必要な INSERT 文だけを手動適用する。
- RLS やテーブル制約の変更はステージングで検証してから本番へ適用する。
- Supabase の anon key は公開前提だが、漏えい時に備えて定期的なローテーションやアクセスログの監視を行う。
- Preview で本番データが混ざらないよう、環境ごとの `profiles`・`companies` を明確に分離する。

---

## 6. 参考リンク

- [Supabase CLI ドキュメント](https://supabase.com/docs/guides/cli)
- [Vercel Build & Development Settings](https://vercel.com/docs/deployments/configure-a-build)
- [Vite 環境変数](https://vitejs.dev/guide/env-and-mode.html)
