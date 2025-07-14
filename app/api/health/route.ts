import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple health check
    return NextResponse.json({ 
      status: "ok", 
      message: "API is working",
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      { 
        status: "error", 
        message: "API error",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
