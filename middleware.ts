import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for static files and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.includes('.') // files with extensions
  ) {
    return res
  }

  try {
    // TEMPORARILY DISABLED: Authentication middleware for development
    console.log('🔓 Middleware auth checks temporarily disabled for development')
    return res
    
    /* ORIGINAL AUTH CODE - TEMPORARILY COMMENTED OUT
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/profile", "/settings", "/submit-complaint"]
    
    // Auth routes that should redirect if already authenticated
    const authRoutes = ["/auth/signin", "/auth/signup"]

    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )
    
    const isAuthRoute = authRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    // Redirect to signin if trying to access protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/auth/signin"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if trying to access auth routes with session
    if (isAuthRoute && session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    return res
    */
  } catch (error) {
    // If there's an error with Supabase, just continue
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
