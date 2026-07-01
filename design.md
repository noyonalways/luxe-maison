# Luxe Maison — Application Design

## Overview

Luxe Maison is split into two independently deployable applications plus a shared package. The public storefront and the staff CMS never share a runtime bundle or route tree, so admin surfaces (including SEO tooling) cannot be reached from the storefront origin.

```
luxe-maison/
├── design.md                 # Architecture source of truth
├── turbo.json                # Turborepo task pipeline
├── package.json              # Root scripts (turbo run …)
├── pnpm-workspace.yaml
├── apps/
│   ├── storefront/           # Next.js — public e-commerce site
│   └── cms/                  # Vite + TanStack Router — staff CMS
└── packages/
    ├── shared/               # Types, mock data, utilities
    └── typescript-config/    # Shared TSConfig presets
```

## Applications

### `apps/storefront` (Next.js)

**Purpose:** Customer-facing shop — browse, cart, checkout, account, order tracking.

| Concern | Choice |
|--------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Context + TanStack Query |
| Auth | Customer login only (staff redirected to admin URL) |
| Default port | `3000` |

**Routes (App Router):**

| Path | Page |
|------|------|
| `/` | Home |
| `/shop` | Product listing |
| `/product/[id]` | Product detail |
| `/checkout` | Checkout (customer auth required) |
| `/wishlist` | Wishlist |
| `/login` | Customer login / signup |
| `/account` | Customer account (auth required) |
| `/track-order` | Order tracking |

**Environment:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STOREFRONT_URL` | Canonical storefront URL (SEO, metadata) |
| `NEXT_PUBLIC_ADMIN_URL` | Admin CMS URL (e.g. link for staff login redirect) |

### `apps/cms` (React + TanStack Router)

**Purpose:** Staff CMS — products, orders, analytics, campaigns, team, access control, SEO board.

| Concern | Choice |
|--------|--------|
| Framework | Vite + React |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS + shadcn/ui (same design tokens as storefront) |
| State | React Context + TanStack Query |
| Auth | Staff login only; role-based route prefix `/:role/*` |
| Default port | `5173` |

**Routes:**

| Path | Page |
|------|------|
| `/login` | Staff login |
| `/:role/dashboard` | Dashboard |
| `/:role/products` | Product list |
| `/:role/products/new` | Create product |
| `/:role/products/:id/edit` | Edit product |
| `/:role/orders` | Orders |
| `/:role/customers` | Customers |
| `/:role/analytics` | Analytics |
| `/:role/newsletter` | Newsletter |
| `/:role/discounts` | Discounts |
| `/:role/campaigns` | Campaigns |
| `/:role/popup` | Welcome popup settings |
| `/:role/team` | Team management |
| `/:role/settings` | System settings |
| `/:role/access-control` | Role permissions |

Valid roles: `admin`, `manager`, `employee`.

**Environment:**

| Variable | Description |
|----------|-------------|
| `VITE_STOREFRONT_URL` | Link back to the public store (sidebar) |
| `VITE_API_URL` | Future backend API base (optional) |

## Security boundary

```
┌─────────────────────┐     ┌─────────────────────┐
│   storefront        │     │   cms               │
│   (public origin)   │     │   (private origin)  │
│                     │     │                     │
│  Customer auth      │     │  Staff auth         │
│  No admin routes    │     │  No storefront UI   │
│  No CMS bundle      │     │  Protected routes   │
└─────────────────────┘     └─────────────────────┘
         │                            │
         └──────── packages/shared ───┘
                    (types & data only)
```

- Deploy on **separate origins** (e.g. `www.maison.com` vs `admin.maison.com`).
- Admin must not be proxied under the storefront path (no `/admin` on the Next.js app).
- Staff accounts logging in on the storefront are redirected to `NEXT_PUBLIC_ADMIN_URL`.
- Customer accounts cannot access admin routes.

## Shared package (`packages/shared`)

Internal library compiled with `tsc` to `dist/`. Apps depend on it via `workspace:*`; Turbo ensures `shared` builds before apps (`dependsOn: ["^build"]`).

Contains code safe to share across both apps:

- `admin-types.ts` — Order, Product, Campaign, Customer types
- `products.ts`, `promo-codes.ts`, `admin-mock.ts` — seed / mock data
- `utils.ts` — `cn()` and other pure utilities

Does **not** include React components or route definitions.

## Design system

Both apps share:

- **Fonts:** Playfair Display (headings), Inter (body)
- **Palette:** Gold primary (`hsl(40 45% 56%)`), charcoal text, cream/off-white surfaces
- **Components:** shadcn/ui with identical CSS variables in `index.css` / `globals.css`

## Development

This repo uses [Turborepo](https://turbo.build) on top of pnpm workspaces. Turbo orchestrates tasks, caches build outputs, and respects dependency order (`shared` builds before apps).

From the repository root:

```bash
pnpm install
pnpm dev              # Turbo: storefront :3000 + cms :5173
pnpm dev:storefront   # Next.js only
pnpm dev:admin        # CMS only (:5173)
pnpm build            # Turbo: build all packages (cached)
pnpm lint             # Turbo: lint all packages
pnpm check-types      # Turbo: typecheck all packages
pnpm clean            # Remove build artifacts
```

Run a task in one app only:

```bash
pnpm turbo run build --filter=@luxe-maison/storefront
```

## Deployment

| App | Suggested host | Build output |
|-----|----------------|--------------|
| Storefront | Vercel / Netlify | `apps/storefront/.next` |
| CMS | Private subdomain, IP allowlist, or VPN | `apps/cms/dist` |

## Migration notes

The original single-app Vite project has been fully migrated into this monorepo.

## Future work

- Replace mock data with Supabase / Shopify backend
- Server-side staff session validation for cms
- Shared `@luxe-maison/ui` package if component duplication becomes costly
- SEO board as a dedicated admin section once backend is connected
