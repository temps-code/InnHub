# Tasks: Protected Route Groups with Role-Based Navigation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-380 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1–5 | All phases | PR 1 | Single PR — within 400-line budget. |

## Phase 1: Route Metadata Foundation

*All tasks in this phase touch `src/app/routes/routeMetadata.ts` unless noted.*

- [x] 1.1 **TDD: RouteGroup type + canAccess() helper** — Add `RouteGroup` union (`operations | reports | settings`). Extend `ProtectedRouteMeta` with `group: RouteGroup` and `minRole: AppProfileRole`. Define `ROLE_ORDER` precedence map and `canAccess(minRole, userRole): boolean`. RED: unit test hierarchy matrix. GREEN: types + function.
- [x] 1.2 **TDD: Split arrays + rename properties→propertyProfile** — Split `protectedRoutes` into top-level + `settingsRoutes` array. Rename route ID `properties`→`propertyProfile`. Export `allRoutes = [...protectedRoutes, ...settingsRoutes]`. RED: update test exports. GREEN: restructure arrays.
- [x] 1.3 **i18n group keys** — Add `shell.sidebar.group.{operations,reports,settings}` to `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts`.

## Phase 2: Settings Routes Structure

- [x] 2.1 **TDD: SettingsLayout.tsx** — Create `src/app/routes/SettingsLayout.tsx` with `<nav aria-label="Settings navigation">` linking to `/app/settings/property` and `/app/settings/users`, plus `<Outlet />`. RED: render test. GREEN: implement.
- [x] 2.2 **TDD: Nest settings + redirect in routes.tsx** — Nest settings routes under `/app/settings/*` using `SettingsLayout`. Add `/app/properties`→`/app/settings/property` redirect. Update `PropertyProfilePage` ID check to `propertyProfile`. RED: integration test for `/app/settings/property` resolution and `/app/properties` redirect. GREEN: configure routes.

## Phase 3: Role-Based Navigation

- [x] 3.1 **AppShell GroupedRouteItem prop** — Change `items` type from `readonly ProtectedRouteMeta[]` to `GroupedRouteItem[]`. Import `GroupedRouteItem` from routeMetadata. Update SidebarNav prop. File: `src/app/shell/AppShell.tsx`.
- [x] 3.2 **TDD: SidebarNav grouped sections** — Accept `GroupedRouteItem[]`. Render per-group `<section>` with `<h2>` heading and `<ul>` of NavLink items. RED: test group headers render, empty group renders nothing. GREEN: rewrite render.
- [x] 3.3 **TDD: ProtectedLayout role filtering** — Derive `userRole` from `state.session.profile.role` when authenticated. Filter `allRoutes` via `canAccess(minRole, userRole)`. Group by `group` into `GroupedRouteItem[]`, remove empty groups. Pass `grouped` to `<AppShell>`. RED: test different roles produce different group visibility. GREEN: implement filtering + grouping.

## Phase 4: Test Coverage

- [x] 4.1 **Full routing integration tests** — Added to `src/app/__tests__/App.routing.test.tsx`: `canAccess()` unit matrix (14 assertions), settings routes rendering, `/app/properties` redirect, administrator sees 3 groups, receptionist sees only operations (negative assertion). Updated "keep metadata reachable" test to iterate `allRoutes`.
- [x] 4.2 **SidebarNav grouped tests** — Updated `src/app/shell/__tests__/SidebarNav.test.tsx`: adapted icon tests to `GroupedRouteItem[]`, added group heading rendering test.

## Phase 5: Documentation

- [x] 5.1 **Architecture docs (EN)** — Added "Protected Route Architecture" section to `docs/05-architecture.md` with group table.
- [x] 5.2 **Architecture docs (ES)** — Mirrored "Arquitectura de rutas protegidas" in `docs/05-architecture.es.md`.

## Implementation Order

1. Phase 1 (types → split → i18n) — everything depends on types
2. Phase 2 (SettingsLayout → routes.tsx) — needs split arrays from 1.2
3. Phase 3 in order: 3.1 (AppShell type) → 3.2 (SidebarNav) → 3.3 (ProtectedLayout) — data flows top-down
4. Phase 4 (tests) — runs against working app
5. Phase 5 (docs) — final, knows the complete structure
