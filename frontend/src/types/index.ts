export type Role = 'admin' | 'operator'

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface User extends BaseEntity {
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

export interface Document extends BaseEntity {
  type: DocumentType
  title: string
  status: DocumentStatus
  foreignerId: string
  createdAt: string
  updatedAt: string
  data: Record<string, unknown>
}

export interface Foreigner extends BaseEntity {
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
  syncedAt?: string | null
}

export interface Company extends BaseEntity {
  name: string
  address: string
  representative: string
  phone: string
  registrationNumber: string
}

export interface ActivityLog extends BaseEntity {
  message: string
  createdAt: string
}

export interface DashboardStats {
  submittedCount: number
  approvedCount: number
  monthlyCount: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ApiMeta {
  requestId?: string
  correlationId?: string
  pagination?: PaginationMeta
  [key: string]: unknown
}

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & { pagination: PaginationMeta }
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiErrorShape {
  status: number
  code?: string
  message: string
  errors?: ValidationError[]
  details?: Record<string, unknown>
}
