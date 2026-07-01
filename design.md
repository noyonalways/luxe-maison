# Luxe Maison — Application Design

## Overview

Luxe Maison is a **one codebase, many interfaces** monorepo. Business logic and data access live in shared packages; each interface (REST API, CMS, storefront, and future GraphQL/SDK/CLI) is a thin deployable layer on top.

```
luxe-maison/
├── design.md
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── packages/                    # Core platform
│   ├── core/                    # Domain types, business rules, services, repository interfaces
│   ├── database/                # DB client + adapters (repositories live inside adapters)
│   ├── shared/                  # Back-compat re-exports + UI utilities (cn)
│   └── typescript-config/
└── apps/                        # Interfaces (deployables)
    ├── restapi/                 # REST HTTP API (Hono)
    ├── cms/                     # Staff CMS (Vite + TanStack Router)
    └── storefront/              # Public shop (Next.js)
```

Future interfaces (not yet implemented): `graphql`, `sdk`, `cli`.

## Layered architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  storefront │  │     cms     │  │   restapi   │   ← interfaces (apps/)
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                 ┌─────────────┐
                 │    core     │   domain, services, repositories
                 └──────┬──────┘
                        ▼
                 ┌─────────────┐
                 │  database   │   client + adapter + repositories
                 └─────────────┘
```

- **`packages/core`** — Framework-agnostic business logic: domain types, promo validation, RBAC rules, services that orchestrate data access via **repository interfaces**.
- **`packages/database`** — Persistence layer: `createMemoryDatabase()` today; future Supabase/Postgres adapters implement the same repository contracts.
- **`apps/*`** — UI or protocol adapters only. No duplicated domain rules.

## Packages

### `packages/core`

| Area | Contents |
|------|----------|
| `entities/` | `product.entity.ts`, `order.entity.ts`, `customer.entity.ts`, `campaign.entity.ts`, etc. |
| `auth/` | Staff RBAC (`staff-permissions.auth.ts`) — pure functions, no `localStorage` |
| `repositories/` | `product.repository.ts`, `order.repository.ts`, `customer.repository.ts` |
| `services/` | `product.service.ts`, `order.service.ts`, `promo.service.ts` |

### `packages/database`

| Area | Contents |
|------|----------|
| `adapter/memory/` | In-memory adapter with seed data, catalog, and repository implementations |
| `createMemoryDatabase()` | Returns `{ adapter, repositories }` |

Swap adapters without touching core or interfaces:

```ts
const db = createMemoryDatabase();
const products = createProductService(db.repositories.products);
```

### `packages/shared`

Legacy compatibility layer: re-exports `@luxe-maison/core` and mock seed data from `@luxe-maison/database`, plus `cn()` for Tailwind. New code should import from `core` / `database` directly.

## Interfaces

### `apps/restapi` (Hono)

**Purpose:** HTTP API for storefront, CMS, and external clients.

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/products` | Active storefront products |
| `GET /api/products/admin` | All admin products |
| `GET /api/products/:id` | Single product |
| `GET /api/orders` | All orders (CMS) |
| `GET /api/orders/track?email=` | Orders by customer email |
| `GET /api/orders/:id` | Single order |

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

### `apps/storefront` (Next.js)

**Purpose:** Customer-facing shop — browse, cart, checkout, account, order tracking.

| Concern | Choice |
|--------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Context + TanStack Query |
| Auth | Customer login only (staff redirected to admin URL) |
| Default port | `3000` |

**Environment:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STOREFRONT_URL` | Canonical storefront URL |
| `NEXT_PUBLIC_ADMIN_URL` | CMS URL for staff redirect |
| `NEXT_PUBLIC_API_URL` | REST API base (optional, future) |

### `apps/cms` (Vite + TanStack Router)

**Purpose:** Staff CMS — products, orders, analytics, campaigns, team, access control.

| Concern | Choice |
|--------|--------|
| Framework | Vite + React |
| Routing | TanStack Router |
| Auth | Staff login; role prefix `/:role/*` |
| Default port | `5173` |

**Environment:**

| Variable | Description |
|----------|-------------|
| `VITE_STOREFRONT_URL` | Link to public store |
| `VITE_API_URL` | REST API base (optional) |

Valid roles: `admin`, `manager`, `employee`. RBAC defaults live in `core`; CMS persists overrides via `localStorage`.

## Security boundary

```
┌─────────────────────┐     ┌─────────────────────┐
│   storefront        │     │   cms               │
│   (public origin)   │     │   (private origin)  │
│  Customer auth      │     │  Staff auth         │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └───────────┬───────────────┘
                       ▼
                ┌─────────────┐
                │   restapi   │  (shared backend)
                └──────┬──────┘
                       ▼
              core + database
```

Deploy storefront and CMS on **separate origins**. The REST API can be shared but should enforce auth per route when connected to real persistence.

## Development

```bash
pnpm install
pnpm dev              # storefront :3000 + cms :5173 + restapi :3001
pnpm dev:storefront   # Next.js only
pnpm dev:admin        # CMS only
pnpm dev:api          # REST API only
pnpm build
pnpm check-types
```

## Deployment

| App | Suggested host | Build output |
|-----|----------------|--------------|
| Storefront | Vercel / Netlify | `apps/storefront/.next` |
| CMS | Private subdomain | `apps/cms/dist` |
| REST API | Fly.io / Railway / container | `apps/restapi/dist` |

## Future work

- Postgres/Supabase adapter in `packages/database`
- Wire storefront/CMS to `restapi` via TanStack Query
- Add `graphql`, `sdk`, `cli` interfaces
- Server-side staff session validation
- Shared `@luxe-maison/ui` package
