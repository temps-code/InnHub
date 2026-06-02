# Design: Reservation UX Alignment

## Overview

This change aligns the reservations UX with user-facing hotel operations and `docs/assets/reservations.png`.

The main design shift is from ID-centric, single-primary-item presentation to readable reservation headers with multiple reservation item summaries. The UI should present reservations as operational records: one holder, dates, status, room/item summary, and actions.

Strict TDD is active. Primary verification command:

```bash
npm run test:run
```

## Reservation Header + Reservation Items Mapping

Use a header/items model:

- `Reservation` header:
  - reservation reference
  - primary guest/holder
  - check-in/check-out dates
  - status
  - property scope
- `ReservationItem[]`:
  - room type
  - optional room
  - guest count
  - item-level availability validation when room is assigned

The UI should not expose this as raw database internals. It should show:

- reservation reference instead of reservation UUID
- guest full name instead of `primary_guest_id`
- room identifier(s) instead of `room_id`
- room type labels instead of `room_type_id`
- item summaries for multi-room reservations

## Service/List DTO Design

Extend or adapt reservation list DTOs so the table does not need to assemble human display values from raw IDs.

Suggested list DTO shape:

```ts
type ReservationListItem = {
  id: string;
  reference: string;
  primaryGuest: {
    id: string;
    displayName: string;
  };
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  items: ReservationItemSummary[];
};

type ReservationItemSummary = {
  id: string;
  roomTypeId: string;
  roomTypeLabel: string;
  roomId?: string | null;
  roomIdentifier?: string | null;
  guestCount: number;
};
```

Raw IDs may remain in DTOs for actions and service calls, but normal visible labels must use human fields.

## Dynamic Form Design

The create/edit form should contain:

- one primary guest/holder selector
- date fields
- status/lifecycle fields only where currently supported
- dynamic reservation item rows

Each item row includes:

1. room type selector;
2. optional room selector filtered by selected room type;
3. guest count input;
4. remove action when more than one row exists.

Behavior:

- At least one item row is required.
- Changing a row’s room type clears an incompatible selected room.
- Room assignment remains optional.
- Add/remove row state stays local to the form until submit.
- Submit payload maps rows to `reservation_items`.

## Filter Design

Filters should be visibly labeled and human-readable.

Required filter groups:

- Search/reference/guest text where supported.
- Status selector.
- Check-in:
  - From
  - To
- Check-out:
  - From
  - To
- Guest selector/search.
- Room selector/search.

The guest and room filters may submit underlying IDs to the service, but the visible controls must show names, room identifiers, and room type context.

## Table and Prototype Alignment

Prioritize these prototype-aligned improvements:

- readable reservation reference column;
- guest name column;
- stay dates;
- status chips;
- room/item summary column;
- clear create CTA and filter area;
- no raw IDs in primary table cells.

Optional polish if budget allows:

- denser status tabs;
- improved spacing and cards;
- lightweight operational summary panels;
- additional visual hierarchy closer to `docs/assets/reservations.png`.

Do not pursue pixel parity if it threatens the review budget.

## Slicing Strategy

Budget risk is high. Split into at least three slices:

### Slice A: Readability and Filter Alignment

Goal: remove ID exposure and clarify filters.

Includes:

- visible grouped date labels;
- human guest/room filters;
- readable table columns;
- list DTO/display changes needed for table and filters;
- EN/ES copy for these controls.

### Slice B: Multi-Item Create/Edit

Goal: support one reservation holder with multiple room item rows.

Includes:

- form state for dynamic item rows;
- add/remove item behavior;
- item payload mapping;
- service create/edit support for multiple items;
- per-assigned-item availability validation.

### Slice C: Optional Visual Polish

Goal: improve visual alignment with `docs/assets/reservations.png`.

Includes only budget-safe polish:

- status tabs/chips refinement;
- spacing/layout adjustments;
- optional summary panels.

If Slice C risks exceeding the 400-line budget, defer it.

## TDD Strategy

Follow RED, GREEN, TRIANGULATE, REFACTOR.

### RED

Add failing tests first for:

- visible date labels;
- no raw IDs in table/filter UX;
- human guest/room filters;
- readable table content;
- multi-item add/remove rows;
- room filtering by room type;
- service validation per assigned item;
- EN/ES copy presence.

### GREEN

Implement the smallest changes needed to pass each slice’s tests.

### TRIANGULATE

Add edge tests for:

- multiple item summaries;
- unassigned item rows;
- clearing room when room type changes;
- service conflict on one assigned item among multiple rows;
- Spanish copy parity.

### REFACTOR

Extract helpers/components only after behavior is green:

- item row component if form complexity grows;
- summary formatting helper;
- reservation display mapping helper;
- selector option mapping helpers.

## Risks and Tradeoffs

- **Review budget risk:** Multi-item service and UI changes may exceed 400 changed lines if combined with polish.
- **Service complexity:** Edit flows may need careful item diffing or replacement strategy.
- **Data consistency risk:** Every assigned item must preserve property scoping and availability validation.
- **UX risk:** Full prototype parity is not feasible inside the budget.
- **DTO tradeoff:** Adding display fields to list DTOs reduces UI complexity but may require service hydration updates.
- **Form tradeoff:** Dynamic rows improve correctness for multi-room reservations but increase validation and testing surface.

## Constraints

- No new UI libraries.
- No backend stack change.
- EN/ES i18n required.
- Availability validation remains in services.
- Components must not duplicate overlap logic.
- Shared UI must remain generic.
