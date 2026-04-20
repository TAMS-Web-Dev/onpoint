import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/chat', '/admin', '/private']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — getUser() re-validates with Supabase server (safer than getSession())
  const { data: { user } } = await supabase.auth.getUser()

  // No valid session → redirect to sign-in, preserving intended destination
  if (!user) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = '/sign-in'
    signInUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin route — check role from app_metadata (server-set) with user_metadata fallback
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (isAdminRoute) {
    const role = user.app_metadata?.role ?? user.user_metadata?.role
    if (role !== 'admin') {
      const notFoundUrl = request.nextUrl.clone()
      notFoundUrl.pathname = '/404'
      return NextResponse.redirect(notFoundUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*', '/private/:path*'],
}
