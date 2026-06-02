# Design: issue-14-reservations-management

## Overview

Implement InnHub reservations management as a property-scoped vertical slice centered on `src/features/reservations`. The feature will replace the current reservations placeholder route with a real management page that supports listing, creation, editing, cancellation, status display, filters/search, server-side pagination, soft delete, recycle-bin restore, and administrator-only purge protections.

The design follows existing InnHub frontend architecture:

- React components render UI only.
- Feature hooks coordinate state, loading, and mutations.
- Feature services own data access, property scoping, authorization checks, lifecycle rules, and availability validation calls.
- Business rules remain in services and pure helper functions, not JSX.
- Shared UI remains generic; reservation-specific behavior stays inside `src/features/reservations`.
- The configured `lucide-react` icon system remains the only icon system.

Strict TDD mode is active. Apply must start with failing tests and use `npm run test:run` as the primary test command.

## Relevant Existing Patterns and Discoveries

### Availability implementation from issue #15

Existing availability code lives in:

- `src/features/reservations/reservationAvailability.ts`
- `src/features/reservations/__tests__/reservationAvailability.rules.test.ts`
- `src/features/reservations/__tests__/reservationAvailability.service.test.ts`

`validateRoomAvailability(session, request, deps?)` already enforces:

- property-scoped blocker queries;
- date order validation;
- half-open date overlap semantics through service-facing logic;
- reservation item blockers;
- active stay blockers;
- unresolved availability-blocking maintenance blockers;
- update self-exclusion through `excludeReservationItemId` / `excludeReservationId`.

Issue #14 create/edit flows MUST call this service-layer validation when a room is assigned or when assigned room/dates change. Components must not duplicate overlap predicates.

### Existing trash/null filtering pattern

Rooms, room types, and guests use:

- Active queries: `.is("deleted_at", null)`.
- Archived/trash queries: property-scoped fetch followed by service-layer `deleted_at !== null` filtering when needed.
- Restore: load by `property_id` + `id`, verify `deleted_at !== null`, then set `deleted_at: null`.
- Purge: load archived record, verify `deleted_at !== null`, check blockers, then physical delete.

Reservations should copy this null-safe pattern.

Important InsForge caveat:

- Use `.is("deleted_at", null)` for active records.
- Avoid `.neq("deleted_at", null)` for archived records.
- For recycle bin, fetch property-scoped rows and post-filter `row.deleted_at !== null` in the service if a reliable `IS NOT NULL` API is unavailable.

### Existing service/result patterns

Use existing helpers:

- `withServiceContext`
- `scopeOperationalQuery`
- `assignPropertyOwnership`
- `executeServiceQuery`
- `serviceSuccess`
- `serviceFailure`
- `canAccess`

Authorization should be enforced in the reservation service, even when the UI hides actions.

### Existing route/icon/i18n state

Reservations already has route metadata in `src/app/routes/routeMetadata.ts`:

- id: `reservations`
- path: `reservations`
- min role: `receptionist`
- icon: `CalendarCheck`

`src/app/routes/routes.tsx` currently renders `ModulePlaceholderPage` for reservations. It should be changed to render `ReservationsPage`.

English and Spanish route copy already contains placeholder reservation strings. Feature-specific reservation copy should be added to both:

- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

### Shared UI primitives to reuse

Audit/reuse these before adding reservation-specific components:

- `Button`
- `StatusBadge`
- `FormField`
- `MetricCard`
- `PaginationControls`
- `ConfirmDialog`
- `StrictConfirmDialog`
- `Modal`
- `PageSection`
- input class helpers from `formFieldClasses`
- `InitialsAvatar` where guest initials are useful
- `Alert` where dialog/action errors need inline feedback

Create reservation-specific components only when generic primitives would leak reservation behavior or make tests/UI harder to maintain.

## Architecture

### File-level plan

Expected affected areas:

```text
src/features/reservations/
├── ReservationsPage.tsx
├── reservationService.ts
├── useReservations.ts
├── types.ts
├── reservationAvailability.ts        # existing dependency, reused
├── components/
│   ├── ReservationFilters.tsx        # if useful after reuse audit
│   ├── ReservationFormDialog.tsx     # if form complexity warrants it
│   ├── ReservationStatusBadge.tsx    # reservation status mapping only
│   └── ReservationPurgeDialog.tsx    # optional wrapper over StrictConfirmDialog
└── __tests__/
    ├── reservationService.test.ts
    ├── useReservations.test.ts
    └── ReservationsPage.test.tsx
```

Route/i18n changes:

```text
src/app/routes/routes.tsx
src/shared/i18n/resources/en.ts
src/shared/i18n/resources/es.ts
```

Shared UI should be modified only for generic improvements discovered during TDD. Do not add reservation-specific behavior to shared components.

## Data Model and Contracts

### Reservation status mapping

Database statuses are currently underscored:

- `pending`
- `confirmed`
- `partially_checked_in`
- `checked_in`
- `cancelled`
- `no_show`

Issue #14 visible statuses are user-facing hyphenated/labeled statuses:

- `pending`
- `confirmed`
- `checked-in`
- `checked-out`
- `cancelled`
- `no-show`

Design decision:

- Keep service/domain values aligned with the existing schema where persisted.
- Map persisted values to localized display labels in a reservation-specific status helper/component.
- Do not silently treat unknown statuses as valid. Unknown status should render a safe fallback and be covered by tests.

Because the current schema does not include `checked_out` in `reservation_status`, checked-out display must be derived only if the service has a reliable source, such as linked stays with checked-out state. If not available in the first slice, keep lifecycle handling schema-compatible and document `checked-out` as display support pending backend status/source availability.

### Header-first approach

The implementation should be reservation-header-first:

- `reservations` is the primary list/search/lifecycle entity.
- `reservation_items` is used only where schema/services require it:
  - room type;
  - optional room assignment;
  - guest count;
  - item status;
  - availability validation self-exclusion;
  - purge/soft-delete cascading or FK considerations.

For MVP create/edit, model a single primary reservation item per reservation unless existing data requires multiple items. Do not build a full multi-item reservation editor in this change.

### Proposed TypeScript contracts

```ts
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "partially_checked_in"
  | "checked_in"
  | "cancelled"
  | "no_show";

export type ReservationDisplayStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled"
  | "no-show";

export type ReservationListItem = {
  readonly id: string;
  readonly property_id: string;
  readonly primary_guest_id: string;
  readonly primary_guest_name?: string;
  readonly planned_check_in_date: string;
  readonly planned_check_out_date: string;
  readonly status: ReservationStatus;
  readonly room_type_id?: string | null;
  readonly room_type_name?: string | null;
  readonly room_id?: string | null;
  readonly room_identifier?: string | null;
  readonly guest_count?: number;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
};

export type ReservationFormData = {
  readonly primary_guest_id: string;
  readonly planned_check_in_date: string;
  readonly planned_check_out_date: string;
  readonly room_type_id: string;
  readonly room_id?: string | null;
  readonly guest_count: number;
  readonly status?: ReservationStatus;
  readonly notes?: string | null;
};

export type ReservationListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly status?: ReservationStatus | "all";
  readonly checkInFrom?: string;
  readonly checkInTo?: string;
  readonly checkOutFrom?: string;
  readonly checkOutTo?: string;
  readonly room_id?: string;
  readonly guest_id?: string;
};

export type ReservationListResult = {
  readonly reservations: ReservationListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
};

export type ReservationPurgeBlockers = {
  readonly invoiceCount: number;
  readonly paymentCount: number;
};

export type ReservationPurgeResult = {
  readonly reservation: ReservationListItem;
  readonly blockers: ReservationPurgeBlockers;
};
```

Exact field names should be adjusted to the current implementation while preserving these semantics.

## Service Layer Design

Create `reservationService.ts` as the authoritative layer for reservation data access and lifecycle rules.

### Public API

Recommended service functions:

```ts
list(session, params?, deps?): Promise<ServiceResult<ReservationListResult>>
listTrash(session, params?, deps?): Promise<ServiceResult<ReservationListResult>>
getById(session, id, deps?): Promise<ServiceResult<ReservationListItem>>
create(session, data, deps?): Promise<ServiceResult<ReservationListItem>>
update(session, id, data, deps?): Promise<ServiceResult<ReservationListItem>>
cancel(session, id, deps?): Promise<ServiceResult<ReservationListItem>>
softDelete(session, id, deps?): Promise<ServiceResult<ReservationListItem>>
restore(session, id, deps?): Promise<ServiceResult<ReservationListItem>>
purge(session, id, deps?): Promise<ServiceResult<ReservationPurgeResult>>
```

### Property scoping

Every read/write path must use `withServiceContext` and `scopeOperationalQuery`.

Required paths:

- active list;
- trash list;
- detail;
- create;
- edit;
- cancel;
- soft delete;
- restore;
- purge;
- blocker checks;
- invoice/payment checks;
- reservation item reads/writes.

Property identity must come from the authenticated session, never from form input.

### Authorization

Recommended minimum role checks:

| Operation | Role |
| --- | --- |
| list/detail | `receptionist` through route/session access |
| create | `receptionist` |
| edit | `receptionist` |
| cancel | `receptionist` |
| soft delete | `manager` |
| restore | `manager` |
| purge | `administrator` |

Service checks remain authoritative. UI uses `canAccess` only to show/hide or disable controls.

### Create flow

1. Validate input with a Zod schema or pure validation helper:
   - primary guest required;
   - check-out after check-in;
   - room type required;
   - guest count > 0;
   - optional room assignment can be `null`;
   - notes normalized to `null` when blank.
2. Assign `property_id` via `assignPropertyOwnership`.
3. If `room_id` is present:
   - call `validateRoomAvailability(session, { roomId, checkInDate, checkOutDate })`;
   - return the existing availability validation error if blocked.
4. Insert reservation header into `reservations`.
5. Insert one reservation item into `reservation_items` with:
   - same `property_id`;
   - new `reservation_id`;
   - `room_type_id`;
   - optional `room_id`;
   - `guest_count`;
   - status matching initial flow (`pending` or matching reservation status).
6. Return normalized list/detail item.

No overlap logic should be implemented in components or duplicated in the create form.

### Edit flow

1. Load active reservation by `id`, `property_id`, and `.is("deleted_at", null)`.
2. Reject if lifecycle is not editable.
   - Editable: likely `pending`, `confirmed`.
   - Non-editable: `checked_in`, `partially_checked_in`, `cancelled`, `no_show`, and completed/derived checked-out states.
3. Validate input.
4. Load/update the primary reservation item if required by schema.
5. If assigned room or date range changes:
   - call `validateRoomAvailability` with `excludeReservationId`;
   - also pass `excludeReservationItemId` when updating an existing item.
6. Update reservation header fields.
7. Update item fields for room type, room assignment, guest count, notes/status as needed.
8. Return normalized updated item.

### Cancel flow

1. Load active reservation by property/id with `.is("deleted_at", null)`.
2. Allow cancellation for eligible states only:
   - likely `pending` and `confirmed`.
3. Block cancellation for:
   - `checked_in`;
   - `partially_checked_in`;
   - completed/derived checked-out state;
   - `cancelled`;
   - `no_show`.
4. Update reservation status to `cancelled`.
5. Update linked reservation item statuses to `cancelled` where appropriate.
6. Return updated reservation.

### Soft delete flow

1. Require `manager` or `administrator`.
2. Load active reservation by property/id with `.is("deleted_at", null)`.
3. Block if there is an in-progress stay/check-in:
   - reservation status `checked_in` or `partially_checked_in`;
   - or linked active `stays` record through reservation item.
4. Set `reservations.deleted_at` to current ISO timestamp.
5. If schema/services require item-level soft delete, set linked `reservation_items.deleted_at` too; otherwise keep item rows as dependent data and rely on header visibility.
6. Return archived reservation.

### Recycle bin list

1. Require `manager` or `administrator` if matching current rooms/guests trash access.
2. Start with a property-scoped query.
3. Do not use `.neq("deleted_at", null)`.
4. Fetch property-scoped rows and post-filter:

```ts
const archived = rows.filter((row) => row.deleted_at !== null);
```

5. Apply status/search/date/room/guest filters safely.
6. Return paginated result.

If the implementation can apply some filters server-side safely before post-filtering, do so while preserving property scope and null safety.

### Restore flow

1. Require `manager` or `administrator`.
2. Load reservation by property/id without active `.is("deleted_at", null)` filter.
3. Verify `deleted_at !== null`; otherwise return `not-found`.
4. Optionally re-run availability if restoring an active blocking reservation with assigned room and future/current dates. This is safer because a room may have been rebooked while the reservation was archived.
5. Clear `reservations.deleted_at`.
6. If item soft-delete was used, clear linked `reservation_items.deleted_at`.
7. Return restored reservation.

### Purge flow

1. Require `administrator`.
2. Load reservation by property/id.
3. Verify `deleted_at !== null`; purge only from recycle bin.
4. Check invoice/payment blockers:
   - query `invoices` by `property_id` and `reservation_id`;
   - query `payments` through linked invoices, or direct payment references if a future schema adds them;
   - include soft-deleted invoices/payments unless product later says archived financial records do not block audit deletion.
5. If blockers exist, return `foreign-key-conflict` with blocking counts.
6. Require strict irreversible confirmation in UI before calling the service.
7. Delete dependent reservation items first if needed by FK behavior, then delete reservation; or rely on `reservation_items` `on delete cascade` while ensuring audit blockers are checked first.
8. Return purged reservation and zero blockers.

### Pagination and filtering

Default page size: 20.

Filters:

- status;
- check-in date range;
- check-out date range;
- `room_id`;
- `guest_id`;
- text search by guest name or reservation reference where supported.

Because the current schema does not visibly include a reservation reference field, first implementation can:

- search guest names if service can resolve guest IDs or joined data safely;
- search reservation ID as a reference fallback;
- add display copy as “guest or reservation ID/reference” only if implementation supports both.

For InsForge limitations, prefer correctness over excessive query cleverness:

- property-scope first;
- active/trash lifecycle filter safely;
- apply server-side filters where straightforward;
- post-filter for filters that require joined guest names if no safe join/query API exists;
- slice to page results after all service-side filtering;
- return total after filtering.

## Hook and State Design

Create `useReservations(session)` following `useGuests` more than `useRooms`, because reservations require filters and pagination.

### Hook state

```ts
export type ReservationsState =
  | { readonly status: "loading" }
  | { readonly status: "loaded"; readonly result: ReservationListResult }
  | { readonly status: "error"; readonly error: ServiceError };
```

Hook return should include:

- `state`;
- `showTrash`;
- `params`;
- `setSearch`;
- `setStatus`;
- `setDateRange` or individual date setters;
- `setRoom`;
- `setGuest`;
- `setPage`;
- `toggleTrash`;
- `create`;
- `update`;
- `cancel`;
- `remove`;
- `restore`;
- `purge`;
- `refresh`.

### Hook rules

Follow existing hook safeguards:

- `mountedRef`;
- `requestIdRef`;
- `latestSessionRef`;
- microtask initial load via `Promise.resolve().then(() => load())`;
- reset page to 1 when filters or trash mode changes;
- after mutations, reload the current mode using the latest session.

The hook should not implement lifecycle or overlap rules. It only calls services and manages UI state.

## Component and UI Design

### Page composition

`ReservationsPage` should be the route-level component.

Recommended structure:

1. Page shell/card container following Guests/Rooms styling.
2. Header area:
   - title: Reservations;
   - subtitle from prototype: manage bookings and arrivals;
   - primary CTA: Create reservation.
3. Optional summary cards if within budget:
   - Today’s arrivals;
   - Today’s departures;
   - Active reservations;
   - Pending confirmations.
4. Filter/status controls:
   - search input;
   - status chips/tabs;
   - date filters;
   - room/guest filters if data sources are available;
   - trash toggle for managers/admins.
5. Main table:
   - guest;
   - room;
   - check-in;
   - check-out;
   - status;
   - guests;
   - reference/total placeholder only if supported;
   - actions.
6. Pagination and record count with `PaginationControls`.
7. Dialogs:
   - create/edit form;
   - cancel confirmation;
   - soft delete confirmation;
   - restore confirmation;
   - purge strict confirmation.

### Prototype mapping

Use `docs/assets/reservations.png` as the main visual reference.

In scope for first implementation:

- page header;
- create reservation CTA;
- summary/KPI cards if cheap and derived from loaded data;
- status filter chips/tabs;
- main reservations table;
- row action menu/buttons;
- search/filter state;
- pagination and count;
- loading, empty, no-results, and error states.

Deferred if review budget is at risk:

- top date picker in global header;
- notification/profile controls shown in prototype;
- right-side “Today’s arrivals” panel;
- right-side “Today’s departures” panel;
- notes panel and add-note workflow;
- total amount display unless billing/service data already exists;
- advanced dashboard-like analytics.

### Component reuse strategy

Reuse shared primitives first:

- `Button` for CTAs/actions;
- `MetricCard` for KPI cards;
- `StatusBadge` wrapped by `ReservationStatusBadge`;
- `PaginationControls` for paging;
- `ConfirmDialog` for cancel/archive/restore;
- `StrictConfirmDialog` for purge;
- `Modal` + `FormField` for form dialog;
- `InitialsAvatar` for guest initials;
- `PageSection` for safe loading/error sections.

Reservation-specific components are justified for:

- status-to-tone/icon mapping;
- reservation filters/status chips;
- form data normalization;
- lifecycle-aware action rendering;
- purge blocker messaging.

Shared components must not gain reservation-specific props or behavior.

## Icon Strategy

Use `lucide-react` only.

Existing route icon:

- Route/navigation: `CalendarCheck` already configured.

Recommended reservation icons:

| Context | Icon |
| --- | --- |
| Route/sidebar | `CalendarCheck` |
| Create reservation | `Plus` |
| Search | `Search` |
| Filters | `Filter` |
| Edit | `Pencil` |
| Cancel reservation | `Ban` or `XCircle` |
| Soft delete/archive | `Trash2` |
| Recycle bin/trash mode | `Trash2` or `Archive` |
| Restore | `RotateCcw` |
| Purge warning | `AlertTriangle` |
| More row actions | `MoreVertical` |
| Pending status | `Clock` |
| Confirmed status | `CheckCircle2` |
| Checked-in status | `LogIn` or `DoorOpen` |
| Checked-out status | `LogOut` |
| Cancelled status | `XCircle` |
| No-show status | `UserX` |
| Empty state | `CalendarX` |
| Date fields | `CalendarDays` |
| Guest count | `Users` |
| Room | `DoorOpen` or `BedDouble` |
| Arrivals KPI | `LogIn` or `CalendarDays` |
| Departures KPI | `LogOut` |
| Active reservations KPI | `Users` |
| Pending confirmations KPI | `Clock` |

Accessibility rules:

- Icons next to visible text must be decorative with `aria-hidden="true"`.
- Icon-only buttons must have `aria-label`.
- Tooltips should be added for icon-only actions where patterns exist or where labels are not otherwise visible.
- Keep button icons around 16px and navigation icons at the existing 20px convention.

## Routing and i18n

### Routing

Modify `src/app/routes/routes.tsx`:

- import `ReservationsPage`;
- render it when `route.id === "reservations"`.

`routeMetadata.ts` likely does not need changes because reservations metadata and icon already exist.

### i18n

Add English and Spanish strings for:

- page title/subtitle;
- create/edit form fields;
- status labels;
- filters/search labels/placeholders;
- loading/empty/no-results/error states;
- pagination labels if page-specific;
- action labels;
- confirmation dialog titles/messages;
- permission errors;
- availability conflict errors;
- purge blockers with invoice/payment counts;
- strict purge confirmation phrase.

Keep route placeholder descriptions aligned if changed.

## Lifecycle Rules

Initial lifecycle policy:

| Status | Edit | Cancel | Soft delete | Notes |
| --- | --- | --- | --- | --- |
| `pending` | yes | yes | yes for manager+ | May not block availability unless service says otherwise |
| `confirmed` | yes | yes | yes for manager+ if no active stay | Availability-blocking |
| `partially_checked_in` | no | no | no | In-progress stay |
| `checked_in` | no | no | no | In-progress stay |
| `cancelled` | no or limited notes only | no | yes for manager+ | Non-blocking |
| `no_show` | no or limited notes only | no | yes for manager+ | Non-blocking |
| derived checked-out | no | no | yes for manager+ | Completed stay/audit caution |

Service-layer rules are authoritative. UI action visibility should mirror these rules but not replace them.

## Recycle Bin, Restore, and Purge Flow

### Active list

- Shows only current property reservations.
- Excludes archived rows using `.is("deleted_at", null)`.

### Soft delete

- Manager/admin only.
- Requires confirmation.
- Sets `deleted_at`.
- Blocks active stay/check-in reservations.
- Removes row from active list.

### Trash list

- Separate mode/view, controlled by `showTrash`.
- Manager/admin only.
- Uses safe property-scoped fetch + `deleted_at !== null` post-filter if necessary.
- Does not use `.neq("deleted_at", null)`.

### Restore

- Manager/admin only.
- Clears `deleted_at`.
- Remains property-scoped.
- Should re-run availability validation when restoring an assigned active/future reservation could reintroduce a conflict.

### Purge

- Administrator only.
- Available only for archived reservations.
- Requires `StrictConfirmDialog`.
- Blocks linked financial records.
- Returns/report counts:
  - invoice count;
  - payment count.
- Uses user-facing error messages such as:
  - “Cannot permanently delete this reservation because 2 invoice(s) and 1 payment(s) are linked.”

## Tests and Strict TDD Plan

Strict TDD mode is active. Apply must follow:

1. RED
2. GREEN
3. TRIANGULATE
4. REFACTOR

Primary command:

```bash
npm run test:run
```

For app code changes, also run lint/build before final apply completion when feasible:

```bash
npm run lint
npm run build
```

### RED tests to write first

#### Service tests

Create `reservationService.test.ts` before implementation.

Cover:

- active list scopes by property and calls `.is("deleted_at", null)`;
- trash list avoids `.neq("deleted_at", null)` and post-filters archived rows;
- cross-property rows are not returned in list/detail/trash/restore/purge;
- create derives property from session and rejects form-supplied mismatched property;
- create validates required fields/date order/guest count;
- create calls `validateRoomAvailability` when `room_id` is present;
- create does not call availability when `room_id` is omitted;
- edit blocks non-editable statuses;
- edit calls availability when dates/room assignment change;
- cancel allows eligible statuses and sets `cancelled`;
- cancel blocks checked-in/completed/ineligible statuses;
- soft delete requires manager+;
- soft delete blocks active stay/check-in;
- restore requires manager+ and only restores archived records;
- purge requires administrator;
- purge rejects active records;
- purge checks invoices/payments and returns blocking counts;
- purge deletes only after blockers pass.

#### Hook tests

Create `useReservations.test.ts`.

Cover:

- initial loading with no session returns empty result;
- initial load calls active list by default;
- filter setters reset page to 1;
- `toggleTrash` switches list service and resets page;
- mutations reload current mode;
- stale requests do not overwrite newer session/mode state;
- service errors surface as hook error state or thrown mutation errors.

#### Page tests

Create `ReservationsPage.test.tsx`.

Cover:

- renders header and create CTA;
- renders status filters/search controls;
- renders loaded reservations table;
- renders loading/error/empty/no-results states;
- hides manager/admin actions from lower roles;
- shows trash/restore/purge controls for permitted roles;
- cancel/archive/restore dialogs call hook actions;
- purge uses strict confirmation and displays financial blocker messages;
- icons used as decorative where paired with labels and accessible labels exist for icon-only actions.

### TRIANGULATE

After initial green:

- add tests for both assigned and unassigned reservations;
- add both active and archived null handling cases;
- add at least one Spanish i18n assertion if page copy changes significantly;
- add one action-visibility test per major role boundary.

### Evidence to record later

The apply/verify phase should record:

- failing RED test evidence;
- green test evidence;
- final `npm run test:run`;
- lint/build if code changed;
- notable skipped/deferred prototype enhancements.

## Rollout and Slicing Recommendation

This change is likely above the configured 400 changed-line review budget if implemented as one PR/slice, because it includes:

- service/types;
- strict TDD tests;
- hook state;
- route wiring;
- i18n in two languages;
- full page UI;
- form dialogs;
- recycle bin;
- restore/purge blockers;
- icon/status mapping.

Recommended slicing before apply if forecast exceeds 400 changed lines:

1. **Service/types/tests slice**
   - reservation types;
   - list/create/edit/cancel;
   - property scoping;
   - availability reuse;
   - active/trash null strategy;
   - lifecycle guards.

2. **Active UI/hook/route/i18n slice**
   - `useReservations`;
   - `ReservationsPage`;
   - active list;
   - create/edit/cancel;
   - filters/search/pagination;
   - route wiring and copy.

3. **Recycle bin slice**
   - trash mode UI;
   - soft delete/restore/purge dialogs;
   - invoice/payment blocker messaging;
   - role guards.

4. **Prototype enhancement slice**
   - KPI cards;
   - arrivals/departures side panels;
   - notes panel;
   - richer operational polish.

If only one implementation pass is allowed, prioritize correctness and core management flows over prototype side panels.

## Tradeoffs

### Header-first vs full reservation-items editor

A header-first approach keeps the feature reviewable and matches issue #14’s core workflows. It still respects the existing schema by creating/updating one reservation item where room type, room, and guest count are required. The tradeoff is that multi-room/multi-item reservation management remains deferred.

### Service-side filtering vs richer InsForge queries

Using property-scoped fetch plus post-filtering for archived records is less efficient than a perfect `IS NOT NULL` server query, but it avoids known InsForge null inequality issues and matches existing rooms/room-types/guests patterns. Active lists still use `.is("deleted_at", null)` for efficient safe filtering.

### Derived checked-out display

The issue wants `checked-out` display, but the current reservation enum does not visibly include `checked_out`. The design supports the label, but implementation should derive it only from reliable stay data or defer full checked-out lifecycle until schema/service support exists.

### Prototype fidelity vs review budget

The prototype includes side panels and dashboard-like summaries. Core CRUD/lifecycle/recycle-bin behavior is more important than exact visual fidelity. KPI cards can be included if cheap; right-side panels should be deferred if the 400 changed-line budget is at risk.

### Restore availability validation

Revalidating availability on restore may surprise users if a previously valid archived reservation can no longer be restored. However, it prevents reintroducing conflicts after the room has been rebooked, which is safer for operational integrity.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Scope exceeds review budget | Slice as recommended; defer side panels/KPI polish first. |
| Overlap logic duplicated in components | Require create/edit to call `validateRoomAvailability`; test that service path is used. |
| InsForge null archived query fails | Avoid `.neq("deleted_at", null)`; use property-scoped fetch + post-filter. |
| Cross-property leakage | Every query uses `scopeOperationalQuery`; tests cover active/trash/restore/purge. |
| Purge violates financial audit requirements | Block purge with invoice/payment counts before deletion. |
| Reservation status mismatch between issue and schema | Keep persisted enum values schema-compatible and map to display labels. |
| Multi-item complexity grows | Use single-item/header-first design and defer deep reservation item management. |
| UI role guards differ from service guards | Test both; service remains authoritative. |
| Search by guest name is hard without joins | Use safe guest-ID/reference fallback first or service-side guest lookup; document exact behavior in tests. |

## Memory and Skill Resolution Notes

- `skill_resolution`: `none` because no executor skill path was injected and no skill registry/tool was available in this child session.
- Engram memory tools were not available in the provided toolset, so discoveries/decisions could not be saved to project memory.