// Build verification script - tests environment config during build
import { env, hasRealSupabaseConfig, validateEnvironmentVariables } from './lib/env-config'

console.log('🔍 Build Environment Check:')
console.log('- Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL)
console.log('- Has real config:', hasRealSupabaseConfig)
console.log('- Build should succeed:', true)

validateEnvironmentVariables()

export default function BuildTest() {
  return null // This component won't be rendered, just tested during build
}
