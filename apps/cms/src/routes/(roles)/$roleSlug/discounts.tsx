import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Discounts from "@/pages/cms/Discounts";

export const Route = createFileRoute("/(roles)/$roleSlug/discounts")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "discounts"),
  component: Discounts,
});
