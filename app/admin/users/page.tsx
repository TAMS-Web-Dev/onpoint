import { createClient } from '@/lib/supabase/server'
import UsersClient from '@/components/admin/UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role
  const isSuperAdmin = role === 'super_admin'

  return <UsersClient isSuperAdmin={isSuperAdmin} />
}
