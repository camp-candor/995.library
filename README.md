# 995.library

> Master storehouse and Blessed terminal cockpit for the fleet. Local-first,
> deterministic, zero-config: domain pivots mount dynamically, no cloud
> deployment, no workers.

`995.library` operates under a dual mandate (see [AGENTS.md](./AGENTS.md)):

1. **Definitive point of origin** -- all reusable units (`*.unit`), action
   bales, buzzers, and Redux-pattern state machines across the fleet originate,
   evolve, and are verified in this repository.
2. **Autonomous terminal cockpit** -- a deterministic Blessed terminal UI
   harness backed by an `rx-lite` state machine, mounting local domain pivots
   dynamically without compile-time coupling.

---

## Architecture Overview

```text
.
|-- apps/
|   `-- 995.library/            # Blessed TUI harness (@camp_candor/995.library)
|       |-- run.ts              # Schema-driven dynamic runner & bus injector
|       |-- data/redux/BEE.txt  # Redux wiring manifest template
|       |-- test/               # AVA test suites
|       `-- 995.library/        # Core curses engine & built-in units
|           |-- BEE.ts / hunt.ts
|           |-- 00.library.unit/# Workspace template compiler (updateLibrary)
|           |-- 01.unit.unit/   # Deterministic unit scaffolding engine
|           |-- 80.terminal.unit/, 81.grid.unit/
|           |-- 83.console.unit/# Console log viewport (cns00)
|           |-- 84.input.unit/, 85.choice.unit/
|           `-- 98.menu.unit/   # Master terminal navigation loop
|
|-- packages/                   # Canonical storehouse for fleet domain pivots
|   |-- 000.pivot/              # Base pivot template
|   |-- 001.cauldron/
|   |-- 002.lore/
|   |-- 100.agent/              # Core Agent Domain & Cockpit
|   |-- 103.factory/
|   |-- 104.hotkey/
|   |-- 105.gemini/
|   |-- 132.github/             # GitHub control plane pivot
|   |-- 133.cloudflare/         # Cloudflare domain pivot
|   |-- 135.jules/
|   |-- 202.dashboard/
|   |-- 821.repobot/
|   `-- 924.slack/              # Slack operations bridge
|
`-- data/                       # Transcripts, directives, runtime artifacts
```

Each package is a self-contained workspace (`BEE.ts` manifest, `hunt.ts`
bootstrap, `*.unit/` modules) that can be copied 1:1 into any downstream
monorepo. `run.ts` discovers them by sweeping `packages/*` for a valid
`tsconfig.json` plus `terminal` metadata in `package.json` -- no hardcoded
registry.

---

## Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`

No cloud account, worker runtime, or deploy target is required. This repository
is local-first: the cockpit, compilers, and test batteries all run on your
workstation.

---

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/camp-candor/995.library.git
cd 995.library
npm ci
```

### 2. Configure Environment (optional)

```bash
cp .env.example .env
```

Only needed when exercising pivot integrations (GitHub, Slack, Cloudflare API
clients inside `packages/`). The TUI and test suites run without it.

### 3. Launch the Cockpit

```bash
# Blessed curses cockpit (dynamic pivot autodiscovery)
npm run tui

# Focused entry points
npm run tui:pivot
npm run tui:cauldron
```

### 4. Verify Quality Gates

```bash
# Static compilation across all project references
npm run check:types

# Full monorepo test battery (Vitest + AVA)
npm test

# Unified gate: boundary + sentry + artifacts + types + format + lint
npm run check:all
```

---

## Key Scripts

| Script                | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `npm run tui`         | Launch Blessed cockpit via dynamic `run.ts` |
| `npm run build`       | Build all workspaces                        |
| `npm run check:types` | Project-wide typecheck (`tsc -b`)           |
| `npm run test`        | Agent (Vitest) + library (AVA) suites       |
| `npm run check:all`   | Unified verification gate                   |
| `npm run gauntlet`    | `check:all` + full test battery             |
| `npm run fix`         | Auto-format (Prettier) + auto-fix (ESLint)  |

---

## CI Parity

Pushes to `main` run the Main CI gauntlet (`.github/workflows/push-main.yml`):

1. `npm ci` -- clean install from the committed lockfile
2. `npm run check:types` -- verify types across project references
3. `npm test` -- full monorepo test battery
4. Immutable harness boundary assertion

There are no deploy workflows in this repository. Keep `package-lock.json`
committed and in sync (`npm install` after any workspace change) so `npm ci`
stays green.

---

## Working Here

- Read [AGENTS.md](./AGENTS.md) first -- it defines the architectural laws:
  7-bit pure ASCII telemetry, no `console.log` after curses init (route to
  `cns00` via `UPDATE_CONSOLE`), fail-closed buzzers, and the verification
  gauntlet.
- New modules scaffold as `packages/<domain>/<index>.<name>.unit/` following the
  deterministic `01.unit.unit` stubs (no `setTimeout`, no `debugger`
  placeholders).
- The `UPDATE_LIBRARY` compiler regenerates `BEE.ts` manifests in-process from a
  lexical unit sweep -- see `AGENTS.md` section 3.
