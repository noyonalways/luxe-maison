import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Dashboard from "@/pages/cms/Dashboard";

export const Route = createFileRoute("/(roles)/admin/dashboard")({
  beforeLoad: () => requireSectionAccess("admin", "dashboard"),
  component: Dashboard,
});
