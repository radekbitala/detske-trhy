import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Registration {
  id: string
  created_at: string
  parent_name: string
  parent_email: string
  parent_phone: string
  parent_birth_date: string
  parent_address: string
  child_name: string
  child_age: number
  city: string
  stall_name: string
  products: string
  status: 'pending' | 'theme_approved' | 'video_approved'
  consent_given: boolean
  emails_sent: string[]
  theme_approved_at: string | null
  video_approved_at: string | null
}
