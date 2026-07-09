import type { ContentPage, ContentPageSlug } from '@luxe-maison/shared';

const API_BASE =
  process.env.RESTAPI_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchContentPage(slug: ContentPageSlug): Promise<ContentPage | null> {
  try {
    const response = await fetch(`${API_BASE}/api/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as ContentPage;
  } catch {
    return null;
  }
}
