// Use a placeholder image service instead of a missing local file
export const DEFAULT_BLOG_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f3f4f6" width="800" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EBlog Image%3C/text%3E%3C/svg%3E';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export function getImagePath(imagePath: string | null | undefined): string {
  if (!imagePath) return DEFAULT_BLOG_IMAGE;
  
  try {
    // Check if it's already a full URL
    new URL(imagePath);
    return imagePath;
  } catch {
    // If it's a relative path, prepend the API URL
    return `${API_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }
}

export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}