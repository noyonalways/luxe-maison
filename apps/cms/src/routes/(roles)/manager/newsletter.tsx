import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Newsletter from "@/pages/cms/Newsletter";

export const Route = createFileRoute("/(roles)/manager/newsletter")({
  beforeLoad: () => requireSectionAccess("manager", "newsletter"),
  component: Newsletter,
});
