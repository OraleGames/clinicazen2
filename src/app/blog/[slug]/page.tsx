import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { getBlogPostBySlug } from '@/lib/api'
import { getImagePath } from '@/lib/image-utils'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string) {
  const post = await getBlogPostBySlug(slug)
  if (!post) {
    notFound()
  }
  return post
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Blog post not found | Clinica Zen'
    }
  }

  return {
    title: `${post.title} | Clinica Zen`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.image_url ? [getImagePath(post.image_url)] : undefined
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug)

  const featuredImage = (post.image_url && post.image_url !== '/blog-placeholder.jpg') 
    ? getImagePath(post.image_url) 
    : getImagePath(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/#blog"
          className="inline-flex items-center text-pink-500 hover:text-pink-600 font-semibold mb-6"
        >
          <span className="mr-2">←</span> Back to blog
        </Link>

        <article className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="relative w-full h-80 md:h-[28rem]">
            <Image
              src={featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-8 md:p-12 space-y-6">
            <header className="space-y-4">
              <div className="text-sm uppercase tracking-[0.3em] text-pink-400 font-semibold">Clinica Zen</div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {post.author?.name && (
                  <span className="font-semibold text-gray-700">By {post.author.name}</span>
                )}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </header>

            {post.content ? (
              <div
                className="prose prose-lg max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-gray-600">This article is coming soon. Please check back later.</p>
            )}

            {post.keywords?.length ? (
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  )
}
