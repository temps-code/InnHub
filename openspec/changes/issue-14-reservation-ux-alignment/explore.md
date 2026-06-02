## SDD EXPLORE — `issue-14-reservation-ux-alignment` (under GitHub issue #14)

### Status
Proposed (exploration complete, no files changed).

### Summary
Current reservations UX is functionally working but misaligned with user expectations and `docs/assets/reservations.png`.  
Main gaps: unlabeled date filters, exposed internal IDs in normal workflows, single-room reservation editing despite schema support for multi-room via `reservation_items`, and insufficient visual/layout fidelity to the reference design.

### Findings
- **Prototype mismatch** (`docs/assets/reservations.png` vs `ReservationsPage.tsx`)
  - Prototype shows guest-first readable table (guest names, room numbers, richer columns/chips/panels).
  - Current table still shows `reservation.id` and `primary_guest_id` directly.
- **Unlabeled date filters**
  - Four date inputs are rendered without visible labels (only `aria-label`), causing ambiguity for check-in/check-out from/to.
- **ID-centric filters and display**
  - Active filters include raw `room_id` and `guest_id` inputs.
  - Row content shows UUIDs (`reservation.id`, `primary_guest_id`) in primary workflow.
- **Data model supports multi-room, UI/service currently header+primary-item only**
  - Schema supports one reservation with many `reservation_items`.
  - Current service hydration uses first item as “primary” (`hydrateReservationsWithPrimaryItems`), and create/update flows write one item path.
  - This conflicts with requirement “reservation holder can reserve multiple rooms”.
- **Existing OpenSpec context**
  - `issue-14-reservation-selectors` improved modal selectors, but did not remove ID exposure in list/filter/table UX.
  - `issue-14-reservations-management` explicitly used a header-first approach and deferred deeper multi-item lifecycle.

### Proposed Scope (this change)
1. **Filter UX alignment**
   - Replace bare date inputs with visible labels/grouping:
     - Check-in: From / To
     - Check-out: From / To
2. **Remove ID exposure from normal workflows**
   - Replace `room_id` / `guest_id` filter inputs with human-readable selectors (room identifier, guest name).
   - Table should show human values (guest full name, room identifier(s)); move raw IDs out of default UI.
3. **Multi-room reservation alignment**
   - Extend reservation form + service contract to support multiple room items per reservation (`reservation_items[]`) instead of single primary item only.
   - Keep overlap validation via existing service-layer availability checks.
4. **Visual alignment pass**
   - Bring list layout closer to `reservations.png` (status chips/tabs, readable table columns, right-side summary panels if budget allows).
   - Keep within review budget by prioritizing core UX corrections first.

### Risks
- **Budget risk (400 lines): High** if multi-room editor + layout polish are combined.
- **Service complexity:** moving from single-item update to multi-item diff/update logic.
- **Backward compatibility:** tests and existing consumers assume `room_id`/single primary item behavior.
- **Data consistency:** must preserve property scoping and availability validation per room item.

### Next Steps
1. Create proposal/spec/tasks for `issue-14-reservation-ux-alignment` as a follow-up slice under issue #14.
2. Split delivery into at least two focused slices:
   - Slice A: filter labeling + remove ID exposure + table readability
   - Slice B: multi-room reservation item create/edit flow
3. Keep prototype-polish extras (right-side panels/full visual parity) as optional if line budget is exceeded.

---

`skill_resolution: none`
