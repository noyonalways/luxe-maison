import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Settings from "@/pages/cms/Settings";

export const Route = createFileRoute("/(roles)/admin/settings")({
  beforeLoad: () => requireSectionAccess("admin", "settings"),
  component: Settings,
});
