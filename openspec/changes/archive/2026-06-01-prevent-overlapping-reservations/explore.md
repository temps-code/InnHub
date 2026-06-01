# Explore — prevent-overlapping-reservations (Issue #15)

## Scope

Implement backend/service-layer availability validation to prevent overlapping active reservations for the same room/date range, including maintenance blockers and property scope.

## Key Findings

1. **Issue status / gap**
   - `docs/issues-remaining-analysis.md` marks #15 as pending and dependent on reservations (#14).
   - `src/features/reservations` currently has no implementation files, so overlap checks are not yet present in a reservations service layer.

2. **Existing schema support is ready**
   - `database/migrations/001_define_core_innhub_schema.sql` includes:
     - reservation date fields + date-order check (`planned_check_out_date > planned_check_in_date`)
     - status enums (`reservation_status`, `reservation_item_status`, `stay_status`, `maintenance_status`)
     - maintenance flag `maintenance_tickets.blocks_availability`
     - index `reservations_property_status_dates_idx` on `(property_id, status, planned_check_in_date, planned_check_out_date)`

3. **Documented business rules to preserve**
   - `docs/07-functional-specification.md`: no overlapping active reservations, maintenance blocks availability, validation must be backend-enforced.
   - `docs/08-database-erd.md` Availability Rules:
     - confirmed reservation items block future availability
     - active stays block current availability
     - maintenance tickets with `blocks_availability = true` block assignability while unresolved

4. **Property scope requirement**
   - Service patterns already enforce property scoping via `requirePropertyScope` and `scopeOperationalQuery` (`src/shared/services/propertyScope.ts`).
   - Availability queries must remain property-scoped in every blocker source query.

## Availability Semantics to Lock in

### Date overlap rule

Use half-open intervals: `[check_in, check_out)`.

Conflict when:

- `requested_check_in < existing_check_out`
- `requested_check_out > existing_check_in`

This preserves valid same-day turnover: checkout date equals next check-in date means no overlap.

### Blocking statuses

Define explicitly:

- Reservation items/reservations that **block**: confirmed, checked-in / partially-checked-in equivalents representing active commitment.
- Reservation statuses that **do not block**: cancelled, no-show.
- Stays that block: `active`.
- Maintenance that blocks: unresolved (`open`, `in_progress`) with `blocks_availability = true`.

### Edit scenario

For updates, exclude the current reservation item/reservation id from overlap query to avoid self-conflict.

## Edge Cases Required in TDD

- Boundary dates:
  - same-day checkout/check-in allowed
  - exact overlap start/end rejected
- Full containment and partial overlap rejected
- Cancellation/no-show frees availability
- Edit flow excludes self and still rejects true conflicts
- Property A reservations never block property B
- Maintenance blocks only when unresolved and `blocks_availability = true`

## Risks

- Status-source ambiguity (reservation header vs reservation items) could cause inconsistent blocking logic if not normalized in spec.
- Missing reservation feature baseline means this issue may include foundational reservations-service scaffolding unless bounded.
- Concurrency race conditions may still exist without DB-level locking/exclusion constraints; document as out-of-scope or follow-up.

## Recommendation

Proceed with:

1. proposal clarifying blocker statuses and half-open interval policy;
2. spec scenarios for create/edit/cancel/maintenance/property scope;
3. design choosing service-layer validation path first with tests, and noting DB-hardening follow-up if needed.
