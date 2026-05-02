'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { createPost } from '@/app/(main)/community/actions'
import type { PostWithMeta } from '@/types/database'

interface CurrentUser {
  id: string
  name: string | null
  avatar: string | null
  isAdmin: boolean
}

interface CreatePostDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (post: PostWithMeta) => void
  currentUser: CurrentUser
}

export function CreatePostDialog({ open, onClose, onCreated, currentUser }: CreatePostDialogProps) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    setContent('')
    removeImage()
    onClose()
  }

  async function handleSubmit() {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const supabase = createClient()
        const ext = imageFile.name.split('.').pop()
        const path = `${currentUser.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(path, imageFile)
        if (uploadError) throw new Error('Image upload failed')
        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(path)
        imageUrl = publicUrl
      }

      const raw = await createPost(content.trim(), imageUrl)

      const newPost: PostWithMeta = {
        id: raw.id,
        content: raw.content,
        image_url: raw.image_url,
        created_at: raw.created_at,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
        is_admin: currentUser.isAdmin,
        like_count: 0,
        comment_count: 0,
        is_liked: false,
      }

      onCreated(newPost)
      handleClose()
      toast.success('Post published!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the community…"
            rows={5}
            className="resize-none"
          />

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl px-4 py-3 transition-colors w-full justify-center"
            >
              <ImagePlus size={16} />
              Add image (optional)
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
            {submitting ? 'Posting…' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
