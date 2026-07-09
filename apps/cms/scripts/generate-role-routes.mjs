import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesRoot = path.join(__dirname, "../src/routes/(roles)");

const ALL_SECTIONS = [
  "dashboard",
  "orders",
  "customers",
  "analytics",
  "newsletter",
  "discounts",
  "campaigns",
  "popup",
  "homepage",
  "team",
  "settings",
  "access-control",
];

const pages = {
  dashboard: { name: "Dashboard", importPath: "@/pages/cms/Dashboard" },
  orders: { name: "Orders", importPath: "@/pages/cms/Orders" },
  customers: { name: "Customers", importPath: "@/pages/cms/Customers" },
  analytics: { name: "Analytics", importPath: "@/pages/cms/Analytics" },
  newsletter: { name: "Newsletter", importPath: "@/pages/cms/Newsletter" },
  discounts: { name: "Discounts", importPath: "@/pages/cms/Discounts" },
  campaigns: { name: "Campaigns", importPath: "@/pages/cms/Campaigns" },
  popup: { name: "PopupSettings", importPath: "@/pages/cms/PopupSettings" },
  homepage: { name: "Homepage", importPath: "@/pages/cms/Homepage" },
  team: { name: "Team", importPath: "@/pages/cms/Team" },
  settings: { name: "Settings", importPath: "@/pages/cms/Settings" },
  "access-control": {
    name: "AccessControl",
    importPath: "@/pages/cms/AccessControl",
  },
};

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true, force: true });
    else fs.unlinkSync(filePath);
  }
}

// Remove legacy fixed-role route folders
for (const legacy of ["admin", "manager", "employee", "$role"]) {
  removeIfExists(path.join(routesRoot, legacy));
}

const roleDir = path.join(routesRoot, "$roleSlug");
const allowedFiles = new Set(["route.tsx", "index.tsx"]);

write(
  path.join(roleDir, "route.tsx"),
  `import { createFileRoute } from "@tanstack/react-router";
import StaffLayout from "@/components/staff/StaffLayout";
import { requireStaffRoleSlug } from "@/lib/route-guards";

export const Route = createFileRoute("/(roles)/$roleSlug")({
  beforeLoad: ({ params }) => requireStaffRoleSlug(params.roleSlug),
  component: StaffLayout,
});
`,
);

write(
  path.join(roleDir, "index.tsx"),
  `import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(roles)/$roleSlug/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$roleSlug/dashboard", params: { roleSlug: params.roleSlug } });
  },
});
`,
);

for (const segment of ALL_SECTIONS) {
  const page = pages[segment];
  allowedFiles.add(`${segment}.tsx`);
  write(
    path.join(roleDir, `${segment}.tsx`),
    `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import ${page.name} from "${page.importPath}";

export const Route = createFileRoute("/(roles)/$roleSlug/${segment}")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "${segment}"),
  component: ${page.name},
});
`,
  );
}

// Products routes
for (const [file, route, guard, section] of [
  ["index.tsx", "products/", "requireSectionAccess", "products"],
  ["new.tsx", "products/new", "requireSectionModify", "products"],
  ["$id.edit.tsx", "products/$id/edit", "requireSectionModify", "products"],
]) {
  allowedFiles.add(`products/${file}`);
  write(
    path.join(roleDir, "products", file),
    `import { createFileRoute } from "@tanstack/react-router";
import { ${guard} } from "@/lib/route-guards";
import ${file === "index.tsx" ? "Products" : "ProductForm"} from "@/pages/cms/${file === "index.tsx" ? "Products" : "ProductForm"}";

export const Route = createFileRoute("/(roles)/$roleSlug/${route}")({
  beforeLoad: ({ params }) => ${guard}(params.roleSlug, "${section}"),
  component: ${file === "index.tsx" ? "Products" : "ProductForm"},
});
`,
  );
}

// Orders detail
allowedFiles.add("orders/index.tsx");
write(
  path.join(roleDir, "orders", "index.tsx"),
  `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Orders from "@/pages/cms/Orders";

export const Route = createFileRoute("/(roles)/$roleSlug/orders/")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "orders"),
  component: Orders,
});
`,
);

allowedFiles.add("orders/$id.tsx");
write(
  path.join(roleDir, "orders", "$id.tsx"),
  `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import OrderDetailPage from "@/pages/cms/OrderDetailPage";

export const Route = createFileRoute("/(roles)/$roleSlug/orders/$id")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "orders"),
  component: OrderDetailPage,
});
`,
);

// Customers detail
allowedFiles.add("customers/index.tsx");
write(
  path.join(roleDir, "customers", "index.tsx"),
  `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import Customers from "@/pages/cms/Customers";

export const Route = createFileRoute("/(roles)/$roleSlug/customers/")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "customers"),
  component: Customers,
});
`,
);

allowedFiles.add("customers/$id.tsx");
write(
  path.join(roleDir, "customers", "$id.tsx"),
  `import { createFileRoute } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import CustomerDetailPage from "@/pages/cms/CustomerDetailPage";

export const Route = createFileRoute("/(roles)/$roleSlug/customers/$id")({
  beforeLoad: ({ params }) => requireSectionAccess(params.roleSlug, "customers"),
  component: CustomerDetailPage,
});
`,
);

// Content pages
allowedFiles.add("pages/$slug.tsx");
write(
  path.join(roleDir, "pages", "$slug.tsx"),
  `import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireSectionAccess } from "@/lib/route-guards";
import ContentPageEditor from "@/pages/cms/ContentPageEditor";
import { isContentPageSlug } from "@luxe-maison/shared";
import { cmsNavPath } from "@/lib/cms-navigation";

export const Route = createFileRoute("/(roles)/$roleSlug/pages/$slug")({
  beforeLoad: ({ params }) => {
    requireSectionAccess(params.roleSlug, "pages");
    if (!isContentPageSlug(params.slug)) {
      throw redirect(cmsNavPath(params.roleSlug, "pages/privacy"));
    }
  },
  component: ContentPageRoute,
});

function ContentPageRoute() {
  const { slug } = Route.useParams();
  if (!isContentPageSlug(slug)) return null;
  return <ContentPageEditor slug={slug} />;
}
`,
);

// Remove duplicate flat orders/customers if generated as section files
removeIfExists(path.join(roleDir, "orders.tsx"));
removeIfExists(path.join(roleDir, "customers.tsx"));

console.log("Generated permission-based $roleSlug routes");
