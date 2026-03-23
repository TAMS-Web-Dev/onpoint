'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronRight, Flame, LogOut, Settings, User } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'
import { fetchProfile, updateUserProfile } from '@/app/(main)/more/actions'
import { ProfileSheet } from '@/components/more/ProfileSheet'
import { SettingsSheet } from '@/components/more/SettingsSheet'
import type { Profile, Database } from '@/types/database'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

interface MorePageClientProps {
  initialProfile: Profile
  userId: string
  userEmail: string | undefined
}

export function MorePageClient({ initialProfile, userId, userEmail }: MorePageClientProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
    initialData: initialProfile,
  })

  const mutation = useMutation({
    mutationFn: (updates: ProfileUpdate) => updateUserProfile(userId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      const previous = queryClient.getQueryData<Profile>(['profile', userId])
      queryClient.setQueryData<Profile>(['profile', userId], (old) =>
        old ? { ...old, ...updates } : old
      )
      return { previous }
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profile', userId], context.previous)
      }
      toast.error('Failed to save changes')
    },
    onSuccess: () => {
      toast.success('Changes saved!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })

  if (!profile) return null

  return (
    <>
      {/* Profile Card */}
      <div className="mt-8 bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-extrabold text-xl">
            {getInitials(profile.full_name)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-secondary font-semibold text-base leading-tight truncate">
            {profile.full_name ?? 'OnPoint Member'}
          </p>
          <p className="text-foreground/55 text-sm mt-0.5 truncate">
            {profile.email ?? userEmail}
          </p>
          {profile.streak_count > 0 && (
            <div className="inline-flex items-center gap-1 mt-1.5">
              <Flame size={13} className="text-primary" />
              <span className="text-primary text-xs font-semibold">
                {profile.streak_count}-day streak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Account Section */}
      <section className="mt-8">
        <h2 className="text-secondary font-extrabold text-xs uppercase tracking-widest mb-3 px-1">
          Account
        </h2>
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors group"
          >
            <User size={18} className="text-primary flex-shrink-0" />
            <span className="flex-1 text-left text-secondary font-medium text-sm">Profile</span>
            <ChevronRight
              size={16}
              className="text-foreground/30 group-hover:text-foreground/60 transition-colors"
            />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors group"
          >
            <Settings size={18} className="text-primary flex-shrink-0" />
            <span className="flex-1 text-left text-secondary font-medium text-sm">
              Account Settings
            </span>
            <ChevronRight
              size={16}
              className="text-foreground/30 group-hover:text-foreground/60 transition-colors"
            />
          </button>
        </div>
      </section>

      {/* Log Out */}
      <div className="mt-6 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-red-50/50 transition-colors"
          >
            <LogOut size={18} className="text-primary flex-shrink-0" />
            <span className="text-primary font-semibold text-sm">Log Out</span>
          </button>
        </form>
      </div>

      {/* Sheets */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onSave={(updates) => {
          mutation.mutate(updates)
          setProfileOpen(false)
        }}
        isPending={mutation.isPending}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onToggle={(updates) => mutation.mutate(updates)}
        isPending={mutation.isPending}
      />
    </>
  )
}
