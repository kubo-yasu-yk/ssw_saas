# 特定技能 在留資格管理システム

特定技能外国人の在留資格管理を効率化するWebアプリケーションです。Vite + React + TypeScript + Tailwind で構成されたフロントエンドと、Supabaseをバックエンドとして使用しています。  
デプロイの再実行が必要な場合は、`main` ブランチに軽微な変更をコミットして push するだけで Vercel の Production が自動で再デプロイされます。

## ディレクトリ構成

```
.
├─ README.md
├─ docs/                      # ドキュメント
│  ├─ setup.md                # Supabaseセットアップ手順書
│  ├─ implementation.md       # 実装プラン
│  └─ codex-review.md         # コードレビュー依頼
├─ frontend/                  # フロントエンド一式（Vite プロジェクト）
│  └─ src/
│     ├─ api/                 # ビジネスロジック層
│     │  ├─ *.service.ts      # APIサービス（CRUD操作）
│     │  └─ mappers/          # データ変換層（snake_case ⇔ camelCase）
│     ├─ services/            # インフラ層
│     │  └─ supabase/         # Supabaseクライアント・型定義
│     ├─ state/               # 状態管理層
│     │  ├─ app/              # アプリケーション状態
│     │  ├─ auth/             # 認証状態
│     │  └─ shared/           # 共通ロジック（apiExecutor）
│     ├─ components/          # UIコンポーネント
│     ├─ pages/               # ページコンポーネント
│     ├─ types/               # 型定義
│     ├─ utils/               # ユーティリティ関数
│     └─ mocks/               # テストデータ
├─ supabase/                  # Supabaseデータベーススキーマ・ポリシー
│  ├─ schema.sql              # テーブル定義とトリガー（統合版）
│  ├─ rls_policies.sql        # Row Level Securityポリシー（統合版）
│  ├─ seed.sql                # 初期データ（開発用）
│  ├─ schema/                 # スキーマ個別ファイル（開発用）
│  └─ policies/               # ポリシー個別ファイル（開発用）
└─ vercel.json                # Vercel 用ルーティング/ビルド設定
```

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **スタイリング**: Tailwind CSS + shadcn/ui
- **状態管理**: React Context API
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **認証**: Supabase Auth
- **フォーム**: React Hook Form + Zod
- **アーキテクチャ**: レイヤードアーキテクチャ（Service層 / Mapper層 / State層）

## アーキテクチャ

このプロジェクトは、**クリーンアーキテクチャ**の原則に基づいた階層構造を採用しています。

### レイヤー構成

```
┌─────────────────────────────────────────┐
│  Presentation Layer (pages, components) │  ← UIコンポーネント
├─────────────────────────────────────────┤
│  State Layer (state/)                   │  ← 状態管理・Context
├─────────────────────────────────────────┤
│  Business Logic Layer (api/)            │  ← ビジネスロジック
│  - *.service.ts                         │
│  - mappers/ (データ変換)                │
├─────────────────────────────────────────┤
│  Infrastructure Layer (services/)       │  ← 外部サービス統合
│  - supabase/ (DB接続)                   │
└─────────────────────────────────────────┘
```

### 各層の責務

1. **Business Logic Layer** (`api/`)
   - CRUD操作の実装
   - ビジネスルールの適用
   - データの取得・加工

2. **Mapper Layer** (`api/mappers/`)
   - データベース型 ⇔ アプリケーション型の変換
   - snake_case ⇔ camelCase の変換
   - 型安全な変換処理

3. **Infrastructure Layer** (`services/`)
   - Supabaseクライアントの管理
   - 外部APIとの通信
   - データベース型定義

4. **State Layer** (`state/`)
   - React Contextによる状態管理
   - 共通ロジック（`apiExecutor`）
   - オプティミスティックUI・エラーハンドリング

### 設計パターン

- **Repository Pattern**: `*.service.ts` がデータアクセスを抽象化
- **Mapper Pattern**: `mappers/` でデータ変換を分離
- **Strategy Pattern**: `apiExecutor` で実行戦略を統一
- **Dependency Injection**: Supabaseクライアントを注入

## 📚 ドキュメント

- **[セットアップ手順](./docs/setup.md)** - Supabaseバックエンドの詳細なセットアップ手順
- **[環境設計ガイド](./docs/environment-setup.md)** - 開発／本番の Supabase・Vercel 構成ポリシー

## セットアップ

### 1. Supabaseバックエンドのセットアップ

詳細な手順は **[docs/setup.md](./docs/setup.md)** を参照してください。

**概要**:
1. Supabaseプロジェクトを作成
2. `supabase/schema.sql` でデータベーススキーマを作成
3. `supabase/rls_policies.sql` でRow Level Securityを設定
4. `supabase/seed.sql` で初期データを投入
5. 認証ユーザーとプロフィールを作成

### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

### 3. 環境変数の設定

`frontend/env.example` を `frontend/.env.local` にコピーして編集：

```bash
cp frontend/env.example frontend/.env.local
```

`.env.local` に以下を設定：

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 開発サーバーの起動

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

## ビルド

```
cd frontend
npm run build
npm run preview
```

## デプロイ（Vercel）

### 1. Supabaseプロジェクトの準備

本番環境用のSupabaseプロジェクトを作成するか、開発環境と同じプロジェクトを使用

### 2. Vercelへのデプロイ

1. リポジトリをGitHub等にpush
2. Vercelで **New Project** → リポジトリをインポート
3. Framework Preset: **Vite**（自動検出）
4. Build Command: `npm --prefix frontend run build`
5. Output Directory: `frontend/dist`
6. **Environment Variables** に以下を設定：
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key
7. **Deploy** をクリック

SPA ルーティング用に `vercel.json` でルートを `/` にリライトしています。

## ログイン情報（開発環境）

初期セットアップで作成したユーザー：
- email: `admin@example.com`
- password: `password123` （またはセットアップ時に設定したパスワード）

## 主な機能

### 認証・ユーザー管理
- Supabase Authによる認証（メール/パスワード）
- ユーザープロフィール管理
- 会社ごとのデータ分離（Row Level Security）

### 特定技能外国人管理
- 外国人データのCRUD操作
- 在留資格情報の管理
- 個人情報の安全な保存

### 書類管理
- 在留資格認定証明書交付申請
- 在留期間更新許可申請
- 在留資格変更許可申請
- 定期面談報告書
- 随時届出（退職）報告
- 書類のプレビュー・PDF出力（準備中）

### 会社情報管理
- 受入機関情報の登録・更新
- 登録支援機関情報の管理

### その他
- ダッシュボード（統計情報）
- アクティビティログ
- リアルタイムデータ同期
- オプティミスティックUI
- エラーハンドリング

## データベース構成

### テーブル一覧

| テーブル | 説明 | 対応サービス |
|---------|------|-------------|
| `companies` | 受入機関情報 | `company.service.ts` |
| `foreigners` | 特定技能外国人情報 | `foreigners.service.ts` |
| `documents` | 申請書類 | `documents.service.ts` |
| `activity_logs` | アクティビティログ | `activity-logs.service.ts` |
| `profiles` | ユーザープロフィール | `AuthContext` |

### セキュリティ

- **Row Level Security (RLS)**: 全テーブルで有効化
- **マルチテナント対応**: 会社ごとにデータを分離
- **認証**: Supabase Auth（JWT トークン）

詳細は `supabase/schema.sql` および `supabase/rls_policies.sql` を参照してください。

## コード例

### サービスの使い方

```typescript
// api/foreigners.service.ts を使用
import { getForeigners, createForeigner } from '@api/foreigners.service'

// 外国人一覧を取得
const foreigners = await getForeigners()

// 新規作成
const newForeigner = await createForeigner({
  companyId: 'xxx',
  name: '田中 太郎',
  // ...
})
```

### Mapperの使い方

```typescript
// api/mappers/foreigners.ts
import { mapForeignerRow } from '@api/mappers/foreigners'

// データベース型 → アプリケーション型
const foreigner: Foreigner = mapForeignerRow(dbRow)
```
