import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CONTENT_PAGE_LABELS,
  CONTENT_PAGE_SLUGS,
  isContentPageSlug,
  type ContentPageSlug,
} from '@luxe-maison/shared';
import StorefrontLayout from '@/components/StorefrontLayout';
import { fetchContentPage } from '@/lib/api/content-pages.server';
import ContentPageView from '@/views/ContentPageView';

/** Slugs with dedicated routes under /privacy, /terms, /cookies */
const LEGACY_STATIC_SLUGS = new Set<ContentPageSlug>(['privacy', 'terms', 'cookies']);

const DYNAMIC_SLUGS = CONTENT_PAGE_SLUGS.filter((slug) => !LEGACY_STATIC_SLUGS.has(slug));

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DYNAMIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isContentPageSlug(slug) || LEGACY_STATIC_SLUGS.has(slug)) {
    return { title: 'Page Not Found' };
  }

  const page = await fetchContentPage(slug);
  return {
    title: page?.title ?? CONTENT_PAGE_LABELS[slug],
    description: page?.metaDescription,
  };
}

export default async function DynamicContentPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isContentPageSlug(slug) || LEGACY_STATIC_SLUGS.has(slug)) {
    notFound();
  }

  const page = await fetchContentPage(slug);

  return (
    <StorefrontLayout>
      <ContentPageView
        page={page}
        slug={slug}
        fallbackTitle={CONTENT_PAGE_LABELS[slug]}
      />
    </StorefrontLayout>
  );
}
