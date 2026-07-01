import { createFileRoute } from "@tanstack/react-router";
import StaffLayout from "@/components/staff/StaffLayout";
import { requireStaffRole } from "@/lib/route-guards";

export const Route = createFileRoute("/(roles)/admin")({
  beforeLoad: () => requireStaffRole("admin"),
  component: StaffLayout,
});
