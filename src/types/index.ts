export type Role = 'admin' | 'operator'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  companyId: string
}

export type DocumentType =
  | 'residence_status'
  | 'period_extension'
  | 'status_change'
  | 'interview_report'
  | 'resignation_report'

export type DocumentStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Document {
  id: string
  type: DocumentType
  title: string
  status: DocumentStatus
  foreignerId: string
  createdAt: string
  updatedAt: string
  data: Record<string, unknown>
}

export interface Foreigner {
  id: string
  companyId: string
  name: string
  nameKana: string
  nationality: string
  birthDate: string
  passportNumber: string
  residenceStatus: string
  residencePeriod: string
  workCategory: string
  notes?: string
}

export interface Company {
  id: string
  name: string
  address: string
  representative: string
  phone: string
  registrationNumber: string
}

export interface ActivityLog {
  id: string
  message: string
  createdAt: string
}

export interface DashboardStats {
  submittedCount: number
  approvedCount: number
  monthlyCount: number
}

