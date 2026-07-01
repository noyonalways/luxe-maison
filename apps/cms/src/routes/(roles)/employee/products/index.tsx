import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Products from "@/pages/cms/Products";

export const Route = createFileRoute("/(roles)/employee/products/")({
  beforeLoad: () => requireSectionAccess("employee", "products"),
  component: Products,
});
