# InnHub — Remaining Issues Analysis

> **Last updated:** 2026-05-29
> **Purpose:** Pre-evaluated issue map to avoid re-analyzing dependencies and backend state before each implementation cycle.

---

## Backend Snapshot (InsForge + PostgreSQL)

All 13 operational tables are live with seed data, soft delete, indexes, and foreign keys.

| Table | Records | Soft Delete | Indexes | FKs |
|-------|---------|-------------|---------|-----|
| properties | 3 | ✅ | ✅ | — |
| profiles | 12 | ✅ | ✅ | → properties |
| room_types | 12 | ✅ | ✅ | → properties |
| rooms | 17 | ✅ | ✅ | → properties, room_types |
| guests | 11 | ✅ | ✅ | → properties |
| reservations | 6 | ✅ | ✅ | → properties, guests |
| reservation_items | 6 | ✅ | ✅ | → properties, reservations, rooms, room_types |
| stays | 3 | ✅ | ✅ | → properties, guests, rooms, reservation_items |
| stay_guests | 4 | ✅ | — | → stays, guests |
| housekeeping_tasks | 4 | ✅ | ✅ | → properties, rooms, profiles, stays |
| maintenance_tickets | 3 | ✅ | ✅ | → properties, rooms, profiles |
| invoices | 8 | ✅ | ✅ | → properties, guests, reservations, stays |
| payments | 4 | ✅ | ✅ | → properties, invoices |

**Total seed data: 94 records across 13 tables.**

---

## Frontend Snapshot

| Feature | Files | Status | Notes |
|---------|-------|--------|-------|
| auth | 15 | ✅ Done | Login, demo selector, session, role-based access |
| profile | 8 | ✅ Done | Profile page, service, name editing |
| properties | 8 | ✅ Done | Property profile page, CRUD service |
| room-types | 8 | ✅ Done | Full CRUD + recycle bin + purge (reference pattern) |
| rooms | 6 | ✅ Done | Issue #12 (PR #91) |
| guests | 0 | ❌ Empty | Issue #13 |
| users | 0 | ❌ Empty | Issue #60 |
| reservations | 0 | ❌ Empty | Issue #14 |
| housekeeping | 0 | ❌ Empty | Issue #18 |
| maintenance | 0 | ❌ Empty | Issue #19 |
| billing | 0 | ❌ Empty | Issue #20 |
| dashboard | 0 | ❌ Empty | Issue #21 |
| reports | 0 | ❌ Empty | Issue #62 |

### Established Service Pattern

All services follow the same architecture (see `src/features/room-types/roomTypeService.ts`):

```
service function → withServiceContext(session) → scopeOperationalQuery(insForge query) → executeServiceQuery
```

Key conventions:
- `property_id` scoping via `scopeOperationalQuery`
- Role gating via `canAccess("manager", role)` from `routeMetadata`
- Ownership assignment via `assignPropertyOwnership`
- Soft delete: `is("deleted_at", null)` for active records
- Dependency injection via `deps` parameter for testing

---

## Dependency Graph

```
                    ┌──────────┐
                    │ rooms #12│ (HIGH) ✅ DONE
                    └────┬─────┘
                         │
           ┌─────────────┼──────────────┐
           ▼             ▼              ▼
    ┌────────────┐ ┌───────────┐  ┌───────────┐
    │ guests #13 │ │ users #60 │  │ maint #19 │
    │   (HIGH)   │ │  (HIGH)   │  │   (MED)   │
    └─────┬──────┘ └───────────┘  └───────────┘
          │
          ▼
    ┌───────────────┐
    │reservat. #14  │ (HIGH)
    └───────┬───────┘
            │
      ┌─────┴──────┐
      ▼            ▼
 ┌─────────┐ ┌──────────┐
 │avail#15 │ │ckin #16  │ (HIGH/MED)
 │  (HIGH) │ └────┬─────┘
 └─────────┘      │
                  ▼
           ┌──────────┐
           │ckout #17 │
           └────┬─────┘
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
 ┌─────────┐ ┌──────┐ ┌────────┐
 │bill#20  │ │hk#18 │ │dash#21 │
 │  (MED)  │ │(MED) │ │  (MED) │
 └────┬────┘ └──────┘ └───┬────┘
      │                   │
      ▼                   │
 ┌──────────┐             │
 │rpts #62  │◄────────────┘
 │  (MED)   │
 └──────────┘

realtime #63 = scope decision (not blocked)
```

---

## Issue Evaluation

### 🔴 HIGH Priority

#### #12 — feat(rooms): manage rooms and physical states ✅ DONE
- **Backend:** ✅ 17 rooms, schema with `state` enum (`available`, `occupied`, `cleaning`, `maintenance`, `inactive`)
- **Frontend:** ✅ Implemented — types, service, hook, page, tests, i18n, route
- **Dependencies:** room-types (✅ done)
- **Status:** DONE — PR #91, 4 chained commits on `features`
- **Unblocks:** #14, #15, #16, #17, #18, #19

#### #13 — feat(guests): manage guest records
- **Backend:** ✅ 11 guests, schema with name, document, contact fields
- **Frontend:** ❌ Empty directory
- **Dependencies:** none
- **Unlocked:** YES
- **Scope:** CRUD for guest records, search, soft delete lifecycle
- **Effort:** Low-Medium — standard CRUD, no complex FKs
- **Unblocks:** #14

#### #14 — feat(reservations): create and manage reservations
- **Backend:** ✅ 6 reservations + 6 reservation_items, schema with status enum, date range, guest FK
- **Frontend:** ❌ Empty directory
- **Dependencies:** rooms (#12), guests (#13)
- **Unlocked:** NO — needs #12 and #13 first
- **Scope:** Create/edit/cancel reservations, reservation items (room assignment), date management
- **Effort:** High — multiple FKs, status transitions, date validation, items sub-entity
- **Unblocks:** #15, #16, #20

#### #15 — feat(availability): prevent overlapping reservations
- **Backend:** Index on `(property_id, status, planned_check_in_date, planned_check_out_date)` exists
- **Frontend:** ❌ Empty directory
- **Dependencies:** reservations (#14)
- **Unlocked:** NO — needs #14
- **Scope:** Overlap validation logic, availability checks before reservation creation
- **Effort:** Medium — business logic + validation, possibly a service function
- **Unblocks:** nothing directly

#### #60 — feat(users): manage staff profiles and role permissions
- **Backend:** ✅ 12 profiles, schema with `role` enum (administrator, manager, receptionist, housekeeping, maintenance), `status` enum, soft delete
- **Frontend:** ❌ Empty directory
- **Dependencies:** none
- **Unlocked:** YES
- **Scope:** CRUD for staff, role-based access control, soft delete lifecycle, recycle bin, purge, filtering/search
- **Effort:** High — the largest issue; full lifecycle including recycle bin and purge (reference: room-types pattern)
- **Unblocks:** nothing directly, but enables proper RBAC enforcement across all modules

---

### 🟡 MEDIUM Priority

#### #16 — feat(checkin): execute guest check-in
- **Backend:** ✅ `stays` table with `actual_check_in_at`, `status` enum (`active`)
- **Dependencies:** reservations (#14), rooms (#12)
- **Unlocked:** NO
- **Scope:** Check-in flow: convert reservation → stay, assign room, update room state to `occupied`
- **Effort:** Medium-High — multi-table transaction, state coordination

#### #17 — feat(checkout): execute check-out and trigger cleaning
- **Backend:** ✅ `stays` table with `actual_check_out_at`
- **Dependencies:** checkin (#16)
- **Unlocked:** NO
- **Scope:** Check-out flow: close stay, update room state to `cleaning`, trigger housekeeping task
- **Effort:** Medium — state transitions, task creation

#### #18 — feat(housekeeping): manage cleaning tasks
- **Backend:** ✅ 4 housekeeping_tasks, schema with status, priority, assignment
- **Dependencies:** checkout (#17), rooms (#12)
- **Unlocked:** NO (partially — rooms needed for FK)
- **Scope:** Task list, assignment, status updates, completion tracking
- **Effort:** Medium — task management, assignment logic

#### #19 — feat(maintenance): manage maintenance tickets
- **Backend:** ✅ 3 maintenance_tickets, schema with status, priority, room FK, assignment
- **Dependencies:** rooms (#12), profiles (#60)
- **Unlocked:** Partially — rooms needed for room FK, profiles for assignment FK
- **Scope:** Ticket creation, assignment, status tracking, `blocks_availability` flag
- **Effort:** Medium — ticket lifecycle, availability blocking

#### #20 — feat(billing): generate invoices and manual payments
- **Backend:** ✅ 8 invoices + 4 payments, full schema with amounts, status, payment methods
- **Dependencies:** checkin/checkout (#16/#17)
- **Unlocked:** NO
- **Scope:** Invoice generation from stays, payment recording, status tracking
- **Effort:** Medium-High — financial calculations, status management

#### #21 — feat(dashboard): show operational metrics
- **Backend:** ✅ All tables have data for aggregations
- **Dependencies:** most other features (for real data)
- **Unlocked:** NO (but can show partial metrics with existing seed data)
- **Scope:** Occupancy metrics, revenue summary, room status overview, alerts
- **Effort:** Medium — aggregation queries, chart components

#### #62 — feat(reports): implement occupancy and revenue reports
- **Backend:** ✅ All tables have data
- **Dependencies:** billing (#20), reservations (#14)
- **Unlocked:** NO
- **Scope:** Occupancy report, revenue report by date range
- **Effort:** Medium — aggregation queries, date range filtering, report UI

#### #63 — feat(realtime): add selective property-scoped updates
- **Backend:** InsForge supports realtime
- **Dependencies:** none (scope decision)
- **Unlocked:** YES (decision only)
- **Scope:** Decide which screens get realtime updates, implement if needed
- **Effort:** Low (decision) to High (full implementation)

---

## Recommended Implementation Order

### Phase 1 — Foundation (unblocks everything)
1. ~~**#12 rooms**~~ ✅ → desbloquea #14, #15, #16, #17, #18, #19
2. **#13 guests** → unblocks #14
3. **#60 users** → can run in parallel with #12/#13 (no deps), but is the largest issue

### Phase 2 — Core Operations
4. **#14 reservations** → unblocks #15, #16, #20
5. **#15 availability** → validates reservation integrity
6. **#19 maintenance** → can start once rooms exist

### Phase 3 — Check-in/Check-out Flow
7. **#16 checkin** → unblocks #17
8. **#17 checkout** → unblocks #18, #20
9. **#18 housekeeping** → post-checkout workflow

### Phase 4 — Financial & Reporting
10. **#20 billing** → invoice and payment management
11. **#21 dashboard** → aggregate metrics from all modules
12. **#62 reports** → detailed occupancy and revenue analysis

### Parallel Track
- **#63 realtime** → can be decided/implemented anytime

---

## Quick Reference: What Do I Need to Know Before Starting an Issue?

| Issue | Read First | Service Pattern Reference | Key Schema Fields |
|-------|-----------|--------------------------|-------------------|
| #12 rooms | room-types service | `roomTypeService.ts` | `state` enum, `room_type_id` FK |
| #13 guests | room-types service | `roomTypeService.ts` | `first_name`, `last_name`, `document_*` |
| #60 users | room-types service + issue body | `roomTypeService.ts` | `role` enum, `status` enum, `auth_user_id` |
| #14 reservations | rooms + guests services | — | `primary_guest_id`, date range, `status` enum |
| #15 availability | reservations service | — | overlap query on date range |
| #16 checkin | reservations + rooms | — | stays: `actual_check_in_at`, `room_id` |
| #17 checkout | checkin | — | stays: `actual_check_out_at` |
| #18 housekeeping | checkout | — | `room_id`, `assigned_to_profile_id`, `status` |
| #19 maintenance | rooms + users | — | `room_id`, `reported_by`, `assigned_to`, `blocks_availability` |
| #20 billing | checkin/checkout | — | `total_amount`, `paid_amount`, `status` |
| #21 dashboard | all services | — | aggregation queries |
| #62 reports | billing + reservations | — | date range filtering |
