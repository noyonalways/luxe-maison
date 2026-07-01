import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});
