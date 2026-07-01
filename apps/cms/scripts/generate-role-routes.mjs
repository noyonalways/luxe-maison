import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesRoot = path.join(__dirname, "../src/routes/(roles)");
const roles = ["admin", "manager", "employee"];

const sectionsByRole = {
  admin: [
    "dashboard",
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
  ],
  manager: [
    "dashboard",
    "orders",
    "customers",
    "analytics",
    "newsletter",
    "discounts",
    "campaigns",
  ],
  employee: ["dashboard", "orders"],
};

const pages = {
  dashboard: { name: "Dashboard", importPath: "@/pages/cms/Dashboard" },
  orders: { name: "Orders", importPath: "@/pages/cms/Orders" },
  customers: { name: "Customers", importPath: "@/pages/cms/Customers" },
  analytics: { name: "Analytics", importPath: "@/pages/cms/Analytics" },
  newsletter: { name: "Newsletter", importPath: "@/pages/cms/Newsletter" },
  discounts: { name: "Discounts", importPath: "@/pages/cms/Discounts" },
  campaigns: { name: "Campaigns", importPath: "@/pages/cms/Campaigns" },
  popup: { name: "PopupSettings", importPath: "@/pages/cms/PopupSettings" },
  team: { name: "Team", importPath: "@/pages/cms/Team" },
  settings: { name: "Settings", importPath: "@/pages/cms/Settings" },
  "access-control": {
    name: "AccessControl",
    importPath: "@/pages/cms/AccessControl",
  },
};

const ROLE_HAS_PRODUCTS = { admin: true, manager: false, employee: true };
const ROLE_CAN_MODIFY_PRODUCTS = { admin: true, manager: false, employee: false };

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function cleanRoleDir(roleDir, allowedFiles) {
  if (!fs.existsSync(roleDir)) return;
  for (const entry of fs.readdirSync(roleDir, { withFileTypes: true })) {
    const fullPath = path.join(roleDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "products") {
        for (const file of fs.readdirSync(fullPath)) {
          const rel = `products/${file}`;
          if (!allowedFiles.has(rel)) removeIfExists(path.join(fullPath, file));
        }
        if (fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
      }
      continue;
    }
    if (!allowedFiles.has(entry.name)) removeIfExists(fullPath);
  }
}

// Remove dynamic $role folder if present
const dynamicRoleDir = path.join(routesRoot, "$role");
if (fs.existsSync(dynamicRoleDir)) {
  fs.rmSync(dynamicRoleDir, { recursive: true, force: true });
}

for (const role of roles) {
  const roleDir = path.join(routesRoot, role);
  const sections = sectionsByRole[role];
  const allowedFiles = new Set(["route.tsx", "index.tsx"]);

  write(
    path.join(roleDir, "route.tsx"),
    `import { createFileRoute } from "@tanstack/react-router";
import StaffLayout from "@/components/staff/StaffLayout";
import { requireStaffRole } from "@/lib/route-guards";

export const Route = createFileRoute("/(roles)/${role}")({
  beforeLoad: () => requireStaffRole("${role}"),
  component: StaffLayout,
});
`,
  );

  write(
    path.join(roleDir, "index.tsx"),
    `import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/${role}/")({
  beforeLoad: () => {
    throw redirect({ to: "/${role}/dashboard" });
  },
});
`,
  );

  for (const segment of sections) {
    const page = pages[segment];
    allowedFiles.add(`${segment}.tsx`);
    write(
      path.join(roleDir, `${segment}.tsx`),
      `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import ${page.name} from "${page.importPath}";

export const Route = createFileRoute("/(roles)/${role}/${segment}")({
  beforeLoad: () => requireSectionAccess("${role}", "${segment}"),
  component: ${page.name},
});
`,
    );
  }

  if (ROLE_HAS_PRODUCTS[role]) {
    allowedFiles.add("products/index.tsx");
    write(
      path.join(roleDir, "products", "index.tsx"),
      `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Products from "@/pages/cms/Products";

export const Route = createFileRoute("/(roles)/${role}/products/")({
  beforeLoad: () => requireSectionAccess("${role}", "products"),
  component: Products,
});
`,
    );
  }

  if (ROLE_CAN_MODIFY_PRODUCTS[role]) {
    for (const [file, route, guard] of [
      ["new.tsx", "products/new", "requireSectionModify"],
      ["$id.edit.tsx", "products/$id/edit", "requireSectionModify"],
    ]) {
      allowedFiles.add(`products/${file}`);
      write(
        path.join(roleDir, "products", file),
        `import { createFileRoute } from "@tanstack/react-router";
import { ${guard} } from "@/lib/route-guards";
import ProductForm from "@/pages/cms/ProductForm";

export const Route = createFileRoute("/(roles)/${role}/${route}")({
  beforeLoad: () => ${guard}("${role}", "products"),
  component: ProductForm,
});
`,
      );
    }
  }

  cleanRoleDir(roleDir, allowedFiles);
}

console.log(`Generated fixed role routes: ${roles.join(", ")}`);
