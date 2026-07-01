import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Discounts from "@/pages/cms/Discounts";

export const Route = createFileRoute("/(roles)/admin/discounts")({
  beforeLoad: () => requireSectionAccess("admin", "discounts"),
  component: Discounts,
});
