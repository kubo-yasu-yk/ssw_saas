import type { Foreigner } from '@types/index'
import type { Database } from '@services/supabase'

type ForeignerRow = Database['public']['Tables']['foreigners']['Row']
type ForeignerInsert = Database['public']['Tables']['foreigners']['Insert']
type ForeignerUpdate = Database['public']['Tables']['foreigners']['Update']

export function mapForeignerRow(row: ForeignerRow): Foreigner {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    nameKana: row.name_kana,
    nationality: row.nationality,
    birthDate: row.birth_date,
    passportNumber: row.passport_number,
    residenceStatus: row.residence_status,
    residencePeriod: row.residence_period,
    workCategory: row.work_category,
    notes: row.notes || undefined,
    syncedAt: row.synced_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapForeignerInsert(
  foreigner: Omit<Foreigner, 'id' | 'createdAt' | 'updatedAt'>
): ForeignerInsert {
  return {
    company_id: foreigner.companyId,
    name: foreigner.name,
    name_kana: foreigner.nameKana,
    nationality: foreigner.nationality,
    birth_date: foreigner.birthDate,
    passport_number: foreigner.passportNumber,
    residence_status: foreigner.residenceStatus,
    residence_period: foreigner.residencePeriod,
    work_category: foreigner.workCategory,
    notes: foreigner.notes ?? null,
    synced_at: foreigner.syncedAt ?? null,
  }
}

export function mapForeignerUpdate(updates: Partial<Foreigner>): ForeignerUpdate {
  const payload: ForeignerUpdate = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.nameKana !== undefined) payload.name_kana = updates.nameKana
  if (updates.nationality !== undefined) payload.nationality = updates.nationality
  if (updates.birthDate !== undefined) payload.birth_date = updates.birthDate
  if (updates.passportNumber !== undefined) payload.passport_number = updates.passportNumber
  if (updates.residenceStatus !== undefined) payload.residence_status = updates.residenceStatus
  if (updates.residencePeriod !== undefined) payload.residence_period = updates.residencePeriod
  if (updates.workCategory !== undefined) payload.work_category = updates.workCategory
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null
  if (updates.syncedAt !== undefined) payload.synced_at = updates.syncedAt ?? null

  return payload
}
