'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  slug: string
  category: string | null
  published: boolean
  updated_at: string
  excerpt: string | null
}

export default function AdminBlogList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()

  const fetchPosts = async () => {
    const res = await fetch('/api/admin/blog')
    if (res.ok) {
      const data = await res.json()
      setPosts(data.posts || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDeleting(null)
  }

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id)
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published: !current } : p))
    }
    setToggling(null)
  }

  const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A09890' }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Blog Posts
        </h1>
        <Link href="/admin/blog/new" style={{ background: '#1C1A17', color: '#F5F1ED', borderRadius: '5px', padding: '10px 20px', fontSize: '12px', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.04em' }}>
          + New Post
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#A09890', fontSize: '13px' }}>Loading…</p>
      ) : posts.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#A09890' }}>No posts yet.</p>
          <Link href="/admin/blog/new" style={{ display: 'inline-block', marginTop: '16px', background: '#1C1A17', color: '#F5F1ED', borderRadius: '5px', padding: '10px 20px', fontSize: '12px', textDecoration: 'none' }}>
            Write your first post
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 120px 140px', gap: '0', padding: '10px 20px', background: 'rgba(28,26,23,0.02)', borderBottom: '0.5px solid rgba(28,26,23,0.08)' }}>
            <span style={labelStyle}>Title</span>
            <span style={labelStyle}>Category</span>
            <span style={labelStyle}>Status</span>
            <span style={labelStyle}>Updated</span>
            <span style={labelStyle}>Actions</span>
          </div>

          {posts.map((post, i) => (
            <div
              key={post.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 120px 140px', gap: '0', padding: '14px 20px', borderBottom: i < posts.length - 1 ? '0.5px solid rgba(28,26,23,0.06)' : 'none', alignItems: 'center' }}
            >
              <div style={{ minWidth: 0, paddingRight: '12px' }}>
                <button
                  onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                  style={{ fontSize: '13px', fontWeight: 500, color: '#1C1A17', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', padding: 0 }}
                >
                  {post.title}
                </button>
                <p style={{ fontSize: '11px', color: '#A09890', marginTop: '1px' }}>/{post.slug}</p>
              </div>

              <span style={{ fontSize: '12px', color: '#6B6460' }}>{post.category || '—'}</span>

              <span style={{ fontSize: '11px', fontWeight: 500, color: post.published ? '#3B6D11' : '#8B4444', background: post.published ? 'rgba(59,109,17,0.08)' : 'rgba(139,68,68,0.08)', borderRadius: '4px', padding: '3px 8px', display: 'inline-block' }}>
                {post.published ? 'Published' : 'Draft'}
              </span>

              <span style={{ fontSize: '11px', color: '#A09890' }}>
                {new Date(post.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link href={`/admin/blog/${post.id}/edit`} style={{ fontSize: '12px', color: '#70798C', textDecoration: 'none', fontWeight: 500 }}>Edit</Link>
                <span style={{ color: '#DAD2BC' }}>·</span>
                <button
                  onClick={() => handleToggle(post.id, post.published)}
                  disabled={toggling === post.id}
                  style={{ fontSize: '12px', color: '#70798C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                >
                  {toggling === post.id ? '…' : post.published ? 'Unpublish' : 'Publish'}
                </button>
                <span style={{ color: '#DAD2BC' }}>·</span>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deleting === post.id}
                  style={{ fontSize: '12px', color: '#8B4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {deleting === post.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
