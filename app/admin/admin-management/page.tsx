import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'
import AdminManagementClient from '@/components/admin/AdminManagementClient'

export default async function AdminManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role

  if (role !== 'super_admin') redirect('/admin')

  // Fetch all admin/super_admin users
  const service = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await service.auth.admin.listUsers({ perPage: 1000, page: 1 })

  const admins = error
    ? []
    : data.users
        .filter((u) => {
          const r = u.app_metadata?.role ?? u.user_metadata?.role
          return r === 'admin' || r === 'super_admin'
        })
        .map((u) => ({
          id: u.id,
          email: u.email ?? '',
          full_name: u.user_metadata?.full_name ?? null,
          role: (u.app_metadata?.role ?? u.user_metadata?.role) as string,
          created_at: u.created_at,
        }))

  return (
    <AdminManagementClient
      initialAdmins={admins}
      currentUserId={user!.id}
    />
  )
}
