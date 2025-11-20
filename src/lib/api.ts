import { supabase } from '@/lib/supabase'
import { BlogPost } from '@/types/BlogPost'

const BLOG_POSTS_SELECT = `
  *,
  author:profiles (
    id,
    name,
    avatar_url
  )
`

export async function getBlogPosts(limit = 6): Promise<BlogPost[]> {
  try {
    // First, try without the join to see if basic query works
    const { data: testData, error: testError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1)

    console.log('Basic blog_posts query test:', { testData, testError })

    // Now try the full query
    const { data, error } = await supabase
      .from('blog_posts')
      .select(BLOG_POSTS_SELECT)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching blog posts from Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    console.log('Blog posts fetched successfully:', data?.length || 0)
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getBlogPosts:', err)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POSTS_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching blog post by slug:', error)
    return null
  }

  return data
}