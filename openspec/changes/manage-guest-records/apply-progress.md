# Apply Progress — manage-guest-records

## Scope
PR slices completed so far:
- **PR 1**: service/types/tests
- **PR 2**: shared reusable UI primitives/tests
- **PR 3**: guests hook + prototype-aligned page + route wiring + i18n + tests

## Completed Tasks
- [x] PR 1 RED: added failing guest service contract tests.
- [x] PR 1 GREEN: implemented `types.ts` and `guestService.ts`.
- [x] PR 1 TRIANGULATE: added edge tests for normalization/date boundary/backend-error safety.
- [x] PR 1 REFACTOR: extracted/kept focused helpers for list pagination, single-record normalization, and safe result handling.
- [x] PR 2 RED: added failing tests for reusable shared components (`InitialsAvatar`, `PaginationControls`, `StrictConfirmDialog`).
- [x] PR 2 GREEN: implemented generic shared components and barrel exports.
- [x] PR 2 TRIANGULATE/REFACTOR: added edge/accessibility tests (zero-state pagination, strict confirm processing guard, initials fallback) and validated generic/no-domain behavior.
- [x] PR 3 RED: added failing hook + guests page tests and a route test for `/app/guests`.
- [x] PR 3 GREEN: implemented `useGuests`, `GuestsPage`, route wiring, and guest EN/ES i18n keys.
- [x] PR 3 TRIANGULATE/REFACTOR: tightened UI behavior coverage (strict purge confirmation flow, permission visibility, selection panel content, no fake stays/billing sections, and pagination/search interactions).
- [x] Verify-repair RED: added failing tests for activity filter behavior, no-results state copy, Spanish pagination labels, and required document fields.
- [x] Verify-repair GREEN: implemented reservation-derived activity filtering in guest service, distinct no-results UI state, localized pagination/strict-confirm prompt plumbing, and required `document_type`/`document_number` validation.
- [x] Verify-repair TRIANGULATE/REFACTOR: added trash-mode activity filter coverage and aligned form defaults/tests after required-field validation changes.
- [x] Runtime/UI repair RED: added failing tests for trash list null-filter fallback, new metric labels/values, and unified toolbar action placement.
- [x] Runtime/UI repair GREEN: replaced DB-side trash not-null filtering with safe in-memory trash filtering and updated guests page metrics/toolbar/layout for the reported UX issues.
- [x] Runtime/UI repair TRIANGULATE/REFACTOR: tightened assertions for full-width section class and removed obsolete metric labels from UI.
- [x] Layout polish RED: added failing tests for full-width AppShell workspace, no duplicate guests heading, full-width guests content wrapper, and table overflow/min-width safeguards.
- [x] Layout polish GREEN: removed AppShell workspace max-width/centering, removed guests internal title/description block, expanded guests content layout, and added table viewport overflow with min-width.
- [x] Layout polish TRIANGULATE/REFACTOR: removed hardcoded bright metric-card border tones in favor of theme-safe neutral border tokens and updated localized heading expectations.

## Files Changed
- `src/features/guests/types.ts`
- `src/features/guests/guestService.ts`
- `src/features/guests/__tests__/guestService.test.ts`
- `src/shared/components/atoms/InitialsAvatar.tsx`
- `src/shared/components/atoms/__tests__/InitialsAvatar.test.tsx`
- `src/shared/components/atoms/index.ts`
- `src/shared/components/molecules/PaginationControls.tsx`
- `src/shared/components/molecules/__tests__/PaginationControls.test.tsx`
- `src/shared/components/molecules/index.ts`
- `src/shared/components/organisms/StrictConfirmDialog.tsx`
- `src/shared/components/organisms/__tests__/StrictConfirmDialog.test.tsx`
- `src/shared/components/organisms/index.ts`
- `src/features/guests/useGuests.ts`
- `src/features/guests/GuestsPage.tsx`
- `src/features/guests/index.ts`
- `src/features/guests/__tests__/useGuests.test.ts`
- `src/features/guests/__tests__/GuestsPage.test.tsx`
- `src/app/routes/routes.tsx`
- `src/app/__tests__/App.routing.test.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `src/app/shell/AppShell.tsx`
- `src/app/shell/TopBar.tsx`
- `src/app/shell/__tests__/SidebarNav.test.tsx`
- `src/app/shell/__tests__/TopBar.test.tsx`
- `src/shared/components/molecules/MetricCard.tsx`
- `openspec/changes/manage-guest-records/apply-progress.md`

## TDD Cycle Evidence

| Cycle | Change | Command | Evidence |
|---|---|---|---|
| RED (PR1) | Added `guestService` tests before implementation | `npm run test:run -- guestService` | Failed (missing `../types` and `../guestService`, 10 failing tests) |
| GREEN (PR1) | Implemented guests types + service | `npm run test:run -- guestService` | Passed (10 tests) |
| TRIANGULATE (PR1) | Added boundary/error edge tests (past reservation does not block soft delete, purge backend-error safety) | `npm run test:run -- guestService` | Passed (12 tests) |
| RED (PR2) | Added tests for new shared components before implementation | `npm run test:run -- InitialsAvatar PaginationControls StrictConfirmDialog` | Failed (3 suites failed: missing component modules) |
| GREEN (PR2) | Implemented shared components and exports | `npm run test:run -- InitialsAvatar PaginationControls StrictConfirmDialog` | Passed (3 files, 9 tests) |
| TRIANGULATE/REFACTOR (PR2) | Added edge/accessibility assertions (zero-state pagination, processing guard) | `npm run test:run -- InitialsAvatar PaginationControls StrictConfirmDialog` | Passed (3 files, 11 tests) |
| REFACTOR/FINAL (PR2) | Full suite after PR2 changes | `npm run test:run` | Passed (45 files, 540 tests) |
| RED (PR3) | Added `useGuests`, `GuestsPage`, and guests route tests before implementation | `npm run test:run -- useGuests GuestsPage App.routing` | Failed (missing `../useGuests` and `../GuestsPage` modules) |
| GREEN/TRIANGULATE (PR3) | Implemented hook/page/route/i18n and iterated on edge/UI assertions | `npm run test:run -- useGuests GuestsPage App.routing` | Passed (3 files, 49 tests) |
| REFACTOR/FINAL (PR3) | Full suite after PR3 changes | `npm run test:run` | Passed (47 files, 553 tests) |
| QUALITY (PR3) | Lint and build validation | `npm run lint` / `npm run build` | Lint: passed with pre-existing warning in `FormField.tsx`; Build: passed (vite chunk-size warning only) |
| RED (verify-repair) | Added assertions for service activity filtering, no-results copy, Spanish pagination labels, and required doc fields | `npm run test:run -- guestService GuestsPage` | Failed (5 tests: activity filter behavior, no-results copy, Spanish pagination aria labels, required doc fields) |
| GREEN (verify-repair) | Implemented service/UI/i18n/schema fixes for verify findings | `npm run test:run -- guestService GuestsPage PaginationControls StrictConfirmDialog` | Passed (4 files, 28 tests) |
| TRIANGULATE (verify-repair) | Added trash-mode activity filter coverage and reran focused suites | `npm run test:run -- guestService GuestsPage PaginationControls StrictConfirmDialog` | Passed (4 files, 29 tests) |
| REFACTOR/FINAL (verify-repair) | Aligned form defaults/tests after required field update and reran broad guest suites | `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog` | Passed (5 files, 35 tests) |
| QUALITY (verify-repair) | Final project gates after repair | `npm run test:run` / `npm run lint` / `npm run build` | Test: 47 files, 556 tests passed. Lint: pre-existing `FormField.tsx` warning only. Build: passed with Vite chunk-size warning. |
| RED (runtime-ui-repair) | Added failing assertions for trash null-filter fallback, new metric cards, and unified toolbar action row | `npm run test:run -- guestService GuestsPage` | Failed (3 tests across `guestService`/`GuestsPage`) |
| GREEN (runtime-ui-repair) | Implemented in-memory trash filtering, toolbar composition update, and new metric cards (total real + 0 placeholders) | `npm run test:run -- guestService GuestsPage` | Passed (2 files, 22 tests) |
| TRIANGULATE/REFACTOR (runtime-ui-repair) | Added/kept focused coverage for full-width section class and removed obsolete metric labels | `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog` | Passed (5 files, 36 tests) |
| QUALITY (runtime-ui-repair) | Final project gates after runtime/UI repair | `npm run test:run` / `npm run lint` / `npm run build` | Test: 47 files, 557 tests passed. Lint: pre-existing `FormField.tsx` warning only. Build: passed with Vite chunk-size warning. |
| RED (layout-polish) | Added assertions for full-width shell workspace, no internal guests heading duplication, full-width guests content, and table overflow/min-width protection | `npm run test:run -- GuestsPage SidebarNav` | Failed (4 tests: shell workspace max-width removal, duplicate heading, missing `guests-content` test id/class, missing table viewport/min-width hooks) |
| GREEN (layout-polish) | Implemented shell/page/layout changes and metric-card neutral border tokens | `npm run test:run -- GuestsPage SidebarNav` | Passed (2 files, 30 tests) |
| TRIANGULATE/REFACTOR (layout-polish) | Added/kept focused assertions for neutral metric-card borders and localized no-heading behavior | `npm run test:run -- GuestsPage SidebarNav` | Passed (2 files, 30 tests) |
| QUALITY (layout-polish) | Final targeted + project gates after layout polish | `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog SidebarNav` / `npm run test:run` / `npm run lint` / `npm run build` | Targeted: 6 files, 59 tests passed. Full: 47 files, 558 tests passed. Lint: pre-existing `FormField.tsx` warning only. Build: passed with Vite chunk-size warning. |
| RED (shell-guests-ui-repair) | Added failing assertions for removing guest profile preview panel, icon presence in guests cards/controls, removing topbar property selector, removing sidebar property card, and desktop topbar no-wrap alignment | `npm run test:run -- GuestsPage SidebarNav TopBar` | Failed (4 tests first, then 3 failures after partial fixes) |
| GREEN (shell-guests-ui-repair) | Removed sidebar property card and topbar property selector, stabilized topbar row alignment/height, removed guests profile preview panel, widened table usage, and added lucide icons for metrics/controls/actions | `npm run test:run -- GuestsPage SidebarNav TopBar` | Passed (3 files, 31 tests) |
| TRIANGULATE/REFACTOR (shell-guests-ui-repair) | Tightened shell + guests assertions and validated broader impacted suites | `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog SidebarNav TopBar` | Passed (7 files, 60 tests) |
| QUALITY (shell-guests-ui-repair) | Final project gates after shell/guests UI repair | `npm run test:run` / `npm run lint` / `npm run build` | Full: 48 files, 559 tests passed. Lint: pre-existing `FormField.tsx` warning only. Build: passed with Vite chunk-size warning. |

## Verification Commands Run
- `npm run test:run -- guestService`
- `npm run test:run -- InitialsAvatar PaginationControls StrictConfirmDialog`
- `npm run test:run`
- `npm run test:run -- useGuests GuestsPage App.routing`
- `npm run test:run -- guestService GuestsPage`
- `npm run test:run -- guestService GuestsPage PaginationControls StrictConfirmDialog`
- `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog`
- `npm run test:run -- guestService GuestsPage`
- `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog`
- `npm run test:run -- GuestsPage SidebarNav`
- `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog SidebarNav`
- `npm run test:run -- GuestsPage SidebarNav TopBar`
- `npm run test:run -- useGuests guestService GuestsPage PaginationControls StrictConfirmDialog SidebarNav TopBar`
- `npm run test:run`
- `npm run lint`
- `npm run build`

## Design Deviations
- Trash listing intentionally avoids DB-side `neq("deleted_at", null)` due runtime query-builder null-filter limitations; it now fetches property-scoped rows and filters `deleted_at !== null` in memory.
- Activity filters are reservation-derived and property-scoped. For `withOpenReservations` / `withoutOpenReservations`, service fetches scoped open reservation guest ids then applies filtered pagination safely in-memory to preserve correct behavior under current query API limits.
- `StrictConfirmDialog` remains domain-neutral and now receives localized phrase prompt/labels via `GuestsPage` props.
- Prototype-inspired summary cards now prioritize requested operational metrics: total guests (real), returning guests (0 placeholder), active stays (0 placeholder), pending invoices (0 placeholder).
- App workspace now uses full available horizontal width (no global `mx-auto`/`max-w-[1240px]` cap in `AppShell`), and guests page no longer duplicates the route title/description already rendered in TopBar.
- Guests metrics now rely on theme-safe neutral borders (no bright hardcoded `border-sky/emerald/amber` tones in metric cards).
- Guests profile preview side panel was removed so the table/list uses the available width; topbar property selector and sidebar bottom property card were removed because property switching is not supported in single-property accounts.

## Remaining Tasks
- None for chained PR slices 1–3 of `manage-guest-records` apply scope.
- Optional follow-up: verify runtime operator support for advanced server-side activity filter behavior with real InsForge data in manual QA.

## Workload / PR Boundary
- This apply run stayed inside **PR 3 boundary**: hook/page/routing/i18n/tests only, reusing PR1 service and PR2 shared primitives.
- No new backend schema/migration work and no unrelated module rewrites were introduced.
