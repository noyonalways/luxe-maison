import { useLocation } from "@tanstack/react-router";
import { VALID_ROLES, type StaffRole } from "@/context/RoleContext";

/** Reads the fixed role prefix from the URL: /admin/..., /manager/..., /employee/... */
export function useStaffUrlRole(): StaffRole {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean)[0];

  if (VALID_ROLES.includes(segment as StaffRole)) {
    return segment as StaffRole;
  }

  return "admin";
}
