import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Orders from "@/pages/cms/Orders";

export const Route = createFileRoute("/(roles)/$roleSlug/orders/")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "orders"),
  component: Orders,
});
