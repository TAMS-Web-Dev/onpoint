'use server'

import { getProfileById, updateProfile } from '@/lib/db/profile'
import type { Database } from '@/types/database'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function fetchProfile(userId: string) {
  const { data, error } = await getProfileById(userId)
  if (error) throw new Error(error)
  return data
}

export async function updateUserProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await updateProfile(userId, updates)
  if (error) throw new Error(error)
  return data
}
