import { createFileRoute } from "@tanstack/react-router";
import { requireSectionModify } from "@/lib/route-guards";
import ProductForm from "@/pages/cms/ProductForm";

export const Route = createFileRoute("/(roles)/$roleSlug/products/new")({
  beforeLoad: ({ params }) => requireSectionModify(params.roleSlug, "products"),
  component: ProductForm,
});
