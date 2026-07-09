import type { Metadata } from 'next';
import StorefrontLayout from '@/components/StorefrontLayout';
import { fetchContentPage } from '@/lib/api/content-pages.server';
import ContentPageView from '@/views/ContentPageView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchContentPage('cookies');
  return {
    title: page?.title ?? 'Cookie Policy',
    description: page?.metaDescription,
  };
}

export default async function CookiesPage() {
  const page = await fetchContentPage('cookies');

  return (
    <StorefrontLayout>
      <ContentPageView page={page} fallbackTitle="Cookie Policy" />
    </StorefrontLayout>
  );
}
