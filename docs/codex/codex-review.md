# コードレビュー依頼: Supabaseバックエンド統合

## 概要

特定技能外国人管理システムに、モックデータベースからSupabaseバックエンドへの移行を実装しました。
以下の実装について、セキュリティ、パフォーマンス、ベストプラクティスの観点からレビューをお願いします。

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **状態管理**: React Context API
- **認証**: Supabase Auth
- **データ取得**: @supabase/supabase-js

## 実装の背景と目的

### Before（モック実装）
- データはローカルストレージに保存
- 認証はモック（ハードコーディングされたユーザー）
- APIクライアントは準備されていたが未使用

### After（Supabase統合）
- PostgreSQLデータベースに永続化
- Supabase Authによる本格的な認証
- Row Level Security (RLS) によるマルチテナント対応
- リアルタイム同期の準備

## レビュー対象ファイル

### 1. データベーススキーマ

**ファイル**: `supabase/schema.sql`

```sql
-- 5つのテーブル定義
-- companies, foreigners, documents, activity_logs, profiles
-- updated_at自動更新トリガー
-- インデックス設定
```

**レビューポイント**:
- テーブル設計の妥当性
- 外部キー制約の適切性
- インデックス戦略
- トリガー関数の実装

---

### 2. Row Level Security ポリシー

**ファイル**: `supabase/rls_policies.sql`

```sql
-- 全テーブルでRLS有効化
-- ユーザーごとに会社データへのアクセス制限
-- 各テーブルにSELECT/INSERT/UPDATE/DELETEポリシー
```

**レビューポイント**:
- RLSポリシーのセキュリティホールがないか
- パフォーマンスへの影響（サブクエリの使用）
- ポリシーの網羅性（すべてのCRUD操作がカバーされているか）

---

### 3. Supabaseクライアント

**ファイル**: `frontend/src/services/supabase/client.ts` および `types.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || undefined
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || undefined

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Database型定義...
```

**レビューポイント**:
- 環境変数の取り扱い
- クライアント設定の妥当性
- 型定義の正確性

---

### 4. APIモジュール群（Serviceレイヤー）

**ファイル**: 
- `frontend/src/api/foreigners.service.ts`
- `frontend/src/api/documents.service.ts`
- `frontend/src/api/company.service.ts`
- `frontend/src/api/activity-logs.service.ts`

**マッパー**:
- `frontend/src/api/mappers/foreigners.ts`
- `frontend/src/api/mappers/documents.ts`
- `frontend/src/api/mappers/company.ts`
- `frontend/src/api/mappers/activityLogs.ts`

**例（foreigners.service.ts）**:
```typescript
export async function getForeigners(): Promise<Foreigner[]> {
  const { data, error } = await supabase
    .from('foreigners')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch foreigners:', error)
    throw error
  }

  return (data || []).map(mapToForeigner)
}

export async function createForeigner(
  foreigner: Omit<Foreigner, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Foreigner> {
  const { data, error } = await supabase
    .from('foreigners')
    .insert({
      company_id: foreigner.companyId,
      name: foreigner.name,
      // ... スネークケースへの変換
    })
    .select()
    .single()

  if (error) throw error
  return mapToForeigner(data)
}

// mapToForeigner: snake_case → camelCase 変換
```

**レビューポイント**:
- エラーハンドリングの適切性
- snake_case ⇔ camelCase 変換の実装
- 型安全性
- クエリの最適化

---

### 5. 認証コンテキスト

**ファイル**: `frontend/src/state/auth/AuthContext.tsx`

**主要な変更**:
- モック認証 → Supabase Auth への完全移行
- `supabase.auth.signInWithPassword()` でログイン
- `supabase.auth.onAuthStateChange()` でセッション監視
- プロフィール情報の自動取得

**レビューポイント**:
- 認証フローのセキュリティ
- セッション管理の実装
- エラーハンドリング
- メモリリーク対策（useEffect cleanup）

---

### 6. アプリケーション状態管理

**ファイル**: `frontend/src/state/app/AppStateContext.tsx`

**共通ロジック**: `frontend/src/state/shared/apiExecutor.ts`

**主要な変更**:
- ローカルストレージ → Supabase API への移行
- 初期データロード処理の追加
- CRUD操作のヘルパー関数追加
- オプティミスティックUIとロールバック機能

```typescript
// 初期データロード
useEffect(() => {
  const loadInitialData = async () => {
    const [foreigners, documents, company, activities] = await Promise.all([
      api.getForeigners(),
      api.getDocuments(),
      api.getCompany(),
      api.getActivityLogs(20),
    ])
    dispatch({ type: 'SET_INITIAL_DATA', payload: { ... } })
  }
  loadInitialData()
}, [state.isLoaded])

// CRUD操作例
const createForeignerAction = useCallback(async (foreigner) => {
  return execute({
    request: () => api.createForeigner(foreigner),
    optimisticUpdate: () => { /* ... */ },
    markSynced: true,
  }).then((created) => {
    dispatch({ type: 'ADD_FOREIGNER', payload: created })
    return created
  })
}, [execute])
```

**レビューポイント**:
- 状態管理の設計
- 非同期処理のハンドリング
- オプティミスティックUIの実装
- パフォーマンス最適化（useCallback, useMemo）

---

## 特に重点的にレビューしてほしい点

### 1. セキュリティ
- [ ] RLSポリシーに抜け穴がないか
- [ ] 認証フローに脆弱性がないか
- [ ] 環境変数の取り扱いは適切か
- [ ] SQLインジェクションのリスクはないか

### 2. パフォーマンス
- [ ] データベースクエリの最適化
- [ ] React re-renderの最小化
- [ ] useEffect依存配列の適切性
- [ ] 初期ロードのパフォーマンス

### 3. エラーハンドリング
- [ ] すべてのAPI呼び出しでエラー処理されているか
- [ ] ユーザーへのエラー通知は適切か
- [ ] ネットワークエラー時の挙動
- [ ] ロールバック処理の実装

### 4. 型安全性
- [ ] TypeScriptの型定義は正確か
- [ ] any型の使用は最小限か
- [ ] snake_case ⇔ camelCase 変換時の型安全性

### 5. コード品質
- [ ] DRY原則（重複コードの排除）
- [ ] 関数の単一責任原則
- [ ] 命名規則の一貫性
- [ ] コメントの適切性

---

## 改善提案を期待する領域

1. **型定義の自動生成**
   - Supabase CLIで型定義を自動生成すべきか？

2. **リアルタイム機能**
   - Supabase Realtimeの導入は必要か？

3. **キャッシング戦略**
   - React QueryやSWRの導入を検討すべきか？

4. **エラーハンドリングの統一**
   - カスタムフックでAPIエラー処理を抽象化すべきか？

5. **テスト**
   - 単体テスト・統合テストの戦略は？

---

## 期待するレビュー形式

以下の形式でフィードバックをお願いします：

### 🔴 Critical（必ず修正すべき問題）
- セキュリティホール
- データ損失のリスク
- パフォーマンス上の重大な問題

### 🟡 Warning（推奨される改善）
- ベストプラクティスからの逸脱
- 保守性の懸念
- パフォーマンス改善の余地

### 🟢 Suggestion（より良くするための提案）
- コード品質の向上
- DX（開発者体験）の改善
- 将来の拡張性

### ✨ Good Practice（評価できる点）
- 優れた実装
- 参考になるパターン

---

## 補足情報

- このアプリケーションはプロトタイプから本番運用を見据えた実装への移行段階
- **Codexによるリファクタリング実施済み**: レイヤー分離、Mapper層の追加、型安全性の向上
- ユーザーは1社あたり数名〜数十名を想定
- 外国人データは1社あたり数十名〜数百名を想定
- 書類データは年間数百件〜数千件を想定

## レビュー対象ファイル一覧

### バックエンド（Supabase）
1. `supabase/schema.sql` - データベーススキーマ
2. `supabase/rls_policies.sql` - Row Level Securityポリシー
3. `supabase/seed.sql` - 初期データ

### フロントエンド - インフラ層
4. `frontend/src/services/supabase/client.ts` - Supabaseクライアント
5. `frontend/src/services/supabase/types.ts` - データベース型定義

### フロントエンド - ビジネスロジック層
6. `frontend/src/api/foreigners.service.ts` - 外国人データCRUD
7. `frontend/src/api/documents.service.ts` - 書類データCRUD
8. `frontend/src/api/company.service.ts` - 会社情報API
9. `frontend/src/api/activity-logs.service.ts` - アクティビティログAPI

### フロントエンド - Mapper層
10. `frontend/src/api/mappers/foreigners.ts` - 外国人データ変換
11. `frontend/src/api/mappers/documents.ts` - 書類データ変換
12. `frontend/src/api/mappers/company.ts` - 会社情報変換
13. `frontend/src/api/mappers/activityLogs.ts` - アクティビティログ変換

### フロントエンド - 状態管理層
14. `frontend/src/state/auth/AuthContext.tsx` - 認証状態管理
15. `frontend/src/state/app/AppStateContext.tsx` - アプリケーション状態管理
16. `frontend/src/state/shared/apiExecutor.ts` - API実行共通ロジック

---

よろしくお願いします！

