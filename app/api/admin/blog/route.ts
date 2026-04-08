import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — all posts (published + drafts) for admin
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, published, created_at, updated_at, excerpt')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts })
}

// POST — create new post
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: body.title,
      slug: body.slug,
      category: body.category || null,
      excerpt: body.excerpt || null,
      content: body.content || '',
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      focus_keyword: body.focus_keyword || null,
      featured_image_url: body.featured_image_url || null,
      published: body.published ?? false,
      author: body.author || 'The Starter',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data }, { status: 201 })
}
