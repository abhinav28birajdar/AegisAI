import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// For use in Server Components
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}

// For use in Route Handlers (API routes)
export const createRouteHandlerSupabaseClient = () => {
  return createRouteHandlerClient({ cookies })
}

// For server-side operations that require elevated permissions
export const createServiceSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Standard client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
