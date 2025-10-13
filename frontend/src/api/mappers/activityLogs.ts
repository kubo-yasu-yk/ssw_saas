import type { ActivityLog } from '@types/index'
import type { Database } from '@services/supabase'

type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

export function mapActivityLogRow(row: ActivityLogRow): ActivityLog {
  return {
    id: row.id,
    message: row.message,
    createdAt: row.created_at,
  }
}

export function mapActivityLogInsert(params: { message: string; companyId: string }): ActivityLogInsert {
  return {
    message: params.message,
    company_id: params.companyId,
  }
}
