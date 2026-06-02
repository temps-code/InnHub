# Tasks: Reservation UX Alignment

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 700–1200 if delivered together |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Required split | At least Slice A, Slice B, Slice C required by user decision |
| Target branch | `features` |
| Issue | GitHub issue #14 |
| Strategy | Sequential slices; split further if any slice approaches 400 changed lines |

## Slice A — Labels, No IDs, Readable Table, Human Filters

Goal: fix the highest-value UX issues without changing multi-item persistence.

### RED

- [x] Add failing UI tests for visible check-in From/To labels.
- [x] Add failing UI tests for visible check-out From/To labels.
- [x] Add failing UI tests proving normal table UX does not show raw reservation, guest, room, or room type IDs.
- [x] Add failing UI tests for human guest and room filter controls.
- [x] Add failing tests for readable table display:
  - reservation reference;
  - guest name;
  - room identifier;
  - room type label.
- [x] Add failing EN/ES i18n assertions for new filter/table labels.

### GREEN

- [x] Add grouped visible date filter labels.
- [x] Replace raw guest/room filter inputs with human-readable selectors/search controls.
- [x] Update reservation list DTO/hydration as needed for guest names, room identifiers, and room type labels.
- [x] Update table columns to show reservation reference and human display values.
- [x] Add EN/ES localized copy.
- [x] Ensure no new UI libraries are introduced.

### TRIANGULATE

- [x] Test empty guest/room option states.
- [x] Test selected guest/room filters display human labels while submitting service-compatible values.
- [x] Test multiple item summaries if existing data already includes multiple items.

### REFACTOR

- [x] Extract display formatting helpers only if duplication appears.
- [x] Keep reservation-specific behavior inside `src/features/reservations`.
- [x] Confirm shared components remain generic.

## Slice B — Multi-Item Create/Edit

Goal: support one reservation holder with multiple reservation item rows.

### RED

- [x] Add failing form tests for adding an item row.
- [x] Add failing form tests for removing an item row.
- [x] Add failing validation tests requiring at least one item row.
- [x] Add failing tests for item row fields:
  - room type;
  - optional room filtered by type;
  - guest count.
- [x] Add failing tests that changing room type clears incompatible selected room.
- [x] Add failing service tests for creating a reservation with multiple items.
- [x] Add failing service tests for editing a reservation with multiple items.
- [x] Add failing service tests proving availability validation runs per assigned item.

### GREEN

- [x] Update form state to support dynamic `reservation_items`.
- [x] Implement add/remove item row UI.
- [x] Implement room selector filtering per row by selected room type.
- [x] Map item rows to create/edit service payloads.
- [x] Update service create flow to persist multiple items.
- [x] Update service edit flow to update multiple items safely.
- [x] Reuse existing availability validation for each assigned room item.
- [x] Preserve optional room assignment.
- [x] Add EN/ES copy for item row labels, actions, and validation messages.

### TRIANGULATE

- [x] Test one assigned item conflict among multiple items.
- [x] Test unassigned items do not require room availability validation.
- [x] Test property scoping for item persistence.
- [x] Test edit behavior when an item is removed.
- [x] Test edit behavior when a new item is added.

### REFACTOR

- [x] Extract `ReservationItemRows` or equivalent only if form complexity warrants it.
- [x] Normalize item payload mapping in a pure helper.
- [x] Keep availability rules out of React components.

## Slice C — Optional Prototype Visual Polish

Goal: improve alignment with `docs/assets/reservations.png` only if budget remains safe.

### RED

- [x] Add focused tests only for approved visual/structural polish.
- [x] Prefer tests for accessible labels, visible chips/tabs, or panel headings over brittle pixel/layout assertions.

### GREEN

- [x] Improve status chips/tabs if needed.
- [x] Adjust spacing and table/card hierarchy.
- [x] Add lightweight summary panels only if changed-line budget allows.
- [x] Reuse existing components and configured icons.

### TRIANGULATE

- [x] Test polish does not remove required filters or table information.
- [x] Test responsive/accessibility-safe rendering where applicable.

### REFACTOR

- [x] Remove duplicated class strings/helpers where worthwhile.
- [x] Defer any polish that threatens the 400-line review budget.

## Verification Commands

Run per slice before reporting completion:

```bash
npm run test:run
npm run lint
npm run build
```

## Review Budget Guard

- [x] Check changed-line count before opening or reporting each slice.
- [x] If a slice approaches or exceeds 400 changed lines, split it before continuing.
- [x] Do not combine Slice B multi-item service/form work with Slice C polish.
- [x] Preserve Slice A as the minimum required UX correction if later slices need deferral.
