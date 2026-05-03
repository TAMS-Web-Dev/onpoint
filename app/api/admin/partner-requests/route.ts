import { createClient as serviceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function service() {
  return serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getCallerRole(): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.app_metadata?.role ?? user?.user_metadata?.role ?? null
}

function isAdmin(role: string | null) {
  return role === 'admin' || role === 'super_admin'
}

export async function GET() {
  try {
    const role = await getCallerRole()
    if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await service()
      .from('profiles')
      .select('id, full_name, email, organisation_name, job_title, phone, status, updated_at')
      .eq('user_type', 'partner')
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ partners: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const role = await getCallerRole()
    if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, status } = await req.json()
    if (!id || !['active', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await service()
      .from('profiles')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
