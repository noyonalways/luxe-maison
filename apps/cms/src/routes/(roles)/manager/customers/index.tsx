import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Customers from "@/pages/cms/Customers";

export const Route = createFileRoute("/(roles)/manager/customers/")({
  beforeLoad: () => requireSectionAccess("manager", "customers"),
  component: Customers,
});
