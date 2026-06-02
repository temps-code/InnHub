# Proposal: feat(reservations): replace raw IDs with reservation selectors

## Intent

Implement a focused follow-up slice under GitHub issue #14 so the reservation create/edit modal no longer requires users to type raw guest, room type, or room IDs.

This change improves the existing verified reservations management flow by adding selector-oriented UX while preserving the existing reservation service and issue #15 availability validation as the authoritative source for room assignment conflicts.

## Issue Metadata

- GitHub issue: #14
- Change id: `issue-14-reservation-selectors`
- Branch target: `features`
- Delivery strategy: one additional focused PR/slice under issue #14
- Source artifact: `openspec/changes/issue-14-reservation-selectors/explore.md`
- Baseline dependency: `openspec/changes/issue-14-reservations-management/`
- Strict TDD: active
- Test runner: `npm run test:run`
- Review budget guard: 400 changed lines

## Scope

### In Scope

- Replace reservation create/edit modal raw ID inputs with selector UX for:
  - primary guest;
  - room type;
  - optional room.
- Add guest search/select from existing property-scoped guests.
- Add minimal guest quick-create from the reservation form.
- Reuse existing guest service requirements for quick-create.
- Auto-select a guest created through quick-create.
- Load room type choices from active room types.
- Filter optional room choices by selected room type.
- Keep room assignment optional.
- Keep submit-time availability validation authoritative through the existing reservation service / issue #15 path.
- Display room state when already available from room data.
- Update English and Spanish i18n strings.
- Reuse existing services, hooks, and shared UI primitives where practical.
- Use existing Lucide icon setup only if icons are needed.
- Add strict TDD coverage with RED/GREEN evidence.

### Out of Scope

- Opening a new GitHub issue.
- New availability engine or proactive availability filtering.
- Duplicating overlap logic in React components.
- New UI/icon libraries or combobox packages.
- Full guest management inside the reservation modal.
- Reservation schema or lifecycle changes.
- Multi-item reservation editor changes.
- Redesigning the reservations page outside the create/edit selector UX.

## Explicit Decisions

- Guest quick-create MUST reuse full guest service requirements.
- The UI SHOULD use simple search + select behavior, not a complex custom combobox/package.
- Room selection MUST be filtered by selected room type.
- Room assignment remains optional.
- Availability validation remains submit-time service authority.
- Room state MAY be displayed if available, but it MUST NOT replace service validation.

## Affected Areas

| Area | Impact |
| --- | --- |
| `src/features/reservations/ReservationsPage.tsx` | Replace raw ID inputs in create/edit modal with selectors and quick-create flow. |
| `src/features/reservations/useReservations.ts` | Reuse or minimally extend hook state only if needed for selector data/mutations. |
| `src/features/reservations/reservationService.ts` | Existing submit validation remains authoritative; avoid availability duplication. |
| `src/features/guests/guestService.ts` | Reuse list/create for search/select and quick-create. |
| `src/features/room-types/roomTypeService.ts` | Reuse active room type listing. |
| `src/features/rooms/roomService.ts` | Reuse room listing and room state data. |
| `src/shared/components/*` | Reuse modal, form, button, alert, and input primitives. |
| `src/shared/i18n/resources/en.ts` | Add/update English copy. |
| `src/shared/i18n/resources/es.ts` | Add/update Spanish copy. |
| `src/features/reservations/__tests__/*` | Add RED/GREEN tests for selectors, quick-create, filtering, payloads, and validation boundaries. |

## Success Criteria

- [ ] Reservation create/edit form no longer asks users to type `primary_guest_id`, `room_type_id`, or `room_id`.
- [ ] User can search/select an existing guest.
- [ ] User can quick-create a guest using existing guest service requirements.
- [ ] Newly quick-created guest is automatically selected.
- [ ] Room type is selected from active room types.
- [ ] Optional room select is filtered by selected room type.
- [ ] Clearing/changing room type handles room selection safely.
- [ ] Create/edit payloads still submit IDs expected by the existing reservation service.
- [ ] Room assignment can be omitted.
- [ ] Availability conflicts are still detected through submit-time reservation service validation.
- [ ] No React component duplicates issue #15 overlap/availability logic.
- [ ] EN/ES copy is updated and aligned.
- [ ] No new UI/icon library is introduced.
- [ ] Strict TDD evidence exists: RED first, GREEN implementation, final passing tests.

## Risks

| Risk | Mitigation |
| --- | --- |
| Quick-create expands into full guest management | Keep only required guest service fields and defer richer guest editing. |
| Selector state complicates the existing modal | Keep simple search/select controls and local form state. |
| Users assume filtered rooms are available | Copy and error handling must preserve submit-time validation authority. |
| Room type changes leave stale room IDs | Clear selected room if it no longer belongs to the selected room type. |
| Review budget grows from broad UI refactor | Limit changes to reservation modal selector UX and related tests/i18n. |

## Review Workload Guard

Estimated changed lines: 250–400.

400-line budget risk: Medium.

If implementation forecast exceeds 400 changed lines, split or defer non-essential polish before coding. Do not expand into proactive availability filtering, advanced combobox behavior, or full guest management.
