'use client'

import { useState } from 'react'
import { validatePassword } from '@/lib/validation/password'
import { format } from 'date-fns'
import { Plus, Trash2, Loader2, ShieldCheck, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AdminRow {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
        <Crown size={11} />
        Super Admin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-0.5">
      <ShieldCheck size={11} />
      Admin
    </span>
  )
}

interface Props {
  initialAdmins: AdminRow[]
  currentUserId: string
}

export default function AdminManagementClient({ initialAdmins, currentUserId }: Props) {
  const [admins, setAdmins] = useState<AdminRow[]>(initialAdmins)
  const [addOpen, setAddOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!email.trim() || !password.trim()) return
    const pwError = validatePassword(password)
    if (pwError) {
      setPasswordError(pwError)
      return
    }
    setPasswordError(null)
    setAdding(true)
    try {
      const res = await fetch('/api/admin/admin-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create admin')
      setAdmins((prev) => [data.admin, ...prev])
      setEmail('')
      setPassword('')
      setPasswordError(null)
      setAddOpen(false)
      toast.success(`Admin account created for ${data.admin.email}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(admin: AdminRow) {
    setDeletingId(admin.id)
    try {
      const res = await fetch(`/api/admin/admin-management/${admin.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete admin')
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id))
      toast.success(`${admin.email} has been removed.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete admin')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin and super admin accounts.</p>
          <hr className="mt-4 border-border" />
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0 gap-2 mt-1">
          <Plus size={15} />
          Add Admin
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                  No admin accounts found.
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const isSelf = admin.id === currentUserId
                const isDeleting = deletingId === admin.id
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-semibold text-gray-900">{admin.email}</TableCell>
                    <TableCell className="text-gray-600">{admin.full_name ?? '-'}</TableCell>
                    <TableCell>
                      <RoleBadge role={admin.role} />
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {format(new Date(admin.created_at), 'd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(admin)}
                        disabled={isSelf || isDeleting}
                        title={isSelf ? 'You cannot delete your own account' : `Remove ${admin.email}`}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                      >
                        {isDeleting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setEmail(''); setPassword(''); setPasswordError(null) } setAddOpen(o) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(null) }}
                placeholder="Min. 12 characters"
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={adding || !email.trim() || !password.trim()}
            >
              {adding && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {adding ? 'Creating…' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
