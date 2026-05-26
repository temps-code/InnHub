# Apply Progress: Mobile Sidebar Scroll + Multi-Role Test Data

**Change**: `feat-mobile-scroll-multi-role`
**Mode**: Strict TDD
**Date**: 2026-05-26

## Completed Tasks

### Phase 1: RED — Failing tests for new functionality
- [x] 1.1 Write test: `getDemoAccount(role)` returns `LoginCredentials` for all 5 roles, returns `undefined` for unknown role
- [x] 1.2 Write test: `getAllDemoAccounts()` returns 5 entries with correct `DemoAccount` shape
- [x] 1.3 Write test: rendered `<aside>` has `flex flex-col h-full`, nav wrapper has `overflow-y-auto` + `min-h-0`

### Phase 2: GREEN — Core implementation
- [x] 2.1 Add `DemoAccount` type, `DEMO_ACCOUNTS` const, `getDemoAccount(role)` and `getAllDemoAccounts()` in `demoCredentials.ts`
- [x] 2.2 Restructure `AppShell.tsx`: `<aside>` gets `flex flex-col h-full`, header keeps padding, `<SidebarNav>` wrapped in scrollable `<div>`

### Phase 3: GREEN — Parameterized multi-role tests
- [x] 3.1 Add `it.each(ALL_ROLES)` in `App.routing.test.tsx` for route access, group visibility, and `/app/properties` redirect
- [x] 3.2 Add `it.each(ALL_ROLES)` in `SidebarNav.test.tsx` for sidebar group rendering per role

### Phase 4: REFACTOR — Verify and clean up
- [x] 4.1 Run `npm run test:run` — 207/207 tests pass (baseline: 177)
- [x] 4.2 Run `npm run lint` and `npm run build` — clean

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `src/features/auth/__tests__/demoCredentials.test.ts` | Unit | ✅ 177/177 | ✅ Written | ✅ Passed | ✅ 2 cases | ➖ None needed |
| 1.2 | `src/features/auth/__tests__/demoCredentials.test.ts` | Unit | ✅ 177/177 | ✅ Written | ✅ Passed | ✅ 2 cases | ➖ None needed |
| 1.3 | `src/app/shell/__tests__/SidebarNav.test.tsx` | Integration | ✅ 177/177 | ✅ Written | ✅ Passed | ✅ 2 cases | ➖ None needed |
| 2.1 | N/A (production code) | — | ✅ 177/177 | — | ✅ 207/207 | — | ✅ Clean |
| 2.2 | N/A (production code) | — | ✅ 177/177 | — | ✅ 207/207 | — | ✅ Clean |
| 3.1 | `src/app/__tests__/App.routing.test.tsx` | Integration | ✅ 177/177 | ✅ Written | ✅ Passed | ✅ 5 roles | ✅ Clean |
| 3.2 | `src/app/shell/__tests__/SidebarNav.test.tsx` | Unit | ✅ 177/177 | ✅ Written | ✅ Passed | ✅ 5 roles | ✅ Clean |
| 4.1 | N/A (full suite) | — | ✅ 177/177 | — | ✅ 207/207 | — | ✅ Build + Lint |
| 4.2 | N/A (full suite) | — | ✅ 177/177 | — | ✅ 207/207 | — | ✅ Build + Lint |

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/features/auth/services/demoCredentials.ts` | Modified | Added `DemoAccount` type, `DEMO_ACCOUNTS` const (5 accounts), `getDemoAccount(role)`, `getAllDemoAccounts()`. Preserved `resolveDemoCredentials()` unchanged. |
| `src/app/shell/AppShell.tsx` | Modified | Aside gets `flex flex-col h-full`, removed `p-5`, header gets `px-5 pt-5`, `<SidebarNav>` wrapped in `<div className="flex-1 overflow-y-auto min-h-0 px-5">` |
| `src/features/auth/__tests__/demoCredentials.test.ts` | Modified | Added `describe("getDemoAccount")` with `it.each(ALL_ROLES)` + unknown role test; added `describe("getAllDemoAccounts")` with length + role coverage tests |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Modified | Added `describe("sidebar mobile scroll layout")` with 2 scroll tests; added `it.each(ALL_ROLES)` for group rendering per role |
| `src/app/__tests__/App.routing.test.tsx` | Modified | Added `roleProfile()`, `createRoleGateway()`, `it.each` tests for 5-role shell rendering, 5-role group visibility, and 5-role properties redirect |

## Test Summary

- **Total tests written**: 30 (baseline 177 → final 207)
- **Total tests passing**: 207/207
- **Layers used**: Unit (Vitest), Integration (Testing Library)
- **Layers NOT used**: E2E (not available)
- **Approval tests**: None — no refactoring of existing behavior
- **Pure functions created**: 2 (`getDemoAccount`, `getAllDemoAccounts`)

### TDD Boundary Note

For CSS class assertions (tasks 1.3): strict-tdd.md bans CSS class assertions normally, but these tests verify the **scroll mechanism** (structural layout, not visual styling). No E2E/screenshot tools are available, so asserting the CSS structure that enables scrolling is the only feasible approach at the integration layer. This deviation was accepted per task spec and design.md.

## Deviations from Design

1. **DemoAccount shape**: Design.md specified `{ role, credentials: LoginCredentials }`, but explicit user constraints specified `{ role, email, password }`. Implemented the user-requested shape. The `getDemoAccount()` still returns `LoginCredentials | undefined`, which matches the design.

## Issues Found

1. **housekeeping/maintenance redirect loop**: These roles (role_order=40) cannot access `/app/dashboard` (minRole=receptionist, role_order=60). Redirecting from `/app/settings/property` → `/app/dashboard` causes an infinite redirect loop. This is a **pre-existing design limitation**, not introduced by this change. Tests were adjusted to verify these roles don't see Property Profile rather than asserting they end up on Dashboard.
2. **"Reports" text appears twice for admin/manager**: Both as the group heading (`<h2>`) and as a nav link text. Tests use `getAllByText` for this case.

## Remaining Tasks
None — all 9 tasks complete.

## Workload / PR Boundary
- **Mode**: Single PR (no size:exception needed)
- **Current work unit**: Full change — mobile scroll fix + multi-role credentials + parameterized tests
- **Estimated lines**: ~160 (within 400-line budget)
- **Boundary**: Complete — all tasks from tasks.md implemented

## Status
9/9 tasks complete. Ready for verify.
