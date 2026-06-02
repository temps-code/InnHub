# Reservations Specification

## Purpose

Define the required behavior for property-scoped reservation management, including active-list operations, creation/edit/cancel lifecycle, status display, filters/search, server-side pagination, soft delete, recycle-bin restore, administrator purge protections, configured icon usage, and UI/component reuse boundaries.

## Requirements

### Requirement: Property-Scoped Active Reservations List

The system MUST provide an active reservations list scoped to the current session property and MUST exclude soft-deleted reservations from the active list.

#### Scenario: Active list is property-scoped and excludes archived records

- GIVEN a user is operating within property A
- WHEN the user opens the reservations list
- THEN the system MUST return only reservations belonging to property A
- AND the active list MUST exclude reservations where `deleted_at` is set
- AND the active list query MUST use a safe null check for soft-delete state (`deleted_at IS NULL`, e.g. `.is("deleted_at", null)`)

#### Scenario: Cross-property reservations are not visible

- GIVEN property A and property B both have reservations
- WHEN a user assigned to property A opens reservations
- THEN reservations from property B MUST NOT be returned in active list, detail, edit, trash, restore, or purge paths

### Requirement: Reservation Creation Fields and Availability Validation Reuse

The system MUST allow creating a reservation with primary guest, check-in/check-out dates, room type, guest count, and optional room assignment, and MUST reuse existing service-layer availability validation from issue #15.

#### Scenario: Create reservation with required and optional fields

- GIVEN the user provides a primary guest, valid check-in/check-out dates, room type, and guest count
- WHEN the user submits create reservation
- THEN the system MUST create the reservation for the current session property
- AND room assignment MAY be omitted or included
- AND property identity MUST be derived from the authenticated session, not from form input

#### Scenario: Availability check is reused from service layer

- GIVEN a create request with a room assignment that conflicts with room availability rules
- WHEN the reservation is validated
- THEN the system MUST use the existing issue #15 service-layer availability validation path
- AND components MUST NOT duplicate overlap logic

#### Scenario: Invalid create input is rejected safely

- GIVEN the create form is missing required fields or has invalid dates or guest count
- WHEN the user submits create reservation
- THEN the system MUST reject the request with a clear validation error
- AND MUST NOT create a partial reservation

### Requirement: Reservation Edit and Cancel Lifecycle Rules

The system MUST enforce lifecycle/status rules for edit and cancel operations in the service layer.

#### Scenario: Edit allowed only for eligible lifecycle states

- GIVEN a reservation is in an editable lifecycle state
- WHEN the user submits valid edits
- THEN the system MUST apply changes through the reservations service
- AND if dates or room assignment changed, issue #15 availability validation MUST be reused

#### Scenario: Edit blocked for ineligible lifecycle states

- GIVEN a reservation is in a non-editable lifecycle state
- WHEN the user attempts to edit the reservation
- THEN the system MUST reject the operation with a clear domain error

#### Scenario: Cancel allowed only for eligible lifecycle states

- GIVEN a reservation is in a cancellable lifecycle state
- WHEN the user cancels the reservation
- THEN the system MUST update the reservation status to `cancelled`
- AND the updated status MUST be reflected in the active list

#### Scenario: Cancel blocked for completed or in-progress states

- GIVEN a reservation is checked-in, checked-out, or otherwise ineligible for cancellation
- WHEN the user attempts cancellation
- THEN the system MUST reject the operation with a clear domain error

### Requirement: Reservation Status Display

The system MUST display reservation status using the supported states: `pending`, `confirmed`, `checked-in`, `checked-out`, `cancelled`, and `no-show`.

#### Scenario: Supported statuses are rendered consistently

- GIVEN reservations exist in different lifecycle states
- WHEN the list or detail view is shown
- THEN each reservation MUST display one of the supported statuses
- AND unsupported or unknown statuses MUST NOT be silently shown as valid

#### Scenario: Status-specific actions are visible only when allowed

- GIVEN a reservation has a status with restricted actions
- WHEN the row actions or detail actions are rendered
- THEN the UI MUST hide or disable actions that the service would reject
- AND service-layer rules MUST remain authoritative even if the UI hides an action

### Requirement: Filters, Search, and Server-Side Pagination

The system MUST support status filters, date-range filters, room and guest filters, text search, and server-side pagination with a default page size of 20.

#### Scenario: Default server-side pagination

- GIVEN the reservations page loads without an explicit page size
- WHEN data is requested
- THEN the system MUST request and render results with default page size 20
- AND pagination metadata MUST allow page navigation and record-count display

#### Scenario: Filter by status

- GIVEN the user selects a reservation status filter
- WHEN reservations are loaded
- THEN only reservations matching that status MUST be shown within the current property and active/trash mode

#### Scenario: Filter by date range

- GIVEN the user applies a check-in or check-out date range
- WHEN reservations are loaded
- THEN only reservations matching the selected date range MUST be shown

#### Scenario: Filter by room or guest

- GIVEN the user applies `room_id` and/or `guest_id` filters
- WHEN reservations are loaded
- THEN only reservations matching those filters MUST be shown

#### Scenario: Search by guest name or reservation reference

- GIVEN the user enters text search
- WHEN reservations are loaded
- THEN matching reservations MUST be found by guest name or reservation reference where supported by the service/query strategy

#### Scenario: Active filter visibility and no-results safety

- GIVEN the user applies filters or search text
- WHEN results are loaded
- THEN active filters MUST be visibly represented
- AND the UI MUST safely handle loading, empty, no-results, and error states

### Requirement: Soft Delete Authorization and Guardrails

The system MUST implement soft delete by setting `deleted_at`, require confirmation, and restrict soft delete to manager or administrator roles.

#### Scenario: Authorized soft delete with confirmation

- GIVEN a manager or administrator selects an eligible reservation for archive
- WHEN the user confirms soft delete
- THEN the system MUST set `deleted_at`
- AND the reservation MUST be removed from the active list

#### Scenario: Unauthorized soft delete is blocked

- GIVEN a user without manager or administrator access attempts to soft-delete a reservation
- WHEN the soft-delete request reaches the service
- THEN the system MUST reject the operation with an authorization error

#### Scenario: Soft delete blocked for active stay or check-in

- GIVEN a reservation has an in-progress stay or active check-in
- WHEN the user attempts soft delete
- THEN the system MUST block the action with a clear reason
- AND `deleted_at` MUST remain unchanged

### Requirement: Recycle Bin Listing and Restore

The system MUST provide a separate recycle bin (papelera) view for archived reservations and MUST allow restore of eligible records.

#### Scenario: Archived list uses safe null strategy

- GIVEN a user opens the recycle bin for property A
- WHEN archived reservations are loaded
- THEN only reservations for property A with `deleted_at != null` MUST be shown
- AND archived retrieval MUST avoid unsafe null inequality patterns such as `.neq("deleted_at", null)`
- AND the service MAY use property-scoped fetch plus post-filtering with `deleted_at !== null` when the InsForge query API cannot reliably express `IS NOT NULL`

#### Scenario: Restore archived reservation

- GIVEN an archived reservation in the recycle bin
- WHEN an authorized user restores it
- THEN the system MUST clear `deleted_at`
- AND the reservation MUST reappear in the active list for the same property

#### Scenario: Restore remains property-scoped

- GIVEN an archived reservation belongs to property B
- WHEN a user from property A attempts to restore it
- THEN the system MUST reject or not find the reservation
- AND MUST NOT modify property B data

### Requirement: Purge Restrictions and Blocking Counts

The system MUST allow permanent purge only for administrators, only from the recycle bin, and only after irreversible-action confirmation; purge MUST be blocked when linked invoices or payments exist and MUST return blocking counts.

#### Scenario: Purge allowed only under strict conditions

- GIVEN an administrator selects an archived reservation in the recycle bin
- WHEN the administrator confirms irreversible purge
- THEN the system MAY permanently remove the reservation
- AND the purged reservation MUST no longer appear in active or recycle-bin lists

#### Scenario: Purge blocked outside recycle bin

- GIVEN a reservation is not soft-deleted
- WHEN purge is requested
- THEN the system MUST reject purge because permanent deletion is allowed only from the recycle bin

#### Scenario: Purge blocked by financial links

- GIVEN an archived reservation has linked invoice or payment records
- WHEN purge is requested
- THEN the system MUST block purge
- AND the response MUST include blocking counts for linked invoices and payments

#### Scenario: Non-administrator cannot purge

- GIVEN a manager or receptionist attempts to purge an archived reservation
- WHEN the purge request reaches the service
- THEN the system MUST reject the operation with an authorization error

### Requirement: UI Prototype Alignment, Icons, and Component Reuse Policy

The reservations feature MUST use `docs/assets/reservations.png` as the visual reference for the main layout and controls, MUST use the already configured Lucide icon system where icons are needed, MUST reuse existing shared/feature components where suitable, and MUST introduce reservation-specific components only when required for domain behavior, clarity, or testability.

#### Scenario: Prototype-aligned core UI

- GIVEN the reservations page is implemented
- WHEN the user opens the page
- THEN the page SHOULD include the prototype's core structure where feasible: header, create CTA, status controls, reservations table, search/filter controls, pagination, and safe state messaging

#### Scenario: Configured icons are used consistently

- GIVEN reservations route metadata, actions, statuses, dialogs, or empty states need icons
- WHEN implementing the reservations UI
- THEN the implementation MUST use the configured `lucide-react` icon system and existing icon conventions
- AND MUST NOT introduce another icon library or ad-hoc icon system

#### Scenario: Icons remain accessible

- GIVEN an icon accompanies visible text
- WHEN the icon is rendered
- THEN it MUST be decorative with `aria-hidden="true"`
- AND standalone icon-only actions MUST provide an accessible label

#### Scenario: Reuse-first component selection

- GIVEN existing generic components satisfy a reservations UI need
- WHEN implementing reservations screens
- THEN those components MUST be reused
- AND reservation-specific components MUST be created only where generic reuse would leak reservation behavior or reduce clarity/testability

#### Scenario: Domain behavior stays out of shared UI

- GIVEN reservation-specific lifecycle, purge, or status behavior is needed
- WHEN implementing UI components
- THEN that behavior MUST remain inside the reservations feature
- AND shared components MUST remain generic

### Requirement: Routing and i18n Changes Are Minimal and Need-Driven

Routing/navigation and localization updates SHOULD be made only as needed to expose and operate reservations management behavior.

#### Scenario: Route and copy additions only when required

- GIVEN reservations functionality requires an access path or user-facing copy
- WHEN implementing the feature
- THEN only necessary protected route/navigation and localized strings SHOULD be added

## Acceptance Criteria

- Active reservations list is property-scoped and excludes soft-deleted records.
- Create supports primary guest, dates, room type, guest count, and optional room assignment.
- Create/edit reuse issue #15 availability validation in the service layer without component-level duplication.
- Edit/cancel behavior is enforced by lifecycle/status rules.
- Status rendering supports `pending`, `confirmed`, `checked-in`, `checked-out`, `cancelled`, and `no-show`.
- Filters/search support status, date range, `room_id`, `guest_id`, and guest-name/reference text search.
- Server-side pagination defaults to 20 records.
- Active filter state is visible; loading, empty, error, and no-results states are safe.
- Soft delete sets `deleted_at`, requires confirmation, is manager/admin only, and is blocked for active stay/check-in.
- Recycle bin lists archived reservations separately and supports restore.
- Purge is admin-only, recycle-bin-only, irreversible-confirmed, blocked by invoices/payments, and returns blocking counts.
- Active list uses safe `deleted_at IS NULL` filtering; archived flow avoids unsafe null inequality and uses safe fallback strategy when needed.
- UI follows the main structure of `docs/assets/reservations.png` where feasible.
- Configured Lucide icons are used for reservation route/action/status/dialog/empty-state UI where icons are needed.
- No new icon library or ad-hoc icon system is introduced.
- Implementation follows reuse-first UI/component policy without leaking reservation-specific behavior into shared components.
