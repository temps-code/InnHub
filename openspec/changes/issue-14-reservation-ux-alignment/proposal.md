# Proposal: Reservation UX Alignment

## Intent

Align the reservations experience with GitHub issue #14 expectations and the reference design in `docs/assets/reservations.png`.

The current reservations UI works functionally, but it exposes internal IDs, has ambiguous date filters, and presents reservations as single-room records even though the data model supports multiple `reservation_items` per reservation. This change makes the reservation workflow more user-facing, readable, and consistent with the documented product expectations.

## Scope

This change remains under GitHub issue #14 and focuses on the reservations UX only.

### In Scope

1. **Visible and grouped date filters**
   - Add visible labels for all reservation date filters.
   - Group filters as:
     - Check-in: From / To
     - Check-out: From / To

2. **Remove raw ID exposure from normal UI**
   - Do not show raw reservation, guest, room, or filter UUIDs in normal workflows.
   - Replace guest and room ID filters with human-readable selectors/search controls.
   - Reservation tables should display guest names and room identifiers instead of internal IDs.

3. **Multi-room reservation UI alignment**
   - Update reservation form behavior to support one reservation holder/primary guest with multiple reserved rooms.
   - Represent reserved rooms through `reservation_items[]` rather than a single primary item in the UI contract.
   - Keep service-layer validation authoritative for availability and overlap checks.

4. **Reference design alignment**
   - Bring the reservations page closer to `docs/assets/reservations.png`.
   - Prioritize readable table columns, status chips/tabs, and clearer reservation summaries.
   - Add larger visual/layout polish only if it fits within the review budget.

5. **Testing**
   - Follow strict TDD.
   - Validate with:

   ```bash
   npm run test:run
   ```

### Out of Scope

- New UI libraries or icon packages.
- Backend stack changes.
- Payment or billing workflow changes.
- Full visual pixel parity with the prototype if it exceeds the review budget.
- Creating a new GitHub issue.

## Affected Areas

- Reservations page UI.
- Reservation filters.
- Reservation table columns and display formatting.
- Reservation create/edit form.
- Reservation service contract where it currently assumes a single primary item.
- Reservation tests covering filtering, display, and multi-room behavior.

## Delivery Approach

To keep the change reviewable, implementation should be split into focused slices:

### Slice A: Readability and filter alignment

- Add visible date filter labels/grouping.
- Replace raw room/guest ID filters with human selectors/search.
- Remove raw IDs from the default reservation table.
- Display guest full names and room identifiers.

### Slice B: Multi-room reservation alignment

- Extend reservation form state to support multiple room items.
- Update create/edit service flow to persist multiple `reservation_items`.
- Preserve property scoping and room overlap validation.
- Add tests for multi-room create/edit behavior.

### Slice C: Visual alignment polish

- Improve status chips, tabs, spacing, and table layout.
- Add summary panels only if budget allows.

## Business Rules and Constraints

- Normal UI must not expose raw UUIDs/IDs for reservations, guests, rooms, or filters.
- Date filters must be visibly labeled.
- Guest and room filters must be human-readable selectors/search controls.
- One reservation has one primary guest/holder.
- One reservation may contain multiple room reservation items.
- Service/business rules remain authoritative.
- All reservation data remains property-scoped.
- Room availability and overlap validation must remain enforced through the service layer.
- Reuse existing services, components, and icons.
- Do not add new UI libraries.

## Risks

- **Review budget risk:** High if multi-room editor changes and visual polish are delivered together.
- **Service complexity:** Updating from single-item assumptions to multi-item create/edit behavior may require careful diff/update logic.
- **Regression risk:** Existing tests and UI consumers may assume `room_id`, `guest_id`, or “primary item only” behavior.
- **Data consistency risk:** Multi-room reservation edits must preserve property scoping and availability validation per room item.
- **UX scope risk:** Full visual parity with `docs/assets/reservations.png` may exceed the current review budget.

## Rollback Plan

If implementation introduces regressions:

1. Revert multi-room form/service changes first while keeping non-breaking label/readability improvements if possible.
2. Restore the previous single-primary-item service path.
3. Keep tests isolating the failing behavior so the multi-room slice can be retried separately.
4. If visual polish causes layout instability, revert polish independently from functional UX corrections.

## Success Criteria

- Reservation filters have visible, unambiguous labels.
- Check-in and check-out filters are grouped as From / To.
- Normal reservation workflows no longer expose raw reservation, guest, room, or filter IDs.
- Guest and room filters use human-readable selectors/search.
- Reservation table displays guest names and room identifiers.
- Reservation create/edit supports multiple room items under one reservation holder.
- Existing property scoping and availability validation remain enforced.
- No new UI libraries are introduced.
- Tests pass with:

```bash
npm run test:run
```

## skill_resolution

none
