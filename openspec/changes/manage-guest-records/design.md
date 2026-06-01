# Design: feat(guests): manage guest records

## Technical Approach

Implement `guests` as a new frontend feature module centered on `packages/coding-agent` equivalent local app paths under `src/features/guests`, following the existing `room-types` and `rooms` service/hook/page/testing conventions. The feature uses the authenticated InsForge client through `createInsForgeClient()` and the shared `withServiceContext`, `scopeOperationalQuery`, `assignPropertyOwnership`, and `ServiceResult` primitives. Every data access path applies an explicit `property_id` filter in addition to relying on active RLS.

The feature must include full lifecycle management: active list, separate trash/recycle-bin list, restore, and administrator-only permanent purge. Deletion guards query reservations through the authenticated client only; no service-role or privileged bypass is introduced.

## Current Codebase Findings

- `guests` is already a protected route id and navigation metadata entry, but `routes.tsx` still renders the placeholder for it.
- The database schema already has `guests` with `first_name`, `last_name`, `document_type`, `document_number`, `email`, `phone`, `notes`, timestamps, `property_id`, and a `deleted_at` column from migration `002_add_soft_delete.sql`.
- Existing service patterns expose minimal dependency-injected query interfaces and normalize singleton array responses.
- Existing rooms/room-types lifecycle uses soft-delete and archive terminology; this change should use user-facing “Recycle Bin/Trash” copy while keeping implementation names clear (`listTrash`, `restore`, `purge`).
- Reservation status values in the DB use snake_case (`checked_in`) while the issue text says `checked-in`; service code should query `checked_in` and UI copy may say “checked-in”.

## Architecture Decisions and Tradeoffs

| Decision | Options | Tradeoff | Choice |
| --- | --- | --- | --- |
| RLS safety | Trust RLS only vs. RLS plus explicit filters | Extra filter code and tests, but avoids accidental broad queries and cross-property leaks | Use authenticated client plus explicit `property_id` filters on guests and reservation guard queries |
| Trash implementation | Reuse current `listArchived` names vs. guest-specific trash names | New names add minor divergence, but match issue terminology and avoid ambiguity | Use `listTrash`/`showTrash` in guests; i18n labels use Recycle Bin/Trash |
| Purge permission | Manager+ like some existing patterns vs. administrator only | Stricter than rooms/room-types, but required by issue | `canAccess("administrator", role)` for purge only |
| Search/pagination | Client-side filtering like rooms vs. server-side query contract | Server-side requires a slightly larger query DI and tests, but is required and scales better | Service accepts `GuestListParams` and applies scoped search, pagination, and count metadata server-side where SDK supports it |
| Activity filter | Add schema status field vs. derive from reservations vs. treat active/trash as activity | New schema is out of scope; active/trash is lifecycle, not guest activity | Define `activity` as reservation activity: `all`, `withOpenReservations`, `withoutOpenReservations`, derived through scoped reservation queries if supported; fall back to page/service test contract before implementation if SDK limitations appear |
| Delete guards | DB FK errors only vs. preflight reservation queries | Preflight is more code, but gives user-friendly errors and blocking counts | Query reservations before soft delete/purge, then perform mutation only when allowed |
| Cross-property errors | Distinguish not-found/forbidden vs. generic not-found | Distinction can leak existence | Return generic `not-found` or validation errors from scoped queries only |

## Data Model and Types

Create `src/features/guests/types.ts`:

```ts
export type Guest = {
  readonly id: string;
  readonly property_id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly document_type: string | null;
  readonly document_number: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
};

export type GuestFormData = {
  readonly first_name: string;
  readonly last_name: string;
  readonly document_type?: string | null;
  readonly document_number?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly notes?: string | null;
};

export type GuestActivityFilter = "all" | "withOpenReservations" | "withoutOpenReservations";

export type GuestListParams = {
  readonly search?: string;
  readonly activity?: GuestActivityFilter;
  readonly page?: number;
  readonly pageSize?: number; // default 20
};

export type GuestListResult = {
  readonly guests: Guest[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
};

export type GuestReservationGuard = {
  readonly blocked: boolean;
  readonly count: number;
};
```

Validation uses `zod`: `first_name` and `last_name` required; document type/number, email, phone, and notes trim empty strings to `null`. Email should validate only when non-empty.

## Service Contract

Create `src/features/guests/guestService.ts` with a DI interface extended as needed for server-side list behavior (`eq`, `is`, `in`, `or`/`ilike` or equivalent, `range`, `order`, count metadata). If the current InsForge SDK query shape cannot provide exact count, return `total` from returned row count for MVP and document the limitation in apply.

Public functions:

```ts
list(session, params?: GuestListParams, deps?): Promise<ServiceResult<GuestListResult>>
listTrash(session, params?: GuestListParams, deps?): Promise<ServiceResult<GuestListResult>>
getById(session, id, deps?): Promise<ServiceResult<Guest>>
create(session, data: GuestFormData, deps?): Promise<ServiceResult<Guest>>
update(session, id, data: GuestFormData, deps?): Promise<ServiceResult<Guest>>
softDelete(session, id, deps?): Promise<ServiceResult<Guest>>
restore(session, id, deps?): Promise<ServiceResult<Guest>>
purge(session, id, deps?): Promise<ServiceResult<{ guest: Guest; blockingCount: number }>>
```

Service rules:

- `list`: `guests.property_id = session.propertyId`, `deleted_at IS NULL`, optional search over first name, last name, full-name-friendly terms, email, and document number, `pageSize` default 20.
- `listTrash`: same scope, `deleted_at IS NOT NULL`, manager/admin only unless route-level access later changes.
- `getById/update/softDelete`: scoped by `property_id`, `id`, and active/trash state as appropriate.
- `create`: manager+ or receptionist+? Use `canAccess("receptionist", role)` because MVP scope says receptionist can create guests. Assign `property_id` from the session and reject mismatched payload ownership.
- `update`: `canAccess("receptionist", role)` and never update `property_id`.
- `softDelete`: manager or administrator only. Load active guest by scoped query, run soft-delete guard, then set `deleted_at = new Date().toISOString()`.
- `restore`: manager/admin only. Load soft-deleted guest by scoped query, then clear `deleted_at`; no reservation guard is needed because restoring only reactivates a guest record.
- `purge`: administrator only. Load soft-deleted guest by scoped query, run purge guard, and physically delete only when blocking count is zero.

### Reservation Guards

Soft delete guard:

- Query `reservations` with explicit `property_id = session.propertyId`, `primary_guest_id = guestId`, `deleted_at IS NULL`, `status IN ('pending', 'confirmed', 'checked_in')`.
- Block only active/current/future reservations. Use `planned_check_out_date >= today` as the current/future predicate so already-ended reservations do not block soft delete.
- Return a validation error that does not reveal cross-property existence; if scoped query returns no rows, deletion may continue.

Purge guard:

- Query `reservations` with explicit `property_id = session.propertyId`, `primary_guest_id = guestId` and no status/date/deleted filter requirement beyond property scoping unless the SDK requires separate queries.
- Count every reservation reference regardless of status and regardless of `deleted_at`.
- Return `foreign-key-conflict` with a message including the blocking count for UI messaging. The delete must not run when count > 0.
- Note: future apply should consider `stays`, `stay_guests`, and `invoices` FK references if purge tests expose backend FK conflicts; the issue explicitly requires reservation references, but the schema contains additional guest FKs that may also block physical deletion.

## Hook Design: `useGuests`

Create `src/features/guests/useGuests.ts`.

State shape:

```ts
type GuestsState =
  | { readonly status: "loading" }
  | { readonly status: "loaded"; readonly result: GuestListResult }
  | { readonly status: "error"; readonly error: ServiceError };

type UseGuestsResult = {
  readonly state: GuestsState;
  readonly showTrash: boolean;
  readonly params: Required<Pick<GuestListParams, "page" | "pageSize">> & Pick<GuestListParams, "search" | "activity">;
  readonly setSearch: (value: string) => void;
  readonly setActivity: (value: GuestActivityFilter) => void;
  readonly setPage: (page: number) => void;
  readonly toggleTrash: () => void;
  readonly create: (data: GuestFormData) => Promise<void>;
  readonly update: (id: string, data: GuestFormData) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
  readonly restore: (id: string) => Promise<void>;
  readonly purge: (id: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
};
```

Behavior follows `useRooms`: mounted guard, stale request id, latest session ref, async load scheduled from effects, failed mutations throw `ServiceError`, successful mutations refresh current mode. Changing search/activity resets page to 1; toggling active/trash also resets page to 1.

## Page Design: `GuestsPage`

Create `src/features/guests/GuestsPage.tsx`.

UI responsibilities:

- Protected page rendered for `/app/guests` in `routes.tsx` instead of `ModulePlaceholderPage`.
- Header actions: create guest, toggle Recycle Bin/Active list.
- Active list table: full name, document, email, phone, notes summary, actions.
- Trash list table: same identifying columns plus `deleted_at`, restore action, administrator-only purge action.
- Filters: search input, activity select, page size/select or fixed 20, previous/next pagination with total text.
- Loading, empty active list, empty trash, no-results, and error states use i18n strings.
- Form modal uses `react-hook-form` + `zodResolver(guestFormSchema)` following rooms/room-types patterns.
- Soft-delete confirmation: visible only to manager or administrator users; copy explains record moves to recycle bin and may be blocked by reservations.
- Restore confirmation: visible in trash for manager/admin.
- Strict purge confirmation: administrator only, available only in trash, requires typed phrase such as the guest full name or `DELETE` before enabling the destructive confirm button. Copy states the action is irreversible and blocked by any reservation reference.

## Prototype Alignment and Component Reuse

Use `docs/assets/guests.png` as the visual reference for the guests page while keeping issue #13 scope authoritative. The implementation should match the prototype's structure and visual language, but must not invent unsupported business data.

Prototype-driven layout adjustments:

- Page header: title, short description, search, and primary "Add guest" action.
- Summary row: compact metric cards inspired by the prototype. Use only real/derivable MVP data in this issue, such as total active guests, trash count, and reservation-activity-derived counts if available through the service contract. Prototype-only billing/stay metrics must remain out of scope unless backed by real service data.
- Main content: two-column desktop layout with a large guest table/list on the left and a selected guest detail panel on the right.
- Guest table/list: avatar initials, guest name, document, email, phone, last/reservation activity where available, lifecycle/activity badge, and row selection affordance.
- Detail panel: selected guest profile, contact fields, notes, lifecycle status, and extension slots for future recent stays/reservations/billing summaries. Do not render fake reservations, stays, or invoices.
- Trash mode: preserve the same layout language, but replace active actions with restore and administrator-only purge actions, show `deleted_at`, and make trash state visually clear.
- Responsive behavior: collapse the detail panel below the list on smaller screens.

Component reuse requirements:

- Reuse existing shared components first: `Button`, `StatusBadge`, `MetricCard`, `PageSection`, `Modal`, `ConfirmDialog`, and `FormField`.
- Keep feature-specific business composition inside `GuestsPage.tsx` and `useGuests.ts`.
- Create new shared components only when they are generic and immediately reduce duplication or improve consistency. Candidate components:
  - `InitialsAvatar` for circular initials used in guests and future staff/reservation screens.
  - `PaginationControls` for reusable server-side list navigation.
  - `StrictConfirmDialog` for typed destructive confirmation, extending the existing dialog pattern without embedding purge-specific logic.
- Avoid creating a large generic data-table framework during this issue; a guest-specific table/list is acceptable unless repeated patterns become obvious during implementation.

## i18n

Modify `src/shared/i18n/resources/en.ts` and `src/shared/i18n/resources/es.ts` with aligned `guests` keys for:

- list title/loading/empty/error/noResults
- fields: firstName, lastName, fullName, documentType, documentNumber, email, phone, notes, deletedAt
- filters: search placeholder, all activity, with open reservations, without open reservations
- create/edit labels and validation messages
- delete permission/generic/reservation conflict messages
- trash/recycle bin toggle/title/empty/restore/purge/strict confirmation/blocking count messages

## Tests and Strict TDD Slices

Strict TDD applies in apply/verify. Implementation should start by writing failing tests and capturing RED evidence, then implement the smallest GREEN slice.

### Slice 1 — Service/types RED → GREEN

RED tests in `src/features/guests/__tests__/guestService.test.ts`:

- `list` applies `property_id`, `deleted_at IS NULL`, default page size 20, search filters, and returns pagination metadata.
- `listTrash` applies `property_id` and `deleted_at IS NOT NULL` and enforces manager/admin access.
- `create` assigns session property ownership and rejects mismatched `property_id`.
- `update` scopes by `property_id`, active row, and `id`, and does not update `property_id`.
- `softDelete` is allowed for manager or administrator users, scopes all guest and reservation queries, blocks `pending`/`confirmed`/`checked_in` current/future reservations, and sets `deleted_at` only when unblocked.
- `restore` scopes to property and clears `deleted_at` only for trashed guests.
- `purge` is administrator only, scopes guard query, counts any reservation reference regardless of status/deleted/date, and does not delete when count > 0.
- Cross-property-looking missing rows normalize to generic `not-found`/safe errors.

GREEN implementation: types + service only. Evidence: `npm run test:run -- guestService` if supported, otherwise `npm run test:run`.

### Slice 2 — Hook RED → GREEN

RED tests in `useGuests.test.ts`:

- initial load chooses active vs trash service based on `showTrash`.
- search/activity/page changes reload and reset page where required.
- create/update/remove/restore/purge refresh current list and throw service errors.
- stale request/session protection matches `useRooms` behavior.

GREEN implementation: `useGuests.ts` only. Evidence: `npm run test:run`.

### Slice 3 — Page/route/i18n RED → GREEN

RED tests in `GuestsPage.test.tsx` and route metadata/routes tests if present:

- route `/app/guests` renders `GuestsPage`, not placeholder.
- active list renders a prototype-aligned two-column layout with search, summary cards, selectable rows, and selected guest details without fake out-of-scope data.
- active list renders rows, empty, no-results, loading, and error states.
- create/edit modal validates required fields and submits normalized data.
- soft delete confirmation invokes hook remove and displays reservation conflict safely.
- trash toggle renders deleted rows and restore confirmation.
- purge action is hidden for non-administrators, shown for administrators in trash only, disabled until strict confirmation phrase is entered, and displays blocking count errors.
- English/Spanish keys exist for guest UI copy.

GREEN implementation: `GuestsPage.tsx`, `index.ts`, route wiring, i18n. Evidence: `npm run test:run`, then `npm run lint` and `npm run build` before reporting implementation complete.

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `src/features/guests/types.ts` | Create | Guest domain types, list params/results, lifecycle guard types, zod form schema |
| `src/features/guests/guestService.ts` | Create | Authenticated property-scoped CRUD, active/trash lists, restore, admin purge, reservation guards |
| `src/features/guests/useGuests.ts` | Create | Page-facing state manager for filters, pagination, active/trash mode, mutations |
| `src/features/guests/GuestsPage.tsx` | Create | Prototype-aligned guest management UI with summary cards, selectable list, details panel, recycle bin, and strict purge confirmation |
| `src/features/guests/index.ts` | Create | Public exports |
| `src/shared/components/atoms/InitialsAvatar.tsx` | Create if needed | Generic initials avatar for guest/staff-style entity rows and profile panels |
| `src/shared/components/molecules/PaginationControls.tsx` | Create if needed | Generic server-side pagination controls for list pages |
| `src/shared/components/organisms/StrictConfirmDialog.tsx` | Create if needed | Generic typed destructive confirmation for purge flows |
| `src/features/guests/__tests__/guestService.test.ts` | Create | RED/GREEN service and guard coverage |
| `src/features/guests/__tests__/useGuests.test.ts` | Create | RED/GREEN hook state coverage |
| `src/features/guests/__tests__/GuestsPage.test.tsx` | Create | RED/GREEN UI, route, permission, and confirmation coverage |
| `src/app/routes/routes.tsx` | Modify | Render `GuestsPage` for `route.id === "guests"` |
| `src/shared/i18n/resources/en.ts` | Modify | English guest-management copy |
| `src/shared/i18n/resources/es.ts` | Modify | Spanish guest-management copy |

## Rollout and Validation

- No new database migration is expected; guest table and soft-delete support already exist.
- The route metadata already exposes Guests to receptionist+ users. Page-level action gating handles create/update vs manager/admin lifecycle operations.
- Verification commands for apply/verify: `npm run test:run`; for code-changing completion also run `npm run lint` and `npm run build`.
- Rollback: remove the `src/features/guests` module/tests, revert `routes.tsx` guest page wiring, and remove guest i18n keys.

## Review Budget Forecast

This implementation is likely to exceed the configured 400 changed-line review budget if done in one PR because it adds a new feature module, three test files, route wiring, and bilingual i18n. Recommended split before apply if the parent chooses review-sliced delivery:

1. **Service slice**: `types.ts`, `guestService.ts`, service tests. This establishes RLS/property-scope contracts, pagination/search metadata, reservation guards, and real summary inputs.
2. **Reusable UI foundation slice** if needed: generic `InitialsAvatar`, `PaginationControls`, and `StrictConfirmDialog` with focused tests, only if existing components cannot cover the prototype safely.
3. **Guests UI slice**: `useGuests.ts`, prototype-aligned `GuestsPage.tsx`, page/hook tests, route wiring, and i18n.

If strict review budget is enforced literally, pause before apply and ask for a delivery decision.

## Open Questions / Risks

- The InsForge query builder support for exact server-side count, `ilike`/`or`, and `IS NOT NULL` should be verified during RED service tests. If unavailable, implement the closest authenticated scoped query and keep pagination metadata honest.
- Activity filtering is derived from reservation activity because the `guests` table has no status/activity field. If product expects a different activity definition, adjust before apply.
- Physical purge may also be blocked by non-reservation guest FKs (`stays`, `stay_guests`, `invoices`) even though issue #13 specifically calls out reservation references. Service should still surface backend FK conflicts safely if they occur.
