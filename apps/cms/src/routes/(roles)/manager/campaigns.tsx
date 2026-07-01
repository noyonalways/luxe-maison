import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Campaigns from "@/pages/cms/Campaigns";

export const Route = createFileRoute("/(roles)/manager/campaigns")({
  beforeLoad: () => requireSectionAccess("manager", "campaigns"),
  component: Campaigns,
});
