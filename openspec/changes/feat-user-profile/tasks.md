# Tasks: User Profile Page

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500–760 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Role hierarchy + routing + sidebar | PR 1 | ~180–270 lines. types.ts, routeMetadata, routes, sidebar, SettingsLayout. Base: tracker branch. |
| 2 | Profile module + i18n + profile tests | PR 2 | ~300–400 lines. All src/features/profile/ + i18n + tests. Base: PR 1 branch. |

## Phase 1: Foundation — Role & Routing (TDD)

- [x] 1.1 RED: Write failing test for `"any"` level 10 in ROLE_ORDER and `>=` canAccess
- [x] 1.2 RED: Write failing test for `"profile"` in ProtectedRouteId
- [x] 1.3 GREEN: Add `"any"` to AppProfileRole, update ROLE_ORDER (any=10, mnt=30, hk=40, rcp=60, mgr=80, adm=100)
- [x] 1.4 GREEN: Simplify `canAccess()` to pure `>=`, remove peer-equality logic
- [x] 1.5 GREEN: Add `"profile"` to ProtectedRouteId + settingsRoutes (minRole: any)
- [x] 1.6 GREEN: Wire profile route in routes.tsx (placeholder import)
- [x] 1.7 REFACTOR: Clean up types exports

## Phase 2: Sidebar & SettingsLayout (TDD)

- [x] 2.1 RED: Write failing test for Profile tab in SettingsLayout
- [x] 2.2 RED: Write failing test for pinned "My Profile" sidebar link
- [x] 2.3 GREEN: Add Profile NavLink to SettingsLayout tabs
- [x] 2.4 GREEN: Add pinnedItem prop: ProtectedLayout → AppShell → SidebarNav
- [x] 2.5 GREEN: Render `<hr>` + pinned link below groups in SidebarNav
- [x] 2.6 REFACTOR: Organize SidebarNav types

## Phase 3: Profile Module (TDD per layer)

- [ ] 3.1 RED: Write failing tests for profileService (getProfileData, updateProfileFullName, property fallback)
- [ ] 3.2 GREEN: Implement profileService with DI + FakeQuery pattern
- [ ] 3.3 RED: Write failing tests for useCurrentProfile (loading→loaded, loading→error, update success/failure)
- [ ] 3.4 GREEN: Implement useCurrentProfile hook with stale-request guard
- [ ] 3.5 RED: Write failing tests for UserProfilePage (read mode, admin edit toggle, non-admin restricted, validation, cancel, backend error preserves form)
- [ ] 3.6 GREEN: Implement UserProfilePage with read/edit + React Hook Form + Zod
- [ ] 3.7 REFACTOR: Clean up ProfileData, formSchema, exports, hook state

## Phase 4: i18n & Integration

- [ ] 4.1 Add i18n keys `routes.protected.profile.*` and `profile.*` to en.ts
- [ ] 4.2 Add Spanish i18n counterparts to es.ts
- [ ] 4.3 Swap placeholder import in routes.tsx for real UserProfilePage
- [ ] 4.4 Run `npm run test:run` and `npm run build`, fix any regressions in routing/sidebar tests
