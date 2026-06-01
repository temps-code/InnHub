# Proposal: feat(guests): manage guest records

## Intent

Implement the MVP guest records feature for issue #13 so property staff can create, search, update, soft-delete, restore, and permanently purge guest/customer records while preserving property-scoped data isolation under active RLS.

## Problem Statement

InnHub needs guest/customer records before reservation workflows can select real guests. The app currently documents guests as a core property-scoped entity, but there is no feature module, service, page, or test coverage for managing them. Because RLS is active in the backend, guest behavior must not rely on privileged bypasses: all guest reads and writes must use the authenticated client and include explicit property-scoped service filters that align with RLS policies.

## Scope

### In Scope

- Add a guests feature following the existing rooms/room-types pattern:
  - `src/features/guests/types.ts`
  - `src/features/guests/guestService.ts`
  - `src/features/guests/useGuests.ts`
  - `src/features/guests/GuestsPage.tsx`
  - `src/features/guests/index.ts`
  - feature tests for service, hook, and page behavior
- Add protected route wiring and navigation metadata for the guests page if not already present.
- Add English and Spanish i18n keys for guest labels, forms, filters, messages, empty states, recycle bin, restore, and purge flows.
- Support required guest fields:
  - first name
  - last name
  - document type
  - document number
  - email
  - phone
  - notes
- Provide server-side list behavior for the active guest list:
  - hide records with `deleted_at`
  - search by name, email, and document number
  - activity filter
  - server-side pagination with default page size of 20
  - safe loading, empty, and error states
- Add lifecycle controls:
  - create and update active guest records
  - soft delete for manager or administrator users only by setting `deleted_at`
  - separate recycle bin/trash view for soft-deleted guests
  - restore soft-deleted guests when business rules allow it
  - permanent purge for administrator users only with strict confirmation
- Add service-layer reservation guards:
  - soft delete blocks guests with non-deleted active/current/future reservations in statuses `pending`, `confirmed`, or `checked-in`
  - purge blocks if any reservation references the guest, regardless of status, and returns the blocking reference count
- Keep guest records selectable for future reservation flows by exposing typed service/list results suitable for later integration.
- Preserve strict TDD expectations for later apply/verify phases: tests must be written first and `npm run test:run` is the primary test gate.

### Out of Scope

- Implementing reservation create/edit flows.
- Changing reservation schemas except for read-only guard queries if required by service tests.
- Bulk guest import/export, merge/deduplication, audit history, or automated retention cleanup.
- Bypassing RLS through service-role/admin clients for normal app behavior.
- New backend stack decisions, new UI libraries, or unrelated shell/page redesigns.

## Capabilities

### New Capabilities

- `guests`: property-scoped CRUD for guest records, server-side search/pagination/filtering, soft delete, recycle bin restore, and admin-only purge with reservation safeguards.

### Modified Capabilities

- `routing/navigation`: expose the Guests page in the protected app for roles allowed by current route metadata conventions.
- `i18n`: add guest-management copy in English and Spanish.

## Approach

1. **Types and validation**
   - Define guest domain types, list filter/page types, lifecycle result shapes, and form schema in `src/features/guests/types.ts`.
   - Keep identifiers and technical artifacts in English.

2. **RLS-safe service layer**
   - Implement `guestService.ts` using the existing authenticated/property-scoped service context pattern (`withServiceContext`, property scope helpers, and current role checks).
   - Use the authenticated client expected to be constrained by RLS; do not introduce service-role bypass behavior.
   - Apply explicit `property_id` filters in list, detail, mutation, trash, restore, and purge queries so service behavior remains aligned with RLS and testable.
   - Active listing must exclude `deleted_at` records; trash listing must include only `deleted_at` records.

3. **Listing UX**
   - Implement server-side search by full/partial name, email, and document number.
   - Implement activity filter and server-side pagination with default limit/page size of 20.
   - Surface loading, empty, no-results, and error states safely.

4. **Lifecycle controls and guards**
   - Create/update are regular authenticated property-scoped operations.
   - Soft delete is allowed for manager or administrator users, sets `deleted_at`, and first checks for blocking non-deleted reservations in `pending`, `confirmed`, or `checked-in` with current/future relevance.
   - Recycle bin/trash lists soft-deleted guests separately.
   - Restore is manager/admin only unless existing conventions require administrator-only restore; it clears `deleted_at` after validating the record belongs to the active property and remains restorable.
   - Purge is administrator only, requires strict confirmation, and is blocked when any reservation references the guest; the returned error should include the blocking count for UI messaging.

5. **Hook and page**
   - Implement `useGuests` as the page-facing state manager for active/trash mode, filters, pagination, create/edit/delete/restore/purge actions, and refresh behavior.
   - Implement `GuestsPage.tsx` with table, filters, pagination controls, form modal, soft-delete confirmation, trash toggle/view, restore confirmation, and strict purge confirmation.

6. **Tests and validation evidence for later phases**
   - Apply phase must begin with failing tests for service guard/RLS scoping expectations, hook state transitions, and page interactions.
   - Verify phase should report `npm run test:run`; code-changing implementation should also run `npm run lint` and `npm run build` before completion.

## Affected Areas

| Area | Impact | Description |
| --- | --- | --- |
| `src/features/guests/types.ts` | New | Guest types, filters, pagination, lifecycle DTOs, and validation schema. |
| `src/features/guests/guestService.ts` | New | RLS-safe authenticated/property-scoped guest CRUD, listing, trash, restore, purge, and reservation guards. |
| `src/features/guests/useGuests.ts` | New | Page hook for list state, filters, pagination, active/trash mode, and mutations. |
| `src/features/guests/GuestsPage.tsx` | New | Guest management UI with active list, form, filters, pagination, recycle bin, restore, and purge dialogs. |
| `src/features/guests/index.ts` | New | Public feature exports. |
| `src/features/guests/__tests__/*` | New | Service, hook, and page tests, written first during apply. |
| `src/app/routes` / route metadata | Modified | Protected route and navigation entry for guests, following existing app conventions. |
| `src/shared/i18n/resources/en.ts` | Modified | English guest-management strings. |
| `src/shared/i18n/resources/es.ts` | Modified | Spanish guest-management strings. |
| Reservation service/table access | Read-only dependency | Used only for deletion/purge guard checks; reservation implementation remains out of scope. |

## RLS and Property-Scoping Requirements

- All guest operations must use the authenticated client associated with the current session.
- Service code must not bypass RLS assumptions with privileged clients for normal UI behavior.
- Every query and mutation must include the active `property_id` filter in addition to relying on backend RLS.
- Tests should assert property scoping is applied for active list, trash list, detail/update/delete/restore/purge paths, and reservation guard queries where applicable.
- Errors should avoid leaking cross-property record existence.

## Recycle Bin / Trash Flow

- Active guest list hides rows where `deleted_at` is set.
- Trash view lists only soft-deleted guests for the active property.
- Soft delete:
  - manager or administrator only;
  - requires confirmation;
  - sets `deleted_at` instead of removing the row;
  - blocked by active/current/future reservation references as defined above.
- Restore:
  - available from trash for allowed roles;
  - clears `deleted_at` and returns the guest to the active list;
  - must remain property-scoped and RLS-safe.
- Purge:
  - administrator only;
  - available only from trash;
  - requires strict confirmation, preferably a typed phrase or explicit destructive dialog pattern consistent with the app;
  - blocked if any reservation references the guest, regardless of reservation status, returning the blocking count.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| RLS is accidentally bypassed or assumed without service filters | Medium | Require authenticated client usage plus explicit `property_id` filters and tests for service query scoping. |
| Reservation guard semantics are under-specified | Medium | Use the proposed guard definitions in this proposal and refine in spec/design before apply. |
| Server-side search/pagination differs from existing feature assumptions | Medium | Keep API small and align with current service query-builder patterns; test filter payloads and pagination metadata. |
| Recycle bin and purge UI pushes changed lines over 400 | Medium/High | Forecast in tasks/design; split service+tests from UI if the apply workload would exceed the review budget. |
| Purge could remove data needed by historical reservations | Low | Block purge on any reservation reference and expose blocking count. |
| Cross-property existence leaks through errors | Medium | Return generic not-found/forbidden style errors and rely on scoped queries. |

## Rollback Plan

- Revert the new `src/features/guests/` module and tests.
- Revert guest route/navigation wiring.
- Revert guest i18n additions in English and Spanish resources.
- No database migration rollback is expected unless later phases discover missing schema requirements.
- No reservation feature rollback is required because reservation implementation remains out of scope.

## Dependencies

- Existing authenticated service context and property-scoping helpers.
- Existing role/permission helper conventions for administrator, manager, and staff access.
- Existing shared UI components for page sections, forms, tables, dialogs, status/empty/error states, and pagination if available.
- Existing reservation records/table for service-layer guard queries.
- Active RLS policies in the backend.

## Success Criteria

- [ ] Guests route renders in the protected app for permitted users.
- [ ] Active list shows only guests for the active property and excludes `deleted_at` records.
- [ ] Search by name, email, and document number works with server-side pagination defaulting to 20 records.
- [ ] Activity filter works without losing property scoping.
- [ ] Loading, empty, no-results, and error states are safe and user-friendly.
- [ ] Create and update validate required fields and persist through the authenticated property-scoped service.
- [ ] Soft delete is allowed for manager or administrator users, sets `deleted_at`, and is blocked for guests with active/current/future reservations.
- [ ] Trash view lists soft-deleted guests separately.
- [ ] Restore returns eligible soft-deleted guests to the active list.
- [ ] Purge is administrator only, requires strict confirmation, and is blocked by any reservation reference with blocking count messaging.
- [ ] Guest service uses authenticated/RLS-constrained client behavior and explicit `property_id` filters; no service-role bypass is introduced.
- [ ] English and Spanish i18n strings are added and aligned.
- [ ] Strict TDD evidence is available from apply: failing tests first, then green implementation.
- [ ] `npm run test:run` passes; for implementation work, `npm run lint` and `npm run build` pass before completion.

## Review Budget and Delivery Notes

The expected implementation has medium/high review-budget risk because it combines a new service, tests, page UI, route wiring, i18n, server-side listing, recycle bin, and destructive purge flows. If the task forecast exceeds the configured 400 changed-line review budget, pause before apply and ask for a delivery decision. A likely split is:

1. Service, types, guards, and service/hook tests.
2. UI, route wiring, i18n, page tests, and final validation.

## SDD Execution Notes

- Change id: `manage-guest-records`.
- GitHub issue: #13 `feat(guests): manage guest records`.
- Configured SDD proposal model requested by user: `openai-codex/gpt-5.5`.
- Strict TDD is active for later apply/verify phases.
- Primary test command: `npm run test:run`.
- Artifact store: OpenSpec.
