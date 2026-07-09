import type { Metadata } from 'next';
import StorefrontLayout from '@/components/StorefrontLayout';
import { fetchContentPage } from '@/lib/api/content-pages.server';
import ContentPageView from '@/views/ContentPageView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchContentPage('terms');
  return {
    title: page?.title ?? 'Terms of Service',
    description: page?.metaDescription,
  };
}

export default async function TermsPage() {
  const page = await fetchContentPage('terms');

  return (
    <StorefrontLayout>
      <ContentPageView page={page} fallbackTitle="Terms of Service" />
    </StorefrontLayout>
  );
}
