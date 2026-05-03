import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getCallerRole(): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role ?? user?.user_metadata?.role ?? null
}

export async function GET() {
  try {
    const role = await getCallerRole()
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = serviceClient()
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 })
    if (error) throw new Error(error.message)

    const admins = data.users
      .filter((u) => {
        const r = u.app_metadata?.role ?? u.user_metadata?.role
        return r === 'admin' || r === 'super_admin'
      })
      .map((u) => ({
        id: u.id,
        email: u.email ?? '',
        full_name: u.user_metadata?.full_name ?? null,
        role: u.app_metadata?.role ?? u.user_metadata?.role,
        created_at: u.created_at,
      }))

    return NextResponse.json({ admins })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const role = await getCallerRole()
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = serviceClient()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: 'admin' },
      email_confirm: true,
    })

    if (error) throw new Error(error.message)

    return NextResponse.json({
      admin: {
        id: data.user.id,
        email: data.user.email ?? '',
        full_name: null,
        role: 'admin',
        created_at: data.user.created_at,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
