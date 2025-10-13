import type { Company } from '@types/index'
import type { Database } from '@services/supabase'

type CompanyRow = Database['public']['Tables']['companies']['Row']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    representative: row.representative,
    phone: row.phone,
    registrationNumber: row.registration_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapCompanyUpdate(updates: Partial<Company>): CompanyUpdate {
  const payload: CompanyUpdate = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.address !== undefined) payload.address = updates.address
  if (updates.representative !== undefined) payload.representative = updates.representative
  if (updates.phone !== undefined) payload.phone = updates.phone
  if (updates.registrationNumber !== undefined) payload.registration_number = updates.registrationNumber

  return payload
}
