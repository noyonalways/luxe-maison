import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Orders from "@/pages/cms/Orders";

export const Route = createFileRoute("/(roles)/manager/orders")({
  beforeLoad: () => requireSectionAccess("manager", "orders"),
  component: Orders,
});
