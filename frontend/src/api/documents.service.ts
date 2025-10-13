import { supabase } from '@services/supabase'
import type { Document, DocumentStatus } from '@types/index'

import { mapDocumentInsert, mapDocumentRow, mapDocumentUpdate } from './mappers/documents'

export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch documents:', error)
    throw error
  }

  return (data ?? []).map(mapDocumentRow)
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to fetch document:', error)
    throw error
  }

  return mapDocumentRow(data)
}

export async function getDocumentsByForeignerId(foreignerId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('foreigner_id', foreignerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch documents by foreigner:', error)
    throw error
  }

  return (data ?? []).map(mapDocumentRow)
}

export async function createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const { data, error } = await supabase.from('documents').insert(mapDocumentInsert(document)).select().single()

  if (error) {
    console.error('Failed to create document:', error)
    throw error
  }

  return mapDocumentRow(data)
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  const { data, error } = await supabase.from('documents').update(mapDocumentUpdate(updates)).eq('id', id).select().single()

  if (error) {
    console.error('Failed to update document:', error)
    throw error
  }

  return mapDocumentRow(data)
}

export async function updateDocumentStatus(id: string, status: DocumentStatus): Promise<Document> {
  const { data, error } = await supabase.from('documents').update({ status }).eq('id', id).select().single()

  if (error) {
    console.error('Failed to update document status:', error)
    throw error
  }

  return mapDocumentRow(data)
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)

  if (error) {
    console.error('Failed to delete document:', error)
    throw error
  }
}
