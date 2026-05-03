import { createClient as serviceClient } from '@supabase/supabase-js'
import PartnerRequestsClient from '@/components/admin/PartnerRequestsClient'

export default async function PartnerRequestsPage() {
  // service role client — bypasses RLS
  const service = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await service
    .from('profiles')
    .select('id, full_name, email, organisation_name, job_title, phone, status, updated_at')
    .eq('user_type', 'partner')
    .order('updated_at', { ascending: false })

  return <PartnerRequestsClient initialPartners={data ?? []} />
}
