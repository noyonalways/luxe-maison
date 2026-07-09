import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import CustomerDetailPage from "@/pages/cms/CustomerDetailPage";

export const Route = createFileRoute("/(roles)/$roleSlug/customers/$id")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "customers"),
  component: CustomerDetailPage,
});
