import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/$roleSlug/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$roleSlug/dashboard", params: { roleSlug: params.roleSlug } });
  },
});
