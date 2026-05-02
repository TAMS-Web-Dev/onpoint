'use client'

import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { fetchComments, addComment } from '@/app/(main)/community/actions'
import type { CommentWithMeta } from '@/types/database'

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

interface CommentSheetProps {
  postId: string | null
  onClose: () => void
  onCommentAdded: () => void
}

export function CommentSheet({ postId, onClose, onCommentAdded }: CommentSheetProps) {
  const [comments, setComments] = useState<CommentWithMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!postId) { setComments([]); return }
    setLoading(true)
    fetchComments(postId)
      .then(setComments)
      .finally(() => setLoading(false))
  }, [postId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function handleSubmit() {
    if (!postId || !text.trim()) return
    setSubmitting(true)
    try {
      const newComment = await addComment(postId, text.trim())
      setComments((prev) => [...prev, newComment])
      setText('')
      onCommentAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={!!postId} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No comments yet — be the first!
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={c.author_avatar ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(c.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-secondary">
                        {c.author_name ?? 'Member'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mt-0.5 break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="self-end"
            size="sm"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Send size={14} className="mr-1.5" />
            )}
            {submitting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
