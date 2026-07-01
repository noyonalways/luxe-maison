"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isStaffRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  type: "customer";
}

export default function ProtectedRoute({ children, type }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace(type === "customer" ? "/login" : "/login");
      return;
    }
    if (type === "customer" && user.role !== "customer") {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5173";
      window.location.href = `${adminUrl}/login`;
    }
  }, [isAuthenticated, user, type, router]);

  if (!isAuthenticated || !user) return null;
  if (type === "customer" && user.role !== "customer") return null;

  return <>{children}</>;
}
