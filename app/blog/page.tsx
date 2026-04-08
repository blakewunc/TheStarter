import { getAllPosts } from '@/lib/blog'
import type { Metadata } from 'next'
import BlogIndex from './BlogIndex'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Golf Trip Guides & Tips | The Starter',
  description: 'Planning guides, destination breakdowns, and tips for organizing golf trips with your crew.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  return <BlogIndex posts={posts} />
}
