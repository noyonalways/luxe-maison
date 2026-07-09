import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Customers from "@/pages/cms/Customers";

export const Route = createFileRoute("/(roles)/employee/customers/")({
  beforeLoad: () => requireSectionAccess("employee", "customers"),
  component: Customers,
});
