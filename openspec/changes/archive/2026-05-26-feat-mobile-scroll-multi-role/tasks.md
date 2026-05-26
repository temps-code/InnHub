# Tasks: Mobile Sidebar Scroll + Multi-Role Test Data

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 120-160 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Mobile scroll fix + multi-role credentials + param tests | PR 1 | Single PR; both deliverables are small and independent |

## Phase 1: RED — Failing tests for new functionality

- [x] 1.1 Write test: `getDemoAccount(role)` returns `LoginCredentials` for all 5 roles, returns `undefined` for unknown role — `src/features/auth/__tests__/demoCredentials.test.ts`
- [x] 1.2 Write test: `getAllDemoAccounts()` returns 5 entries with correct `DemoAccount` shape — `src/features/auth/__tests__/demoCredentials.test.ts`
- [x] 1.3 Write test: rendered `<aside>` has `flex flex-col h-full`, nav wrapper has `overflow-y-auto` + `min-h-0` — `src/app/shell/__tests__/SidebarNav.test.tsx`

## Phase 2: GREEN — Core implementation

- [x] 2.1 Add `DemoAccount` type, `DEMO_ACCOUNTS` const, `getDemoAccount(role)` and `getAllDemoAccounts()` in `src/features/auth/services/demoCredentials.ts` — preserve existing `resolveDemoCredentials()` unchanged
- [x] 2.2 Restructure `AppShell.tsx`: `<aside>` gets `flex flex-col h-full` (remove `p-5`), header keeps padding, `<SidebarNav>` wrapped in `<div className="flex-1 overflow-y-auto min-h-0 px-5">`

## Phase 3: GREEN — Parameterized multi-role tests

- [x] 3.1 Add `it.each(ALL_ROLES)` in `App.routing.test.tsx` for route access, group visibility per role, and `/app/properties` redirect
- [x] 3.2 Add `it.each(ALL_ROLES)` in `SidebarNav.test.tsx` for sidebar group rendering per role

## Phase 4: REFACTOR — Verify and clean up

- [x] 4.1 Run `npm run test:run` — all tests pass (existing + new)
- [x] 4.2 Run `npm run lint` and `npm run build` — no regressions
