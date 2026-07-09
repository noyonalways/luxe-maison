import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Homepage from "@/pages/cms/Homepage";

export const Route = createFileRoute("/(roles)/$roleSlug/homepage")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "homepage"),
  component: Homepage,
});
