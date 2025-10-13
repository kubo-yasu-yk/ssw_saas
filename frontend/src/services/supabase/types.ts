export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string
          representative: string
          phone: string
          registration_number: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      foreigners: {
        Row: {
          id: string
          company_id: string
          name: string
          name_kana: string
          nationality: string
          birth_date: string
          passport_number: string
          residence_status: string
          residence_period: string
          work_category: string
          notes: string | null
          synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['foreigners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['foreigners']['Insert']>
      }
      documents: {
        Row: {
          id: string
          type: string
          title: string
          status: string
          foreigner_id: string
          data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          company_id: string
          message: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          company_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}
