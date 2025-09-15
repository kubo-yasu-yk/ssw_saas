# 実装計画

- [x] 1. プロジェクト初期設定とコア構造の構築 （完了）
  - Vite + React + TypeScript プロジェクトを作成
  - Tailwind CSS、React Router、React Hook Form等の必要ライブラリをインストール
  - 基本的なフォルダ構造（components, pages, hooks, context, types, data, utils）を作成
  - _要件: 6.1, 6.4_
  - 実装: `package.json`, `vite.config.ts`, `src/` 一式

- [x] 2. TypeScript型定義とハードコーディングデータの作成 （完了）
  - User, Foreigner, Company, Document インターフェースを定義
  - サンプルデータ（特定技能外国人、会社情報、書類データ）をハードコーディングで作成
  - ローカルストレージ操作用のユーティリティ関数を実装
  - _要件: 3.3, 3.4, 6.3_
  - 実装: `src/types/index.ts`, `src/data/mock.ts`, `src/utils/storage.ts`

- [x] 3. 認証システムの実装 （完了）
  - ログイン画面コンポーネントを作成
  - ハードコーディングされた認証情報での認証ロジックを実装
  - 認証状態管理用のContext APIを実装
  - ルートガード機能（未認証時のリダイレクト）を実装
  - _要件: 4.1, 4.2, 4.3, 4.4_
  - 実装: `src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/App.tsx`

- [x] 4. 基本レイアウトとナビゲーションの実装 （完了）
  - ヘッダーコンポーネント（ログアウト機能付き）を作成
  - サイドバーメニューコンポーネントを作成
  - ダッシュボードページの基本レイアウトを実装
  - React Routerによるページルーティングを設定
  - _要件: 4.3, 5.1_
  - 実装: `src/components/Header.tsx`, `src/components/Sidebar.tsx`, `src/pages/Dashboard.tsx`, `src/App.tsx`

- [ ] 5. 共通UIコンポーネントの実装 （一部未実装）
  - Button, FormField, Modal, LoadingSpinner コンポーネントを作成
  - フォームバリデーション用のカスタムフックを実装
  - エラー表示・成功通知用のトースト機能を実装
  - _要件: 5.2, 5.3, 5.4_
  - 実装: `src/components/Button.tsx`, `src/components/FormField.tsx`, `src/components/Modal.tsx`, `src/components/LoadingSpinner.tsx`
  - 未了: バリデーション用カスタムフック、トースト

- [x] 6. 在留資格関連書類作成機能の実装 （MVP完了）
- [x] 6.1 在留資格認定証明書交付申請書フォームの作成
  - ResidenceStatusForm コンポーネントを実装
  - 必要項目のフォームフィールドとバリデーションを設定
  - プレビュー機能を実装
  - _要件: 1.1, 1.4_
  - 実装: `src/pages/ResidenceStatusForm.tsx`（バリデーションは最小）

- [x] 6.2 在留期間更新許可申請書フォームの作成
  - PeriodExtensionForm コンポーネントを実装
  - 更新申請に必要な項目のフォームを作成
  - プレビュー機能を実装
  - _要件: 1.2, 1.4_
  - 実装: `src/pages/PeriodExtensionForm.tsx`

- [x] 6.3 在留資格変更許可申請書フォームの作成
  - StatusChangeForm コンポーネントを実装
  - 変更申請に必要な項目のフォームを作成
  - プレビュー機能を実装
  - _要件: 1.3, 1.4_
  - 実装: `src/pages/StatusChangeForm.tsx`

- [x] 7. 支援業務書類作成機能の実装 （MVP完了）
- [x] 7.1 定期面談報告書フォームの作成
  - InterviewReportForm コンポーネントを実装
  - 面談内容記録用のフォームフィールドを作成
  - リアルタイム保存機能を実装
  - _要件: 2.1, 2.3_
  - 実装: `src/pages/InterviewReportForm.tsx`（autosave対応）

- [x] 7.2 退職等随時報告書フォームの作成
  - ResignationReportForm コンポーネントを実装
  - 退職・転職関連の報告項目フォームを作成
  - リアルタイム保存機能を実装
  - _要件: 2.2, 2.3_
  - 実装: `src/pages/ResignationReportForm.tsx`（autosave対応）

- [x] 8. PDF出力機能の実装 （完了）
  - jsPDF + html2canvas を使用したPDF生成機能を実装
  - 各書類フォームからのPDF出力機能を統合
  - 日本語フォント対応とレイアウト調整を実装
  - _要件: 1.5, 2.4_
  - 実装: `src/utils/pdf.ts`（DOM画像化により日本語表示対応）

- [ ] 9. 情報管理機能の実装
- [ ] 9.1 書類一覧画面の作成 （一部未実装）
  - DocumentListPage コンポーネントを実装
  - 申請中・過去分の書類を分類表示する機能を実装
  - 書類の検索・フィルタリング機能を実装
  - _要件: 3.3_
  - 実装: `src/pages/DocumentListPage.tsx`（一覧表示のみ）
  - 未了: ステータス分類、検索/フィルタ

- [ ] 9.2 特定技能外国人一覧画面の作成 （一部未実装）
  - ForeignerListPage コンポーネントを実装
  - ハードコーディングデータとローカルストレージデータの統合表示を実装
  - 外国人情報の追加・編集機能を実装
  - _要件: 3.4_
  - 実装: `src/pages/ForeignerListPage.tsx`（追加は可能、永続化未）
  - 未了: localStorageとの統合、編集

- [x] 9.3 会社情報管理画面の作成 （完了）
  - CompanyInfoPage コンポーネントを実装
  - 会社情報の表示・編集機能を実装
  - ローカルストレージへの保存機能を実装
  - _要件: 3.5_
  - 実装: `src/pages/CompanyInfoPage.tsx`

- [ ] 10. レスポンシブデザインとユーザビリティの向上 （一部未実装）
  - 全画面のモバイル対応レスポンシブデザインを実装
  - ローディング状態の表示を各機能に追加
  - 確認ダイアログを重要操作に追加
  - アクセシビリティ対応（キーボードナビゲーション、ARIAラベル）を実装
  - _要件: 5.1, 5.3, 5.4_
  - 実装: Tailwind による基本レスポンシブ、モック断り書き（ログイン/ヘッダー）
  - 未了: 重要操作の確認ダイアログ、アクセシビリティ拡張

- [ ] 11. エラーハンドリングとテストの実装 （未実装）
  - React Error Boundary を実装
  - ローカルストレージエラー処理を実装
  - 主要コンポーネントの単体テストを作成
  - ログイン・書類作成フローの統合テストを作成
  - _要件: 5.2_

- [x] 12. 本番デプロイ準備とVercel設定 （設定完了・デプロイ待ち）
  - 本番用ビルド設定を最適化
  - Vercelデプロイ用の設定ファイルを作成
  - 環境変数の設定（必要に応じて）
  - パフォーマンス最適化（コード分割、画像最適化）を実装
  - _要件: 6.4_
  - 実装: ルーティング対応 `vercel.json`、`package.json` のビルドスクリプト整備
  - メモ: Vercelでのプロジェクト作成と接続・デプロイはダッシュボード操作で実施

---

## 次の具体タスク
- トースト通知の導入とフォーム用カスタムバリデーションフック作成（5の残）
- 書類一覧のステータス分類・検索/フィルタ実装（9.1の残）
- 外国人一覧のlocalStorage永続化・編集対応（9.2の残）
- 重要操作の確認ダイアログ・アクセシビリティ拡張（10の残）
- Error Boundary・ストレージ例外処理・単体/統合テスト追加（11）
- Vercel用設定ファイル作成とデプロイ（12）
