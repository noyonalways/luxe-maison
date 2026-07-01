import { createFileRoute } from "@tanstack/react-router";
import StaffLayout from "@/components/staff/StaffLayout";
import { requireStaffRole } from "@/lib/route-guards";

export const Route = createFileRoute("/(roles)/manager")({
  beforeLoad: () => requireStaffRole("manager"),
  component: StaffLayout,
});
