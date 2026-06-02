status: completed-with-risk

files_changed:
- src/features/reservations/types.ts (new)
- src/features/reservations/reservationService.ts (new)
- src/features/reservations/__tests__/reservationService.test.ts (new)
- src/features/reservations/index.ts (modified)
- openspec/changes/issue-14-reservations-management/tasks.md (PR1 checkboxes)
- openspec/changes/issue-14-reservations-management/apply-progress-pr1.md (new)

red_green_refactor_evidence:
- RED:
  - Added `reservationService.test.ts` before implementation.
  - Ran `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts`.
  - Result: 7 failing tests (module `reservationService` not found), confirming RED state.
- GREEN:
  - Implemented `types.ts` and `reservationService.ts` with property-scoped operations, lifecycle guards, availability reuse, and trash/purge flows.
  - Focused tests passed: `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` (8/8 pass).
- TRIANGULATE/REFACTOR:
  - Added edge cases for soft-delete blocking when checked-in and purge rejection when record is not archived.
  - Refactored helper functions for pagination/filtering/normalization in service.

commands_run:
- npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts
  - first run: failed (RED)
  - second run: passed (GREEN)
  - third run after extra edge tests: passed (8 tests)
- npm run test:run
  - passed (51 files, 579 tests)
- npm run lint
  - passed
- npm run build
  - passed

implementation_notes:
- Property scope enforced through `withServiceContext` + `scopeOperationalQuery` in all service operations.
- Active list uses `.is("deleted_at", null)`.
- Trash list avoids `.neq("deleted_at", null)` and uses post-filter `deleted_at !== null`.
- Create/update/restore with assigned room reuse `validateRoomAvailability` from issue #15.
- Soft delete requires manager+ and blocks in-progress check-in statuses.
- Restore requires manager+, archived-only, and revalidates availability using primary reservation item.
- Purge requires administrator, archived-only, and blocks linked financial records with blocker counts.

remaining_risks:
- PR1 slice is materially above the 400-line review target (service + tests are large).
- Purge blocker counting currently uses scoped invoice/payment queries without deep invoice->payment join semantics; behavior is covered by current tests but may need tightening in later hardening.
- `cancel` service behavior implemented, but dedicated cancel-focused tests should be expanded in a future micro-cycle for deeper status matrix coverage.

pr1_complete: true

next_recommended_slice:
- PR2 / slice 2: hook + active UI + route + i18n + icons (no recycle-bin UI yet)
