# Proposal: Protected Route Groups with Role-Based Navigation

## Intent

Issue #61 — protected routes are flat peers on a single level with no grouping, settings structure, or role filtering. As the app grows toward real modules, the sidebar becomes unusable: 11 items with no hierarchy, every role sees the same links, and there's no place for admin settings. Grouping, settings nesting, and role-based visibility are needed before module implementation starts.

## Scope

### In Scope
- Define 3 route groups: `operations`, `reports`, `settings`
- Add `group` and `minRole` fields to `ProtectedRouteMeta`
- Restructure property and users as settings routes (`/app/settings/property`, `/app/settings/users`)
- Implement role hierarchy filter: `administrator > manager > receptionist > (housekeeping | maintenance)`
- SidebarNav renders grouped sections; filters items below the user's role
- Settings routes use a nested layout under `/app/settings/*`
- Update router config in `routes.tsx` for settings nesting
- Update existing routing tests; add tests for role filtering and settings routes
- Update `docs/05-architecture.md` (and `.es.md`)

### Out of Scope
- Feature shell pages (placeholder strategy stays; only route structure changes)
- Settings page content (blank placeholders, same as other modules)
- Backend RBAC enforcement or InsForge role checks
- Breadcrumbs, route guards, or 403 pages

## Capabilities

### New Capabilities
None — this change modifies existing routing structure.

### Modified Capabilities
- `app-routing`: route metadata gains `group` and `minRole` fields; settings become nested routes under `/app/settings/*`; sidebar renders grouped sections with role-based filtering.

## Approach

1. **Route metadata** — add `RouteGroup` union type (`operations | reports | settings`), `minRole: AppProfileRole` field, and `group` to `ProtectedRouteMeta`. Move property and users out of top-level array into a separate `settingsRoutes` array.
2. **Settings layout** — create `SettingsLayout.tsx` as a child route wrapper under `/app/settings` with its own nav/sub-header. Routes become `/app/settings/property` and `/app/settings/users`.
3. **Role hierarchy** — create `canAccess(routeMinRole: AppProfileRole, userRole: AppProfileRole): boolean` helper using ordered precedence.
4. **SidebarNav** — accept grouped route items; render sections with group headers; filter items where `minRole` exceeds user's role.
5. **ProtectedLayout** — derive user role from `useAuthSession()`; pass filtered, grouped routes to `AppShell`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/routes/routeMetadata.ts` | Modified | Add group/minRole, split settings routes |
| `src/app/routes/routes.tsx` | Modified | Add settings nesting, route mapping |
| `src/app/shell/SidebarNav.tsx` | Modified | Grouped rendering, role filter |
| `src/app/shell/AppShell.tsx` | Modified | Accept grouped/filtered items |
| `src/app/layouts/ProtectedLayout.tsx` | Modified | Derive role, filter routes |
| `src/app/routes/SettingsLayout.tsx` | New | Settings nested layout |
| `src/app/__tests__/App.routing.test.tsx` | Modified | Add role/settings tests |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Modified | Test grouped rendering |
| `docs/05-architecture.md` | Modified | Reflect new route structure |
| `docs/05-architecture.es.md` | Modified | Mirror English changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hardcoded role hierarchy breaks if DB enum order changes | Low | Role hierarchy is frontend-only; kept in a single `roleHierarchy` map |
| Settings routes break existing bookmarks | Medium | Add redirect from old `/app/properties` → `/app/settings/property` |

## Rollback Plan

Revert `routeMetadata.ts`, `routes.tsx`, `SidebarNav.tsx`, `AppShell.tsx`, `ProtectedLayout.tsx` to their current flat structure. Delete `SettingsLayout.tsx`. Restore old redirect in test setup. Run `npm run test:run` to confirm baseline passes.

## Dependencies

- None. This is purely frontend routing structure — no backend changes needed.

## Success Criteria

- [ ] All existing routing tests pass without modification to test assertions
- [ ] Sidebar renders 3 groups with correct items when role is administrator
- [ ] Sidebar hides operations/reports items when role lacks `minRole`
- [ ] Settings routes render under `/app/settings/*` path and resolve correctly
- [ ] Old `/app/properties` redirects to `/app/settings/property`
- [ ] `npm run lint` and `npm run build` pass
