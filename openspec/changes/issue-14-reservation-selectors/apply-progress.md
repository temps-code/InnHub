# Apply Progress — issue-14-reservation-selectors

## Completed tasks
- Completed T1–T11 and V1–V6 in `tasks.md`.
- Replaced raw ID entry UX in reservation create/edit modal with selectors.
- Added guest search + selector + quick-create flow.
- Added room type selector and optional room selector filtered by room type.
- Preserved submit contract to reservation service (`primary_guest_id`, `room_type_id`, optional `room_id`).
- Updated EN/ES copy for selector-oriented labels and quick-create flow.

## Files changed
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `openspec/changes/issue-14-reservation-selectors/tasks.md`

## TDD Cycle Evidence

| Phase | Evidence |
|---|---|
| RED | Updated `ReservationsPage.test.tsx` first for selector labels/submit behavior; focused run failed because old modal still exposed raw ID fields (`Primary guest ID`, `Room type ID`, `Room ID (optional)`). |
| GREEN | Implemented selector UX and quick-create in `ReservationsPage.tsx`; focused reservation page tests passed (10/10). |
| TRIANGULATE | Added quick-create auto-select test (`quick-creates a guest and auto-selects it`) and maintained edit prefill/update payload checks with selector controls. |
| REFACTOR | Kept architecture unchanged (no new UI libs, no service overlap duplication), reused existing shared form/modal components and existing guest/room-type/room services. |

## Commands run
- `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx` (RED fail then GREEN pass)
- `npm run test:run` (PASS: 53 files, 599 tests)
- `npm run lint` (PASS)
- `npm run build` (PASS; existing Vite chunk-size warning)

## Deviations from design/spec
- Guest selector uses simple search input + backend guest list call + native select (no combobox package), aligned with required decision.
- Room and room-type selectors are native select controls and show room state where available.

## Remaining tasks / risks
- No functional blockers identified for this selector slice.
- Follow-up UX opportunity (non-blocking): room/guest picker could later evolve to richer autocomplete controls if approved.

## Workload / PR boundary
- Implemented as one focused additional PR/slice under issue #14.
- Scope remained in reservation create/edit selector UX + i18n/tests only.

## Verify-Blocker Test Coverage Fix

### Completed tasks
- Added focused ReservationsPage tests to align completed checklist evidence with strict-TDD requirements for T1, T2, T3, T4, and T10.
- Kept implementation scope unchanged (selector slice only); no new packages, no service/lifecycle expansion.

### Files changed in verify-fix cycle
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`

### TDD Cycle Evidence (verify-fix)

| Phase | Evidence |
|---|---|
| RED | Ran `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx` after adding new tests; failed with 2 failing tests (quick-create error copy assertion and submit-time validation error copy assertion). |
| GREEN | Updated assertions to actual current EN copy and re-ran focused tests; `ReservationsPage.test.tsx` passed (16/16). |
| TRIANGULATE | Added assertions for: raw ID label absence, quick-create error in modal + create payload fields, room-type filtered room options + stale-room clearing + unassigned option, assigned/unassigned submit payload boundary, submit-time validation error display, selector-load safe error, empty guest-search quick-create path, and Spanish selector copy. |
| REFACTOR | No production refactor needed; changes limited to test coverage/evidence alignment. |

### Commands run (verify-fix)
- `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx` → FAIL (RED), then PASS (16 tests)
- `npm run test:run` → PASS (53 files, 605 tests)
- `npm run lint` → PASS
- `npm run build` → PASS (existing non-blocking Vite chunk-size warning)
