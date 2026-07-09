import { Suspense } from 'react';
import StorefrontLayout from '@/components/StorefrontLayout';
import ShopPage from '@/views/ShopPage';

export default function KidsShop() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<div className="min-h-screen pt-24" />}>
        <ShopPage defaultSection="kids" />
      </Suspense>
    </StorefrontLayout>
  );
}
