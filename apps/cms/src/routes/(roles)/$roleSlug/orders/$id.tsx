import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import OrderDetailPage from "@/pages/cms/OrderDetailPage";

export const Route = createFileRoute("/(roles)/$roleSlug/orders/$id")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "orders"),
  component: OrderDetailPage,
});
