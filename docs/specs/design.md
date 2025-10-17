# MVP追加機能 設計書（Design）

## 1. アーキテクチャ概要
- 既存構成（React + Vite + Supabase）を維持しつつ、以下を追加：
  - Supabase PostgreSQL：進捗管理フィールド、証憑メタデータテーブル
  - Supabase Storage：証憑ファイル格納用バケット `documents-evidence`
  - フロントエンド：ダッシュボードカード、ステップ UI、ストレージ操作ロジック

```
[Supabase DB] <-> [supabase-js クライアント] <-> [React コンポーネント]
          \- Storage バケット (RLS) ↔ ファイル操作
```

## 2. データモデル変更
### 2.1 新規/変更テーブル
| テーブル | 変更内容 | 備考 |
| --- | --- | --- |
| `documents` | `progress_state JSONB` 追加。ステップIDと完了フラグを保持 | 例: `{ "checklist": [{"id":"form", "done":true}, ...] }` |
| `attachments` (新規) | 証憑メタ情報: `id`, `document_id`, `category`, `file_key`, `file_name`, `file_type`, `uploaded_by`, `uploaded_at` | `document_id` FK。`category` は `salary_ledger` など |

### 2.2 Storage
- バケット名：`documents-evidence`
- フォルダ構成：`/{companyId}/{documentId}/{category}`
- RLS ルール：JWT内の `company_id` がパスと一致する場合のみ read/write 許可。

## 3. データ取得・更新フロー
### 3.1 タスクサマリー取得
- フロントエンドから `supabase.from('documents')` や `supabase.from('foreigners')` を直接呼び出し、`type` / `status` / `deadline` でフィルタリング。
- 取得したレコードをフロント側で `reduce` し、カード表示用の `deadline_at`・`remaining_days`・`count` を算出。

### 3.2 進捗更新
- `documents` テーブルの `progress_state` を `supabase.from('documents').update()` で更新。
- 進捗判定ロジックはフロントエンドで実行し、DB では JSONB のキー存在チェック程度にとどめる（追加のトリガーは作成しない）。

### 3.3 証憑メタ保存
- フロントでファイルアップロード後、`attachments` にレコード挿入。
- ファイルキーは `companyId/documentId/category/timestamp.ext` を採用。

## 4. フロントエンド構成
### 4.1 コンポーネント
| 領域 | コンポーネント | 主な責務 |
| --- | --- | --- |
| ダッシュボード | `TaskBoardCard` | タスクデータ表示、残日数に応じたスタイル付け、CTA 実装 |
| 定期届出フォーム | `ProgressSteps` | ステップ表示、完了条件チェック、状態更新 |
| 在留更新フォーム | `ProgressSteps` (再利用) | 同上 |
| 証憑アップロード | `EvidenceUploader` | ファイル選択、バリデーション、アップロード/削除/再アップロード制御 |

### 4.2 状態管理
- `AppStateContext` に `taskSummary` を追加。初回マウント時に Supabase のシンプルな `select` を呼び出し、失敗時はフロント側でリトライ。
- `useDocumentProgress(documentId)` フックを新設し、進捗状態と更新関数を提供。
- `useEvidenceUpload(documentId, category)` フックで Storage API をカプセル化。

## 5. UI/UX 仕様
- ダッシュボードカード：幅レスポンシブ、残日数に応じて `bg-warning`, `bg-destructive` を適用。
- ステップ UI：3ステップ固定、完了時にチェックアイコン表示。未完了ステップは説明テキストを表示。
- 証憑セクション：カード型レイアウト、アップロード済みの場合はファイル情報とダウンロードボタン、未アップロードの場合はドラッグ＆ドロップ領域を表示。

- API 取得失敗時：ダッシュボードに「データ取得に失敗しました」トースト、手動再読み込みボタン。
- 進捗更新失敗：エラートースト＋ステップ状態をロールバック。
- アップロード失敗：Storage エラー内容を表示し、ファイル選択状態をリセット。

## 7. テスト戦略
- ユニットテスト：ステップ完了条件ロジック、残日数カラーリング、アップロードバリデーション。
- 結合テスト：Cypress で進捗完了→タスクボード状態更新の E2E を追加。
- セキュリティテスト：RLS ルールの read/write をロール別に検証。

## 8. デプロイ考慮
- DB マイグレーションは Supabase CLI で本番適用前にステージング適用。
- Storage バケット作成は IaC（Supabase CLI scripts）または手動手順書を整備。
- フロントリリース後、古いキャッシュでタスクカードが空になる可能性があるため `npm run build` 後にバージョンバナーを更新。
