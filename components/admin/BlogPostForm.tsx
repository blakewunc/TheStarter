'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type BlogPost = {
  id?: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  meta_title: string
  meta_description: string
  focus_keyword: string
  published: boolean
  featured_image_url: string
  author: string
}

const empty: BlogPost = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  meta_title: '',
  meta_description: '',
  focus_keyword: '',
  published: false,
  featured_image_url: '',
  author: '',
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function BlogPostForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter()
  const [form, setForm] = useState<BlogPost>(initial ?? empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEdit = !!initial?.id

  function set(field: keyof BlogPost, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: f.slug === toSlug(f.title) || f.slug === '' ? toSlug(value) : f.slug,
    }))
  }

  async function handleSave(publish?: boolean) {
    const payload = publish !== undefined ? { ...form, published: publish } : form
    setSaving(true)
    try {
      const res = await fetch(
        isEdit ? `/api/admin/blog/${initial!.id}` : '/api/admin/blog',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Something went wrong')
      }
      toast.success(isEdit ? 'Post saved.' : 'Post created.')
      router.push('/admin/blog')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save post.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/${initial!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Post deleted.')
      router.push('/admin/blog')
      router.refresh()
    } catch {
      toast.error('Failed to delete post.')
    } finally {
      setDeleting(false)
    }
  }

  const field = 'w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none'

  return (
    <div className="space-y-8">

      {/* Main content */}
      <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#6B6460]">Content</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Title</label>
            <input
              className={field}
              placeholder="Post title"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Slug</label>
            <input
              className={field}
              placeholder="post-url-slug"
              value={form.slug}
              onChange={(e) => set('slug', toSlug(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Excerpt</label>
            <textarea
              className={`${field} resize-none`}
              rows={2}
              placeholder="Short description shown in listings"
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Content</label>
            <textarea
              className={`${field} resize-y font-mono text-xs leading-relaxed`}
              rows={20}
              placeholder="Write your post here…"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#6B6460]">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Author</label>
            <input
              className={field}
              placeholder="Author name"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Category</label>
            <input
              className={field}
              placeholder="e.g. Golf Tips, Trip Reports"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Featured image URL</label>
            <input
              className={field}
              placeholder="https://..."
              value={form.featured_image_url}
              onChange={(e) => set('featured_image_url', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#6B6460]">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Meta title</label>
            <input
              className={field}
              placeholder="Defaults to post title if blank"
              value={form.meta_title}
              onChange={(e) => set('meta_title', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Meta description</label>
            <textarea
              className={`${field} resize-none`}
              rows={2}
              placeholder="150–160 characters"
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#1C1A17]">Focus keyword</label>
            <input
              className={field}
              placeholder="Primary keyword for this post"
              value={form.focus_keyword}
              onChange={(e) => set('focus_keyword', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-[5px] bg-[#252323] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3B6D11] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          {!form.published && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="rounded-[5px] border border-[#252323] px-5 py-2 text-sm font-semibold text-[#1C1A17] hover:bg-[#F5F1ED] disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {form.published && (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="rounded-[5px] border border-[#DAD2BC] px-5 py-2 text-sm font-semibold text-[#3B6D11] hover:bg-[#F5F1ED] disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
        </div>
        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete post'}
          </button>
        )}
      </div>

    </div>
  )
}
