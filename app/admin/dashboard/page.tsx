'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ total: number; published: number; drafts: number } | null>(null)

  useEffect(() => {
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((data) => {
        const posts = data.posts || []
        setStats({
          total: posts.length,
          published: posts.filter((p: any) => p.published).length,
          drafts: posts.filter((p: any) => !p.published).length,
        })
      })
      .catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Posts', value: stats?.total ?? '—', href: '/admin/blog' },
    { label: 'Published', value: stats?.published ?? '—', href: '/admin/blog' },
    { label: 'Drafts', value: stats?.drafts ?? '—', href: '/admin/blog' },
  ]

  const actions = [
    { href: '/admin/blog/new', label: 'New Blog Post', desc: 'Write and publish a new article' },
    { href: '/admin/blog', label: 'Manage Posts', desc: 'Edit, delete, or toggle published status' },
    { href: '/admin/settings', label: 'Site Settings', desc: 'Update feature tiles and logo' },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '32px' }}>
        Dashboard
      </h1>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {cards.map(({ label, value, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A09890', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A09890', marginBottom: '12px', fontWeight: 600 }}>Quick Actions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {actions.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1A17', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: '#A09890' }}>{desc}</p>
              </div>
              <span style={{ fontSize: '14px', color: '#70798C' }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
