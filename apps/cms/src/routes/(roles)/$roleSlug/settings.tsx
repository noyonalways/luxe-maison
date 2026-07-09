import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Settings from "@/pages/cms/Settings";

export const Route = createFileRoute("/(roles)/$roleSlug/settings")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "settings"),
  component: Settings,
});
