status: completed

blockers_fixed:
  - update() now persists reservation item fields (`room_type_id`, `room_id`, `guest_count`, `notes`) to `reservation_items` primary row.
  - Reservation list filtering now supports date filters (`checkInFrom/checkInTo/checkOutFrom/checkOutTo`).
  - `room_id` filtering now resolves through `reservation_items` and filters reservations by matching `reservation_id`.
  - `listTrash()` now applies archived post-filter (`deleted_at !== null`) before pagination.
  - Purge payment blockers now count only payments linked to reservation invoices via `invoice_id IN (<reservation invoice ids>)`.
  - Added targeted tests for update item persistence, date/room filters, trash pagination ordering, and purge payment linkage.

files_changed:
  - src/features/reservations/reservationService.ts
  - src/features/reservations/__tests__/reservationService.test.ts
  - openspec/changes/issue-14-reservations-management/apply-progress-pr1.md

red_green_evidence:
  red:
    - Added targeted tests first in `reservationService.test.ts` for all four review blockers.
  green:
    - Implemented service fixes in `reservationService.ts`.
    - Focused test suite passes: 10/10 tests.
  triangulate:
    - Added stronger assertions for trash `total` and payments `invoice_id` linkage.
  refactor:
    - Consolidated in-memory filter/pagination helpers used by list/listTrash while preserving property scoping.

commands_run:
  - command: npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts
    result: pass (1 file, 10 tests)
  - command: npm run test:run
    result: pass (51 files, 581 tests)
  - command: npm run lint
    result: pass
  - command: npm run build
    result: pass

remaining_risks:
  - List/search remains ID-based for `search`; guest-name search behavior should be completed/verified in later slice if required by UI contract.
  - Pagination is now correctness-first (post-filter then paginate) and may need optimization once PR2/PR3 data-shape is finalized.

pr1_ready_for_pr2: true
