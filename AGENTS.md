# AGENTS.md -- Execution Contract & Master Storehouse Invariants

> Authoritative operational specification for autonomous coding and verification
> agents operating in `995.library`. `995.library` is the sovereign upstream
> origin for the Blessed terminal harness (`@camp_candor/995.library`) and all
> modular fleet domain pivots (`packages/*`). Current source code and this
> contract supersede all historical records in `data/`.

---

## 1. Core Invariants & Non-Negotiable Laws

1. **Lifted Harness Mutability (Sovereign Origin Exception):**
   - Unlike downstream consumer repositories, `apps/995.library/995.library/**`
     is **MUTABLE IN THIS REPOSITORY**.
   - Active development of core curses widgets, state engines, compilers, and
     built-in units takes place directly inside `apps/995.library/995.library/`.
     (`npm run check:boundary` intentionally exits `0`).
2. **Structural Monorepo Parity (Copy-Paste Invariant):**
   - Standard NPM Monorepo (`workspaces: ["packages/*", "apps/*"]`, Node
     `>=20.0.0`, NPM `>=10.0.0`, `"private": true`). Do NOT introduce Yarn,
     PNPM, Bun, Nx, Lerna, or Turborepo.
   - Domain pivots MUST reside in isolated workspace folders under
     `packages/<NNN>.<domain>/` and never be collapsed into `apps/995.library/`.
     Every package under `packages/*` must remain a self-contained drop-in unit
     (`BEE.ts`, `hunt.ts`, `tsconfig.json`, `package.json`).
3. **7-Bit Pure ASCII Compliance (`check:sentry`):**
   - Every source file, test, script, and markdown document across `packages/`,
     `apps/995.library/`, and `.github/` must contain strictly 7-bit ASCII
     characters (`charCode <= 127`).
   - Multi-byte UTF-8 emojis, box-drawing characters, curly quotes, and
     em-dashes are forbidden. Use ASCII status tokens: `>>`, `::`, `---`,
     `[OK]`, `[PASS]`, `[FAIL]`, `[WARN]`, `[UPDATE]`.
4. **Curses Viewport Logging Isolation (`cns00`):**
   - Once Blessed curses initializes (`INIT_LIBRARY` / `INIT_TERMINAL`), calling
     `console.log`, `console.warn`, or `console.error` is **STRICTLY
     FORBIDDEN**. Bare stdout/stderr writes corrupt the Blessed 12x12 coordinate
     grid and raw TTY state.
   - Route all runtime telemetry, compiler diagnostics, and status alerts
     exclusively to console pane `cns00` (`COLOR.GREEN`) via
     `ste.hunt('[Console action] Update Console', { idx: 'cns00', src: '>> ...' })`
     (`ActCns.UPDATE_CONSOLE`).
   - All buzzers must guard `ste.hunt` / `global.LIBRARY` calls so headless unit
     tests resolve cleanly without a mounted TTY screen.
5. **Gauntlet Type & Reducer Hardening (`test/gauntlet.verification.test.ts`):**
   - **Typed Bit Callbacks (Tier 1):** In every `fce/*.bit.ts` interface,
     `slv?: Function` is forbidden. Declare strongly typed resolver callbacks:
     `slv?: (result: { <prefix>Bit: <BitType> }) => void`.
   - **Generic Action Classes (Tier 2):** Every action class in `*.action.ts`
     must explicitly implement `Action<TBit>` and belong to the exported
     `Actions` union.
   - **Pure Cloned Reducers (Tier 2):** Every unit reducer (`*.reduce.ts`) must
     wrap state in `clone(model, true)` (via `clone-deep`) before delegating to
     `Buzz.*`, and must include a `default: return model` branch.
   - **Buzzer Barrel Parity:** Every function implemented in `buz/*.buzz.ts` and
     invoked by a reducer must be re-exported in `<unit>.buzzer.ts`.
6. **Zero Artificial Delays & Non-Blocking Stubs (`01.unit.unit`):**
   - Never introduce `setTimeout` delays or `debugger` statements in buzzers or
     unit scaffolding templates (`unit.model.ts`).
   - All buzzers must emit a `cns00` execution receipt, invoke
     `bal.slv({ <prefix>Bit: ... })` if present, and return `cpy`
     deterministically.
7. **Sovereignty Interlock & Fleet Broadcast Safety (`00.library.unit`):**
   - Fleet-wide operations (`scanFleet`, `progressLibrarySaga`, `rewireLibrary`)
     must verify sovereignty via `checkSovereigntyInterlock()` against
     `data/versions.json` before mutating external targets.
   - Never allow fleet broadcast routines to overwrite the active working
     directory (`process.cwd()`) or `apps/995.library` in-place.
   - When testing `resolveFleetRoot()` or `scanFleet()`, always isolate
     filesystem probes in temporary scratch directories using
     `process.env.FLEET_ROOT` or `process.env.WORK_DIR` and restore them in
     `t.teardown()`.

---

## 2. File & Workspace Boundaries

| Path / Scope                                             | Access Level            | Enforcement Gate          | Operational Rule                                                                                                                    |
| :------------------------------------------------------- | :---------------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| `apps/995.library/995.library/**`                        | **MUTABLE (Sovereign)** | `npm run test:library`    | Core Blessed harness and built-in units (`00.library.unit` .. `99.bus.unit`). Must pass `gauntlet.verification.test.ts`.            |
| `apps/995.library/run.ts`                                | **MUTABLE**             | `run.discovery.test.ts`   | Schema-driven dynamic package runner. Hardcoded package registries (`PACKAGES_CONFIG`) are forbidden.                               |
| `apps/995.library/test/*.test.ts`                        | **MUTABLE (AVA)**       | `npm run test:library`    | Executed sequentially via AVA (`concurrency: 1`, `--import=tsx`). Do NOT use Vitest APIs here.                                      |
| `packages/100.agent/**`                                  | **SOURCE-ONLY (.ts)**   | `npm run check:artifacts` | Executed via Vitest (`npm run test:agent`). Zero leaked `.js` or `.d.ts` files allowed outside `dist/`.                             |
| `packages/<NNN>.<domain>/**`                             | **MUTABLE (Pivots)**    | `npm run check:types`     | Canonical fleet domain pivots. Never collapse into `apps/995.library/`.                                                             |
| `data/overview/**`, `data/build/**`, `data/directive/**` | **APPEND-ONLY**         | Audit Review              | Historical ledger. Never delete or rewrite prior specs; only update designated `- **Progress:**` headers or add new numbered files. |
| External Sibling Repos (`D:\trellis\*`)                  | **OFF-LIMITS**          | Sovereignty Interlock     | Never mutate sibling repositories on disk during local unit tests or unapproved broadcast runs.                                     |

---

## 3. Monorepo Topology & Unit Architecture

```text
.
|-- apps/
|   `-- 995.library/                    # Blessed Terminal UI Harness (@camp_candor/995.library)
|       |-- run.ts                      # Dynamic package autodiscovery runner & global.PIVOTS bus injector
|       |-- data/redux/BEE.txt          # Canonical Redux BEE.ts code generation template
|       |-- test/                       # 30+ AVA verification suites (gauntlet, library, unit, fleet, lockfile, terminal)
|       `-- 995.library/                # [MUTABLE IN THIS REPO] Core Curses engine & metaprogramming units
|           |-- BEE.ts & hunt.ts        # Root library state manifest & action dispatcher
|           |-- 00.library.unit/        # Metaprogramming compiler (updateLibrary, scanFleet, rewireLibrary, sovereignty)
|           |-- 01.unit.unit/           # Deterministic unit scaffolding engine (createUnit, updateUnit)
|           |-- 02.action.unit/         # Action synthesis unit
|           |-- 03.data.unit/           # Flattening, telemetry & data snapshot unit
|           |-- 04.server.unit/         # Local server orchestration unit
|           |-- 05.package.unit/        # Package management & version bumping unit
|           |-- 06.directive.unit/      # Directive lifecycle & phase orchestration unit
|           |-- 80.terminal.unit/       # Blessed curses screen & raw TTY lifecycle management
|           |-- 81.grid.unit/           # 12x12 percentage coordinate grid layout engine
|           |-- 83.console.unit/        # Right-column green telemetry viewport (cns00)
|           |-- 84.input.unit/          # Modal keyboard & text input capture unit
|           |-- 85.choice.unit/         # Interactive vertical menu selection widget
|           |-- 97.collect.unit/        # Runtime collection management
|           |-- 98.menu.unit/           # Master flight deck navigation & fleet broadcast menus
|           `-- 99.bus.unit/ & 99.core/ # Rx-Lite reactive bus & core action/model interfaces
|-- packages/                           # Canonical Storehouse for Modular Fleet Domain Pivots
|   |-- 000.pivot/                      # Pivot template package
|   |-- 001.cauldron/                   # Cauldron orchestration package
|   |-- 002.time/ & 003.space/          # Temporal & spatial hex/GeoJSON units
|   |-- 100.agent/                      # Core Agent Domain & Cockpit (@camp_candor/100.agent)
|   |-- 103.factory/ & 104.hotkey/      # Factory & hotkey units
|   |-- 105.gemini/ & 135.jules/        # LLM & autonomous worker integration units
|   |-- 132.github/ & 133.cloudflare/   # GitHub & Cloudflare control units
|   |-- 202.dashboard/                  # TUI dashboard control units
|   |-- 299.lore/ & 300.engine/         # Narrative lore & pure simulation engine units
|   |-- 301.spatial/                    # Spatial lattice units
|   `-- 821.repobot/ & 924.slack/       # Repo-bot governance & Slack notification units
|-- bin/git-hooks/functions.sh          # Git hook enforcement functions (branch, filenames, lockfile sync, lint-staged)
`-- data/                               # Institutional memory (overview/, build/, directive/day-000..day-005/, flat/, unit/)
```

### Standard Unit Anatomy (`<NN>.<name>.unit/`)

- `fce/<name>.bit.ts` & `fce/<name>.interface.ts`: Strongly typed payload
  envelopes (`slv?: (result: { <prefix>Bit: ... }) => void`).
- `<name>.action.ts`: Action string constants, classes implementing
  `Action<TBit>`, and discriminated `Actions` union.
- `buz/<name>.buzz.ts`: Business logic handlers accepting
  `(cpy: Model, bal: Bit, ste: State)` and returning `cpy`.
- `<name>.buzzer.ts`: Barrel re-exports of all handlers from
  `./buz/<name>.buzz`.
- `<name>.reduce.ts`: Pure reducer cloning `model` via `clone(model, true)` and
  routing `Act.*` to `Buzz.*`.
- `<name>.model.ts`: Default state model class.
- `<name>.unit.ts`: Unit lifecycle registration class.

---

## 4. Metaprogramming & Dynamic Runner Protocols

1. **In-Process Manifest Compiler (`updateLibrary` in `00.library.unit`):**
   - Resolves `bal.src` across absolute paths, relative paths, or bracketed
     workspace slugs (`[packages/103.factory]`).
   - Sweeps only directories matching `/^\d{2}\..+\.unit$/`, sorted via
     `a.localeCompare(b)` for deterministic output.
   - Interpolates `BEE.txt` (falling back to in-memory template) and writes
     `<targetDir>/BEE.ts` synchronously without touching
     `apps/995.library/995.library/BEE.ts` unless explicitly targeted.
2. **In-Memory Hot Re-Wiring (`rewireLibrary` in `00.library.unit`):**
   - Purges `require.cache` entries prefixed with `targetDir`, re-imports
     regenerated `BEE.ts`, and remounts slice reducers onto `ste.reducers`
     without dropping Blessed raw mode.
3. **Schema-Driven Runner (`apps/995.library/run.ts`):**
   - Sweeps `packages/*` for directories with `tsconfig.json`, ingests
     `package.json#terminal` (`globalKey`, `menuTitle`, `menuDesc`) or applies
     heuristic fallback from the folder name.
   - Mounts each package's `hunt` dispatcher onto `global[pkg.globalKey]` and
     `global.PIVOTS[pkg.name]`.
   - Routes packages with `98.menu.unit/menu.action` into the Blessed
     switchboard via `ROUTE_MENU`; mounts menu-less packages as headless
     background services.

---

## 5. Agent Roles & Directive Execution Protocol

Directives in `data/directive/day-XXX/NNN.<topic>.<role>.md` enforce strict
separation of duties:

| Role Suffix    | Persona                                | Operational Mandate & Restrictions                                                                                                                                                                                                                                                                                                                                            |
| :------------- | :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*.jules.md`   | **Jules** (Implementer)                | Run the `Pre-Execution Completion Inspection` checklist first. If the completion score meets the directive's threshold (`>= 67%` or `>= 80%` as specified), update `- **Progress:**` with the timestamp and `>> [HALT]` notice, save the file, and **STOP IMMEDIATELY** without modifying any code or tests. **NEVER execute, read, or mutate partner `*.ag-test.md` files.** |
| `*.ag-test.md` | **Antigravity** (Adversarial Verifier) | Execute all verification levels (`Level 0` through `Level 4`), including negative-control falsification tests and interactive Blessed TUI checks. Follow the **In-Scope Remediation Mandate (Zero-Handoff Policy)**: fix missing wiring, exports, or `tsconfig` references proactively, but NEVER weaken assertions or skip gauntlet checks.                                  |
| `*.gravity.md` | **Antigravity** (Architect)            | Perform architectural audits, saga alignment, and release sealing.                                                                                                                                                                                                                                                                                                            |

---

## 6. Toolchain, Pre-Flight & Verification Gauntlet

### 6.1 Pre-Flight Hygiene Sequence (Run Before Any Mutation)

```bash
# 1. Verify no leaked .js/.d.ts artifacts in packages/100.agent and zero UTF-8 emojis
npm run check:artifacts
npm run check:sentry
```

### 6.2 Post-Mutation Verification Gauntlet (Mandatory Before Commit/Completion)

Run the consolidated gauntlet from the monorepo root; all stages must exit `0`:

```bash
npm run gauntlet
```

`npm run gauntlet` executes:

1. `npm run check:all`:
   - `npm run check:boundary` -- Sovereign no-op (`exit 0`).
   - `npm run check:sentry` -- Scans `packages/`, `apps/995.library/run.ts`, and
     `.github/` for multi-byte UTF-8 emojis.
   - `npm run check:artifacts` -- Verifies zero leaked `.js` or `.d.ts` files
     inside `packages/100.agent`.
   - `npm run check:types` (`tsc -b`) -- Composite TypeScript compilation across
     all workspaces.
   - `npm run prettier:check` -- Formatting verification (auto-fix via
     `npm run fix`).
   - `npm run lint:check` -- ESLint verification across workspaces.
2. `npm test`:
   - `npm run test:agent` -- Runs Vitest suites in `@camp_candor/100.agent`.
   - `npm run test:library` -- Runs all AVA test suites in
     `@camp_candor/995.library` (`apps/995.library/test/**/*.test.ts`).

### 6.3 Authoritative Command Reference

| Command                                                       | Purpose                                                                                                                  |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `npm run dev` / `npm run tui`                                 | Launch interactive Blessed terminal cockpit via `npx tsx apps/995.library/run.ts`.                                       |
| `npm run tui:pivot`                                           | Launch Blessed terminal directly into `pivot` (`npx tsx apps/995.library/run.ts -t pivot`).                              |
| `npm run tui:cauldron`                                        | Launch Blessed terminal directly into `cauldron` (`npx tsx apps/995.library/run.ts -t cauldron`).                        |
| `npm run gauntlet`                                            | Run full verification gate (`npm run check:all && npm test`).                                                            |
| `npm run check:all`                                           | Run `check:boundary && check:sentry && check:artifacts && check:types && prettier:check && lint:check`.                  |
| `npm run test:library`                                        | Run AVA test suite in `apps/995.library`.                                                                                |
| `npx ava apps/995.library/test/<file>.test.ts`                | Run a single targeted AVA test file from the monorepo root (or `npx ava test/<file>.test.ts` inside `apps/995.library`). |
| `npm --workspace=@camp_candor/995.library run check:gauntlet` | Run `ava test/gauntlet.verification.test.ts` (certifies Bit contracts, Action generics, and Reducer cloning).            |
| `npm run test:agent`                                          | Run Vitest suite in `packages/100.agent`.                                                                                |
| `npm run fix`                                                 | Auto-format with Prettier and apply ESLint fixes (`prettier:fix && lint:fix`).                                           |
| `npm run clean:js`                                            | Remove leaked `.js` and `.d.ts` artifacts from `packages/100.agent`.                                                     |

---

## 7. Git Hook Enforcement & Commit Protocol

Commits and pushes are gated by `.husky/pre-commit`, `.husky/pre-push`, and
[`bin/git-hooks/functions.sh`](file:///d:/trellis/995.library/bin/git-hooks/functions.sh):

1. **Protected Branch Guard:** Direct commits or pushes to `master` are blocked.
2. **Branch Naming Regex:** Active branch name must match
   `^[a-zA-Z0-9]+([/-][a-zA-Z0-9]+)*$`.
3. **Staged Filename Whitelist:** Staged file paths must contain only
   `A-Z a-z 0-9 space . _ - + @ /`.
4. **Automatic Lockfile Sync:** Staging changes in `package.json`,
   `packages/**`, or `apps/**` automatically triggers
   `npm install --package-lock-only --no-audit --ignore-scripts` and stages
   `package-lock.json`. Never bypass hooks with `--no-verify`.
5. **Commit Format:** Conventional commits (`feat:`, `fix:`, `chore:`,
   `refactor:`, `test:`, `docs:`, `ci:`).

---

## 8. Error Budgets, Backtracking & Halt Conditions

1. **3-Strike Remediation Cap:** If a typecheck, AVA test, or lint check fails
   after **3 consecutive fix attempts**, STOP mutating files. Revert broken
   edits to the last green state and report the failure with exact stderr
   diagnostics.
2. **Test Runner Separation:** Never import `vitest` inside
   `apps/995.library/test/*.test.ts` (which uses `ava` + `sinon`), and never
   import `ava` inside `packages/100.agent/test/*.test.ts` (which uses
   `vitest`).
3. **Scratch & Env Cleanup in Tests:** Any test that mutates
   `process.env.FLEET_ROOT`, `process.env.WORK_DIR`, `require.cache`, or creates
   temporary directories MUST restore the original state inside `t.teardown()` /
   `try..finally`.
4. **Hard Halt (`CONFLICT_BLOCKED`):** Emit `CONFLICT_BLOCKED` and halt
   immediately if a task requires:
   - Collapsing `packages/*` workspaces into `apps/995.library/`.
   - Emitting bare `console.log` calls during active Blessed curses sessions or
     introducing UTF-8 emojis.
   - Weakening `test/gauntlet.verification.test.ts` assertions or bypassing
     `checkSovereigntyInterlock()` to mutate external repositories.
