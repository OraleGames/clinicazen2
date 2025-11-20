import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  console.log('[Middleware]', {
    pathname,
    hasSession: !!session,
    userId: session?.user?.id
  })

  // Get user profile with role
  let userRole: string | null = null
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    userRole = profile?.role || null
    console.log('[Middleware] User role:', userRole)
  }

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/dashboard/']
  const authRoutes = ['/login', '/register']
  const publicRoutes = ['/']

  // Redirect unauthenticated users from protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes
  if (authRoutes.includes(pathname) && session) {
    // Redirect to role-specific dashboard
    const dashboardUrl = new URL(`/dashboard/${userRole?.toLowerCase() || 'patient'}`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Redirect from generic dashboard to role-specific dashboard
  if (pathname === '/dashboard' && session) {
    const dashboardUrl = new URL(`/dashboard/${userRole?.toLowerCase() || 'patient'}`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Add user info to headers for server components
  if (session) {
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-role', userRole || 'PATIENT')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}