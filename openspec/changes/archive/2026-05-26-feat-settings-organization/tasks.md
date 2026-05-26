# Tasks: Organize Property and Admin Settings

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150-250 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full implementation of settings organization | PR 1 | Base branch: features |

## Phase 1: Foundation (Protected Layout Guard)

- [x] 1.1 Update `src/app/layouts/ProtectedLayout.tsx` to read `activeRoute.minRole` and `userRole`.
- [x] 1.2 Restrict direct URL path access inside `src/app/layouts/ProtectedLayout.tsx` using a redirect to `/app/dashboard`.

## Phase 2: Core Shell (Responsive Shell & Drawer)

- [x] 2.1 Add state `isSidebarOpen` inside `src/app/shell/AppShell.tsx` and render overlay backdrop on small viewports.
- [x] 2.2 Re-use generic atomic `Button` (ghost variant) in `src/app/shell/TopBar.tsx` as a hamburger menu button.
- [x] 2.3 Accept `onClose` callback in `src/app/shell/SidebarNav.tsx` and invoke it on `NavLink` clicks to auto-close drawer.

## Phase 3: Screen Responsiveness (Property Profile Grid)

- [x] 3.1 Refactor `ReadOnlyField` elements inside `src/features/properties/PropertyProfilePage.tsx` using `grid-cols-1 sm:grid-cols-[180px_1fr]`.

## Phase 4: Verification (Integration Testing)

- [x] 4.1 Enhance route-guard tests inside `src/app/__tests__/App.routing.test.tsx` to verify Settings route redirection.
- [x] 4.2 Add mobile menu drawer toggle and auto-close tests inside `src/app/shell/__tests__/SidebarNav.test.tsx`.
- [x] 4.3 Add or update `ReadOnlyField` responsive classes assertion inside `src/features/properties/__tests__/PropertyProfilePage.test.tsx`.
- [x] 4.4 Verify build, formatting, and unit tests using `npm run lint` and `npm run test:run`.

## Phase 5: Cleanup & Documentation

- [x] 5.1 Document responsive off-canvas drawer structure and role-based redirect design in `docs/05-architecture.md` and its Spanish counterpart.
