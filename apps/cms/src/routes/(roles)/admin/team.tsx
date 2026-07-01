import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Team from "@/pages/cms/Team";

export const Route = createFileRoute("/(roles)/admin/team")({
  beforeLoad: () => requireSectionAccess("admin", "team"),
  component: Team,
});
