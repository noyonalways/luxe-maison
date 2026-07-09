import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Campaigns from "@/pages/cms/Campaigns";

export const Route = createFileRoute("/(roles)/$roleSlug/campaigns")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "campaigns"),
  component: Campaigns,
});
