import type { ContentPage } from '@luxe-maison/shared';
import { PageBody, PageHero, PageMain } from '@/components/layout/PageShell';

function renderBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const lines = block.split('\n');
      const isHeading =
        lines.length === 1 &&
        lines[0]!.length < 80 &&
        !lines[0]!.endsWith('.') &&
        !lines[0]!.includes('@');

      if (isHeading) {
        return (
          <h2 key={index} className="font-heading text-xl lg:text-2xl mt-10 first:mt-0 mb-3">
            {lines[0]}
          </h2>
        );
      }

      return (
        <p key={index} className="text-sm lg:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
          {block}
        </p>
      );
    });
}

interface ContentPageViewProps {
  page: ContentPage | null;
  fallbackTitle: string;
}

export default function ContentPageView({ page, fallbackTitle }: ContentPageViewProps) {
  const title = page?.title ?? fallbackTitle;
  const description = page?.metaDescription;

  return (
    <PageMain>
      <PageHero title={title} description={description} align="center" />
      <PageBody narrow className="py-10 lg:py-14">
        {page ? (
          <article className="space-y-4">{renderBody(page.body)}</article>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            This page is not available right now. Please check back soon.
          </p>
        )}
      </PageBody>
    </PageMain>
  );
}
