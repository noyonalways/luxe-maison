import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Newsletter from "@/pages/cms/Newsletter";

export const Route = createFileRoute("/(roles)/admin/newsletter")({
  beforeLoad: () => requireSectionAccess("admin", "newsletter"),
  component: Newsletter,
});
