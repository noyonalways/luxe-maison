import { Suspense } from 'react';
import StorefrontLayout from '@/components/StorefrontLayout';
import ShopPage from '@/views/ShopPage';
import ShopPageFallback from '@/components/layout/ShopPageFallback';

export default function KidsShop() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<ShopPageFallback />}>
        <ShopPage defaultSection="kids" />
      </Suspense>
    </StorefrontLayout>
  );
}
