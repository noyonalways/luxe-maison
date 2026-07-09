import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Orders from "@/pages/cms/Orders";

export const Route = createFileRoute("/(roles)/admin/orders/")({
  beforeLoad: () => requireSectionAccess("admin", "orders"),
  component: Orders,
});
