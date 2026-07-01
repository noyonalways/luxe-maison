import { createFileRoute } from "@tanstack/react-router";
import { requireGuest } from "@/lib/route-guards";
import AuthLayout from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: requireGuest,
  component: AuthLayout,
});
