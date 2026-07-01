# Luxe Maison

[Turborepo](https://turbo.build) + [pnpm](https://pnpm.io) monorepo for the Luxe Maison e-commerce platform.

| Package | Description | Dev command |
|---------|-------------|-------------|
| [`apps/storefront`](apps/storefront) | Public Next.js shop | `pnpm dev:storefront` |
| [`apps/cms`](apps/cms) | Staff CMS (TanStack Router) | `pnpm dev:admin` |
| [`packages/shared`](packages/shared) | Shared types & mock data | — |
| [`packages/typescript-config`](packages/typescript-config) | Shared TSConfig presets | — |

Architecture and conventions are documented in [`design.md`](design.md).

## Quick start

```bash
pnpm install
pnpm dev              # storefront :3000 + cms :5173 (via Turbo)
```

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages (with caching) |
| `pnpm lint` | Lint all packages |
| `pnpm check-types` | Typecheck all packages |
| `pnpm clean` | Remove `dist`, `.next`, `.turbo` artifacts |

Copy env examples:

```bash
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/cms/.env.example apps/cms/.env
```
