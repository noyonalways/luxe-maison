import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Products from "@/pages/cms/Products";

export const Route = createFileRoute("/(roles)/$roleSlug/products/")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "products"),
  component: Products,
});
