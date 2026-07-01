import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Analytics from "@/pages/cms/Analytics";

export const Route = createFileRoute("/(roles)/manager/analytics")({
  beforeLoad: () => requireSectionAccess("manager", "analytics"),
  component: Analytics,
});
