import { supabase } from '@services/supabase'
import type { Company } from '@types/index'

import { mapCompanyRow, mapCompanyUpdate } from './mappers/company'

export async function getCurrentUserCompanyId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Failed to fetch profile:', profileError)
    throw profileError
  }

  return profile?.company_id ?? null
}

export async function getCompany(): Promise<Company | null> {
  const companyId = await getCurrentUserCompanyId()
  if (!companyId) {
    return null
  }
  return getCompanyById(companyId)
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to fetch company:', error)
    throw error
  }

  return mapCompanyRow(data)
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
  const { data, error } = await supabase.from('companies').update(mapCompanyUpdate(updates)).eq('id', id).select().single()

  if (error) {
    console.error('Failed to update company:', error)
    throw error
  }

  return mapCompanyRow(data)
}

export const companyApi = {
  getCompany,
  getCompanyById,
  updateCompany,
}
