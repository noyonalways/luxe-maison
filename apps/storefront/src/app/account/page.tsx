"use client";

import StorefrontLayout from "@/components/StorefrontLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountPage from "@/views/AccountPage";

export default function Account() {
  return (
    <ProtectedRoute type="customer">
      <StorefrontLayout>
        <AccountPage />
      </StorefrontLayout>
    </ProtectedRoute>
  );
}
