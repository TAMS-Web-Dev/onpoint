'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, PenSquare, Share2, Users, MoreVertical, EyeOff, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommentSheet } from '@/components/community/CommentSheet'
import { CreatePostDialog } from '@/components/community/CreatePostDialog'
import { toggleLike, hidePost, deletePost } from '@/app/(main)/community/actions'
import type { PostWithMeta } from '@/types/database'

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

interface CurrentUser {
  id: string
  name: string | null
  avatar: string | null
  isAdmin: boolean
}

interface CommunityFeedProps {
  initialPosts: PostWithMeta[]
  currentUserId: string | null
  canPost: boolean
  currentUser: CurrentUser | null
  isAdmin: boolean
  isSuperAdmin: boolean
}

function PostCard({
  post,
  isLoggedIn,
  isAdmin,
  isSuperAdmin,
  onLike,
  onOpenComments,
  onHide,
  onDelete,
}: {
  post: PostWithMeta
  isLoggedIn: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  onLike: (postId: string) => void
  onOpenComments: (postId: string) => void
  onHide: (postId: string, hidden: boolean) => void
  onDelete: (postId: string) => void
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <article className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-opacity ${post.hidden ? 'opacity-60' : ''}`}>
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={post.author_avatar ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                {getInitials(post.author_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-secondary">
                {post.author_name ?? 'OnPoint Member'}
              </span>
              {post.is_admin && (
                <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
              {post.hidden && isAdmin && (
                <span className="bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Hidden
                </span>
              )}
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0 cursor-pointer">
                  <MoreVertical size={15} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onHide(post.id, !post.hidden)}
                  className="gap-2 cursor-pointer"
                >
                  {post.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                  {post.hidden ? 'Show Post' : 'Hide Post'}
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem
                    onClick={() => onDelete(post.id)}
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post image */}
      {post.image_url && (
        <div className="relative aspect-[16/9] mx-5 mb-5 rounded-xl overflow-hidden">
          <Image
            src={post.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-3 pb-3 border-t border-border pt-2">
        <button
          onClick={() => isLoggedIn && onLike(post.id)}
          disabled={!isLoggedIn}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            post.is_liked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          } disabled:opacity-40 disabled:cursor-default`}
        >
          <Heart size={15} fill={post.is_liked ? 'currentColor' : 'none'} />
          <span>{post.like_count}</span>
        </button>

        <button
          onClick={() => isLoggedIn && onOpenComments(post.id)}
          disabled={!isLoggedIn}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-default"
        >
          <MessageCircle size={15} />
          <span>{post.comment_count}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Share2 size={15} />
          <span>Share</span>
        </button>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users size={48} className="text-foreground/20 mb-4" />
      <h3 className="text-secondary font-semibold text-lg">No posts yet</h3>
      <p className="mt-1.5 text-foreground/50 text-sm max-w-xs">
        Check back soon — the community feed is just getting started.
      </p>
    </div>
  )
}

export function CommunityFeed({
  initialPosts,
  currentUserId,
  canPost,
  currentUser,
  isAdmin,
  isSuperAdmin,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<PostWithMeta[]>(initialPosts)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const isLoggedIn = !!currentUserId

  async function handleLike(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
          : p
      )
    )
    try {
      const { liked, likeCount } = await toggleLike(postId)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_liked: liked, like_count: likeCount } : p))
      )
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
            : p
        )
      )
      toast.error('Could not update like')
    }
  }

  async function handleHide(postId: string, hidden: boolean) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hidden } : p)))
    try {
      await hidePost(postId, hidden)
      toast.success(hidden ? 'Post hidden.' : 'Post is now visible.')
    } catch (err) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hidden: !hidden } : p)))
      toast.error(err instanceof Error ? err.message : 'Could not update post')
    }
  }

  async function handleDelete(postId: string) {
    const deleted = posts.find((p) => p.id === postId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    try {
      await deletePost(postId)
      toast.success('Post deleted.')
    } catch (err) {
      if (deleted) setPosts((prev) => [deleted, ...prev])
      toast.error(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  function handleCommentAdded(postId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
    )
  }

  function handlePostCreated(post: PostWithMeta) {
    setPosts((prev) => [post, ...prev])
  }

  return (
    <>
      {canPost && currentUser && (
        <div className="mb-6">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <PenSquare size={15} />
            Create Post
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              onLike={handleLike}
              onOpenComments={setActiveCommentPostId}
              onHide={handleHide}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <CommentSheet
        postId={activeCommentPostId}
        onClose={() => setActiveCommentPostId(null)}
        onCommentAdded={() => activeCommentPostId && handleCommentAdded(activeCommentPostId)}
      />

      {canPost && currentUser && (
        <CreatePostDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handlePostCreated}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
