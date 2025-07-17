import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { env, hasRealSupabaseConfig } from "./env-config"

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

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
  if (!hasRealSupabaseConfig || supabaseServiceKey.includes('placeholder')) {
    throw new Error('Missing Supabase environment variables for service client')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Standard client for general use
export const supabase = hasRealSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
