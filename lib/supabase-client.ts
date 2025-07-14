import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For use in Client Components with auth helpers
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Standard client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
