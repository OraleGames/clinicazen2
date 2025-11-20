'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BlogPost } from '@/types/BlogPost'
import { getImagePath } from '@/lib/image-utils'

interface BlogListProps {
  posts: BlogPost[]
}

export default function BlogList({ posts }: BlogListProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})

  const handleImageError = (postId: number) => {
    setFailedImages(prev => ({
      ...prev,
      [postId]: true
    }))
  }

  const getImageSrc = (post: BlogPost) => {
    // Check if image is missing or is the old placeholder
    if (failedImages[post.id] || !post.image_url || post.image_url === '/blog-placeholder.jpg') {
      return getImagePath(null); // Use the default from image-utils
    }
    // Use the getImagePath utility
    return getImagePath(post.image_url);
  }

  return (
    <div className="space-y-12 px-4 md:px-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={getImageSrc(post)}
                alt={post.title}
                width={300}
                height={200}
                className="h-48 w-full object-cover md:h-full md:w-48"
                onError={() => handleImageError(post.id)}
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="hover:text-pink-500 transition duration-300"
                >
                  {post.title}
                </button>
              </h3>
              { (post.content || post.excerpt) && (
                <div 
                  className="text-gray-600 mb-4 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: `${(post.content || post.excerpt || '').substring(0, 300)}...` }}
                />
              )}
              <button
                onClick={() => setSelectedPost(post)}
                className="text-pink-500 hover:text-pink-600 font-semibold transition duration-300"
              >
                Read more →
              </button>
            </div>
          </div>
        </article>
      ))}

      {selectedPost && (
        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-4 text-pink-500 hover:text-pink-600 font-semibold transition duration-300"
          >
            ← Back to articles
          </button>
          <article>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">{selectedPost.title}</h2>
            <div className="relative w-full max-h-[500px] flex justify-center mb-8">
             <Image
                src={getImageSrc(selectedPost)}
                alt={selectedPost.title}
                width={800}
                height={400}
                className="rounded-lg object-contain"
                style={{ maxHeight: '500px', width: 'auto' }}
                priority
                   />
             </div>
            {selectedPost.content && (
              <div 
                className="prose prose-lg max-w-none text-gray-800 blog-content"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            )}
            <Link
              href={`/blog/${selectedPost.slug}`}
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-semibold transition duration-300"
            >
              Read full article →
            </Link>
            {selectedPost.keywords && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Keywords:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.keywords.map((keyword, index) => (
                    <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      )}

      <style jsx>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          font-weight: bold !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
        }

        .blog-content p {
          margin-bottom: 1em !important;
        }

        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1em !important;
          padding-left: 1.5em !important;
        }

        .blog-content li {
          margin-bottom: 0.5em !important;
        }

        .blog-content a {
          color: #3182ce !important;
          text-decoration: underline !important;
        }

        .blog-content code {
          background-color: #edf2f7 !important;
          padding: 0.2em 0.4em !important;
          border-radius: 0.25em !important;
        }

        .blog-content pre {
          background-color: #edf2f7 !important;
          padding: 1em !important;
          border-radius: 0.25em !important;
          overflow-x: auto !important;
        }

        .blog-content blockquote {
          border-left: 4px solid #cbd5e0 !important;
          padding-left: 1em !important;
          color: #4a5568 !important;
        }

        /* Increase specificity by nesting selectors */
        .blog-content :global(h1),
        .blog-content :global(h2),
        .blog-content :global(h3),
        .blog-content :global(h4),
        .blog-content :global(h5),
        .blog-content :global(h6) {
          font-weight: bold !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
        }

        .blog-content :global(p) {
          margin-bottom: 1em !important;
        }

        .blog-content :global(ul),
        .blog-content :global(ol) {
          margin-bottom: 1em !important;
          padding-left: 1.5em !important;
        }

        .blog-content :global(li) {
          margin-bottom: 0.5em !important;
        }

        .blog-content :global(a) {
          color: #3182ce !important;
          text-decoration: underline !important;
        }

        .blog-content :global(code) {
          background-color: #edf2f7 !important;
          padding: 0.2em 0.4em !important;
          border-radius: 0.25em !important;
        }

        .blog-content :global(pre) {
          background-color: #edf2f7 !important;
          padding: 1em !important;
          border-radius: 0.25em !important;
          overflow-x: auto !important;
        }

        .blog-content :global(blockquote) {
          border-left: 4px solid #cbd5e0 !important;
          padding-left: 1em !important;
          color: #4a5568 !important;
        }
      `}</style>
    </div>
  )
}
