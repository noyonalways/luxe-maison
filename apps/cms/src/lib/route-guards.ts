import { redirect } from "@tanstack/react-router";
import { getStoredStaffUser, getStoredToken } from "@/lib/auth-session";
import { cmsDashboard, resolveRoleSlug } from "@/lib/cms-navigation";
import {
  canAccessSection,
  canModifySection,
  getActiveRoles,
  type Section,
} from "@/lib/role-permissions";

/** Redirect authenticated staff away from guest-only auth pages. */
export function requireGuest() {
  const user = getStoredStaffUser();
  const token = getStoredToken();
  if (user && token) {
    throw redirect(cmsDashboard(resolveRoleSlug(user)));
  }
}

function roles() {
  return getActiveRoles();
}

/** Ensure the visitor is authenticated staff for the URL role slug. */
export function requireStaffRoleSlug(roleSlug: string) {
  const user = getStoredStaffUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  const expectedSlug = resolveRoleSlug(user);
  if (expectedSlug !== roleSlug) {
    throw redirect(cmsDashboard(expectedSlug));
  }
}

/** @deprecated Use requireStaffRoleSlug */
export function requireStaffRole(urlRole: string) {
  requireStaffRoleSlug(urlRole);
}

/** Block direct navigation to sections this role cannot access. */
export function requireSectionAccess(roleSlug: string, section: Section) {
  requireStaffRoleSlug(roleSlug);
  const user = getStoredStaffUser()!;
  if (!canAccessSection(user.role, section, roles())) {
    throw redirect(cmsDashboard(resolveRoleSlug(user)));
  }
}

/** Block create/edit routes when the role is view-only. */
export function requireSectionModify(roleSlug: string, section: Section) {
  requireStaffRoleSlug(roleSlug);
  const user = getStoredStaffUser()!;
  if (!canModifySection(user.role, section, roles())) {
    throw redirect(cmsDashboard(resolveRoleSlug(user)));
  }
}
