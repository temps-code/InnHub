# Design: issue-14-reservation-selectors

## Overview

This change improves the existing issue #14 reservation create/edit modal by replacing raw ID inputs with practical selector UX.

The design is intentionally narrow:

- keep the existing reservations page and service contracts;
- improve the modal form controls;
- reuse guest, room type, and room services;
- preserve submit-time availability validation through the reservation service;
- avoid new UI packages or a custom combobox.

## Current Gap

`src/features/reservations/ReservationsPage.tsx` currently uses raw text inputs for:

- `primary_guest_id`;
- `room_type_id`;
- optional `room_id`.

That is technically compatible with the reservation service but unsuitable for real users.

## Architecture Rules

- Components may coordinate form UI and selector state.
- Components MUST NOT duplicate room overlap or availability logic.
- Existing reservation create/update service calls remain the submit authority.
- Guest quick-create MUST call the existing guest service.
- Room type and room options MUST come from existing feature services.
- Shared UI components remain generic.
- Reservation-specific behavior stays in `src/features/reservations`.

## Data Sources

### Guests

Use existing guest service behavior:

- list/search existing guests scoped to current property;
- create guests scoped to current property;
- reuse full guest service validation requirements.

Quick-create should collect only the fields required by the existing service. Do not create a temporary or partial guest policy just for reservations.

### Room Types

Use existing room type service:

- load active room types for current property;
- show user-facing names;
- submit selected `room_type_id`.

Inactive or deleted room types should not be normal create options.

### Rooms

Use existing room service:

- load rooms for current property;
- filter options by selected `room_type_id`;
- keep selection optional;
- include room state in option labels when already available.

Room state is informative only. Availability remains a submit-time service validation concern.

## UI Design

### Guest selector

Use a simple search + select pattern:

- search input or filterable list/select;
- selected guest summary;
- clear/change action;
- “Create guest” or quick-create action for missing guests.

Avoid custom combobox complexity unless existing primitives already provide it.

### Guest quick-create

Recommended flow:

1. User opens quick-create area from reservation form.
2. User enters required guest fields.
3. Form calls `guestService.create`.
4. On success:
   - guest is added to local options if needed;
   - created guest becomes selected;
   - quick-create inputs close or reset.
5. On failure:
   - show error inline;
   - keep reservation form open.

### Room type select

Use a standard select/list control:

- options are active room types;
- selection is required;
- label should not mention raw ID.

### Optional room select

Use a standard select/list control:

- disabled or empty until room type is selected;
- options filtered by selected room type;
- includes an empty option such as “No room assigned”;
- if selected room becomes invalid after room type changes, clear it.

Recommended option label:

```text
Room 204 · Available
```

Only include state when available from loaded room data.

## Form Payload Mapping

The UI state should still submit the existing reservation payload shape:

```ts
{
  primary_guest_id: selectedGuest.id,
  room_type_id: selectedRoomType.id,
  room_id: selectedRoom?.id ?? null,
  planned_check_in_date,
  planned_check_out_date,
  guest_count,
  status,
  notes
}
```

Property identity remains service/session-derived. Do not add property input fields.

## Availability Boundary

Do not proactively filter by date availability in this PR.

The UI may filter rooms by room type only. It must not attempt to determine whether the room is bookable for the selected dates.

Create/edit submission continues to call the existing reservation service, which uses issue #15 validation for assigned room conflicts.

## Error Handling

Selector-specific errors:

- no guest selected;
- quick-create validation failure;
- no room type selected;
- room options failed to load;
- guest/room type/room loading failed.

Submit errors:

- service validation errors;
- availability conflicts;
- lifecycle/edit restrictions;
- network/backend failures.

Availability conflict messages should be shown at submit time and should not imply that the selector prevalidated availability.

## i18n

Update both:

- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

Expected copy areas:

- guest selector label and placeholder;
- guest search placeholder;
- selected guest label;
- quick-create open/cancel/create labels;
- quick-create success/error text;
- room type select label and placeholder;
- optional room select label and placeholder;
- no room assigned option;
- room state labels if shown;
- selector validation messages;
- submit-time availability error context if page-specific copy exists.

Avoid user-facing “ID” language in selector labels.

## Testing Strategy

Strict TDD mode is active.

Primary command:

```bash
npm run test:run
```

For code changes, also validate with:

```bash
npm run lint
npm run build
```

### RED tests first

Add or update tests before implementation for:

- form no longer renders raw guest/room type/room ID UX;
- existing guest can be searched and selected;
- quick-created guest is auto-selected;
- quick-create validation errors are shown;
- room type options are loaded from active room types;
- room options filter by selected room type;
- changing room type clears invalid selected room;
- unassigned room submits `null` or omitted `room_id`;
- assigned room submits selected `room_id`;
- availability validation remains submit-time service behavior;
- EN/ES selector labels exist.

### GREEN implementation

Implement the smallest change that satisfies tests:

- selector state in reservation modal;
- service calls for guest/room-type/room option data;
- quick-create call through guest service;
- payload mapping to existing reservation service.

### TRIANGULATE

Add edge coverage for:

- empty guest search results;
- failed selector data loading;
- edit modal preselects existing guest, room type, and room values;
- stale selected room after room type change;
- Spanish copy for quick-create or selector labels.

### REFACTOR

Refactor only after tests are green:

- extract small reservation-specific selector helpers/components if the modal becomes hard to read;
- keep shared components generic;
- avoid broad page rewrites.

## Review Workload Forecast

Estimated changed lines: 250–400.

Budget risk: Medium.

Potential split if over budget:

1. Guest selector + quick-create.
2. Room type/room selectors + i18n/test polish.

Avoid adding proactive availability filtering, advanced combobox behavior, or unrelated reservation page redesign in this slice.
