import type { Metadata } from 'next';
import StorefrontLayout from '@/components/StorefrontLayout';
import { fetchContentPage } from '@/lib/api/content-pages.server';
import ContentPageView from '@/views/ContentPageView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchContentPage('privacy');
  return {
    title: page?.title ?? 'Privacy Policy',
    description: page?.metaDescription,
  };
}

export default async function PrivacyPage() {
  const page = await fetchContentPage('privacy');

  return (
    <StorefrontLayout>
      <ContentPageView page={page} fallbackTitle="Privacy Policy" />
    </StorefrontLayout>
  );
}
