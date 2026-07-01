"use client";

import StorefrontLayout from "@/components/StorefrontLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CheckoutPage from "@/views/CheckoutPage";

export default function Checkout() {
  return (
    <ProtectedRoute type="customer">
      <StorefrontLayout>
        <CheckoutPage />
      </StorefrontLayout>
    </ProtectedRoute>
  );
}
