# Tasks — `issue-14-reservation-selectors`

## Review Workload Forecast

| Field | Value |
| --- | --- |
| Estimated changed lines | 250–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No, unless implementation forecast exceeds budget |
| Delivery strategy | One focused additional PR/slice under GitHub issue #14 targeting `features` |
| Scope guard | Reservation create/edit selector UX only |

If forecast exceeds 400 changed lines, split into guest selector/quick-create first and room selectors second.

---

## TDD Tasks

- [x] **T1 (RED): Add selector UX tests for reservation form**
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`
  Add failing tests proving:
  - raw `primary_guest_id`, `room_type_id`, and `room_id` text-entry UX is not the primary form experience;
  - guest selector/search is rendered;
  - room type select is rendered;
  - optional room select is rendered.

- [x] **T2 (RED): Add guest select and quick-create tests**
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`
  Add failing tests for:
  - searching/selecting an existing property-scoped guest;
  - quick-create calling existing guest create behavior;
  - successful quick-create auto-selecting the created guest;
  - quick-create validation errors staying inside the modal.

- [x] **T3 (RED): Add room type and room filtering tests**
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`
  Add failing tests for:
  - active room types populate the room type select;
  - rooms filter by selected room type;
  - room assignment can remain empty;
  - changing room type clears an invalid selected room;
  - room state is displayed only when available.

- [x] **T4 (RED): Add payload and validation-boundary tests**
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`
  Add failing tests proving:
  - submit payload still uses selected IDs expected by reservation service;
  - unassigned room submits `null` or omits `room_id`;
  - assigned room submits selected `room_id`;
  - UI does not implement proactive availability filtering;
  - submit-time service error is displayed for availability conflicts.

- [x] **T5 (GREEN): Load selector option data through existing services**
  **Files:** `src/features/reservations/ReservationsPage.tsx` and existing reservation hook/component files as needed
  Reuse:
  - `guestService.list`;
  - `guestService.create`;
  - `roomTypeService.list`;
  - `roomService.list`.
  Keep data property-scoped through existing service/session behavior.

- [x] **T6 (GREEN): Implement guest selector and quick-create**
  **Files:** `src/features/reservations/ReservationsPage.tsx` or reservation-specific form component
  Implement:
  - simple guest search/select;
  - quick-create using existing guest requirements;
  - auto-select after successful create;
  - inline quick-create error handling.

- [x] **T7 (GREEN): Implement room type and optional room selectors**
  **Files:** `src/features/reservations/ReservationsPage.tsx` or reservation-specific form component
  Implement:
  - active room type select;
  - optional room select filtered by selected room type;
  - “no room assigned” option;
  - clear invalid room when room type changes;
  - optional room state labels if available.

- [x] **T8 (GREEN): Preserve existing reservation service submit contract**
  **Files:** `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/useReservations.ts` if needed
  Ensure create/edit submit still calls the existing reservation mutation path with:
  - `primary_guest_id`;
  - `room_type_id`;
  - optional `room_id`;
  - dates;
  - guest count;
  - status/notes as already supported.

- [x] **T9 (GREEN): Update EN/ES i18n copy**
  **Files:** `src/shared/i18n/resources/en.ts`, `src/shared/i18n/resources/es.ts`
  Add or update aligned strings for:
  - guest selector/search;
  - guest quick-create;
  - room type select;
  - optional room select;
  - no-room option;
  - selector validation/errors;
  - loading/empty option states where needed.

- [x] **T10 (TRIANGULATE): Add edit-mode preselection and edge-case coverage**
  **Files:** `src/features/reservations/__tests__/ReservationsPage.test.tsx`
  Add coverage for:
  - edit modal preselects existing guest, room type, and room;
  - failed option loading shows safe error/empty state;
  - empty guest search can still open quick-create;
  - Spanish selector or quick-create copy exists.

- [x] **T11 (REFACTOR): Keep selector code reviewable**
  **Files:** `src/features/reservations/ReservationsPage.tsx`, `src/features/reservations/components/*` if needed
  Refactor only after green:
  - extract small reservation-specific selector components if needed;
  - do not add reservation-specific behavior to shared UI;
  - do not introduce a combobox package or icon library.

---

## Verification Tasks

- [x] **V1:** Capture RED evidence from failing selector tests before implementation.
- [x] **V2:** Run `npm run test:run` after GREEN implementation.
- [x] **V3:** Run `npm run lint`.
- [x] **V4:** Run `npm run build`.
- [x] **V5:** Record changed-line count and confirm the PR remains within or acceptably near the 400-line budget.
- [x] **V6:** Confirm no new GitHub issue was opened and the work remains a PR/slice under issue #14.

---

## Explicit Deferrals

- [ ] Proactive room/date availability filtering.
- [ ] New availability engine.
- [ ] New combobox/autocomplete package.
- [ ] Full guest management inside reservation modal.
- [ ] Reservation lifecycle/schema changes.
- [ ] Multi-room or multi-item reservation editor.
