import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Products from "@/pages/cms/Products";

export const Route = createFileRoute("/(roles)/admin/products/")({
  beforeLoad: () => requireSectionAccess("admin", "products"),
  component: Products,
});
