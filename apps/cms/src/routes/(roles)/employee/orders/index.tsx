import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Orders from "@/pages/cms/Orders";

export const Route = createFileRoute("/(roles)/employee/orders/")({
  beforeLoad: () => requireSectionAccess("employee", "orders"),
  component: Orders,
});
