import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { PostWithMeta, CommentWithMeta } from '@/types/database'

export async function fetchPosts(currentUserId: string | null): Promise<PostWithMeta[]> {
  const supabase = await createClient()

  // 1. Posts — no join, avoids FK dependency on profiles
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, image_url, created_at, user_id')
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('[fetchPosts] posts query error:', postsError)
    return []
  }
  if (!posts || posts.length === 0) return []

  // 2. Profiles for all authors — separate .in() query, no FK required
  const uniqueAuthorIds = [...new Set(posts.map((p) => p.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', uniqueAuthorIds)

  if (profilesError) console.error('[fetchPosts] profiles query error:', profilesError)

  const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
  for (const p of profiles ?? []) profileMap[p.id] = p

  // 3. All likes → like count per post
  const { data: allLikes, error: likesError } = await supabase
    .from('likes')
    .select('post_id')

  if (likesError) console.error('[fetchPosts] likes query error:', likesError)

  const likeCountMap: Record<string, number> = {}
  for (const l of allLikes ?? []) {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] ?? 0) + 1
  }

  // 4. All comments → comment count per post
  const { data: allComments, error: commentsError } = await supabase
    .from('comments')
    .select('post_id')

  if (commentsError) console.error('[fetchPosts] comments query error:', commentsError)

  const commentCountMap: Record<string, number> = {}
  for (const c of allComments ?? []) {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] ?? 0) + 1
  }

  // 5. Current user's liked post IDs
  const likedPostIds = new Set<string>()
  if (currentUserId) {
    const { data: myLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
    for (const l of myLikes ?? []) likedPostIds.add(l.post_id)
  }

  // 6. Author roles via service role (admin check)
  const authorRoles: Record<string, string | undefined> = {}
  try {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await Promise.all(
      uniqueAuthorIds.map(async (uid) => {
        const { data } = await service.auth.admin.getUserById(uid)
        authorRoles[uid] =
          data.user?.app_metadata?.role ?? data.user?.user_metadata?.role
      })
    )
  } catch {
    // fail-open — no admin badges if service call fails
  }

  // 7. Merge and return
  return posts.map((post) => {
    const profile = profileMap[post.user_id]
    const role = authorRoles[post.user_id]
    return {
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      author_name: profile?.full_name ?? null,
      author_avatar: profile?.avatar_url ?? null,
      is_admin: role === 'admin' || role === 'super_admin',
      like_count: likeCountMap[post.id] ?? 0,
      comment_count: commentCountMap[post.id] ?? 0,
      is_liked: likedPostIds.has(post.id),
    }
  })
}

export async function fetchComments(postId: string): Promise<CommentWithMeta[]> {
  const supabase = await createClient()

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error('[fetchComments] error:', commentsError)
    return []
  }
  if (!comments || comments.length === 0) return []

  const uniqueUserIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', uniqueUserIds)

  if (profilesError) console.error('[fetchComments] profiles error:', profilesError)

  const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
  for (const p of profiles ?? []) profileMap[p.id] = p

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    author_name: profileMap[c.user_id]?.full_name ?? null,
    author_avatar: profileMap[c.user_id]?.avatar_url ?? null,
  }))
}
