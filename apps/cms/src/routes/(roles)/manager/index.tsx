import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/manager/")({
  beforeLoad: () => {
    throw redirect({ to: "/manager/dashboard" });
  },
});
