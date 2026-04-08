import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.meta_title || `${post.title} | The Starter`,
    description: post.meta_description || post.excerpt || '',
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      type: 'article',
      siteName: 'The Starter',
    },
    twitter: {
      card: 'summary',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
    },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getAllPosts()
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
      {/* Article header */}
      <div style={{ background: '#1C1A17', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Link
            href="/blog"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(245,241,237,0.40)', textDecoration: 'none', marginBottom: '20px', letterSpacing: '0.05em' }}
          >
            ← All Guides
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,237,0.45)', fontWeight: 600 }}>
              {post.category}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.25)' }}>·</span>
            <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.35)' }}>{post.readTime}</span>
            <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.25)' }}>·</span>
            <span style={{ fontSize: '10px', color: 'rgba(245,241,237,0.35)' }}>{post.author}</span>
          </div>

          <h1 style={{ fontSize: '30px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.2, marginBottom: '14px' }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ fontSize: '14px', color: 'rgba(245,241,237,0.50)', lineHeight: 1.6, marginBottom: '16px' }}>
              {post.excerpt}
            </p>
          )}
          <p style={{ fontSize: '11px', color: 'rgba(245,241,237,0.30)' }}>
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div
          className="prose prose-stone max-w-none
            prose-headings:font-medium prose-headings:text-[#1C1A17] prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[#3C3835] prose-p:leading-8 prose-p:text-base
            prose-li:text-[#3C3835] prose-li:leading-relaxed
            prose-ul:my-4 prose-ol:my-4
            prose-strong:text-[#1C1A17] prose-strong:font-semibold
            prose-a:text-[#70798C] prose-a:no-underline hover:prose-a:underline
            prose-hr:border-[rgba(28,26,23,0.10)] prose-hr:my-10
            prose-blockquote:border-l-[#70798C] prose-blockquote:text-[#6B6460] prose-blockquote:not-italic
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Internal link — golf trip planner */}
        <div style={{ margin: '48px 0 0', background: '#F0F4ED', border: '0.5px solid rgba(59,109,17,0.15)', borderRadius: '6px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#3C3835', lineHeight: 1.5 }}>
            Ready to <Link href="/golf-trip-planner" style={{ color: '#3B6D11', textDecoration: 'underline', textUnderlineOffset: '3px' }}>plan a golf trip</Link>? The Starter handles itinerary, costs, foursomes, and payouts — all in one link.
          </p>
          <Link
            href="/golf-trip-planner"
            style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, color: '#3B6D11', letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}
          >
            Golf trip planner →
          </Link>
        </div>

        {/* CTA */}
        <div style={{ margin: '32px 0 0', background: '#1C1A17', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 300, color: '#F5F1ED', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '8px' }}>
            Ready to plan your trip?
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(245,241,237,0.50)', marginBottom: '20px', lineHeight: 1.6 }}>
            Build your itinerary, split costs, and coordinate the whole crew. Free to start.
          </p>
          <Link
            href="/trips/new"
            style={{ display: 'inline-block', background: '#F5F1ED', color: '#1C1A17', borderRadius: '5px', padding: '10px 24px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}
          >
            Start planning →
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div style={{ margin: '48px 0 64px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A09890', fontWeight: 600, marginBottom: '16px' }}>
              More in {post.category}
            </p>
            <div className="space-y-3">
              {related.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '6px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    className="hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1A17', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rp.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#A09890' }}>{rp.readTime}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#70798C', flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!related.length && <div style={{ paddingBottom: '64px' }} />}
      </div>
    </div>
  )
}
