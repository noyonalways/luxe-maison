import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Discounts from "@/pages/cms/Discounts";

export const Route = createFileRoute("/(roles)/manager/discounts")({
  beforeLoad: () => requireSectionAccess("manager", "discounts"),
  component: Discounts,
});
