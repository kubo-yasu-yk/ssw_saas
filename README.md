# 特定技能 在留資格管理モック

ニーズ検証のためのフロントエンドのみのモック実装です。Vite + React + TypeScript + Tailwind で構成し、データはハードコーディング/ローカルストレージで扱います。

## ディレクトリ構成

```
.
├─ README.md
├─ frontend/          # フロントエンド一式（Vite プロジェクト）
└─ vercel.json        # Vercel 用ルーティング/ビルド設定
```

フロントエンドに関するコードや設定、依存関係は `frontend/` 配下に集約しています。バックエンドなどを追加する際は、リポジトリ直下に新しいディレクトリを作成して並列に配置してください。

## 開発

```
cd frontend
npm install
npm run dev
```

### 環境変数

- `frontend/.env.local` を作成し、開発環境の `REACT_APP_API_URL`（任意で `VITE_API_URL`）を設定してください。サンプルは `frontend/.env.local.example` を参照します。
- 本番環境向けの変数はデプロイ環境側で設定するか、必要に応じて `frontend/.env.production` などを用意してください。
- Vite の `envPrefix` に `REACT_APP_` を追加しているため、既存の React アプリと同様の命名で API エンドポイントを参照できます。

## ビルド

```
cd frontend
npm run build
npm run preview
```

## デプロイ（Vercel）

1. リポジトリを GitHub 等に push
2. Vercel で New Project → リポジトリをインポート
3. Framework Preset: Vite（自動検出されます）
4. Build Command: `npm --prefix frontend run build`、Output Directory: `frontend/dist`
5. Deploy

SPA ルーティング用に `vercel.json` でルートを `/` にリライトしています。

注意: ニーズ検証用モックのため、実データ（個人情報）は入力しないでください。検索エンジンのインデックス抑止として `frontend/public/robots.txt` と `vercel.json` の `X-Robots-Tag` ヘッダを設定しています。

## ログイン情報（モック）

- email: `admin@example.com`
- password: `password123`

## 主な機能

- 認証（モック）、ルートガード、基本レイアウト
- 書類フォーム（認定/更新/変更、面談/随時報告）プレビューと PDF 出力
- 書類一覧、特定技能外国人一覧（簡易追加）、会社情報（保存）
- API 連携準備のための抽象化レイヤー（ApiClient）、JWT トークン管理、統一的なエラートースト/ローディング制御

詳細は `.kiro/specs/tokutei-ginou-management` を参照してください。
