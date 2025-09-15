export type Role = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

export type DocumentType =
  | 'residence-cert' // 在留資格認定証明書交付申請
  | 'period-extension' // 在留期間更新許可
  | 'status-change' // 在留資格変更許可
  | 'interview-report' // 定期面談報告
  | 'resignation-report' // 退職等随時報告

export type DocumentStatus = 'draft' | 'submitted' | 'approved'

export interface DocumentItem {
  id: string
  type: DocumentType
  status: DocumentStatus
  personId: string
  title: string
  createdAt: string
}

export interface Foreigner {
  id: string
  name: string
  dob: string
  nationality: string
  residenceStatus: string
  residencePeriod: string
}

export interface Company {
  id: string
  name: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

