/**
 * モックデータ
 * 
 * 注意: このファイルはSupabase統合後も以下の目的で保持されています：
 * - 開発中のフォールバックデータ
 * - テスト用の参照データ
 * - データ構造の例示
 * 
 * 実際のアプリケーションではSupabaseからデータを取得します。
 */
import type { ActivityLog, Company, Document, Foreigner } from '@types/index'

export const foreigners: Foreigner[] = [
  {
    id: 'f1',
    companyId: 'c1',
    name: '田中 太郎',
    nameKana: 'たなか たろう',
    nationality: 'ベトナム',
    birthDate: '1995-04-10',
    passportNumber: 'AB1234567',
    residenceStatus: '特定技能1号',
    residencePeriod: '1年',
    workCategory: '飲食料品製造業',
    notes: '日本語教育: JLPT N3 相当',
  },
  {
    id: 'f2',
    companyId: 'c1',
    name: '佐藤 花子',
    nameKana: 'さとう はなこ',
    nationality: 'インドネシア',
    birthDate: '1998-12-01',
    passportNumber: 'CD7654321',
    residenceStatus: '特定技能1号',
    residencePeriod: '1年',
    workCategory: '外食業',
  },
  {
    id: 'f3',
    companyId: 'c1',
    name: 'グエン ティン',
    nameKana: 'ぐえん てぃん',
    nationality: 'ベトナム',
    birthDate: '1997-07-21',
    passportNumber: 'EF2468101',
    residenceStatus: '特定技能2号',
    residencePeriod: '2年',
    workCategory: '介護',
  },
]

export const documents: Document[] = [
  {
    id: 'd1',
    type: 'residence_status',
    title: '在留資格認定証明書交付申請書',
    status: 'submitted',
    foreignerId: 'f1',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15',
    data: {
      name: '田中 太郎',
      nationality: 'ベトナム',
      residenceStatus: '特定技能1号',
    },
  },
  {
    id: 'd2',
    type: 'interview_report',
    title: '定期面談報告書',
    status: 'approved',
    foreignerId: 'f2',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-10',
    data: {
      interviewer: '管理者',
      summary: '業務状況を確認し、特記事項なし。',
    },
  },
  {
    id: 'd3',
    type: 'period_extension',
    title: '在留期間更新許可申請書',
    status: 'draft',
    foreignerId: 'f3',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    data: {},
  },
]

export const activities: ActivityLog[] = [
  {
    id: 'a1',
    message: '田中 太郎さんの在留資格認定証明書交付申請を提出しました。',
    createdAt: '2024-01-15T10:30:00+09:00',
  },
  {
    id: 'a2',
    message: '佐藤 花子さんの定期面談報告書を承認しました。',
    createdAt: '2024-01-12T14:20:00+09:00',
  },
  {
    id: 'a3',
    message: 'グエン ティンさんの在留期間更新を下書き保存しました。',
    createdAt: '2024-02-01T09:10:00+09:00',
  },
]

export const company: Company = {
  id: 'c1',
  name: 'サンプル受入機関株式会社',
  address: '東京都千代田区丸の内1-1-1',
  representative: '山田 太郎',
  phone: '03-1234-5678',
  registrationNumber: '1234567890123',
}

