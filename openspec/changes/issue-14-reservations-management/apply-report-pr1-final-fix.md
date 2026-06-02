status: completed

summary:
- Fixed the final PR1 rereview blocker: `update()` no longer ignores reservation-item update failures.
- Added a targeted RED test proving `update()` must fail when `reservation_items` persistence fails.
- Kept scope to PR1 service/tests only.

files_changed:
- src/features/reservations/__tests__/reservationService.test.ts
- src/features/reservations/reservationService.ts
- openspec/changes/issue-14-reservations-management/apply-progress-pr1.md

red_green_evidence:
- RED:
  - Added test: "fails update when reservation item persistence fails" in `reservationService.test.ts`.
  - Ran focused tests: `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts`.
  - Result: failed as expected (`result.ok` was true), proving the bug.
- GREEN:
  - Updated `update()` to capture `reservation_items` update result and return `serviceFailure("backend-error")` when item update fails.
  - Re-ran focused tests: pass (11/11).
- TRIANGULATE/REFACTOR:
  - Verified no regressions with full test suite/lint/build.

commands:
- npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts  # RED fail
- npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts  # GREEN pass (11 tests)
- npm run test:run  # pass (51 files, 582 tests)
- npm run lint  # pass
- npm run build  # pass

pr1_safe_for_pr2: true
notes:
- The final silent-failure path is now guarded; PR1 service layer is safe to support PR2 UI edit flows.
- Search remains reservation-ID based and should be aligned with PR2 UI copy/scope.