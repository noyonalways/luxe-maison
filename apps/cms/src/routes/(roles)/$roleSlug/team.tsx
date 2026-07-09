import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Team from "@/pages/cms/Team";

export const Route = createFileRoute("/(roles)/$roleSlug/team")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "team"),
  component: Team,
});
