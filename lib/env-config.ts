// Environment variable configuration with build-time fallbacks
export const env = {
  // Supabase Configuration - with build-safe fallbacks
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service-placeholder',
  
  // WalletConnect Configuration
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '12345678901234567890123456789012',
  
  // AI Service Configuration
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || 'placeholder-ai-key',
  
  // CARV Protocol Configuration
  CARV_APP_ID: process.env.CARV_APP_ID || 'placeholder-carv-app-id',
  CARV_SECRET: process.env.CARV_SECRET || 'placeholder-carv-secret',
};

// Helper to check if we're in development mode with real environment variables
export const isProduction = process.env.NODE_ENV === 'production';
export const isBuild = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
export const hasRealSupabaseConfig = 
  !env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') && 
  !env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder') &&
  env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co');

// Validation function for runtime checks
export const validateEnvironmentVariables = () => {
  if (typeof window !== 'undefined' && isProduction && !hasRealSupabaseConfig) {
    console.warn('Production environment detected but Supabase configuration is missing or using placeholder values');
  }
};
