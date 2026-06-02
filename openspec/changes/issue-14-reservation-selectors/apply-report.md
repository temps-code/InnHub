status: completed

files_changed:
- src/features/reservations/ReservationsPage.tsx
- src/features/reservations/__tests__/ReservationsPage.test.tsx
- src/shared/i18n/resources/en.ts
- src/shared/i18n/resources/es.ts
- openspec/changes/issue-14-reservation-selectors/tasks.md
- openspec/changes/issue-14-reservation-selectors/apply-progress.md

red_green_refactor_evidence:
- RED:
  - Updated `ReservationsPage.test.tsx` first to assert selector-based form behavior.
  - Focused run failed before implementation because labels/controls still reflected raw ID entry (`Primary guest ID`, `Room type ID`, `Room ID (optional)`).
- GREEN:
  - Implemented selector UX in reservation modal:
    - guest search input + guest select (property-scoped guest list)
    - guest quick-create using existing `guestService.create` required fields
    - auto-select newly created guest
    - room type select from active room types
    - optional room select filtered by selected room type
    - stale room cleared when room type changes
  - Preserved existing reservation submit contract and service authority for availability validation.
  - Focused page tests passed (10/10).
- TRIANGULATE:
  - Added explicit quick-create auto-select test.
  - Kept/validated create and edit payload assertions with selector controls.
- REFACTOR:
  - Reused existing shared components (`Modal`, `FormField`, `Button`, `Alert`) and existing services (`guestService`, `roomTypeService`, `roomService`).
  - No new UI/icon library and no overlap logic duplication in React components.

commands_run:
- npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx
  - first run: fail (RED)
  - second run: pass (GREEN, 10 tests)
- npm run test:run
  - pass (53 files, 599 tests)
- npm run lint
  - pass
- npm run build
  - pass (existing Vite chunk-size warning only)

remaining_risks:
- Quick-create uses required guest fields only (by design); richer inline guest profile editing is intentionally out-of-scope.
- Selector UX currently uses native search+select controls (intended); future autocomplete UX can be a separate improvement.

ready_for_verify: yes

notes:
- Scope stayed as one focused additional slice under issue #14.
- Estimated diff for this selector slice is kept near the 400-line guard (focused file set diff is ~292 lines).
