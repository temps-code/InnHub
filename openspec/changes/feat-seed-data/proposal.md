# Proposal: feat-seed-data

## Intent

The InsForge database has schema tables created but no versioned, repeatable seed data. Existing demo records were inserted manually and are incomplete (2 profiles, both admin; 1 property; missing role coverage). Issue #8 needs a reliable seed script so evaluators can test all MVP roles across 2 properties without manual setup.

## Scope

### In Scope
- SQL seed script — idempotent, versioned, runs via InsForge `run-raw-sql`
- 2 properties in Tarija-Bolivia (hotel + hostel), BOB currency
- 10 profiles (5 per property — admin, manager, receptionist, housekeeping, maintenance)
- Full demo data: room types, rooms, guests, reservations, stays, invoices, payments, housekeeping, maintenance
- Auth users with `+alias` emails and bcrypt-hashed password `Demo123!`
- Documentation for seed execution and teardown

### Out of Scope
- Frontend demo-login UI (owned by auth-session spec)
- Schema migrations, RLS policies, or auth config
- Non-MVP domain data (reports, dashboard presets, realtime fixtures)

## Capabilities

### New Capabilities
- `seed-data`: versioned, idempotent seed data for MVP demo — auth users, profiles, properties, rooms, operations, billing

### Modified Capabilities
None — purely seed data; no spec-level behavior changes.

## Approach

1. Write a single SQL script using `INSERT ... ON CONFLICT DO NOTHING` for idempotency
2. Use `crypt('Demo123!', gen_salt('bf', 10))` for bcrypt password hashing (pgcrypto)
3. Insert into `auth.users` first (with `email_verified = true`), then profiles, then operational data
4. Run via InsForge `run-raw-sql` MCP tool with admin API key
5. Document seed execution in `docs/`, including teardown SQL

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `scripts/seed.sql` | New | Main idempotent seed script |
| `scripts/seed-teardown.sql` | New | Cleanup script for rollback |
| `docs/seed-data.md` | New | Execution and verification docs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| bcrypt hash mismatch with InsForge auth | Low | Test with real `signInWithPassword` after seed |
| ON CONFLICT DO NOTHING misses duplicate patterns | Low | Wrap inserts in existence checks first |
| Email aliases conflict with existing users | Low | Use unique `+alias` pattern scoped to innhub.dev |

## Rollback Plan

Run `scripts/seed-teardown.sql` to delete all seeded auth users by email pattern and cascade through profiles, operations, and billing. Re-run seed script to restore.

## Dependencies

- InsForge admin API key with `run-raw-sql` access
- pgcrypto extension (confirmed available on InsForge PostgreSQL)

## Success Criteria

- [ ] Seed script creates 10 auth users, 10 profiles, 2 properties, full demo data without errors
- [ ] Re-running seed produces zero duplicates (idempotent)
- [ ] Each demo account can authenticate via InsForge `signInWithPassword('admin+tarija-admin@innhub.dev', 'Demo123!')`
- [ ] Each profile resolves to its property and role
