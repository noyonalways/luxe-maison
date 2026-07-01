export type StaffRole = "admin" | "manager" | "employee";

export type Section =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "analytics"
  | "newsletter"
  | "discounts"
  | "campaigns"
  | "popup"
  | "access-control"
  | "team"
  | "settings";

export type Permission = "view" | "edit" | "full" | "none";

const ADMIN_PERMISSIONS: Record<Section, Permission> = {
  dashboard: "full",
  products: "full",
  orders: "full",
  customers: "full",
  analytics: "full",
  newsletter: "full",
  discounts: "full",
  campaigns: "full",
  popup: "full",
  "access-control": "full",
  team: "full",
  settings: "full",
};

export const DEFAULT_PERMISSIONS: Record<
  "manager" | "employee",
  Record<Section, Permission>
> = {
  manager: {
    dashboard: "full",
    products: "none",
    orders: "full",
    customers: "edit",
    analytics: "view",
    newsletter: "full",
    discounts: "full",
    campaigns: "full",
    popup: "none",
    "access-control": "none",
    team: "none",
    settings: "none",
  },
  employee: {
    dashboard: "view",
    products: "view",
    orders: "edit",
    customers: "none",
    analytics: "none",
    newsletter: "none",
    discounts: "none",
    campaigns: "none",
    popup: "none",
    "access-control": "none",
    team: "none",
    settings: "none",
  },
};

const STORAGE_KEY = "maison-role-permissions";

export function loadStoredPermissions(): Record<
  "manager" | "employee",
  Record<Section, Permission>
> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        manager: { ...DEFAULT_PERMISSIONS.manager, ...parsed.manager },
        employee: { ...DEFAULT_PERMISSIONS.employee, ...parsed.employee },
      };
    }
  } catch {
    /* ignore */
  }
  return {
    manager: { ...DEFAULT_PERMISSIONS.manager },
    employee: { ...DEFAULT_PERMISSIONS.employee },
  };
}

export function getPermission(
  role: StaffRole,
  section: Section,
  stored = loadStoredPermissions(),
): Permission {
  if (role === "admin") return ADMIN_PERMISSIONS[section];
  return stored[role][section];
}

export function canAccessSection(
  role: StaffRole,
  section: Section,
  stored = loadStoredPermissions(),
): boolean {
  return getPermission(role, section, stored) !== "none";
}

export function canModifySection(
  role: StaffRole,
  section: Section,
  stored = loadStoredPermissions(),
): boolean {
  const permission = getPermission(role, section, stored);
  return permission === "edit" || permission === "full";
}

export function getAccessibleSections(
  role: StaffRole,
  stored = loadStoredPermissions(),
): Section[] {
  const sections: Section[] = [
    "dashboard",
    "products",
    "orders",
    "customers",
    "analytics",
    "newsletter",
    "discounts",
    "campaigns",
    "popup",
    "team",
    "settings",
    "access-control",
  ];
  return sections.filter((section) => canAccessSection(role, section, stored));
}

export function pathToSection(path: string): Section | null {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2 || parts[1] === "dashboard") return "dashboard";
  const section = parts[1];
  const validSections: Section[] = [
    "dashboard",
    "products",
    "orders",
    "customers",
    "analytics",
    "newsletter",
    "discounts",
    "campaigns",
    "popup",
    "team",
    "settings",
    "access-control",
  ];
  if (validSections.includes(section as Section)) return section as Section;
  return null;
}
