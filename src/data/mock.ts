import type { Company, DocumentItem, Foreigner } from '@types/index'

export const foreigners: Foreigner[] = [
  {
    id: 'p1',
    name: '田中 太郎',
    dob: '1995-04-10',
    nationality: 'ベトナム',
    residenceStatus: '特定技能1号',
    residencePeriod: '1年',
  },
  {
    id: 'p2',
    name: '佐藤 花子',
    dob: '1998-12-01',
    nationality: 'インドネシア',
    residenceStatus: '特定技能1号',
    residencePeriod: '1年',
  },
]

export const documents: DocumentItem[] = [
  {
    id: 'd1',
    type: 'residence-cert',
    status: 'submitted',
    personId: 'p1',
    title: '在留資格認定証明書交付申請書',
    createdAt: '2024-01-15',
  },
  {
    id: 'd2',
    type: 'interview-report',
    status: 'approved',
    personId: 'p2',
    title: '定期面談報告書',
    createdAt: '2024-01-10',
  },
]

export const company: Company = {
  id: 'c1',
  name: 'サンプル受入機関株式会社',
  address: '東京都千代田区1-1-1',
  contactName: '山田 太郎',
  contactEmail: 'contact@example.com',
  contactPhone: '03-1234-5678',
}

