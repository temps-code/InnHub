status: completed

summary:
- Fixed PR2 review blocker in edit flow.
- Added RED tests for create/edit submit payloads.
- Updated edit prefill to use real row item fields (`room_type_id`, `room_id`, `guest_count`) instead of unsafe defaults.
- Hydrated active/trash list rows with primary reservation-item fields so edit modal has required data.
- Kept search copy conservative (ID/reference only).

files_changed:
- src/features/reservations/__tests__/ReservationsPage.test.tsx
- src/features/reservations/ReservationsPage.tsx
- src/features/reservations/reservationService.ts
- src/features/reservations/types.ts
- openspec/changes/issue-14-reservations-management/apply-progress-pr2.md

red_green_evidence:
- RED:
  - Added page tests for create/edit submit payloads.
  - Ran `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx`.
  - Result: failed on edit prefill expectation (`room_type_id` empty).
- GREEN:
  - Fixed `ReservationsPage` edit prefill to use row item fields.
  - Added service hydration helper to include primary item fields on list rows.
  - Re-ran focused reservation tests: pass (23/23).
- TRIANGULATE:
  - Added assertions that create/update submit payloads carry required item fields.
- REFACTOR:
  - Minimal type compatibility update (`Reservation` optional item fields).
  - Centralized item hydration in service helper.

commands:
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx  # RED fail
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/useReservations.test.ts src/features/reservations/__tests__/reservationService.test.ts  # pass (23 tests)
- npm run test:run  # pass (53 files, 594 tests)
- npm run lint  # pass
- npm run build  # pass

pr2_safe_for_pr3: true

notes:
- No trash/restore/purge UI added in this fix cycle.
- No PR4 prototype side panels/KPIs added.
- Search behavior remains ID/reference-based by design in PR2.
