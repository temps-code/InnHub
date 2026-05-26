# Design: Mobile Sidebar Scroll + Multi-Role Test Data

## Technical Approach

Two independent deliverables in one change:

1. **Mobile scroll** — restructure `AppShell`'s `<aside>` to `flex flex-col h-full`. The header (logo + close button) stays in normal flow at the top. Wrap `<SidebarNav>` in a `<div>` with `flex-1 overflow-y-auto min-h-0` so the nav list scrolls independently on small viewports. No JavaScript needed — pure CSS.

2. **Multi-role test data** — add a `getDemoAccount(role)` resolver that returns hardcoded `LoginCredentials` per `AppProfileRole`. Keep the original `resolveDemoCredentials()` untouched for backward compatibility. Then parameterize existing routing and sidebar tests with `it.each(ALL_ROLES)` to cover all 5 roles.

Both map directly to the specs: `app-routing` for scroll + role testing, `shared-ui` for multi-role credentials.

## Architecture Decisions

### Decision: Flex layout for independent scroll

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `overflow-y-auto` on whole aside | Scrolls header away — violates spec | ❌ |
| `position: sticky` on header + overflow on nav | Fragile in flex/grid contexts | ❌ |
| **Flex column: fixed header + `flex-1 overflow-y-auto` nav** | Predictable across browsers, no JS, standard Tailwind pattern | ✅ |

**Rationale**: `flex flex-col h-full` on the aside, header in normal flow (no scroll), nav wrapper with `flex-1 overflow-y-auto min-h-0` creates the independent scroll region. The `min-h-0` is critical — without it, `flex-1` children don't shrink below their content height and overflow breaks.

### Decision: Role-keyed credential resolver

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extend `resolveDemoCredentials` with role param | Breaks existing callers, mixes env-vars with hardcoded accounts | ❌ |
| **New `getDemoAccount(role)` function + const array** | Backward-compatible, no env dependency, trivial to test | ✅ |
| Single map export, callers filter | More boilerplate per test — defeats purpose of parameterization | ❌ |

**Rationale**: A dedicated resolver on a `DEMO_ACCOUNTS` const keeps the original interface unchanged. Tests do `getDemoAccount("housekeeping")` and get typed credentials back — or `undefined` for unknown roles.

## Data Flow

```
┌─ resolveDemoCredentials() ──┐    (unchanged — env-based, single account)
│  env → { email, password }   │
└──────────────────────────────┘

┌─ getDemoAccount(role) ───────┐    (new — hardcoded, 5 accounts)
│  role → DEMO_ACCOUNTS[]      │
│       → LoginCredentials     │
└──────────────────────────────┘

┌─ getAllDemoAccounts() ───────┐    (new — returns all accounts)
│       → DemoAccount[]        │
└──────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/shell/AppShell.tsx` | Modify | Restructure aside: `flex flex-col h-full`, header outside scroll, nav wrapped in `<div className="flex-1 overflow-y-auto min-h-0">`. Move `p-5` from aside to children. |
| `src/features/auth/services/demoCredentials.ts` | Modify | Add `DemoAccount` type, `DEMO_ACCOUNTS` constant, `getDemoAccount(role)` and `getAllDemoAccounts()` functions |
| `src/app/__tests__/App.routing.test.tsx` | Modify | Add `it.each(ALL_ROLES)` for route access, redirects, and group visibility |
| `src/app/shell/__tests__/SidebarNav.test.tsx` | Modify | Add `it.each(ALL_ROLES)` for sidebar rendering per role + scroll layout assertions |
| `src/features/auth/__tests__/demoCredentials.test.ts` | Modify | Tests for `getDemoAccount` — each role returns credentials, unknown returns undefined |

## Interfaces / Contracts

```typescript
// Added to src/features/auth/services/demoCredentials.ts
export type DemoAccount = {
  readonly role: AppProfileRole;
  readonly credentials: LoginCredentials;
};

/** Returns credentials for the given role, or undefined if not configured. */
export function getDemoAccount(role: AppProfileRole): LoginCredentials | undefined;

/** Returns all configured demo accounts. */
export function getAllDemoAccounts(): readonly DemoAccount[];
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getDemoAccount` — all 5 roles return credentials; unknown role → undefined | Direct calls, no mocks, no env vars |
| Unit | Scroll layout — aside has `flex-col`, nav container has `overflow-y-auto` | Render `AppShell`, assert CSS classes on aside + nav wrapper |
| Integration | Route access per role — all 5 roles see correct routes + redirects | `it.each(AppProfileRole)` in `App.routing.test.tsx` |
| Integration | Sidebar groups per role — all 5 roles render correct groups | `it.each(AppProfileRole)` in `SidebarNav.test.tsx` |

Existing tests must stay green (`npm run test:run`). The `it.each` blocks are additive — no existing test is removed or altered.

## Migration / Rollout

No migration required. Demo accounts are hardcoded — no data or env change.

## Open Questions

- None.
