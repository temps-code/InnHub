# Proposal: Mobile sidebar scroll + multi-role test data

## Intent

Two remaining issues from #58: (1) mobile sidebar drawer has no overflow scroll — nav items at the bottom are inaccessible on small viewports; (2) all tests only use `administrator` role, so route guards for manager/receptionist/housekeeping/maintenance cannot be verified.

## Scope

### In Scope
- Fix AppShell.tsx so the sidebar header stays fixed and the nav list scrolls independently on mobile
- Add parameterized tests covering all 5 roles in `App.routing.test.tsx` and `SidebarNav.test.tsx`
- Extend `demoCredentials.ts` to support multiple demo accounts with different roles

### Out of Scope
- Navigation grouping or reordering (#61)
- Role-based UI element visibility filtering (#60)
- Backend schema or InsForge changes
- New UI primitives or design-system work

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `app-routing`: add mobile sidebar scroll behavior requirement; add multi-role parameterized test scenarios covering all 5 roles for sidebar visibility and route access
- `auth-session`: extend demo credential interface to support multiple accounts with distinct roles

## Approach

**Problem 1** — In `AppShell.tsx` restructure the `<aside>` to `flex flex-col h-full`. Move the header (logo + close button) out of the scroll area. Wrap `<SidebarNav />` in a container with `flex-1 overflow-y-auto` so it scrolls independently.

**Problem 2** — Extend `DemoCredentialsResult` to include a multi-role variant mapping role → credentials. Add demo accounts for each of the 5 roles. Use `it.each` parameterized tests to verify route access and sidebar visibility per role in existing routing and sidebar test files.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/shell/AppShell.tsx` | Modified | Flexbox layout for independent sidebar scroll |
| `src/features/auth/services/demoCredentials.ts` | Modified | Multi-role demo account interface |
| `src/app/__tests__/App.routing.test.tsx` | Modified | Role-parameterized routing tests |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Modified | Role-parameterized sidebar tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking existing demo login | Low | Backward-compatible interface extension |
| Mobile layout regression | Low | Visual check + existing test coverage |

## Rollback Plan

Revert the 4 affected files. Each change is localized — no cascading rollback needed.

## Dependencies

None.

## Success Criteria

- [ ] Mobile sidebar nav scrolls independently on viewports < 768px
- [ ] `it.each` tests cover all 5 roles in routing and sidebar test files
- [ ] Demo credentials expose accounts for non-admin roles
- [ ] `npm run test:run` passes (TDD: existing tests stay green)
- [ ] `npm run lint` and `npm run build` pass
