import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Dashboard from "@/pages/cms/Dashboard";

export const Route = createFileRoute("/(roles)/$roleSlug/dashboard")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "dashboard"),
  component: Dashboard,
});
