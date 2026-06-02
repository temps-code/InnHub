status: completed

blockers_fixed:
  - Lifecycle action visibility fixed in `ReservationsPage`: edit/cancel/archive now follow status eligibility (not role-only).
  - Date-range, room, and guest filter controls exposed in UI and wired to hook setters.
  - Guest-name search implemented in service filtering using property-scoped guest lookup (`first_name` + `last_name`) plus reservation reference/ID search.
  - Soft-delete now checks linked active `stays` records (via reservation items) in addition to status-based blocking.

files_changed:
  - src/features/reservations/ReservationsPage.tsx
  - src/features/reservations/useReservations.ts
  - src/features/reservations/reservationService.ts
  - src/features/reservations/types.ts
  - src/features/reservations/__tests__/ReservationsPage.test.tsx
  - src/features/reservations/__tests__/reservationService.test.ts
  - src/shared/i18n/resources/en.ts
  - src/shared/i18n/resources/es.ts
  - openspec/changes/issue-14-reservations-management/apply-progress-verify-fix.md

red_green_evidence:
  red:
    - Added/updated tests first for all verify blockers:
      - lifecycle-aware action visibility and filter controls in `ReservationsPage.test.tsx`
      - guest-name search and linked active-stay soft-delete blocker in `reservationService.test.ts`
    - Focused RED run failed with expected gaps (7 failing tests).
  green:
    - Implemented page/hook/service/i18n fixes.
    - Focused reservation tests passed (26/26).
  triangulate:
    - Added stronger assertions for each new filter setter and status-ineligible action absence.
  refactor:
    - Kept service/hook architecture intact; added small eligibility helpers in page and reused existing filter pipeline in service.

commands_run:
  - command: npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/reservationService.test.ts
    result: fail (RED, expected)
  - command: npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/reservationService.test.ts src/features/reservations/__tests__/useReservations.test.ts
    result: pass (3 files, 26 tests)
  - command: npm run test:run
    result: pass (53 files, 598 tests)
  - command: npm run lint
    result: pass
  - command: npm run build
    result: pass (existing Vite chunk-size warning only)

remaining_risks:
  - Purge blocker count UI still parses `invoiceCount/paymentCount` from service message string; functional now but fragile if message format changes.
  - Workspace remains stacked (PR1–PR3 + verify-fix changes uncommitted), so review packaging must preserve slice boundaries externally.

ready_to_rerun_sdd_verify: true
