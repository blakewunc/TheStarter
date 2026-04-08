import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Public endpoint — no auth required, only returns published posts
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, category, content')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) return NextResponse.json({ posts: [] })
  return NextResponse.json({ posts: posts || [] })
}
