export const CONTENT_PAGE_SLUGS = ['privacy', 'terms', 'cookies'] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export interface ContentPage {
  slug: ContentPageSlug;
  title: string;
  body: string;
  metaDescription?: string;
  published: boolean;
  updatedAt: string;
}

export const CONTENT_PAGE_LABELS: Record<ContentPageSlug, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
};

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return (CONTENT_PAGE_SLUGS as readonly string[]).includes(value);
}
