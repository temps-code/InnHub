# Apply Progress: feat-routing-protected-modules

## Mode

Strict TDD — Active

## TDD Cycle Evidence

### Phase 1: Route Metadata

| Task | RED (test written) | GREEN (impl passes) | REFACTOR | Notes |
|------|-------------------|---------------------|----------|-------|
| 1.1 RouteGroup type + canAccess() | ✅ `canAccess returns expected hierarchy` test written first | ✅ 14 assertions pass | ✅ Clean typed numeric map, pure function | Exported as named function; no side effects |
| 1.2 Split arrays + rename properties→propertyProfile | ✅ Existing `keeps protected route metadata` test adapted to use `allRoutes` | ✅ Admin gateway iterates all routes successfully | ✅ Clean export pattern: `protectedRoutes`, `settingsRoutes`, `allRoutes` | `findProtectedRoute` updated to search `allRoutes` |
| 1.3 i18n group keys | ✅ Group heading test in SidebarNav expects `shell.sidebar.group.*` keys | ✅ Keys resolved via i18next mock returning key | ✅ Keys structured under `shell.sidebar.group.*` | en.ts + es.ts updated in parallel |

### Phase 2: Settings Layout

| Task | RED (test written) | GREEN (impl passes) | REFACTOR | Notes |
|------|-------------------|---------------------|----------|-------|
| 2.1 SettingsLayout.tsx | ✅ `settings routes render under /app/settings/*` test | ✅ SettingsLayout renders Outlet; routes resolve | ✅ Added `<nav>` with sub-links post-review | Sub-links to property + users |
| 2.2 Nest settings + redirect | ✅ `redirects /app/properties to /app/settings/property` test | ✅ Navigate element renders; PropertyProfilePage appears | ✅ Clean route structure with old-path guard | Settings children map includes PropertyProfilePage |

### Phase 3: UI Components

| Task | RED (test written) | GREEN (impl passes) | REFACTOR | Notes |
|------|-------------------|---------------------|----------|-------|
| 3.1 AppShell GroupedRouteItem prop | ✅ Existing tests adapted to new prop shape | ✅ TypeScript compiles; SidebarNav receives GroupedRouteItem[] | ✅ Minimal change — only prop type changed | No logic changes in AppShell |
| 3.2 SidebarNav grouped sections | ✅ Group heading rendering test, icon tests adapted | ✅ Sections render with `<h2>` headings; links work | ✅ Clean `section > h2 > ul > li > NavLink` structure | Empty groups filtered upstream by ProtectedLayout |
| 3.3 ProtectedLayout role filtering | ✅ `canAccess` hierarchy test covers role matrix | ✅ Authenticated state derives role, filters, groups | ✅ Empty groups filtered out via `.filter(g => g.items.length > 0)` | Filtered BEFORE grouping to avoid empty arrays |

### Phase 4: Tests

| Task | RED (test written) | GREEN (impl passes) | REFACTOR | Notes |
|------|-------------------|---------------------|----------|-------|
| 4.1 Full routing integration tests | ✅ Settings route test, redirect test, canAccess matrix, admin all-routes | ✅ 171 tests pass across 28 files | ✅ Added receptionist filtered-view negative test post-review | Tests verify both positive and negative filtering |
| 4.2 SidebarNav grouped tests | ✅ Existing icon tests adapted to GroupedRouteItem[] | ✅ All 4 SidebarNav tests pass | ✅ Clean fixture: `allRoutes.filter(r.group === "operations")` | Partial i18n mock returns key strings |

### Phase 5: Documentation

| Task | RED (test written) | GREEN (impl passes) | REFACTOR | Notes |
|------|-------------------|---------------------|----------|-------|
| 5.1 Architecture docs (EN) | N/A (docs) | ✅ "Protected Route Architecture" section added | ✅ Group table, nesting, hierarchy described | Links, i18n keys, and route table present |
| 5.2 Architecture docs (ES) | N/A (docs) | ✅ Mirrored in Spanish | ✅ Same structure as English | Consistent with bilingual convention |

## Apply Progress

### Completed Tasks

- [x] 1.1 Define `RouteGroup` type and `canAccess()` helper
- [x] 1.2 Split `protectedRoutes` and `settingsRoutes` arrays; rename `properties` → `propertyProfile`
- [x] 1.3 Add i18n group keys (`shell.sidebar.group.*`)
- [x] 2.1 Create `SettingsLayout.tsx` with sub-navigation
- [x] 2.2 Nest settings routes and add `/app/properties` redirect
- [x] 3.1 Update `AppShell.tsx` to accept `GroupedRouteItem[]`
- [x] 3.2 Update `SidebarNav.tsx` for grouped section rendering
- [x] 3.3 Update `ProtectedLayout.tsx` with role filtering
- [x] 4.1 Add routing integration tests (role matrix, settings, redirect)
- [x] 4.2 Adapt SidebarNav tests to grouped props
- [x] 5.1 Update `docs/05-architecture.md`
- [x] 5.2 Update `docs/05-architecture.es.md`

### Verification

- ✅ `npm run lint` — no errors
- ✅ `npm run build` — tsc + vite build passes
- ✅ `npm run test:run` — 28 files, 171 tests, all passing
