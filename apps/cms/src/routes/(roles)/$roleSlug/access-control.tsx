import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import AccessControl from "@/pages/cms/AccessControl";

export const Route = createFileRoute("/(roles)/$roleSlug/access-control")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "access-control"),
  component: AccessControl,
});
