import { supabase } from '@services/supabase'
import type { ActivityLog } from '@types/index'

import { mapActivityLogInsert, mapActivityLogRow } from './mappers/activityLogs'

export async function getActivityLogs(limit = 20): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch activity logs:', error)
    throw error
  }

  return (data ?? []).map(mapActivityLogRow)
}

export async function createActivityLog(params: { message: string; companyId: string }): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(mapActivityLogInsert(params))
    .select()
    .single()

  if (error) {
    console.error('Failed to create activity log:', error)
    throw error
  }

  return mapActivityLogRow(data)
}
