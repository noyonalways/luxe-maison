import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Analytics from "@/pages/cms/Analytics";

export const Route = createFileRoute("/(roles)/admin/analytics")({
  beforeLoad: () => requireSectionAccess("admin", "analytics"),
  component: Analytics,
});
