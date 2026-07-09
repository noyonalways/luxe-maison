import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Newsletter from "@/pages/cms/Newsletter";

export const Route = createFileRoute("/(roles)/$roleSlug/newsletter")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "newsletter"),
  component: Newsletter,
});
