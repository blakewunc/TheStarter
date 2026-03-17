import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Golf Trip Guides & Tips | The Starter',
  description: 'Planning guides, destination breakdowns, and tips for organizing golf trips with your crew.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#70798C]">The Starter</p>
          <h1 className="text-4xl font-bold tracking-tight text-[#252323]">Golf Trip Guides</h1>
          <p className="mt-3 text-[#A99985]">Destination breakdowns, planning tips, and everything your crew needs to know</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-[#A99985]">Posts coming soon.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A7C59]">
                      {post.category}
                    </span>
                    <span className="text-xs text-[#A99985]">{post.readTime}</span>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-[#252323] group-hover:text-[#70798C] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#A99985]">{post.description}</p>
                  <p className="mt-4 text-xs text-[#A99985]">
                    {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
