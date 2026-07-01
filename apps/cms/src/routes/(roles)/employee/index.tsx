import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/employee/")({
  beforeLoad: () => {
    throw redirect({ to: "/employee/dashboard" });
  },
});
