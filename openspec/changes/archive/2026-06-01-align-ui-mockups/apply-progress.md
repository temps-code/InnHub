# Apply Progress — align-ui-mockups

## Status
Repair pass completed on `features` after user visual review feedback. Login and landing compositions were restructured to match prototypes more closely, dark-mode-safe login background was fixed, and quality gates are passing.

## Completed work
- Added strict-TDD RED tests for prototype-aligned login/landing user-observable presentation contracts in `src/app/__tests__/PreferenceIntegration.test.tsx`.
- Aligned login shell and card visuals toward `docs/assets/login.png` in:
  - `src/app/pages/LoginPage.tsx`
  - `src/features/auth/components/LoginForm.tsx`
- Aligned landing hero CTA/card visuals toward `docs/assets/landing.png` in:
  - `src/app/pages/PublicHomePage.tsx`
- Added semantic token support used by login/landing refinements in `src/index.css`:
  - `--color-border-strong`
  - `--color-surface-raised`
  - `--color-focus-ring`
- Updated CTA copy for parity with mockup intent in i18n resources:
  - `src/shared/i18n/resources/en.ts`
  - `src/shared/i18n/resources/es.ts`
- Aligned app shell surfaces toward mockup direction while preserving behavior in:
  - `src/app/shell/AppShell.tsx`
  - `src/app/shell/SidebarNav.tsx`
  - `src/app/shell/TopBar.tsx`
- Added strict-TDD RED assertions for shell user-observable visual/navigation contracts in:
  - `src/app/shell/__tests__/SidebarNav.test.tsx`
  - `src/app/__tests__/PreferenceIntegration.test.tsx`
- Repaired login composition to match `docs/assets/login.png` direction with a responsive two-column layout and theme-token-safe background (no hard-coded light-only gradient):
  - `src/app/pages/LoginPage.tsx`
- Repaired landing composition to match `docs/assets/landing.png` direction with top header nav, left hero + CTA, right dashboard preview mockup markup, and module grid below:
  - `src/app/pages/PublicHomePage.tsx`
- Removed the foundation/project-status card from landing (not present in prototype).
- Expanded i18n resources for new landing/login composition copy and preview labels:
  - `src/shared/i18n/resources/en.ts`
  - `src/shared/i18n/resources/es.ts`
- Updated integration/i18n tests to durable user-observable assertions for the repaired composition:
  - `src/app/__tests__/PreferenceIntegration.test.tsx`
  - `src/app/__tests__/App.i18n.test.tsx`

## TDD Cycle Evidence

| Cycle | RED (failing first) | GREEN (minimal production change) | TRIANGULATE/REFACTOR | Evidence |
|---|---|---|---|---|
| Login + landing visual contracts | Added new assertions in `PreferenceIntegration.test.tsx`; test run failed on missing login radial shell/card classes and landing CTA style/text expectations. | Updated `LoginPage`, `LoginForm`, `PublicHomePage`, `index.css`, and i18n copy to satisfy assertions while preserving auth/routes. | Kept changes localized and semantic-token based; avoided behavior logic changes and avoided prototype HTML import. | `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx` (failed, then passed) |
| Regression safety | Re-ran auth/routing-focused tests after visual changes. | N/A | N/A | `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/app/__tests__/App.routing.test.tsx` |
| Slice verification gate | Full suite + quality gates. | N/A | N/A | `npm run test:run`, `npm run lint`, `npm run build` |
| Shell visual contracts | Added shell assertions first; test run failed on missing sticky topbar and sidebar visual classes (`md:w-[260px]`, `shadow-[var(--shadow-panel)]`). | Updated `AppShell`, `SidebarNav`, and `TopBar` classes only (no route/auth logic changes) to satisfy shell visual assertions and preserve drawer interactions. | Extracted `navItemBaseClass` in `SidebarNav` to reduce duplication while keeping role-filtering and `onClose` behavior intact. | `npm run test:run -- src/app/shell/__tests__/SidebarNav.test.tsx src/app/__tests__/PreferenceIntegration.test.tsx` (failed, then passed) |
| Assertion-quality repair | Fresh verify failed because new tests asserted exact Tailwind/arbitrary classes. | Replaced brittle CSS-class checks with accessible/user-observable assertions for login, landing CTA targets, module list presence, sidebar brand, and navigation landmarks. | Kept route/auth/drawer coverage intact and avoided extra production changes. | `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx src/app/shell/__tests__/SidebarNav.test.tsx`, `npm run test:run`, `npm run lint`, `npm run build` (all pass; lint warning pre-existing) |
| Composition fidelity repair (user-requested) | Added prototype-composition assertions in `PreferenceIntegration.test.tsx`; test run failed due missing two-column login narrative/overview and missing landing header + preview composition. | Reworked `LoginPage` and `PublicHomePage` composition, removed the old landing status card, and added i18n keys needed for new structural content while preserving auth/routes/permissions. | Updated `App.i18n.test.tsx` for the new landing copy and robust duplicate-safe text expectations (`getAllByText` where content now appears in multiple sections). | `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx` (RED fail), then `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx src/app/__tests__/App.i18n.test.tsx` (GREEN pass), then full gates pass |

## Commands run
- `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx` (RED fail, then GREEN pass)
- `npm run test:run -- src/features/auth/__tests__/LoginForm.test.tsx src/app/__tests__/App.routing.test.tsx` (pass)
- `npm run test:run` (pass)
- `npm run lint` (pass with 1 pre-existing warning in `src/shared/components/molecules/FormField.tsx`)
- `npm run build` (pass)
- `npm run test:run -- src/app/shell/__tests__/SidebarNav.test.tsx src/app/__tests__/PreferenceIntegration.test.tsx` (RED fail, then GREEN pass)
- `npm run test:run` (pass after shell slice)
- `npm run lint` (pass; same pre-existing warning)
- `npm run build` (pass after shell slice)
- `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx src/app/shell/__tests__/SidebarNav.test.tsx` (pass after assertion-quality repair)
- `npm run test:run` (pass after assertion-quality repair: 41 files, 513 tests)
- `npm run lint` (pass after assertion-quality repair; same pre-existing warning)
- `npm run build` (pass after assertion-quality repair)
- `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx` (RED fail for composition fidelity repair)
- `npm run test:run -- src/app/__tests__/PreferenceIntegration.test.tsx src/app/__tests__/App.i18n.test.tsx` (GREEN pass)
- `npm run test:run` (pass after composition repair: 41 files, 513 tests)
- `npm run lint` (pass after composition repair; same pre-existing warning)
- `npm run build` (pass after composition repair)

## Files changed
- `src/app/__tests__/PreferenceIntegration.test.tsx`
- `src/app/__tests__/App.i18n.test.tsx`
- `src/app/pages/LoginPage.tsx`
- `src/app/pages/PublicHomePage.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/index.css`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `src/app/shell/AppShell.tsx`
- `src/app/shell/SidebarNav.tsx`
- `src/app/shell/TopBar.tsx`
- `src/app/shell/__tests__/SidebarNav.test.tsx`

## Workload / PR boundary
- Current cumulative code diff summary after composition repair: `12 files changed, 782 insertions(+), 220 deletions(-)`.
- Estimated changed lines cumulative: **1002** (exceeds 400-line budget).
- Boundary delivered: **Landing + Login + shell/sidebar/topbar + supporting style tokens/tests**.
- **Size exception rationale:** user explicitly approved a single-PR exception for this repair pass because the prior within-budget apply did not match prototype composition expectations.

## Deviations from design/tasks
- Tasks originally suggested PR 1 as tokens/shared primitives first; apply prioritized user directive to align **login and landing first**, while still introducing only minimal token support.
- No auth logic, backend, RLS, routes, or permission behavior changed.

## Remaining tasks
- Optional visual fine-tuning only if reviewer requests closer parity; functional scope for issue #99 is implemented in this apply pass.
- Keep monitoring unchanged pre-existing lint warning in `src/shared/components/molecules/FormField.tsx` (out of scope for this issue).
- Run a fresh visual check against `docs/assets/login.png` and `docs/assets/landing.png` before any commit/PR decision.
