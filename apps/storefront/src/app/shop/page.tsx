import { Suspense } from "react";
import StorefrontLayout from "@/components/StorefrontLayout";
import ShopPage from "@/views/ShopPage";
import ShopPageFallback from "@/components/layout/ShopPageFallback";

export default function Shop() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<ShopPageFallback />}>
        <ShopPage />
      </Suspense>
    </StorefrontLayout>
  );
}
