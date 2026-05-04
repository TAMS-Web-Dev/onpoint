import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/chat', '/admin', '/private', '/community']
const ADMIN_ROUTES = ['/admin']
const SUSPEND_EXEMPT_PREFIXES = ['/admin', '/suspended']

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

  // Email not yet verified → hold at check-email page
  if (!user.email_confirmed_at) {
    const checkEmailUrl = request.nextUrl.clone()
    checkEmailUrl.pathname = '/check-email'
    return NextResponse.redirect(checkEmailUrl)
  }

  // Admin route — check role from app_metadata (server-set) with user_metadata fallback
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (isAdminRoute) {
    const role = user.app_metadata?.role ?? user.user_metadata?.role
    if (role !== 'admin' && role !== 'super_admin') {
      const notFoundUrl = request.nextUrl.clone()
      notFoundUrl.pathname = '/404'
      return NextResponse.redirect(notFoundUrl)
    }
  }

  // Suspend check — skip for admin and suspended paths
  const isSuspendExempt = SUSPEND_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isSuspendExempt) {
    try {
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data } = await serviceSupabase
        .from('profiles')
        .select('suspended')
        .eq('id', user.id)
        .maybeSingle()

      if (data?.suspended === true) {
        const suspendedUrl = request.nextUrl.clone()
        suspendedUrl.pathname = '/suspended'
        return NextResponse.redirect(suspendedUrl)
      }
    } catch {
      // fail-open — allow through if suspend check fails
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*', '/private/:path*', '/community/:path*'],
}
