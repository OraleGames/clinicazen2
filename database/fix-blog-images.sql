-- Fix blog posts with invalid placeholder images
-- Option 1: Set image_url to NULL for posts using the placeholder
UPDATE blog_posts 
SET image_url = NULL 
WHERE image_url = '/blog-placeholder.jpg';

-- Option 2: Or use a valid external placeholder (uncomment if preferred)
-- UPDATE blog_posts 
-- SET image_url = 'https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=Blog+Image'
-- WHERE image_url = '/blog-placeholder.jpg' OR image_url IS NULL;
