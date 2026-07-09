import type { Section } from "@/contexts/role-context";

type CmsLink = { to: string; params?: { roleSlug: string; id?: string } };

function cmsLink(roleSlug: string, ...segments: string[]): CmsLink {
  const suffix = segments.join("/");
  if (!suffix) {
    return { to: "/$roleSlug", params: { roleSlug } };
  }
  return { to: `/$roleSlug/${suffix}`, params: { roleSlug } };
}

/** Build a CMS link using the staff member's URL role slug. */
export function cmsPath(roleSlug: string, ...segments: string[]) {
  return cmsLink(roleSlug, ...segments);
}

export function cmsTo(section: Section, roleSlug: string) {
  const map: Record<Section, string> = {
    dashboard: "dashboard",
    products: "products",
    orders: "orders",
    customers: "customers",
    analytics: "analytics",
    newsletter: "newsletter",
    discounts: "discounts",
    campaigns: "campaigns",
    popup: "popup",
    homepage: "homepage",
    pages: "pages/privacy",
    team: "team",
    settings: "settings",
    "access-control": "access-control",
  };
  return cmsLink(roleSlug, map[section] ?? "dashboard");
}

export function cmsNavPath(roleSlug: string, path: string) {
  return cmsLink(roleSlug, path);
}

export function cmsProductNew(roleSlug: string) {
  return cmsLink(roleSlug, "products", "new");
}

export function cmsProductEdit(roleSlug: string, id: string) {
  return {
    to: "/$roleSlug/products/$id/edit",
    params: { roleSlug, id },
  };
}

export function cmsDashboard(roleSlug: string) {
  return cmsLink(roleSlug, "dashboard");
}

export function cmsCustomerDetail(roleSlug: string, id: string) {
  return {
    to: "/$roleSlug/customers/$id",
    params: { roleSlug, id },
  };
}

export function cmsOrderDetail(roleSlug: string, id: string) {
  return {
    to: "/$roleSlug/orders/$id",
    params: { roleSlug, id },
  };
}

export function resolveRoleSlug(user: { role: string; roleSlug?: string }): string {
  if (user.roleSlug) return user.roleSlug;
  if (user.role === "admin" || user.role === "manager" || user.role === "employee") {
    return user.role;
  }
  return user.role;
}
