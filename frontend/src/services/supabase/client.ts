import { createClient } from '@supabase/supabase-js'

import type { Database } from './types'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase の環境変数が設定されていません。VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を .env.local などに定義してください。'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type { Database }
