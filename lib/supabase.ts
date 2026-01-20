import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Question {
  id: string
  title: string
  description: string | null
  end_date: string
  end_time: string
  photo_url: string | null
  category: string
  status: 'pending' | 'approved' | 'rejected'
  yes_percentage: number
  no_percentage: number
  volume: string
  symbol: string
  is_new: boolean
  created_at: string
  updated_at: string
}
