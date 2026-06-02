# Tasks — `issue-14-reservations-management`

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (service/types/tests) → PR 2 (hook + active UI + route/i18n/icons) → PR 3 (recycle bin restore/purge UX + blockers) → PR 4 (prototype polish) |
| Delivery strategy | four sequential slices targeting `features` |
| Chain strategy | sequential PRs/slices to `features` |

Decision needed before apply: Resolved — use 4 sequential slices  
Chained PRs recommended: Yes  
Chain strategy: PR 1 → PR 2 → PR 3 → PR 4, all targeting `features`  
400-line budget risk: High

---

## PR 1 — Service rules + types + RED/GREEN baseline (core domain safety)

- [x] **T1 (RED): Add reservation service test file and failing cases**  
  **Files:** `src/features/reservations/__tests__/reservationService.test.ts`  
  Add failing tests for:
  - property scope in list/detail/edit/cancel/trash/restore/purge
  - active list uses safe null strategy (`deleted_at IS NULL`)
  - trash list avoids unsafe null inequality and returns only archived rows
  - create/edit reuse issue #15 availability service
  - soft delete auth + active-stay blocker
  - restore auth + archived-only rule
  - purge admin-only + recycle-bin-only + blocker counts (invoices/payments)

- [x] **T2 (GREEN): Implement/adjust reservation domain types and service contracts**  
  **Files:** `src/features/reservations/types.ts`, `src/features/reservations/reservationService.ts`  
  Implement types for list params/result, form payload, status mapping support, purge blocker result, and service method signatures used by tests.

- [x] **T3 (GREEN): Implement service logic for active list/create/edit/cancel with issue #15 reuse**  
  **Files:** `src/features/reservations/reservationService.ts`  
  Implement property-scoped queries/mutations, lifecycle guards, and availability validation integration via existing `reservationAvailability.ts`.

- [x] **T4 (GREEN): Implement recycle-bin-safe service logic (archive list, soft delete, restore, purge)**  
  **Files:** `src/features/reservations/reservationService.ts`  
  Include InsForge null-safe handling, restore behavior, purge blocker checks/counts, and irreversible purge path.

- [x] **T5 (TRIANGULATE/REFACTOR): Expand edge tests and normalize errors**  
  **Files:** `src/features/reservations/__tests__/reservationService.test.ts`, `src/features/reservations/reservationService.ts`  
  Add coverage for status-ineligible transitions and cross-property denial paths; refactor helper functions for readability.

---

## PR 2 — Hook + active reservations UI + route + i18n + icons

- [x] **T6 (RED): Add hook tests for loading/filter/pagination/mutation refresh behavior**  
  **Files:** `src/features/reservations/__tests__/useReservations.test.ts`  
  Failing tests for:
  - default active mode load
  - server-side pagination defaults (20)
  - filter/search resets page to 1
  - mutation triggers reload
  - stale request protection

- [x] **T7 (GREEN): Implement reservations hook state/actions**  
  **Files:** `src/features/reservations/useReservations.ts`  
  Implement active/trash toggle scaffolding, params state, and mutation handlers wired to service.

- [x] **T8 (RED): Add Reservations page tests for core UI and role-based action visibility**  
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`  
  Failing tests for:
  - header/CTA/table/filter/search/pagination states
  - loading/empty/error/no-results rendering
  - role-based action visibility
  - accessible icon-only actions labels

- [x] **T9 (GREEN): Replace placeholder route with ReservationsPage and implement active management UI**  
  **Files:** `src/app/routes/routes.tsx`, `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/components/*`  
  Implement list/search/filter/status actions + create/edit/cancel flows using reuse-first component policy.

- [x] **T10 (GREEN): Add localized reservation strings in EN/ES**  
  **Files:** `src/shared/i18n/resources/en.ts`, `src/shared/i18n/resources/es.ts`  
  Add copy for labels, statuses, dialogs, errors, purge blockers, and trash actions.

- [x] **T11 (TRIANGULATE/REFACTOR): Component reuse audit and icon consistency pass**  
  **Discovery targets/files:** `src/shared/components/**/*`, `src/features/reservations/components/**/*`, `src/app/routes/routeMetadata.ts`  
  Verify reuse of existing primitives; keep reservation-specific behavior in feature scope; ensure Lucide usage only.

---

## PR 3 — Recycle bin UX + purge blockers UX + availability reuse hardening

- [x] **T12 (RED): Add integration tests for trash/restore/purge UX and strict confirmation**  
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`  
  Failing tests for:
  - trash mode listing
  - restore success path
  - purge strict confirm requirement
  - purge blocked message with invoice/payment counts

- [x] **T13 (GREEN): Implement trash/restore/purge UI flows**  
  **Files:** `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/components/*`  
  Add recycle bin toggle/view, restore action, purge dialog, blocker feedback, and authorization-aware controls.

- [x] **T14 (GREEN): Add restore-time availability safeguard using issue #15 path**  
  **Files:** `src/features/reservations/reservationService.ts`  
  Revalidate room availability on restore for assigned room/date cases; return domain error on conflict.

- [x] **T15 (TRIANGULATE/REFACTOR): Status mapping and unknown-status safety**  
  **Files:** `src/features/reservations/components/ReservationStatusBadge.tsx` (or equivalent), `src/features/reservations/types.ts`  
  Ensure supported display states and safe fallback for unknown persisted values.

---

## PR 4 — Prototype polish and optional operational panels

- [x] **T16 (RED): Add focused UI tests for approved prototype polish**  
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`  
  Add failing tests only for explicitly approved prototype enhancements, such as KPI cards or operational panels.

- [x] **T17 (GREEN): Implement approved KPI/prototype enhancements**  
  **Files:** `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/components/*`  
  Implement lightweight KPI cards and/or prototype-aligned visual refinements only if they remain reviewable.

- [ ] **T18 (GREEN): Implement side panels only if still approved and budget-safe**  
  **Files:** `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/components/*`  
  Implement right-side arrivals/departures/notes panels only after core flows are green and the reviewer budget allows it.

- [x] **T19 (TRIANGULATE/REFACTOR): Final icon, accessibility, and component reuse audit**  
  **Files:** `src/features/reservations/**/*`, `src/shared/components/**/*`  
  Confirm Lucide-only icon usage, accessible icon labels, no domain leakage into shared UI, and no unnecessary component creation.

---

## Verification tasks (must run per PR/slice)

- [x] **V1:** `npm run test:run` (RED evidence captured before GREEN in each PR)
- [x] **V2:** `npm run lint`
- [x] **V3:** `npm run build`
- [x] **V4:** Record changed-line count and confirm each PR remains reviewable against 400-line guard
- [x] **V5:** If any PR forecast exceeds budget mid-apply, pause and request delivery decision before continuing

---

## Explicit deferrals (safe to defer)

- [ ] PR 4 prototype side panels if review budget is still high after PR 1–3  
- [ ] Non-essential KPI/dashboard polish not required for acceptance criteria  
- [ ] Multi-item reservation editor beyond header-first + primary item workflow