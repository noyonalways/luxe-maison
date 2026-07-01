import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import AccessControl from "@/pages/cms/AccessControl";

export const Route = createFileRoute("/(roles)/admin/access-control")({
  beforeLoad: () => requireSectionAccess("admin", "access-control"),
  component: AccessControl,
});
