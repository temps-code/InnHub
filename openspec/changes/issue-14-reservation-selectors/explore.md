# Explore — issue-14-reservation-selectors

## Status

Proposed.

## Executive Summary

`issue-14-reservation-selectors` is a focused follow-up PR under GitHub issue #14. The verified reservations flow currently works, but the create/edit modal still asks users to type raw IDs for `primary_guest_id`, `room_type_id`, and optional `room_id`. That is technically valid but not acceptable UX for a real reservation workflow.

The change should replace those ID inputs with selector-oriented UX:

- choose an existing guest or register one if missing;
- choose a room type from active room types;
- choose an optional room filtered by selected room type;
- keep submit-time availability validation through the existing issue #15 service path.

## Recommended Change ID

`issue-14-reservation-selectors`

## Findings

1. **Current gap location**
   - `src/features/reservations/ReservationsPage.tsx` uses plain inputs for `primary_guest_id`, `room_type_id`, and `room_id`.

2. **Reservation validation already exists**
   - `src/features/reservations/reservationService.ts` validates payloads, property scope, date ordering, and assigned-room availability through `validateRoomAvailability()`.
   - This selector change should not duplicate availability logic in React.

3. **Reusable domain data already exists**
   - `guestService.list/create` can provide guest search/list and minimal create behavior.
   - `roomTypeService.list` can provide active room types.
   - `roomService.list` can provide rooms with `room_type_id` and state.

4. **Reusable UI patterns exist**
   - Shared: `Modal`, `FormField`, `Button`, `Alert`, input class helpers.
   - Existing rooms pages already demonstrate select patterns with room type labels.

5. **i18n impact is clear**
   - EN/ES reservation form copy should stop saying “ID” and use selector labels/placeholders.
   - Guest quick-create flow needs bilingual strings.

## Existing Reuse Opportunities

- Reuse `guestService.list/create`.
- Reuse `roomTypeService.list`.
- Reuse `roomService.list`.
- Keep reservation create/update APIs unchanged.
- Reuse existing modal/form primitives.
- Keep hard validation in reservation service and issue #15 availability logic.

## Proposed Scope

1. Replace reservation modal ID text inputs with selector UX:
   - guest selector/search;
   - room type select;
   - optional room select.
2. Add a minimal guest quick-create path from the reservation form.
3. Auto-select the newly created guest after successful quick-create.
4. Filter room options by selected room type.
5. Keep room assignment optional.
6. Keep availability decision authoritative on submit via reservation service validation.
7. Update EN/ES i18n.
8. Add tests for selector behavior, room filtering, quick-create, and payloads.

## Out of Scope

- New GitHub issue.
- Reservation lifecycle/schema changes.
- New UI library/autocomplete package.
- Full guest management inside reservation modal.
- Proactive availability engine replacing issue #15 validation.
- Redesigning the reservations page outside the create/edit form UX.

## Risks

- Guest search/list pagination may need careful UX if many guests exist.
- Inline guest creation can complicate modal state; keep it minimal.
- Room availability can change after selection; submit-time validation must remain authoritative.
- EN/ES copy must stay aligned.

## Open Questions

1. Should quick-create require the same minimum fields as guest management? Recommended: yes, reuse guest service requirements.
2. Should guest selector be a simple search + select, not a full custom combobox? Recommended: simple search/select for this PR.
3. Should room options be availability-filtered before submit? Recommended: no; filter by room type now and rely on submit-time availability validation.
4. Should room state filter exclude inactive/maintenance rooms? Recommended: show only active/selectable room states if current room service exposes state safely; otherwise validate on submit and display state labels.

## Next Recommended

Proceed automatically to proposal, spec, design, tasks, then apply as a new PR/slice under issue #14 if artifacts pass.

## Skill Resolution

none
