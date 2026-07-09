import type { ContentPage, ContentPageSlug } from '@luxe-maison/shared';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
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
  slug?: ContentPageSlug;
}

export default function ContentPageView({ page, fallbackTitle, slug }: ContentPageViewProps) {
  const title = page?.title ?? fallbackTitle;
  const description = page?.metaDescription;

  return (
    <PageMain>
      <PageHero title={title} description={description} align="center" />
      <PageBody narrow className="py-10 lg:py-14">
        {page ? (
          <article className="space-y-4">
            {renderBody(page.body)}
            {slug === 'contact' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-border">
                <a
                  href="mailto:support@maison.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium letter-wide uppercase transition-smooth hover:opacity-90"
                >
                  <Mail size={16} />
                  Email Support
                </a>
                <a
                  href="tel:+15554820198"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium letter-wide uppercase transition-smooth hover:border-foreground"
                >
                  <Phone size={16} />
                  Call Us
                </a>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium letter-wide uppercase transition-smooth hover:border-foreground"
                >
                  Track an Order
                </Link>
              </div>
            )}
            {slug === 'shipping-returns' && (
              <div className="pt-4">
                <Link
                  href="/track-order"
                  className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-gold"
                >
                  Go to Track Order →
                </Link>
              </div>
            )}
          </article>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            This page is not available right now. Please check back soon.
          </p>
        )}
      </PageBody>
    </PageMain>
  );
}
