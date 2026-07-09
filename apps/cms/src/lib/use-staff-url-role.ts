import { useLocation } from "@tanstack/react-router";

/** Reads the role slug prefix from the URL: /admin/..., /manager/..., /support/... */
export function useStaffUrlRole(): string | null {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment || null;
}

/** @deprecated Use useStaffUrlRole */
export function useStaffUrlRoleLegacy() {
  return useStaffUrlRole();
}
