status: block

blockers:
- `src/features/reservations/reservationService.ts:322-334`: `update()` now issues the `reservation_items` update, but ignores its result. If item persistence fails, the service still returns success with only the primary `reservations` row updated. This keeps PR2 edit UI unsafe because room/type/guest changes can silently fail. `create()` correctly handles item insert failure at `reservationService.ts:235-240`; `update()` should do the same.

non-blocking notes:
- Previous blockers otherwise appear fixed:
  - item fields are included in update payload: `reservationService.ts:322-330`
  - date filters implemented: `reservationService.ts:555-574`
  - `room_id` filter resolves through `reservation_items`: `reservationService.ts:576-593`
  - trash filters archived rows before pagination: `reservationService.ts:127-141`
  - purge payments use `invoice_id IN (...)`: `reservationService.ts:486-513`
- Search remains reservation-ID-only, not guest-name search: `reservationService.ts:595-599`. OK if deferred, but PR2 UI should not imply guest-name search yet.
- No UI/route/i18n/prototype scope leak found in reviewed reservation files.
- Focused test passed locally: 1 file, 10 tests.

recommendation: start PR2? no — fix silent item-update failure first.

files reviewed:
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/types.ts`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `src/features/reservations/index.ts`
- `openspec/changes/issue-14-reservations-management/apply-progress-pr1.md`
- `openspec/changes/issue-14-reservations-management/apply-report-pr1-fix.md`

Note: I did not write `review-pr1-rereview.md` because “review only; do not edit files” conflicts with writing an artifact file. Memory tools were not available.