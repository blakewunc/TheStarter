'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PostData {
  id?: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  meta_title: string
  meta_description: string
  focus_keyword: string
  featured_image_url: string
  published: boolean
}

interface PostEditorProps {
  initialData?: Partial<PostData>
  mode: 'new' | 'edit'
}

const CATEGORIES = ['Trip Planning', 'Course Guides', 'Hidden Gems', 'Trip Planning Tips']

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '0.5px solid rgba(28,26,23,0.20)',
  borderRadius: '5px',
  fontSize: '13px',
  color: '#1C1A17',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: '#A09890',
  display: 'block',
  marginBottom: '6px',
}

export default function PostEditor({ initialData, mode }: PostEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [slugManual, setSlugManual] = useState(mode === 'edit')
  const [form, setForm] = useState<PostData>({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    featured_image_url: '',
    published: false,
    ...initialData,
  })

  // Auto-generate slug from title on new posts
  useEffect(() => {
    if (mode === 'new' && !slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(form.title) }))
    }
  }, [form.title, mode, slugManual])

  const set = (field: keyof PostData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !form.slug.trim()) {
      alert('Title and slug are required.')
      return
    }
    setSaving(true)
    const payload = { ...form }
    if (publish !== undefined) payload.published = publish

    try {
      let res: Response
      if (mode === 'new') {
        res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/blog/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Save failed')
        return
      }

      const data = await res.json()
      if (mode === 'new') {
        router.push(`/admin/blog/${data.post.id}/edit`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    if (!confirm(`Delete "${form.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/admin/blog/${initialData.id}`, { method: 'DELETE' })
    router.push('/admin/blog')
  }

  const charCount = (str: string) => str.length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/admin/blog')}
            style={{ fontSize: '13px', color: '#A09890', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {mode === 'new' ? 'New Post' : 'Edit Post'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {mode === 'edit' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '9px 16px', borderRadius: '5px', border: '0.5px solid rgba(139,68,68,0.30)', background: 'rgba(139,68,68,0.06)', color: '#8B4444', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{ padding: '9px 16px', borderRadius: '5px', border: '0.5px solid rgba(28,26,23,0.20)', background: '#fff', color: '#1C1A17', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{ padding: '9px 16px', borderRadius: '5px', border: 'none', background: '#1C1A17', color: '#F5F1ED', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '20px' }}>
            <label style={labelStyle}>Title *</label>
            <input
              style={{ ...inputStyle, fontSize: '16px', fontWeight: 500 }}
              placeholder="Post title…"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Slug */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '20px' }}>
            <label style={labelStyle}>Slug *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#A09890', whiteSpace: 'nowrap' }}>/blog/</span>
              <input
                style={inputStyle}
                placeholder="post-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true)
                  set('slug', slugify(e.target.value))
                }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Excerpt</label>
              <span style={{ fontSize: '10px', color: charCount(form.excerpt) > 160 ? '#8B4444' : '#A09890' }}>
                {charCount(form.excerpt)}/160
              </span>
            </div>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
              placeholder="Short description shown in article cards…"
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
            />
          </div>

          {/* Content */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Content (Markdown)</label>
              <span style={{ fontSize: '10px', color: '#A09890' }}>
                ~{Math.max(1, Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200))} min read
              </span>
            </div>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '400px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}
              placeholder="Write your post in Markdown…&#10;&#10;# Heading 1&#10;## Heading 2&#10;&#10;Regular paragraph text.&#10;&#10;- Bullet item&#10;- Another item&#10;&#10;**Bold text** and *italic text*"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '16px' }}>
            <label style={labelStyle}>Status</label>
            <div
              onClick={() => set('published', !form.published)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{
                width: '36px', height: '20px', borderRadius: '999px',
                background: form.published ? '#3B6D11' : 'rgba(28,26,23,0.15)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: form.published ? '18px' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </div>
              <span style={{ fontSize: '13px', color: form.published ? '#3B6D11' : '#A09890', fontWeight: 500 }}>
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Category */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '16px' }}>
            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              <option value="">— None —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '16px' }}>
            <label style={labelStyle}>Featured Image URL</label>
            <input
              style={inputStyle}
              placeholder="https://…"
              value={form.featured_image_url}
              onChange={(e) => set('featured_image_url', e.target.value)}
            />
            {form.featured_image_url && (
              <div style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden', aspectRatio: '16/9', background: '#F5F1ED' }}>
                <img src={form.featured_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* SEO */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '16px' }}>
            <label style={{ ...labelStyle, marginBottom: '12px' }}>SEO</label>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ ...labelStyle, marginBottom: 0, fontSize: '9px' }}>Meta Title</label>
                <span style={{ fontSize: '9px', color: charCount(form.meta_title) > 60 ? '#8B4444' : '#A09890' }}>
                  {charCount(form.meta_title)}/60
                </span>
              </div>
              <input
                style={inputStyle}
                placeholder={form.title || 'SEO title…'}
                value={form.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ ...labelStyle, marginBottom: 0, fontSize: '9px' }}>Meta Description</label>
                <span style={{ fontSize: '9px', color: charCount(form.meta_description) > 160 ? '#8B4444' : '#A09890' }}>
                  {charCount(form.meta_description)}/160
                </span>
              </div>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', fontFamily: 'inherit', fontSize: '12px' }}
                placeholder={form.excerpt || 'SEO description…'}
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
              />
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '4px', fontSize: '9px' }}>Focus Keyword</label>
              <input
                style={inputStyle}
                placeholder="bachelor party planning"
                value={form.focus_keyword}
                onChange={(e) => set('focus_keyword', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
