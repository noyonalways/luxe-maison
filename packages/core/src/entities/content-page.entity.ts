export const CONTENT_PAGE_SLUGS = [
  'privacy',
  'terms',
  'cookies',
  'our-story',
  'craftsmanship',
  'sustainability',
  'careers',
  'sizing-guide',
  'shipping-returns',
  'care-instructions',
  'contact',
] as const;

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
  'our-story': 'Our Story',
  craftsmanship: 'Craftsmanship',
  sustainability: 'Sustainability',
  careers: 'Careers',
  'sizing-guide': 'Sizing Guide',
  'shipping-returns': 'Shipping & Returns',
  'care-instructions': 'Care Instructions',
  contact: 'Contact Us',
};

export function isContentPageSlug(value: string): value is ContentPageSlug {
  return (CONTENT_PAGE_SLUGS as readonly string[]).includes(value);
}

export function contentPagePath(slug: ContentPageSlug): string {
  return `/${slug}`;
}
