import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Customers from "@/pages/cms/Customers";

export const Route = createFileRoute("/(roles)/$roleSlug/customers/")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "customers"),
  component: Customers,
});
