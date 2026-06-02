## Review

status: **resolved via PR1 blocker-fix micro-cycle**

Original blockers from fresh review were addressed in `reservationService.ts` and `reservationService.test.ts`:

1. `update()` now persists reservation item fields (`room_type_id`, `room_id`, `guest_count`, `notes`) to `reservation_items` for the reservation primary item.
2. List filters now include date-range filtering and correct `room_id` semantics via `reservation_items` mapping to reservation IDs.
3. `listTrash()` now post-filters archived rows before paginating.
4. Purge payment blocker counting now uses `payments.invoice_id IN (<reservation invoice ids>)`.
5. Targeted tests were added and passing.

Validation summary:
- Focused tests: `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` → 10/10 pass.
- Full tests: `npm run test:run` → 51 files, 581 tests pass.
- Lint: pass.
- Build: pass.

PR1 is now ready for PR2 scope work.
