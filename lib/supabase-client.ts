import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { env, hasRealSupabaseConfig } from "./env-config"

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For use in Client Components with auth helpers
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Standard client for client-side operations
export const supabase = hasRealSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export default supabase
