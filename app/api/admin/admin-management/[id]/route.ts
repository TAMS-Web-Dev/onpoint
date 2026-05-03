import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user: caller } } = await supabase.auth.getUser()
    const callerRole = caller?.app_metadata?.role ?? caller?.user_metadata?.role

    if (callerRole !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    if (id === caller?.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const service = serviceClient()
    const { error } = await service.auth.admin.deleteUser(id)
    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
