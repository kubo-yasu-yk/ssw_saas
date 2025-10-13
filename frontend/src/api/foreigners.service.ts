import { supabase } from '@services/supabase'
import type { Foreigner } from '@types/index'

import { mapForeignerInsert, mapForeignerRow, mapForeignerUpdate } from './mappers/foreigners'

export async function getForeigners(): Promise<Foreigner[]> {
  const { data, error } = await supabase
    .from('foreigners')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch foreigners:', error)
    throw error
  }

  return (data ?? []).map(mapForeignerRow)
}

export async function getForeignerById(id: string): Promise<Foreigner | null> {
  const { data, error } = await supabase
    .from('foreigners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to fetch foreigner:', error)
    throw error
  }

  return mapForeignerRow(data)
}

export async function createForeigner(
  foreigner: Omit<Foreigner, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Foreigner> {
  const { data, error } = await supabase.from('foreigners').insert(mapForeignerInsert(foreigner)).select().single()

  if (error) {
    console.error('Failed to create foreigner:', error)
    throw error
  }

  return mapForeignerRow(data)
}

export async function updateForeigner(id: string, updates: Partial<Foreigner>): Promise<Foreigner> {
  const { data, error } = await supabase.from('foreigners').update(mapForeignerUpdate(updates)).eq('id', id).select().single()

  if (error) {
    console.error('Failed to update foreigner:', error)
    throw error
  }

  return mapForeignerRow(data)
}

export async function deleteForeigner(id: string): Promise<void> {
  const { error } = await supabase.from('foreigners').delete().eq('id', id)

  if (error) {
    console.error('Failed to delete foreigner:', error)
    throw error
  }
}
