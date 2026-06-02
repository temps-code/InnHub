status: completed

files_changed:
- src/features/reservations/__tests__/ReservationsPage.test.tsx
- openspec/changes/issue-14-reservation-selectors/apply-progress.md

red_green_evidence:
- RED:
  - Added missing focused test coverage in `ReservationsPage.test.tsx` for verify blockers (T1/T2/T3/T4/T10).
  - Ran: `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx`.
  - Result: failed (2 tests):
    - quick-create error copy assertion mismatch
    - submit-time validation error copy assertion mismatch
- GREEN:
  - Kept implementation unchanged; corrected assertions to current EN copy.
  - Re-ran focused suite: `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx`.
  - Result: pass (16/16).
- TRIANGULATE:
  - Added explicit assertions for:
    - raw modal ID labels absent and selector labels present
    - quick-create error stays in modal and `guestService.create` receives required fields
    - room options filtered by selected room type
    - unassigned-room option exists
    - stale selected room clears when room type changes
    - room state visibility in option labels when available
    - assigned vs unassigned room payload submission boundaries
    - submit-time validation/service error is displayed
    - selector-load failure shows safe error state
    - empty guest search still allows quick-create
    - Spanish selector copy exists
- REFACTOR:
  - No production refactor needed; changes were test/evidence alignment only.

commands_run:
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx
  - first run: fail (RED)
  - second run: pass (16 tests)
- npm run test:run
  - pass (53 files, 605 tests)
- npm run lint
  - pass
- npm run build
  - pass (existing Vite chunk-size warning only)

remaining_risks:
- Purge blocker count UI still parses `invoiceCount/paymentCount` from service error message strings (non-blocking; pre-existing follow-up).
- Room/guest filters in the page remain ID-based controls (accepted in current scope; UX enhancement can be future work).

ready_to_rerun_verify: yes
