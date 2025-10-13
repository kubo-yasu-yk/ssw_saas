# 環境設計ガイド（開発／本番）

特定技能在留資格管理システムをローカル開発から本番運用まで安定して運用するための環境設計をまとめます。フロントエンドは Vercel、バックエンドは Supabase を前提としています。

---

## 1. 環境一覧

| 環境 | 目的 | フロントエンド | バックエンド (Supabase) | 主な利用者 |
| --- | --- | --- | --- | --- |
| ローカル開発 | 日常の実装・ユニットテスト | `npm run dev` (Vite) | 開発専用 Supabase プロジェクト or Supabase CLI | 開発者 |
| プレビュー | 動作確認・コードレビュー | Vercel Preview Deployment | ステージング Supabase プロジェクト | 開発者・レビュアー・QA |
| 本番 | 実運用 | Vercel Production | 本番 Supabase プロジェクト | エンドユーザー・管理者 |

---

## 2. Supabase 設計

### 2.1 プロジェクトの分離
- 開発／ステージング用 Supabase と本番 Supabase を分けるのが推奨。
- スキーマ変更や seed の適用をステージングで検証してから本番へ反映する運用とする。
- Supabase CLI (`supabase start`) を使えば、ローカル Docker 上で Supabase を起動してテストすることも可能。

### 2.2 運用フロー
1. `supabase/schema.sql`・`supabase/rls_policies.sql` をステージングへ適用（SQL Editor または CLI）。
2. ステージングで挙動を確認し問題なければ、本番プロジェクトにも同じ SQL を適用。
3. 認証ユーザー（`profiles`）や初期データは各環境ごとに手動登録（`seed.sql` は TRUNCATE を含むため開発専用）。

---

## 3. Vercel 設計

### 3.1 環境変数の管理
- ローカル: `frontend/.env.local` に開発用 Supabase の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を記載。
- Vercel Preview: `Settings → Environment Variables` で Scope を `Preview` に設定し、ステージング Supabase の値を登録。
- Vercel Production: Scope を `Production` にして本番 Supabase の値を登録。

### 3.2 ビルド設定
- Root Directory を `frontend` に設定。
- Build Command: `npm run build`
- Install Command: `npm install`
- Production Overrides が残っている場合は新しい本番デプロイを作成して上書きする。

---

## 4. 開発ワークフロー

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
