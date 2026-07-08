import { redirect } from "@tanstack/react-router";
import { getStoredStaffUser, getStoredToken } from "@/lib/auth-session";
import { cmsDashboard } from "@/lib/cms-navigation";
import {
  canAccessSection,
  canModifySection,
  getActivePermissions,
  type StaffRole,
  type Section,
} from "@/lib/role-permissions";

/** Redirect authenticated staff away from guest-only auth pages. */
export function requireGuest() {
  const user = getStoredStaffUser();
  const token = getStoredToken();
  if (user && token) {
    throw redirect(cmsDashboard(user.role));
  }
}

function permissions() {
  return getActivePermissions();
}

/** Ensure the visitor is authenticated staff for the URL role prefix. */
export function requireStaffRole(urlRole: StaffRole) {
  const user = getStoredStaffUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  if (user.role !== urlRole) {
    throw redirect(cmsDashboard(user.role));
  }
}

/** Block direct navigation to sections this role cannot access. */
export function requireSectionAccess(urlRole: StaffRole, section: Section) {
  requireStaffRole(urlRole);
  if (!canAccessSection(urlRole, section, permissions())) {
    throw redirect(cmsDashboard(urlRole));
  }
}

/** Block create/edit product routes when the role is view-only. */
export function requireSectionModify(urlRole: StaffRole, section: Section) {
  requireStaffRole(urlRole);
  if (!canModifySection(urlRole, section, permissions())) {
    throw redirect(cmsDashboard(urlRole));
  }
}
