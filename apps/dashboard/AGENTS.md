# AGENTS.md -- apps/dashboard Execution Contract

> Authoritative directory-ownership and architectural rules for coding agents
> operating in `apps/dashboard`. These rules apply in addition to the root
> `AGENTS.md`.

---

## 1. Immutable Directory Structure (Strict Whitelist)

Coding agents MUST NOT create new top-level directories inside `apps/dashboard/`
or new top-level directories inside `apps/dashboard/src/`.

Creating subdirectories **inside** the approved directories below IS allowed
when organizing domain modules, features, or components.

### Approved `apps/dashboard/` Top-Level Directories

| Directory | Purpose / Ownership |
| :--- | :--- |
| `apps/dashboard/src/` | React application source root (restricted to approved `src/*` folders below) |
| `apps/dashboard/base/` | Integration blocks / adapters interfacing with monorepo `packages/*` (`@camp_candor/*`) |
| `apps/dashboard/functions/` | Cloudflare Pages / Worker server functions |
| `apps/dashboard/public/` | Static public assets |
| `apps/dashboard/test/` | Unit tests (`test/unit/`) and Playwright E2E tests (`test/e2e/`) |

### Approved `apps/dashboard/src/` Directories

| Directory | Purpose / Ownership |
| :--- | :--- |
| `apps/dashboard/src/ui/` | Reusable UI components and visual primitives (subdirectories allowed) |
| `apps/dashboard/src/page/` | Route-level page components (subdirectories allowed) |
| `apps/dashboard/src/queue/` | TanStack React Query queries, mutations, and query-key factories (subdirectories allowed) |
| `apps/dashboard/src/router/` | TanStack Router route definitions, route tree, and navigation config (subdirectories allowed) |
| `apps/dashboard/src/hooks/` | Custom React hooks (subdirectories allowed) |
| `apps/dashboard/src/context/` | React Context providers and state wrappers (subdirectories allowed) |
| `apps/dashboard/src/network/` | HTTP / API transport clients and request helpers (subdirectories allowed) |
| `apps/dashboard/src/template/` | Shared page/layout templates (subdirectories allowed) |

### Forbidden Actions

- Do NOT create new folders under `apps/dashboard/src/` (for example: `components/`, `utils/`, `services/`, `store/`, `lib/`, `types/`, `assets/`). Place files in the appropriate approved folder or a subdirectory within it.
- Do NOT create new folders under `apps/dashboard/` outside the whitelist above.
- Do NOT import `packages/*` (`@camp_candor/*`) outside `apps/dashboard/base/`.

---

## 2. Commands & Verification Gates

- `npm run dev` - Start the Rsbuild dev server
- `npm run build` - Build the dashboard for production
- `npm run test:unit` - Run Vitest unit tests (includes `test/unit/structure.test.ts`)
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run check:dashboard` (from repo root) - Verify `apps/dashboard` directory whitelist
- `npm run gauntlet` (from repo root) - Full repo verification gate (includes `check:dashboard`)

---

## 3. Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
