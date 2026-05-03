'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PartnerStatus = 'pending' | 'active' | 'rejected'

interface PartnerRow {
  id: string
  full_name: string | null
  email: string | null
  organisation_name: string | null
  job_title: string | null
  phone: string | null
  status: PartnerStatus
  updated_at: string | null
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5">
        Active
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-0.5">
      Pending
    </span>
  )
}

export default function PartnerRequestsClient({ initialPartners }: { initialPartners: PartnerRow[] }) {
  const [partners, setPartners] = useState<PartnerRow[]>(initialPartners)
  const [actingId, setActingId] = useState<string | null>(null)

  async function handleAction(id: string, status: 'active' | 'rejected') {
    setActingId(id)
    try {
      const res = await fetch('/api/admin/partner-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')

      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      )
      toast.success(status === 'active' ? 'Partner approved.' : 'Partner rejected.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Partner Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve partner organisation registrations.</p>
        <hr className="mt-4 border-border" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                  No partner requests found.
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => {
                const isActing = actingId === partner.id
                return (
                  <TableRow key={partner.id}>
                    <TableCell className="font-semibold text-gray-900">
                      {partner.full_name ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-700">{partner.email ?? '-'}</TableCell>
                    <TableCell className="text-gray-700">{partner.organisation_name ?? '-'}</TableCell>
                    <TableCell className="text-gray-700">{partner.job_title ?? '-'}</TableCell>
                    <TableCell className="text-gray-700">{partner.phone ?? '-'}</TableCell>
                    <TableCell className="text-gray-600">
                      {partner.updated_at ? format(new Date(partner.updated_at), 'd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={partner.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {partner.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(partner.id, 'active')}
                            disabled={isActing}
                            className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                          >
                            {isActing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(partner.id, 'rejected')}
                            disabled={isActing}
                            className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {isActing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <X size={13} />
                            )}
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground pr-1">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
