# Proposal: feat(reservations): create and manage reservations

## Intent

Implement issue #14, a high-priority reservations management vertical slice for InnHub, so authorized property staff can list, create, edit, cancel, soft-delete, restore, and permanently purge reservations while preserving property-scoped data isolation and reusing existing service-layer overlap prevention from issue #15.

## Issue Metadata

- GitHub issue: #14
- Title: `feat(reservations): create and manage reservations`
- Change id: `issue-14-reservations-management`
- Priority: High
- Related dependency: issue #15 `feat(availability): prevent overlapping reservations` — completed/closed
- Source artifact: `openspec/changes/issue-14-reservations-management/explore.md`
- UI reference: `docs/assets/reservations.png`
- Strict TDD: active
- Test runner: `npm run test:run`
- Review budget guard: 400 changed lines

## Scope

### In Scope

- Add a reservations management feature for the active property.
- List reservations scoped to the current property.
- Create reservations with:
  - primary guest
  - check-in/check-out dates
  - room type
  - guest count
  - optional room assignment
- Edit reservations where lifecycle rules allow it.
- Cancel reservations where lifecycle rules allow it.
- Display reservation statuses:
  - `pending`
  - `confirmed`
  - `checked-in`
  - `checked-out`
  - `cancelled`
  - `no-show`
- Implement filters/search and server-side pagination for the reservations list.
- Use a reservation-header-first implementation approach.
- Use reservation items only where the current schema/services require them.
- Reuse issue #15 availability/overlap prevention for create/edit flows.
- Add soft delete by setting `deleted_at`.
- Add recycle-bin/papelera behavior:
  - archived reservations list
  - restore
  - administrator-only permanent purge
  - purge blockers and blocking counts
  - strict irreversible-action confirmation
- Align the main UI layout and controls with `docs/assets/reservations.png` where feasible:
  - page header
  - primary create CTA
  - status filters/chips/tabs
  - reservations table
  - search/filter state
  - pagination and record count
  - loading, empty, no-results, and error states
- Reuse existing shared/feature UI primitives where they already fit the reservation flows.
- Use the already configured Lucide icon system for reservation routes, actions, states, dialogs, empty states, and prototype-aligned visual affordances.
- Do not introduce another icon library or ad-hoc icon implementation.
- Create reservation-specific components only when reuse would leak domain behavior into shared UI or make the code harder to test.
- Add tests first during apply, then implement to green.

### Out of Scope

- Deep reservation-item lifecycle management unless required by the existing schema/current services.
- Full operational KPI/right-side panels if they risk exceeding the 400-line review budget.
- Automated payments or payment gateway integration.
- Broad billing/invoice lifecycle changes beyond purge-blocking checks.
- Check-in/check-out workflow implementation beyond respecting existing reservation statuses.
- New backend stack decisions.
- New UI libraries or unrelated app shell redesigns.
- Duplicating availability/overlap logic inside React components.

## Capabilities

### New Capabilities

- `reservations`: property-scoped reservations list, create, edit, cancel, status display, filters/search, pagination, soft delete, recycle bin restore, and admin-only purge.

### Modified Capabilities

- `routing/navigation`: expose the reservations page in the protected app if not already wired.
- `i18n`: add English and Spanish reservation-management copy.
- `reservation service layer`: integrate issue #14 flows with the existing issue #15 availability validation path.

## Approach

1. **Reservation domain types and status rules**
   - Define reservation list, form, filter, pagination, lifecycle, archive, restore, and purge result types.
   - Keep the first implementation header-first.
   - Map reservation items only where required by existing schema/service constraints.
   - Define allowed actions per status before implementation:
     - cancellation should be blocked for completed stays unless existing business rules allow otherwise;
     - soft delete should be blocked while a stay/check-in is in progress;
     - destructive or irreversible transitions must be service-layer protected.

2. **Service-layer implementation**
   - Implement reservations data access in the feature service layer, not JSX.
   - Every query/mutation must be scoped by active `property_id`.
   - Use authenticated/RLS-constrained client behavior and explicit property filters.
   - Creation/edit must call the existing issue #15 overlap-prevention/availability validation.
   - Do not duplicate overlap predicates in components.
   - Components should receive typed service/hook results only.

3. **InsForge null-comparison handling**
   - Active reservation list must use a safe null filter for soft-delete state, for example `.is("deleted_at", null)`.
   - Avoid unsafe null comparisons such as `.neq("deleted_at", null)`.
   - Archived/recycle-bin listing must use a safe service-layer approach. If InsForge cannot reliably express `IS NOT NULL`, fetch property-scoped reservation records and post-filter with `deleted_at !== null` in the service layer.
   - Apply the same caveat to purge/restore lookup paths where archived rows are involved.

4. **List, filters, and pagination**
   - Provide a property-scoped reservations list with server-side pagination.
   - Support visible search/filter state, including status filters.
   - Preserve loading, empty, no-results, and error states.
   - Keep pagination metadata clear for record counts and page navigation.

5. **Recycle bin / papelera**
   - Active list hides reservations where `deleted_at` is set.
   - Soft delete:
     - manager or administrator only;
     - requires confirmation;
     - sets `deleted_at`;
     - blocked when the reservation has an in-progress stay/check-in state.
   - Trash/recycle-bin view:
     - lists only soft-deleted reservations for the active property;
     - uses the safe InsForge null-handling strategy described above.
   - Restore:
     - available from the recycle bin for authorized roles;
     - clears `deleted_at`;
     - returns the reservation to the active list;
     - remains property-scoped.
   - Purge:
     - administrator only;
     - available only from the recycle bin;
     - requires strict irreversible-action confirmation;
     - blocked when invoice or payment records are linked to the reservation;
     - returns/report blocking counts for user-facing messaging.

6. **UI implementation and component reuse**
   - Use `docs/assets/reservations.png` as the main visual reference for layout and controls.
   - Audit existing shared UI and feature patterns before creating new components.
   - Prefer existing generic primitives for buttons, cards, dialogs, tables, form fields, empty/loading/error states, pagination, and status badges when available.
   - Use the configured `lucide-react` icon system and existing route/action/status icon conventions; do not add a second icon package.
   - Keep icons accessible: decorative icons use `aria-hidden`, standalone icon actions require accessible labels.
   - Keep domain-specific behavior inside `src/features/reservations`; do not push reservation-specific logic into shared components.
   - Create new reservation-specific components only where needed, for example a reservation status badge, filters bar, form dialog, trash actions, or purge warning dialog.
   - Prioritize core list/create/edit/cancel/archive/trash flows.
   - Treat KPI cards and right-side operational panels as progressive enhancement if the 400 changed-line review budget is at risk.

7. **Strict TDD and validation**
   - Apply phase must start with RED tests for service rules, hook behavior, and page interactions.
   - Implement GREEN behavior after tests fail for the expected reasons.
   - Primary test command: `npm run test:run`.
   - For code-changing implementation, also collect lint/build evidence before completion where applicable.

## Affected Areas

| Area | Impact | Description |
| --- | --- | --- |
| `src/features/reservations/types.ts` | New/Modified | Reservation domain types, filters, pagination, status/lifecycle DTOs, archive/restore/purge result types. |
| `src/features/reservations/reservationService.ts` | New/Modified | Property-scoped reservation CRUD/lifecycle service, safe active/archive filtering, issue #15 availability reuse, purge blockers. |
| `src/features/reservations/useReservations.ts` | New/Modified | Page-facing state for active/trash modes, filters, pagination, create/edit/cancel/delete/restore/purge actions. |
| `src/features/reservations/ReservationsPage.tsx` | New/Modified | Main reservations management UI aligned with prototype. |
| `src/features/reservations/components/*` | New if needed | Reservation-specific UI pieces such as status badge, filter bar, form dialog, trash actions, and purge warning dialog. |
| `src/shared/components/*` | Reuse/possibly modified | Existing generic primitives should be reused first; only adjust shared components for generic, non-domain needs. |
| `openspec/specs/icon-system/spec.md` / route metadata | Dependency/possibly modified | Use the configured Lucide icon system for reservation route/action/status/empty-state icons. |
| `src/features/reservations/__tests__/*` | New/Modified | Strict TDD coverage for service, hook, and page behavior. |
| `src/app/routes` / navigation metadata | Modified | Protected reservations route and navigation entry if needed. |
| `src/shared/i18n/resources/en.ts` | Modified | English reservation-management strings. |
| `src/shared/i18n/resources/es.ts` | Modified | Spanish reservation-management strings. |
| Existing issue #15 availability service/rules | Dependency | Must be reused by create/edit flows; no UI-level duplication. |
| Billing/invoice/payment access | Read-only dependency | Used only to block purge when linked financial records exist. |

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Scope exceeds 400 changed lines | High | Slice before apply if forecast exceeds budget; prioritize service/core UI over KPI/right-side panels and avoid unnecessary component creation. |
| Reservation header/items complexity expands implementation | Medium | Keep header-first; use items only where schema/current services require them. |
| Overlap prevention duplicated in components | Medium | Require create/edit to call issue #15 service-layer validation only. |
| InsForge null comparisons fail for archived records | Medium | Use safe `.is("deleted_at", null)` for active and property-scoped fetch + post-filter for archived if needed. |
| Purge removes records with financial/audit dependencies | Medium | Block purge when invoice/payment references exist and report blocking counts. |
| Lifecycle rules are inconsistently enforced | Medium | Protect status transitions and destructive operations in the service layer with tests. |
| Cross-property leakage through list/detail/trash paths | Medium | Require explicit `property_id` filters and tests for active, archived, restore, and purge paths. |

## Rollback Plan

- Revert the reservations feature files added or modified for issue #14.
- Revert route/navigation wiring for the reservations page.
- Revert reservation i18n additions in English and Spanish.
- Revert tests added for this change.
- No database rollback is expected unless later design/apply phases approve schema changes.
- Existing issue #15 overlap-prevention code should not be removed during rollback unless this change modifies it directly.

## Dependencies

- Existing authenticated service context and property-scoping helpers.
- Existing role/permission conventions for staff, manager, and administrator access.
- Existing issue #15 availability/overlap-prevention service/rules.
- Existing InsForge/PostgreSQL backend assumptions.
- Existing soft-delete convention using `deleted_at`.
- Existing rooms, room-types, and guests trash/recycle-bin patterns.
- Existing Lucide icon system and route/action/status icon conventions.
- Existing guest records for primary guest selection.
- Existing room/room-type data for reservation assignment.
- Invoice/payment records or services for purge-blocking checks.

## Success Criteria

- [ ] Reservations route/page is available in the protected app for permitted users.
- [ ] Active reservations list is scoped to the active property.
- [ ] Active list excludes soft-deleted reservations using safe `.is("deleted_at", null)` behavior.
- [ ] Archived/recycle-bin list safely returns only rows with `deleted_at !== null`, using service-layer post-filtering if InsForge lacks reliable `IS NOT NULL`.
- [ ] Users can create reservations with primary guest, dates, room type, guest count, and optional room assignment.
- [ ] Users can edit reservations only where status/lifecycle rules allow it.
- [ ] Users can cancel reservations only where status/lifecycle rules allow it.
- [ ] Status display supports `pending`, `confirmed`, `checked-in`, `checked-out`, `cancelled`, and `no-show`.
- [ ] Create/edit flows reuse issue #15 overlap prevention and do not duplicate availability logic in components.
- [ ] Search/filter controls and server-side pagination work without losing property scoping.
- [ ] Soft delete sets `deleted_at`, is role-gated, and is blocked for in-progress stays/check-ins.
- [ ] Recycle bin/papelera lists archived reservations separately.
- [ ] Restore clears `deleted_at` and returns eligible reservations to the active list.
- [ ] Purge is administrator-only, requires strict irreversible confirmation, and is blocked by linked invoice/payment records with blocking count messaging.
- [ ] Main layout and controls follow `docs/assets/reservations.png` where feasible.
- [ ] Existing shared/feature UI primitives are reused where they fit without leaking reservation-specific behavior.
- [ ] Configured Lucide icons are used for reservation route/action/status/dialog/empty-state UI where icons are needed.
- [ ] No new icon library or ad-hoc icon system is introduced.
- [ ] New reservation components are created only where needed for clarity, testability, or domain-specific behavior.
- [ ] KPI/right-side operational panels are deferred if needed to stay within the review budget.
- [ ] Strict TDD evidence exists from apply: RED tests first, then GREEN implementation.
- [ ] `npm run test:run` passes.
- [ ] If implementation changes app code, lint/build validation is collected before completion.

## Review Workload Guard

This change is likely near or above the configured 400 changed-line review budget because it includes service logic, lifecycle rules, tests, UI, route wiring, i18n, recycle-bin behavior, restore, and purge. If apply-phase forecasting exceeds 400 changed lines, pause before implementation and recommend slicing, for example:

1. Service/types/tests for property-scoped list, create/edit/cancel, issue #15 availability reuse, and lifecycle guards.
2. UI/hook/route/i18n for active reservations management.
3. Recycle bin restore/purge UI and purge-blocking checks.
4. Prototype KPI/right-side panels only as a later enhancement.
