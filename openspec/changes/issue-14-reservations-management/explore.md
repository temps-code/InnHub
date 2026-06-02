# SDD Explore — Issue #14 Reservations Management

## Status
Explored. Ready for proposal.

## Executive Summary
Issue #14 is a high-priority reservations vertical slice. It includes active-property reservation listing, creation, edit/cancel lifecycle, status display, soft delete, recycle-bin purge flow, filtering/search, and server-side pagination.

This is large enough to require SDD. The main design constraint is to keep reservation business rules in feature services and pure functions, not JSX. The implementation should reuse the already completed availability/overlap prevention from issue #15 instead of duplicating it.

## Recommended Change ID
`issue-14-reservations-management`

## Inputs
- GitHub issue #14: `feat(reservations): create and manage reservations`
- Related GitHub issue #15: `feat(availability): prevent overlapping reservations` — closed
- `docs/03-domain-model.md`
- `docs/05-architecture.md`
- `docs/07-functional-specification.md`
- `docs/08-database-erd.md`
- `openspec/config.yaml`
- UI prototype: `docs/assets/reservations.png`

## Key Findings

### Scope Required by Issue #14
- List reservations for the active property.
- Create reservations with primary guest, dates, room type, guest count, and optional room assignment.
- Edit or cancel reservations according to status.
- Define and display reservation states.
- Handle reservation item states if the implementation uses reservation items.
- Keep list and details scoped by property.
- Rely on issue #15 for final overlap prevention when possible.

### Lifecycle and Statuses
The issue expects these visible statuses:

- `pending`
- `confirmed`
- `checked-in`
- `checked-out`
- `cancelled`
- `no-show`

The proposal/spec should define which actions are allowed per status. At minimum, destructive or irreversible operations must be service-layer protected.

### Recycle Bin / Papelera
The recycle-bin behavior must be explicit in the SDD artifacts.

Expected model:
- Active list shows only reservations with no soft-delete marker.
- Soft delete sets `deleted_at`.
- Soft delete requires `manager` or `administrator` role.
- Soft delete is blocked when a stay/check-in is in progress.
- Soft-deleted reservations should be available in a separate recycle-bin/trash view or equivalent administrative flow.
- Administrators can permanently purge soft-deleted reservations.
- Purge is blocked when invoice or payment records are linked to the reservation.
- Purge should report blocking counts.
- Purge requires a strict irreversible-action confirmation.

Open product question for proposal/spec: whether the recycle bin includes restore UX or only purge UX. Existing module patterns suggest full trash behavior with restore + purge is more consistent.

### InsForge Null-Comparison Caveat
The implementation must explicitly avoid unsafe null comparison patterns for `deleted_at` in InsForge.

Known risk:
- Direct null inequality/equality comparisons can fail or produce incorrect behavior depending on the InsForge query API.
- Avoid patterns equivalent to `.neq("deleted_at", null)` for archived records.

Recommended exploration outcome:
- Active reservations should use the safe InsForge null-filter API if available, e.g. `.is("deleted_at", null)`.
- Archived/recycle-bin reservations should use a safe service-layer approach confirmed against current project patterns. If InsForge cannot express `IS NOT NULL` reliably, fetch property-scoped records and post-filter `deleted_at !== null` in the service layer.
- This caveat belongs in proposal/design because it affects list, recycle bin, and purge flows.

### Issue #15 Dependency
Issue #14 should depend on/reuse issue #15 overlap prevention.

Expected behavior:
- Reservation creation/edit should call existing availability validation.
- Do not duplicate overlap logic in UI components.
- The final implementation should verify the existing overlap prevention is property-scoped and covers active blocking states.

### UI Prototype: `docs/assets/reservations.png`
The SDD proposal/design should use the prototype as the primary UI input.

Relevant UI elements to preserve where feasible:
- Page header for reservations.
- Primary CTA to create a reservation.
- Summary/KPI cards such as arrivals, departures, active, pending.
- Status filters/chips/tabs.
- Main reservation table with guest, room, dates, status, guest count, total/reference, and actions.
- Visible filter/search state.
- Pagination and record count.
- Safe loading, empty, and error states.
- Potential right-side operational panels for arrivals/departures/notes if within review budget.

## Risks
- Scope is large: CRUD, lifecycle, filters, pagination, soft delete, recycle bin, purge, permissions, and UI states may exceed the 400-line review budget.
- Reservation header vs reservation items can expand complexity if not sliced carefully.
- Financial audit constraints make purge rules high-risk.
- InsForge null filtering must be handled deliberately to avoid runtime failures.
- UI prototype includes dashboard-like panels that may be better treated as progressive enhancement.

## Open Questions for Proposal
1. Should the recycle bin include restore + purge, or purge only?
2. Should #14 implement reservation header-first behavior and defer deep reservation-item lifecycle unless schema requires it?
3. Are prototype KPI/right-side panels in scope for the first implementation slice, or should core CRUD/list lifecycle come first?
4. Which exact existing issue #15 API/service should creation/edit call for availability validation?

## Next Recommended
Proceed to SDD proposal for `issue-14-reservations-management`.

Recommended phased scope:
1. Core reservations list/create/edit/cancel with property scope and status display.
2. Filters/search/server-side pagination.
3. Recycle bin with soft delete, restore if approved, and admin-only purge with invoice/payment blockers.
4. Prototype-aligned UI polish/KPI panels only if review budget allows.

## Skill Resolution
none
