import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithProfile } from '@/lib/db/profile'
import { fetchPosts } from '@/lib/db/community'
import { CommunityFeed } from '@/components/community/CommunityFeed'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { profile } = await getCurrentUserWithProfile()

  const role = authUser?.app_metadata?.role ?? authUser?.user_metadata?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isSuperAdmin = role === 'super_admin'
  const isActivePartner = profile?.user_type === 'partner' && profile?.status === 'active'
  const canPost = isAdmin || isActivePartner

  const posts = await fetchPosts(authUser?.id ?? null, isAdmin)

  const currentUser = authUser
    ? {
        id: authUser.id,
        name: profile?.full_name ?? null,
        avatar: profile?.avatar_url ?? null,
        isAdmin,
      }
    : null

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-secondary">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect with creatives and stay updated with the latest news.
        </p>
      </div>

      <div className="max-w-2xl">
        <CommunityFeed
          initialPosts={posts}
          currentUserId={authUser?.id ?? null}
          canPost={canPost}
          currentUser={currentUser}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />
      </div>
    </main>
  )
}
