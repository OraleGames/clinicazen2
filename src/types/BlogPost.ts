export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  image_url: string | null
  author_id: string | null
  published: boolean
  created_at: string
  updated_at: string
  keywords?: string[]
  author?: {
    id: string
    name?: string | null
    avatar_url?: string | null
  } | null
}