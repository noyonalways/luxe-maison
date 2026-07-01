import type { StaffRole } from "@/context/RoleContext";

export type CmsSection =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "analytics"
  | "newsletter"
  | "discounts"
  | "campaigns"
  | "popup"
  | "team"
  | "settings"
  | "access-control";

type RolePath = `/admin` | `/manager` | `/employee`;

export type CmsRoutePath =
  | `${RolePath}/dashboard`
  | `${RolePath}/products`
  | `${RolePath}/orders`
  | `${RolePath}/customers`
  | `${RolePath}/analytics`
  | `${RolePath}/newsletter`
  | `${RolePath}/discounts`
  | `${RolePath}/campaigns`
  | `${RolePath}/popup`
  | `${RolePath}/team`
  | `${RolePath}/settings`
  | `${RolePath}/access-control`
  | `${RolePath}/products/new`
  | `${RolePath}/products/$id/edit`;

function rolePath(role: StaffRole, section: string): CmsRoutePath {
  return `/${role}/${section}` as CmsRoutePath;
}

/** Typed destinations for fixed role CMS routes. */
export function cmsTo(section: CmsSection, role: StaffRole) {
  return { to: rolePath(role, section) };
}

export function cmsProductNew(role: StaffRole) {
  return { to: rolePath(role, "products/new") };
}

export function cmsProductEdit(role: StaffRole, id: string) {
  return { to: `/${role}/products/${id}/edit` as CmsRoutePath };
}

export function cmsDashboard(role: StaffRole) {
  return { to: rolePath(role, "dashboard") };
}
