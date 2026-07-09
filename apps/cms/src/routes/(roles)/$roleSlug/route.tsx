import { createFileRoute } from "@tanstack/react-router";
import StaffLayout from "@/components/staff/StaffLayout";
import { requireStaffRoleSlug } from "@/lib/route-guards";

export const Route = createFileRoute("/(roles)/$roleSlug")({
  beforeLoad: ({ params }) => requireStaffRoleSlug(params.roleSlug),
  component: StaffLayout,
});
