import type { DocumentStatus, DocumentType } from '@types/index'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  residence_status: '在留資格認定証明書',
  period_extension: '在留期間更新許可申請',
  status_change: '在留資格変更許可申請',
  interview_report: '定期面談報告書',
  resignation_report: '退職等随時報告書',
}

export const DOCUMENT_TYPE_ROUTES: Record<DocumentType, string> = {
  residence_status: '/forms/residence-status',
  period_extension: '/forms/period-extension',
  status_change: '/forms/status-change',
  interview_report: '/forms/interview-report',
  resignation_report: '/forms/resignation-report',
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: '下書き',
  submitted: '申請中',
  approved: '承認済み',
  rejected: '差戻し',
}

export const NATIONALITY_OPTIONS = ['ベトナム', 'インドネシア', 'フィリピン', 'ミャンマー', 'タイ', '中国']

export const RESIDENCE_STATUS_OPTIONS = ['特定技能1号', '特定技能2号']

export const RESIDENCE_PERIOD_OPTIONS = ['6ヶ月', '1年', '1年6ヶ月', '2年']

export const WORK_CATEGORY_OPTIONS = ['外食業', '飲食料品製造業', '介護', '農業', '建設業']

