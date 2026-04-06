import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Golf Trip Guides & Tips | The Starter',
  description: 'Planning guides, destination breakdowns, and tips for organizing golf trips with your crew.',
}

const CATEGORIES = ['All', 'Planning Tips', 'Destinations', 'Betting Formats', 'Courses', 'Gear']

const CATEGORY_EMOJI: Record<string, string> = {
  'Planning Tips': '📋',
  'Destinations': '📍',
  'Betting Formats': '🎰',
  'Courses': '⛳',
  'Gear': '🏌️',
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const allPosts = getAllPosts()
  const activeCategory = searchParams?.category || 'All'
  const filtered = activeCategory === 'All'
    ? allPosts
    : allPosts.filter((p) => p.category === activeCategory)

  const featured = filtered[0] ?? null
  const rest = filtered.slice(1)

  return (
    <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
      {/* Page header */}
      <div style={{ background: '#1C1A17', padding: '48px 24px 36px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.40)', marginBottom: '10px' }}>
            The Starter · Journal
          </p>
          <h1 style={{ fontSize: '36px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.15, marginBottom: '8px' }}>
            Golf trip intel.
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(245,241,237,0.45)', lineHeight: 1.6 }}>
            Destination breakdowns, planning guides, and tips your crew actually needs.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: `0.5px solid ${isActive ? '#1C1A17' : 'rgba(28,26,23,0.15)'}`,
                  background: isActive ? '#1C1A17' : '#fff',
                  color: isActive ? '#F5F1ED' : '#6B6460',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {CATEGORY_EMOJI[cat] && <span style={{ fontSize: '11px' }}>{CATEGORY_EMOJI[cat]}</span>}
                {cat}
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#A09890', textAlign: 'center', padding: '48px 0' }}>
            No posts in this category yet.
          </p>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
                <article
                  style={{
                    background: '#fff',
                    border: '0.5px solid rgba(28,26,23,0.10)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                  className="hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  {/* Dark accent bar */}
                  <div style={{ background: '#1C1A17', padding: '28px 28px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.40)', fontWeight: 600 }}>
                        {CATEGORY_EMOJI[featured.category] || ''} {featured.category}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.30)' }}>·</span>
                      <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.35)' }}>{featured.readTime}</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.25, marginBottom: '10px' }}>
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'rgba(245,241,237,0.50)', lineHeight: 1.6 }}>
                      {featured.description}
                    </p>
                  </div>
                  <div style={{ padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#A09890' }}>
                      {new Date(featured.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '12px', color: '#70798C', fontWeight: 500 }}>
                      Read →
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <article
                      style={{
                        background: '#fff',
                        border: '0.5px solid rgba(28,26,23,0.10)',
                        borderRadius: '8px',
                        padding: '20px',
                        height: '100%',
                        boxSizing: 'border-box',
                        transition: 'box-shadow 0.2s',
                      }}
                      className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', letterSpacing: '0.10em', textTransform: 'uppercase', color: '#70798C', fontWeight: 600 }}>
                          {CATEGORY_EMOJI[post.category] || ''} {post.category}
                        </span>
                        <span style={{ fontSize: '10px', color: '#DAD2BC' }}>·</span>
                        <span style={{ fontSize: '10px', color: '#A09890' }}>{post.readTime}</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#1C1A17', lineHeight: 1.35, marginBottom: '8px' }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6B6460', lineHeight: 1.6, marginBottom: '14px' }}>
                        {post.description}
                      </p>
                      <p style={{ fontSize: '11px', color: '#A09890' }}>
                        {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ marginTop: '56px', background: '#1C1A17', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '8px' }}>
            Planning a golf trip?
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(245,241,237,0.50)', marginBottom: '20px' }}>
            Build your itinerary, split costs, and coordinate the whole crew — free.
          </p>
          <Link
            href="/trips/new"
            style={{ display: 'inline-block', background: '#F5F1ED', color: '#1C1A17', borderRadius: '5px', padding: '10px 24px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}
          >
            Start here →
          </Link>
        </div>
      </div>
    </div>
  )
}
