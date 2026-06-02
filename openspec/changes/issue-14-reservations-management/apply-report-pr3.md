status: completed

files changed:
- src/features/reservations/useReservations.ts
- src/features/reservations/ReservationsPage.tsx
- src/features/reservations/components/ReservationStatusBadge.tsx
- src/features/reservations/__tests__/ReservationsPage.test.tsx
- src/features/reservations/__tests__/useReservations.test.ts
- src/shared/i18n/resources/en.ts
- src/shared/i18n/resources/es.ts
- openspec/changes/issue-14-reservations-management/tasks.md
- openspec/changes/issue-14-reservations-management/apply-progress-pr3.md

red/green/refactor evidence:
- RED:
  - Added PR3 tests first for trash toggle/view, restore confirmation flow, purge strict confirmation, purge blocker message, and hook trash-mode loading.
  - Ran focused tests before final implementation and got failures:
    - ambiguous restore button query in dialog flow test
    - missing `listTrash` mock path causing undefined result in hook test
- GREEN:
  - Implemented PR3 UI/hook behavior:
    - hook supports `showTrash`, `toggleTrash`, `remove` (soft delete), `restore`, `purge`, and uses `listTrash` when trash mode is active
    - page adds recycle-bin toggle (manager+), archive (soft delete) confirmation, restore confirmation, and admin-only purge via `StrictConfirmDialog`
    - purge blocker message renders invoice/payment counts from service conflict message
    - trash empty state and role-gated actions added
  - Re-ran focused reservation suites: pass (26 tests).
- TRIANGULATE:
  - Added/validated manager vs administrator role behavior in trash mode.
  - Added strict-confirm phrase path and blocker-message assertions for purge.
- REFACTOR:
  - Reused shared `ConfirmDialog` and `StrictConfirmDialog` instead of adding custom dialog primitives.
  - Kept icon usage in configured Lucide set and preserved conservative search behavior.
  - Updated status badge to tolerate unknown status values safely.

commands run and results:
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/useReservations.test.ts
  - RED fail (as expected while introducing PR3 tests)
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/useReservations.test.ts src/features/reservations/__tests__/reservationService.test.ts
  - pass (3 files, 26 tests)
- npm run test:run
  - pass (53 files, 597 tests)
- npm run lint
  - pass
- npm run build
  - pass

remaining risks:
- Purge blocker counts are parsed from service error message string format (`invoiceCount=... paymentCount=...`); if service error formatting changes, UI parsing must be updated.
- Workspace is stacked (PR1+PR2+PR3 uncommitted together), so per-slice diff-size isolation is approximate until parent slice/PR packaging is applied.

pr3 complete: true

next recommended slice:
- PR4 / slice 4 only (optional prototype polish: KPI/panels) and only if explicitly approved under review budget constraints.
