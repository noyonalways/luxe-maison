import { createFileRoute } from "@tanstack/react-router";
import { requireSectionModify } from "@/lib/route-guards";
import ProductForm from "@/pages/cms/ProductForm";

export const Route = createFileRoute("/(roles)/admin/products/$id/edit")({
  beforeLoad: () => requireSectionModify("admin", "products"),
  component: ProductForm,
});
