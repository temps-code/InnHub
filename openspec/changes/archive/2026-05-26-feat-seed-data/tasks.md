# Tasks: Seed Data for MVP Validation (feat-seed-data)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~420 (seed.sql ~290, teardown.sql ~20, seed-data.md ~80, verify ~30) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (identity) → PR 2 (inventory) → PR 3 (ops+billing) → PR 4 (teardown+docs+verify) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Identity seed: auth users, properties, profiles | PR 1 | Base = main, ~100 lines |
| 2 | Inventory seed: room types, rooms | PR 2 | Base = main, ~60 lines |
| 3 | Operations: guests, reservations, stays, billing, housekeeping, maintenance | PR 3 | Base = main, ~130 lines |
| 4 | Teardown, docs, verification | PR 4 | Base = main, ~130 lines |

## Phase 1: Identity Foundation

- [ ] 1.1 Add 10 auth users to `scripts/seed.sql` — hardcoded UUIDs, `crypt('Demo123!')`, per design §Auth Users
- [ ] 1.2 Add 2 properties to `scripts/seed.sql` — Hotel Tarija + Hostal Los Chapacos, BOB, America/La_Paz
- [ ] 1.3 Add 10 profiles to `scripts/seed.sql` — FK to auth users + properties, one per role per property

## Phase 2: Inventory Layer

- [ ] 2.1 Add 6 room types to `scripts/seed.sql` — 3 per property with base_price, max_capacity per design
- [ ] 2.2 Add 11 rooms to `scripts/seed.sql` — identifiers 101-301 (hotel), D1-P2 (hostel), state=available

## Phase 3: Operations & Billing

- [ ] 3.1 Add 8 guests to `scripts/seed.sql` — 4 per property, CI/NIT document types
- [ ] 3.2 Add 4 reservations + 4 reservation_items — confirmed, future dates (+14d, +21d), FK to room_types
- [ ] 3.3 Add 2 stays + stay_guests — 1 active per property, checked-in today, 1-2 occupants each
- [ ] 3.4 Add 4 invoices + 4 payments — 1 pending + 1 paid per property, cash payments
- [ ] 3.5 Add 2 housekeeping tasks + 2 maintenance tickets — cleaning after check-out, AC/water heater repairs

## Phase 4: Teardown

- [ ] 4.1 Create `scripts/seed-teardown.sql` — reverse-order DELETE by `email LIKE '%@innhub.dev'`, per design §Teardown

## Phase 5: Documentation & Verification

- [ ] 5.1 Create `docs/seed-data.md` — prerequisites, InsForge run-raw-sql execution, per-role login table, expected row counts
- [ ] 5.2 Verify 10 accounts — call `signInWithPassword` for each, all succeed (spec §Auth User Authenticates)
- [ ] 5.3 Verify idempotency — run seed twice, assert 0 new rows (spec §Re-run produces no duplicates)
- [ ] 5.4 Verify teardown + re-seed — run teardown, re-seed, assert full data restored (spec §Teardown reverses seed)
