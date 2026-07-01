import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Campaigns from "@/pages/cms/Campaigns";

export const Route = createFileRoute("/(roles)/admin/campaigns")({
  beforeLoad: () => requireSectionAccess("admin", "campaigns"),
  component: Campaigns,
});
