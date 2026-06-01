# Proposal — prevent-overlapping-reservations

## Problem Statement

InnHub must prevent a room from being assigned to overlapping active reservations or blocking maintenance periods, and this rule must be enforced in the backend/service layer rather than only by UI checks. Issue #15 is currently pending, and the reservations feature has little/no implementation baseline, so the change must add the minimum service-layer availability validation needed without expanding into the full reservations UI/CRUD scope from issue #14.

## Intent

Define and implement a property-scoped availability validation path that rejects conflicting reservation create/update operations for the same room and date range while allowing valid same-day turnover.

## Goals

- Enforce overlap prevention in backend-facing reservation services.
- Use an explicit date-overlap policy: half-open intervals `[check_in, check_out)`.
- Explicitly define blocking and non-blocking reservation states.
- Include maintenance blockers when `blocks_availability = true` and the ticket is unresolved.
- Preserve property-scoped data isolation in all availability checks.
- Cover critical edge cases with strict TDD using `npm run test:run`.

## Non-Goals

- Do not implement the full issue #14 reservations UI/CRUD flow.
- Do not add broad reservation screens, routing, forms, or dashboard/reporting changes.
- Do not introduce a new backend stack or replace InsForge/PostgreSQL assumptions.
- Do not solve concurrency race conditions with database locks/exclusion constraints in this change unless already required by the chosen service path; document DB hardening as a follow-up if needed.
- Do not change physical room state semantics; future reservations must not set rooms to a physical `reserved` state.

## Proposed Change

Add a reservation availability validation capability in the feature/service layer, with minimal reservation-service scaffolding only where needed to support issue #15.

Expected behavior:

- Validate requested date ranges before creating or updating a reservation assignment.
- Treat date ranges as half-open intervals: a request conflicts when `requested_check_in < existing_check_out` and `requested_check_out > existing_check_in`.
- Allow same-day turnover where an existing checkout date equals the next check-in date.
- Block availability for explicitly active reservation commitments, including confirmed and checked-in/partially checked-in equivalents once mapped to the implemented status model.
- Do not block availability for cancelled or no-show reservations.
- Exclude the current reservation/reservation item during update validation to avoid self-conflicts.
- Include unresolved maintenance tickets with `blocks_availability = true` as blockers.
- Require every blocker query to be scoped by the authenticated session property, using existing property-scope service helpers.

## Scope and Affected Areas

- `src/features/reservations/**`: availability rules, reservation service validation, and tests.
- `src/features/maintenance/**` or shared service access only if needed to query maintenance blockers without leaking domain behavior into UI.
- `src/shared/services/propertyScope.ts` usage: must remain the source of property-scoped service enforcement.
- Existing database schema/migrations are expected to support the rule via reservation dates, statuses, maintenance `blocks_availability`, and property/date indexes; schema changes are not expected unless design discovers a hard blocker.
- OpenSpec follow-up artifacts should add spec scenarios, design tradeoffs, and TDD tasks before implementation.

## Acceptance Alignment

- **Backend/service-layer prevention:** overlap validation runs in backend-facing service code, not JSX/frontend-only checks.
- **Same room/date conflict:** rejects overlapping active reservations for the same room and requested range.
- **Cancelled/no-show:** cancelled and no-show reservations do not block availability.
- **Active states:** blocking statuses are explicitly defined in spec/design before apply.
- **Maintenance:** unresolved maintenance records block only when `blocks_availability = true`.
- **Edge cases:** tests cover boundary dates, same-day checkout/check-in, partial/full containment overlaps, edits, cancellation/no-show, maintenance blockers, and property isolation.
- **Property scope:** availability checks must never let another property's reservations or maintenance tickets block the current property.

## Risks and Open Questions

- The exact source of truth for blocking reservation state may be reservation headers, reservation items, stays, or a combination; the spec/design phase must normalize this before implementation.
- The reservations module baseline is sparse, so minimal scaffolding may be needed; keep it bounded to service validation and tests.
- Service-layer validation can still be vulnerable to concurrent writes without database-level constraints or transactional locking; decide whether DB hardening is a follow-up.
- Maintenance date fields/status semantics must be confirmed against the implemented schema before apply.

## Rollback

If the change causes regressions, revert the new reservation availability service/scaffolding and tests. Since schema changes are not expected, rollback should be limited to TypeScript service/test artifacts unless the design phase later approves migrations.

## Success Criteria

- Reservation availability validation is implemented through service/backend-facing code with property-scoped queries.
- Overlapping active reservations and blocking maintenance periods are rejected deterministically.
- Non-blocking statuses and same-day turnover are allowed.
- Strict TDD evidence exists for the acceptance edge cases.
- `npm run test:run` passes; lint/build evidence is collected when TypeScript/app code is changed.

## Expected Review and Testing Evidence

- Unit/service tests proving the overlap predicate and service validation behavior.
- Tests for property isolation and update self-exclusion.
- Tests or explicit validation for maintenance `blocks_availability` behavior.
- Evidence from `npm run test:run` during apply/verify.
- Implementation review evidence showing validation is not UI-only and uses property-scope helpers.
