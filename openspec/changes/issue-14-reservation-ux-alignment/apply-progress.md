# Apply Progress — issue-14-reservation-ux-alignment

## Scope Applied
- Applied **Slice A only** (labels, human filters, readable table, no visible raw IDs, EN/ES copy).
- Did **not** apply Slice B or Slice C in this run.

## Completed Tasks (Slice A)
- RED/GREEN/TRIANGULATE/REFACTOR checkboxes for Slice A were updated to complete in `tasks.md`.
- Added/updated tests for:
  - grouped check-in/check-out labels;
  - human room/guest filters;
  - readable reservation reference/guest/room summary rendering;
  - no visible raw reservation/guest/room IDs in normal table UX;
  - EN copy assertions for new controls and readable values.
- Replaced raw room/guest filter inputs with selector controls.
- Added grouped date filter sections (Check-in and Check-out with From/To).
- Updated reservation list hydration to include readable display fields (reference, guest name, room identifier, room type label, item summary).
- Updated EN/ES resources for new labels/options and table copy.

## Files Changed
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/types.ts`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/tasks.md`

## TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| A1 Filters + labels + readable table | Updated `ReservationsPage.test.tsx` expectations for grouped labels, human filter controls, readable table values, and no raw IDs; focused run failed (3 failing tests). | Implemented grouped date filter blocks, room/guest `<select>` filters, table readable fields, and hydration support in service/types; focused tests pass. | Added assertions for empty filter states (`All guests`/`All rooms`) and human-value filter submissions using service-compatible IDs. | Extracted `formatReservationReference` helper in service; kept reservation-specific logic inside reservations feature layer. |

## Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx` ✅
- `npm run test:run` ✅
- `npm run lint` ✅
- `npm run build` ✅ (with existing chunk-size warning only)

## Workload / PR Boundary
- Intended boundary: **Slice A only**.
- Review-budget evidence from tracked delta in this run: `+278 / -0` across tracked files (i18n + tasks currently tracked).
- Note: reservation feature files are currently untracked in workspace baseline, so repo-level line accounting is polluted by prior unpublished work. Slice A logical boundary is still enforced by scope (no Slice B/C code applied in this run).

## Deviations from Design
- None functionally for Slice A.
- Date-group captions reuse existing `reservations.table.checkIn/checkOut` strings instead of introducing extra keys.

## Additional Slice A Cleanup (post-review notes)
- Addressed reviewer note: existing reservations with multiple `reservation_items` now hydrate into a **combined readable item summary** (instead of first item only).
- Addressed reviewer note: action aria labels now use `reservation.reference` (fallback to id only if reference missing), avoiding raw-id exposure in normal accessible UX.

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| A2 Slice A cleanup — multi-item summary + aria labels | Added failing tests in `reservationService.test.ts` for multi-item combined summary (`"101 · Standard, 201 · Suite"`) and updated `ReservationsPage.test.tsx` expectations for action labels using reservation reference; focused run failed (5 tests). | Updated `hydrateReservationsWithPrimaryItems` to group items per reservation and build combined readable summaries from all items; updated ReservationsPage action `aria-label` bindings to use `reservation.reference`. | Kept UI assertions covering active and trash actions (`edit/cancel/archive/purge`) to ensure labels consistently use references; validated readable combined summary rendering in table tests. | Kept all behavior inside `src/features/reservations`; no shared-component or UI-library changes. |

## Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts src/features/reservations/__tests__/ReservationsPage.test.tsx` ✅
- `npm run test:run` ✅ (53 files, 606 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

## Files Changed (cleanup cycle)
- `src/features/reservations/__tests__/reservationService.test.ts`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/ReservationsPage.tsx`

## Slice B — Multi-Item Create/Edit

### Scope Applied
- Applied **Slice B only** on top of completed Slice A.
- Kept Slice C untouched in this run.

### Completed Tasks (Slice B)
- Updated `tasks.md` Slice B RED/GREEN/TRIANGULATE/REFACTOR checkboxes to complete.
- Added/updated tests for:
  - adding and removing reservation item rows;
  - requiring at least one reservation item in service validation;
  - room type, optional room, and guest-count item fields;
  - clearing incompatible selected room when room type changes;
  - create/update payloads with multiple reservation items;
  - one-item conflict among multiple assigned items;
  - skipping availability validation for unassigned items;
  - property scoping for replaced item persistence;
  - edit flows that remove or add item rows.
- Preserved multi-item form state in `ReservationsPage` and prefilled edit mode from hydrated `reservation_items`.
- Hardened service edit flow so replacing reservation items tolerates empty delete responses while still failing on backend errors.
- Extended reservation hydration to keep a normalized `reservation_items` array for edit prefills.

### Files Changed (Slice B)
- `src/features/reservations/types.ts`
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/tasks.md`
- `openspec/changes/issue-14-reservation-ux-alignment/apply-progress.md`

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| B1 Multi-item edit/create correctness | Focused reservations tests initially failed on multi-item update replacement and per-item availability assertions; added failing edit-prefill/add-remove coverage and service assertions for empty items + per-item conflict. | Extended hydration to carry `reservation_items`, reused that data to prefill edit rows, and made item-replacement delete tolerant of empty responses while keeping backend-error handling. | Added coverage for edit remove/add flows, one conflicting assigned room among multiple items, and unassigned-item validation bypass while preserving property scope assertions. | Kept item-row behavior inside `ReservationsPage`; reused existing `normalizeReservationItems` and form snapshot helpers instead of extracting shared UI prematurely. |

### Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx src/features/reservations/__tests__/reservationService.test.ts` ✅
- `npm run test:run` ✅ (53 files, 614 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

### Workload / PR Boundary
- Intended boundary: **Slice B only**.
- Repo-level line accounting remains noisy because reservation feature files are still untracked in the baseline workspace.
- Tracked delta visible from this run stayed under the review budget (`+288 / -0` on tracked i18n files already present in baseline diff); Slice B boundary was enforced by functional scope and files touched.
- Slice C remains a separate required chained slice.

### Deviations from Design
- No functional deviation from Slice B goals.
- Refactor stayed inline; no `ReservationItemRows` extraction yet because complexity remained manageable in one feature file.

## Slice B Blocker Fix — Duplicate Assigned Room Protection

### Scope Applied
- Applied a focused Slice B follow-up fix only.
- Did **not** implement Slice C in this run.

### Completed Fixes
- Added service-level validation for duplicate assigned room IDs inside the incoming `reservation_items` payload on both create and update.
- Preserved allowed behavior for multiple unassigned items (`room_id: null`).
- Prevented duplicate room selection in the UI by removing rooms already selected in other item rows from each row's room options.
- Added a specific form error path for `duplicate-assigned-room` validation failures.
- Updated edit-form coverage so newly added rows stay unassigned when all matching rooms are already used by other rows.

### Files Changed (blocker fix)
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/apply-progress.md`

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| B2 Duplicate assigned-room blocker fix | Added failing service tests for create/update duplicate room submissions and a failing UI test proving a selected room disappears from other item-row selectors; focused run failed (3 tests). | Added `hasDuplicateAssignedRooms` service validation before persistence/availability checks, filtered room options per row to exclude rooms selected in other rows, and surfaced a specific duplicate-room form error. | Added a passing service scenario with different assigned rooms plus unassigned rows, and updated edit-flow UI coverage so added rows remain unassigned when no unique room remains. | Kept duplicate validation in a pure service helper and left the delete-then-insert replacement strategy unchanged for this focused fix. |

### Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts src/features/reservations/__tests__/ReservationsPage.test.tsx` ✅
- `npm run test:run` ✅ (53 files, 618 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

### Remaining Risks / Notes
- The review blocker is fixed: duplicate assigned rooms in the same submitted reservation are now blocked in both service and UI.
- The service still uses delete-then-insert replacement for reservation items during update. If insert fails after delete succeeds, previous items could be lost. This consistency risk remains documented and was not expanded in this focused fix.

## Slice C — Required Prototype Visual Polish

### Scope Applied
- Applied **Slice C only** on top of completed Slice A and Slice B.
- Kept multi-item persistence/service behavior unchanged except for visual consumers and tests.

### Completed Tasks (Slice C)
- Updated `tasks.md` Slice C RED/GREEN/TRIANGULATE/REFACTOR checkboxes to complete.
- Added focused UI tests for:
  - overview, status-view, filters, and reservation-list headings;
  - accessible status chips with count labels;
  - preserving filters and table visibility while using status chips.
- Added budget-safe visual hierarchy aligned with `docs/assets/reservations.png`:
  - overview metrics inside a dedicated summary panel;
  - status-chip shortcut row above filters;
  - dedicated filters panel;
  - dedicated reservation-list panel with loaded-count helper text;
  - rounded table container for clearer card hierarchy.
- Added EN/ES copy for new panel headings, helper text, and status-chip labels.
- Reused existing icons, buttons, metric cards, and reservation-specific feature code only.

### Files Changed (Slice C)
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/tasks.md`
- `openspec/changes/issue-14-reservation-ux-alignment/apply-progress.md`

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| C1 Prototype-aligned visual hierarchy | Added failing UI assertions for accessible panel headings (`Operational snapshot`, `Status views`, `Filters`, `Reservation list`), count-labelled status chips, and preserving filters/table after chip interaction; focused run failed (2 tests). | Added summary, status-chip, filters, and list panels; introduced accessible count-labelled status chips and list helper copy; kept existing filters/table content intact. | Verified status-chip interaction still calls `setStatus` while filters and reservations table remain visible, covering accessibility-safe structural polish rather than brittle layout snapshots. | Reused existing metric cards and buttons, kept status-chip state derived from reservation params/summary counts, and avoided extra component extraction to stay within the slice budget. |

### Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/ReservationsPage.test.tsx` ✅
- `npm run test:run` ✅ (53 files, 619 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

### Workload / PR Boundary
- Intended boundary: **Slice C only**.
- Repo-level diff accounting remains noisy because reservation feature files are still untracked in the baseline workspace.
- Tracked delta visible in this run came mostly from i18n/resources; Slice C boundary was enforced by scope and touched files rather than a clean global diff.
- No new UI libraries or backend/service refactors were introduced.

### Deviations from Design
- Slice C remained budget-safe and structural; it did not attempt pixel parity with `docs/assets/reservations.png`.
- Used accessible `aria-pressed` chips as status shortcuts instead of a full tabs widget to preserve current filtering behavior with minimal risk.

## Full-chain Blocker Fix — Multi-item Restore Availability

### Scope Applied
- Applied a focused blocker fix only after full-chain fresh review.
- Kept Slice A/B/C behavior unchanged outside multi-item restore validation.

### Completed Fixes
- Added restore-path service coverage for multi-item archived reservations.
- Updated `restore()` to validate **every assigned reservation item** before reactivating an archived reservation.
- Preserved allowed behavior for unassigned/null reservation items during restore.
- Preserved property scoping and existing restore update flow.

### Files Changed (restore blocker fix)
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/apply-progress.md`

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| F1 Restore multi-item availability blocker fix | Added service tests covering a later conflicting assigned item during restore, multiple unassigned items being ignored, and multiple assigned rooms all being validated before restore. | Replaced restore's first-item-only validation with iteration across all normalized reservation items, validating each assigned room with existing exclude-reservation semantics. | Confirmed restore still ignores null room assignments while checking each assigned room in order and preserving property-scoped archived restore behavior. | Extracted `validateReservationItemsAvailability` helper in `reservationService.ts` to keep assigned-item iteration consistent and avoid duplicating restore availability logic. |

### Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` ✅ (22 tests)
- `npm run test:run` ✅ (53 files, 622 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

### Remaining Risks / Notes
- Multi-item restore now preserves the no-overlapping-active-reservations rule for archived reservations with multiple assigned rooms.
- The previously documented Slice B technical debt remains: update still uses delete-then-insert replacement for `reservation_items`, so an insert failure after delete could drop prior items.
- Workspace/global diff accounting remains noisy because reservation feature files are still untracked in the baseline workspace.

## Restore Safety Blocker Fix — Fail Closed on Item Fetch Error

### Scope Applied
- Applied a focused restore-safety blocker fix only.
- Kept Slice A/B/C behavior unchanged outside restore item-loading failure handling.

### Completed Fixes
- Added a failing restore service test proving `restore()` must not clear `deleted_at` when the `reservation_items` query fails.
- Updated `restore()` to return the `reservation_items` fetch failure before any restore update occurs.
- Preserved multi-item assigned-room validation, null-item bypass, and normal archived restore behavior.

### Files Changed (restore fetch blocker fix)
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `openspec/changes/issue-14-reservation-ux-alignment/apply-progress.md`

### TDD Cycle Evidence
| Cycle | RED (failing first) | GREEN (minimal implementation) | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| F2 Restore fetch-failure safety blocker fix | Added a focused restore test where `reservation_items` returns `ok: false`; focused run failed because restore still returned success and attempted to continue. | Changed `restore()` to fail closed by returning the item-query service failure before clearing `deleted_at`. | Re-ran existing restore tests to preserve all-assigned validation, null-item bypass, and normal restore behavior alongside the new fetch-failure path. | Kept the change localized to restore service flow and service tests only; no unrelated lifecycle/UI refactors. |

### Verification Commands Run
- `npm run test:run -- src/features/reservations/__tests__/reservationService.test.ts` ✅ (23 tests)
- `npm run test:run` ✅ (53 files, 623 tests)
- `npm run lint` ✅
- `npm run build` ✅ (existing chunk-size warning only)

### Remaining Risks / Notes
- Restore now fails closed if `reservation_items` cannot be loaded, preserving multi-item availability safety before reactivation.
- The previously documented Slice B technical debt remains: update still uses delete-then-insert replacement for `reservation_items`, so an insert failure after delete could drop prior items.
- Workspace/global diff accounting remains noisy because reservation feature files are still untracked in the baseline workspace.

## Remaining Tasks
- Slice A: complete.
- Slice B: complete (with documented delete-then-insert update consistency risk remaining as technical debt).
- Slice C: complete.
- Blocker fix: complete.
- Restore safety fetch blocker fix: complete.
- Next recommended: rerun fresh review / SDD verify for the completed UX-alignment chain.
