# @teamgbg/orpc

## 2.6.80

### Patch Changes

- 3c7bf26: feat(logger): downgrade expected protocol-probe 4xx to INFO

## 2.6.79

### Patch Changes

- 822c964: feat(worker-pool): stack-free saturation errors + window-aggregated logging + respondAllowOnPoolError wrapper

## 2.6.78

### Patch Changes

- 8382d22: feat(executor-dispatch): in-process worker-thread dispatcher backed by @teamgbg/worker-pool

## 2.6.77

### Patch Changes

- 9ba3e3f: feat(@teamgbg/worker-pool): unified multi-CPU dispatch primitive

## 2.6.68

### Patch Changes

- 27259b3: feat(orpc): expose WebSocket connection status

## 2.6.50

### Patch Changes

- d1844ad: chore: version bump

## 2.6.49

### Patch Changes

- f5d3dfe: feat(master-switch): add write-master-switch-cache export

## 2.6.48

### Patch Changes

- 46e3551: chore: version bump

## 2.6.44

### Patch Changes

- 49947dd: fix(tool-generator): classify fleet_* tables as public scope

## 2.6.33

### Patch Changes

- 7093212: feat(provider-registry): add configure.ts bootloader entry point

## 2.6.23

### Patch Changes

- 18c13da: refactor(orpc,tool-executor): route secrets through configure() — no process.env

## 2.6.11

### Patch Changes

- aa91291: refactor(tool-executor): remove ExecutorConfig union and legacy loose type

## 2.6.10

### Patch Changes

- 523d26a: chore: version bump

## 2.6.9

### Patch Changes

- 03248a8: chore: version bump

## 2.6.8

### Patch Changes

- f75188a: chore: version bump

## 2.6.7

### Patch Changes

- 4881a78: chore: version bump

## 2.6.6

### Patch Changes

- 6bb5e0e: chore: version bump

## 2.6.5

### Patch Changes

- e57bcc1: chore: version bump

## 2.6.4

### Patch Changes

- a8186dd: chore: version bump

## 2.6.2

### Patch Changes

- 4348df2: refactor(tool-executor): remove internal executor and handler registry

## 2.6.1

### Patch Changes

- d9a0dc1: Capture parallel-session source edits to @teamgbg/orpc (configure.ts, guards-router.ts) and @teamgbg/service-boot (install-logging.ts). Changes were committed without their own changeset; this entry brings the publish chain back in sync.

## 2.6.0

### Minor Changes

- Add `fn.guards.{list,pause,resume}` ORPC procedures backing the new `guard_list`/`guard_pause`/`guard_resume` MCP tools. Implements the executor-first path per the just-tightened `single-executor-dispatch` doctrine — no bespoke handler files; three `mcp_tool` registry rows point at these procedures via `executor_key: 'orpc'`. `resume` shells out to scala-guard via subprocess to verify the rule passes before flipping `is_active=true`; `pause` enforces `progressive-activation`'s "no silent pause" rule (reason + reactivateWhen required); `pause` refuses on `critical: true` rows per `critical-guards-cannot-be-paused`.

## 2.5.11

### Patch Changes

- debb9da: fix(orpc/app-router): import generated routers/index.ts directly (was looking for .js that never existed)

  `getAppRouter()` was importing `prisma/generated/orpc/routers/index.js`, but the prisma-orpc-generator emits TypeScript at `routers/index.ts`. The `.js` file never existed anywhere — `scala-tools bundle-orpc` emits to `dist/index.js` (different path entirely). Every puck-orpc dispatch on services routing through this surface failed with `Cannot find module '/app/prisma/generated/orpc/routers/index.js'`.

  Bun runtime imports `.ts` files natively; explicit extension resolves without any bundle step. This is the 2026-05-21 scala-hub-tool-mcp `puck.get` dispatch failure — puck.\* tools use `executor_key="puck-orpc"` which hits `getAppRouter()`, so they were broken the whole time.

  Internal-executor tools (registry*edit, db_admin, doc*\*, etc. on scala-dev-mcp) didn't notice because they don't touch `getAppRouter()` — that's why scala-dev-mcp came back after the unrelated dedupe fix but scala-hub-tool-mcp didn't.

## 2.5.0

### Minor Changes

- e132fdc: Add `getAbly` + `InjectedAbly` to `@teamgbg/orpc/configure`. `fn-router.ts:311` calls `getAbly().createTokenRequest` (the `ably` configure-primitive profile rewrote a direct `@teamgbg/ably` usage). Without an ably arm in the configure module the import resolved to undefined at runtime, and every orpc call on a fleet-tools call path crashed with:

  > `Export named 'getAbly' not found in module '@teamgbg/orpc/src/configure.ts'`

  `configure()` now accepts both `auth` and `ably`; the noop fallback mirrors the realtime-utils pattern. Bootloader extends its injection call in the same `configurable_primitive` row.

  bootstrap-carve-out: layer 4 of readiness invariant 2. The previous layers (root-config scan c1b05d707, prisma blacklist 24b96a628, scala-tools await 32415c745) restored boot + tool registration, but `fleet_status` / `list_slots` / every other orpc-backed fleet tool still failed at call time on this missing export.

## 2.3.0

### Minor Changes

- 3734132: Decouple orpc and http from @teamgbg/db. Both packages now express the deps they need (Prisma factory, registry config loader, request context, logger) via configure() injection rather than direct imports. Removes the last 2 primitives→primitives horizontal-deps violations. Primitives→primitives class is now permanently closed.

  Changes:

  - `@teamgbg/os/contracts/org-scope`: new stable cross-tier OrgScope type. Replaces orpc's import from `@teamgbg/ui-foundation/db-registry/generated/config/org-scope`.
  - `@teamgbg/orpc/configure`: extends configure() with `getPrisma` + `loadRegistryConfig` slots. Adds `InjectedPrisma` (loose surface — only the shapes orpc actually calls, avoids transitively dragging in @prisma/client).
  - `@teamgbg/orpc/internal-cache`: new `InternalCache<V>` (TTL+LRU, ~70 LOC). Replaces uses of @teamgbg/db's monitored TTLCache. The fancier monitored variant stays in db for db-internal use; orpc's caches are short-lived per-process, observability lives at the request layer.
  - `@teamgbg/http`: drop `registerReadOnlyCache` call (circuit-breaker dashboard surface — non-critical for orpc-internal middleware).
  - `server-handlers/boot/install-logging.ts`: bootloader injects getPrisma + loadRegistryConfig into orpc.

  Bug fix: `row-security.ts` had `return !cachedConfig` (negation) instead of `return cachedConfig`. Caller would always get `boolean` instead of OrgScope. Fixed in same diff.

### Patch Changes

- Updated dependencies [3734132]
  - @teamgbg/os@1.1.1

## 2.2.0

### Minor Changes

- d992587: Apply configure-primitive pattern to db and orpc — both packages now accept an InjectedLogger via configure() instead of importing @teamgbg/logger directly.

  Removes 5 horizontal-deps violations:

  - @teamgbg/db (primitives) → @teamgbg/logger
  - @teamgbg/orpc (primitives) → @teamgbg/logger
  - @teamgbg/orpc (primitives) → @teamgbg/runtime-contracts (transitively via removed file)

  Mechanical application of `scala-tools configure-primitive` (11 db files rewritten, 4 orpc files rewritten in two one-line invocations). Bootloader injection wired in server-handlers/boot/install-logging.ts immediately after the logger surface comes up; later refactor moves the manual list to a `configurable_primitive` registry walk (#57).

### Patch Changes

- Updated dependencies [d992587]
  - @teamgbg/db@1.2.0

## 2.1.93

### Patch Changes

- Remove all dead @teamgbg/service-runtime/server-handlers/page-server/actions imports from fn-router

## 2.1.91

### Patch Changes

- 45ffb38: Remove dead `createOpportunity` handler referencing non-existent `@teamgbg/service-runtime/server-handlers/page-server/actions/create-opportunity.ts`

## 2.1.90

### Patch Changes

- Update ws/server.ts
- Updated dependencies
- Updated dependencies
  - @teamgbg/db@1.1.108
  - @teamgbg/runtime-contracts@0.1.5

## 2.1.89

### Patch Changes

- Migrate server packages to proper tiers, split state-machine, rewrite fixa DB fixers for Prisma
- Updated dependencies
  - @teamgbg/db@1.1.106
  - @teamgbg/runtime-contracts@0.1.4

## 2.1.75

### Patch Changes

- Updated dependencies [2a98ec6]
  - @teamgbg/db@1.1.83

## 2.1.74

### Patch Changes

- Updated dependencies [67873b0]
  - @teamgbg/logger@1.1.54
  - @teamgbg/service-runtime@1.1.76

## 2.1.73

### Patch Changes

- Updated dependencies [2fab6a2]
  - @teamgbg/db@1.1.81
  - @teamgbg/service-runtime@1.1.75

## 2.1.72

### Patch Changes

- Updated dependencies [807b08a]
  - @teamgbg/db@1.1.80
  - @teamgbg/service-runtime@1.1.74
