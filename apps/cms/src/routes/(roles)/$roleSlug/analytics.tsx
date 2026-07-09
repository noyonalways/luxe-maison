import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Analytics from "@/pages/cms/Analytics";

export const Route = createFileRoute("/(roles)/$roleSlug/analytics")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "analytics"),
  component: Analytics,
});
