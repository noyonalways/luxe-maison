"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isStaffRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  type: "customer";
}

export default function ProtectedRoute({ children, type }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (type === 'customer' && user.role !== 'customer') {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, user, type, router]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;
  if (type === 'customer' && user.role !== 'customer') return null;

  return <>{children}</>;
}
