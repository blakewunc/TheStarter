import { createClient } from '@supabase/supabase-js'

// Use service role key server-side to bypass RLS for public blog reads
// Falls back to anon key if service role not available (client-side)
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  category: string | null
  excerpt: string | null
  content: string
  meta_title: string | null
  meta_description: string | null
  focus_keyword: string | null
  published: boolean
  featured_image_url: string | null
  author: string
  created_at: string
  updated_at: string
  // Computed
  readTime?: string
}

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, excerpt, content, meta_title, meta_description, focus_keyword, published, featured_image_url, author, created_at, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((p) => ({ ...p, readTime: calcReadTime(p.content) }))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) return null
  return { ...data, readTime: calcReadTime(data.content) }
}

// Admin — used in /admin routes (requires authenticated session)
export async function getAllPostsAdmin(supabase: any): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((p: any) => ({ ...p, readTime: calcReadTime(p.content) }))
}
