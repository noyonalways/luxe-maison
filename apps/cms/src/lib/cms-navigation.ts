import type { StaffRole } from "@/contexts/role-context";
import type { FileRoutesByTo } from "@/routeTree.gen";

export type AppRoutePath = keyof FileRoutesByTo;

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
  | "homepage"
  | "pages"
  | "team"
  | "settings"
  | "access-control";

const DASHBOARD_ROUTES: Record<StaffRole, AppRoutePath> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

const ROLE_SECTION_ROUTES: Record<StaffRole, Partial<Record<CmsSection | string, AppRoutePath>>> = {
  admin: {
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    orders: "/admin/orders",
    customers: "/admin/customers",
    analytics: "/admin/analytics",
    newsletter: "/admin/newsletter",
    discounts: "/admin/discounts",
    campaigns: "/admin/campaigns",
    popup: "/admin/popup",
    homepage: "/admin/homepage",
    "pages/privacy": "/admin/pages/privacy",
    "pages/terms": "/admin/pages/terms",
    "pages/cookies": "/admin/pages/cookies",
    team: "/admin/team",
    settings: "/admin/settings",
    "access-control": "/admin/access-control",
  },
  manager: {
    dashboard: "/manager/dashboard",
    orders: "/manager/orders",
    customers: "/manager/customers",
    analytics: "/manager/analytics",
    newsletter: "/manager/newsletter",
    discounts: "/manager/discounts",
    campaigns: "/manager/campaigns",
  },
  employee: {
    dashboard: "/employee/dashboard",
    products: "/employee/products",
    orders: "/employee/orders",
    customers: "/employee/customers",
  },
};

/** Typed destinations for fixed role CMS routes. */
export function cmsTo(section: CmsSection, role: StaffRole) {
  const to = ROLE_SECTION_ROUTES[role][section] ?? DASHBOARD_ROUTES[role];
  return { to };
}

/** Navigate to a nested CMS path such as `pages/privacy`. */
export function cmsNavPath(role: StaffRole, path: string) {
  const routes = ROLE_SECTION_ROUTES[role] as Record<string, AppRoutePath | undefined>;
  const to = routes[path] ?? DASHBOARD_ROUTES[role];
  return { to };
}

export function cmsProductNew(role: StaffRole) {
  if (role !== "admin") return { to: DASHBOARD_ROUTES[role] };
  return { to: "/admin/products/new" as const };
}

export function cmsProductEdit(role: StaffRole, id: string) {
  if (role !== "admin") return { to: DASHBOARD_ROUTES[role] };
  return {
    to: "/admin/products/$id/edit" as const,
    params: { id },
  };
}

export function cmsDashboard(role: StaffRole) {
  return { to: DASHBOARD_ROUTES[role] };
}

export function cmsCustomerDetail(role: StaffRole, id: string) {
  if (role === 'admin') {
    return { to: '/admin/customers/$id' as const, params: { id } };
  }
  if (role === 'manager') {
    return { to: '/manager/customers/$id' as const, params: { id } };
  }
  return { to: '/employee/customers/$id' as const, params: { id } };
}
