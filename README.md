# Luxe Maison

[Turborepo](https://turbo.build) + [pnpm](https://pnpm.io) monorepo — **one codebase, many interfaces**.

## Structure

| Layer | Package | Description |
|-------|---------|-------------|
| **Core** | [`packages/core`](packages/core) | Domain types, business rules, services |
| **Data** | [`packages/database`](packages/database) | DB client, adapters, repositories |
| **Interface** | [`apps/restapi`](apps/restapi) | REST HTTP API (Hono, `:3001`) |
| **Interface** | [`apps/storefront`](apps/storefront) | Public Next.js shop (`:3000`) |
| **Interface** | [`apps/cms`](apps/cms) | Staff CMS — TanStack Router (`:5173`) |
| **Shared** | [`packages/shared`](packages/shared) | Back-compat re-exports + `cn()` |
| **Config** | [`packages/typescript-config`](packages/typescript-config) | TSConfig presets |

Architecture details: [`design.md`](design.md).

## Quick start

```bash
pnpm install
pnpm dev              # storefront + cms + restapi
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | All three interfaces |
| `pnpm dev:storefront` | Storefront only |
| `pnpm dev:admin` | CMS only |
| `pnpm dev:api` | REST API only |
| `pnpm build` | Build all packages |
| `pnpm check-types` | Typecheck all packages |

```bash
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/cms/.env.example apps/cms/.env
cp apps/restapi/.env.example apps/restapi/.env
```
