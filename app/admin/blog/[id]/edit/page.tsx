'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PostEditor from '../../PostEditor'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) { setPost(data.post); setLoading(false) }
      })
  }, [id])

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: '#A09890', fontSize: '13px' }}>Loading…</p>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: '#8B4444', fontSize: '13px' }}>Post not found.</p>
      </div>
    )
  }

  return (
    <PostEditor
      mode="edit"
      initialData={{
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        category: post.category || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        focus_keyword: post.focus_keyword || '',
        featured_image_url: post.featured_image_url || '',
        published: post.published ?? false,
      }}
    />
  )
}
