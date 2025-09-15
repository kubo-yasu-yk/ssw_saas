# 特定技能 在留資格管理モック

ニーズ検証のためのフロントエンドのみのモック実装です。Vite + React + TypeScript + Tailwind で構成し、データはハードコーディング/ローカルストレージで扱います。

## 開発

```
npm install
npm run dev
```

## ビルド

```
npm run build
npm run preview
```

## デプロイ（Vercel）

1. リポジトリをGitHub等にpush
2. VercelでNew Project → リポジトリをインポート
3. Framework Preset: Vite（自動検出されます）
4. Build Command: `npm run build`、Output Directory: `dist`
5. Deploy

SPAルーティング用に `vercel.json` でルートを `/` にリライトしています。

注意: ニーズ検証用モックのため、実データ（個人情報）は入力しないでください。検索エンジンのインデックス抑止として `public/robots.txt` と `vercel.json` の `X-Robots-Tag` ヘッダを設定しています。

## ログイン情報（モック）

- email: `admin@example.com`
- password: `password123`

## 主な機能

- 認証（モック）、ルートガード、基本レイアウト
- 書類フォーム（認定/更新/変更、面談/随時報告）プレビューとPDF出力
- 書類一覧、特定技能外国人一覧（簡易追加）、会社情報（保存）

詳細は `.kiro/specs/tokutei-ginou-management` を参照してください。
# ssw_saas
