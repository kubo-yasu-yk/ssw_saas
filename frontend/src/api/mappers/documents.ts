import type { Document, DocumentStatus, DocumentType } from '@types/index'
import type { Database } from '@services/supabase'

type DocumentRow = Database['public']['Tables']['documents']['Row']
type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export function mapDocumentRow(row: DocumentRow): Document {
  return {
    id: row.id,
    type: row.type as DocumentType,
    title: row.title,
    status: row.status as DocumentStatus,
    foreignerId: row.foreigner_id,
    data: row.data ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapDocumentInsert(
  document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
): DocumentInsert {
  return {
    type: document.type,
    title: document.title,
    status: document.status,
    foreigner_id: document.foreignerId,
    data: document.data ?? {},
  }
}

export function mapDocumentUpdate(updates: Partial<Document>): DocumentUpdate {
  const payload: DocumentUpdate = {}

  if (updates.type !== undefined) payload.type = updates.type
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.foreignerId !== undefined) payload.foreigner_id = updates.foreignerId
  if (updates.data !== undefined) payload.data = updates.data ?? {}

  return payload
}
