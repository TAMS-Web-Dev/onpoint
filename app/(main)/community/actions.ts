'use server'

import { createClient } from '@/lib/supabase/server'
import { fetchComments } from '@/lib/db/community'
import type { CommentWithMeta } from '@/types/database'

export async function toggleLike(
  postId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  }

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  return { liked: !existing, likeCount: count ?? 0 }
}

export async function addComment(
  postId: string,
  content: string
): Promise<CommentWithMeta> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Comment cannot be empty')

  // Step 1 — insert comment, select only its own columns
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content: trimmed })
    .select('id, content, created_at, user_id')
    .single()

  if (error || !comment) throw new Error(error?.message ?? 'Failed to post comment')

  // Step 2 — fetch author profile separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', comment.user_id)
    .maybeSingle()

  return {
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    author_name: profile?.full_name ?? null,
    author_avatar: profile?.avatar_url ?? null,
  }
}

export async function createPost(
  content: string,
  imageUrl: string | null
): Promise<{ id: string; content: string; image_url: string | null; created_at: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Post content cannot be empty')

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ user_id: user.id, content: trimmed, image_url: imageUrl })
    .select('id, content, image_url, created_at')
    .single()

  if (error || !post) throw new Error(error?.message ?? 'Failed to create post')

  return post
}

export { fetchComments }
