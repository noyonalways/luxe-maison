import { PageMain, NAV_OFFSET } from '@/components/layout/PageShell';

/** Suspense fallback — cream under navbar, no white strip. */
export default function ShopPageFallback() {
  return (
    <PageMain className="bg-gradient-to-b from-cream to-background">
      <div className={NAV_OFFSET} aria-hidden />
    </PageMain>
  );
}
