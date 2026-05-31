# Seed Data — MVP Demo

Versioned, idempotent seed data for 2 properties in Tarija-Bolivia with 10 demo accounts (5 roles per property) and full operational demo data.

## Prerequisites

- InsForge project with admin API key
- Schema migrations `001_define_core_innhub_schema.sql` and `002_add_soft_delete.sql` applied
- `INSFORGE_URL` environment variable set to your InsForge project URL
- Demo Auth user UUIDs aligned with `profiles.auth_user_id` before enabling RLS

## Files

| File | Purpose |
|------|---------|
| `scripts/setup-demo-users.sh` | Create 10 auth users via REST API (pre-seed) |
| `scripts/demo-user-uuids.json` | UUID mapping output from setup-demo-users.sh |
| `scripts/seed.sql` | Idempotent INSERT for public tables — run after users exist |
| `scripts/seed-teardown.sql` | Reverse all seeded public data |

## Execution (Two-Step Process)

Auth users must be created FIRST via REST API (the `auth.users` schema is write-protected by InsForge). Then seed public tables via SQL.

### Step 1: Create Auth Users

```bash
export INSFORGE_URL="https://<project>.us-east.insforge.app"
bash scripts/setup-demo-users.sh

# Output: scripts/demo-user-uuids.json with email→UUID mapping
```

This is idempotent — re-running skips existing users and resolves their UUIDs via login.

Before enabling RLS, compare `scripts/demo-user-uuids.json` with the `auth_user_id` values in `scripts/seed.sql`. If they differ, update the profile seed values first; otherwise RLS profile bootstrap will fail because policies depend on `auth.uid() = profiles.auth_user_id`.

### Step 2: Seed Public Tables

Execute via InsForge MCP with the admin API key:

```bash
# Seed
insforge_run-raw-sql(query: "<contents of seed.sql>", apiKey: "<admin-key>")

# Verify row counts after seed
insforge_run-raw-sql(query: "
  SELECT 'properties' AS tbl, COUNT(*) FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos')
  UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'room_types', COUNT(*) FROM public.room_types WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'rooms', COUNT(*) FROM public.rooms WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'guests', COUNT(*) FROM public.guests WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'reservations', COUNT(*) FROM public.reservations WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'reservation_items', COUNT(*) FROM public.reservation_items WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'stays', COUNT(*) FROM public.stays WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'stay_guests', COUNT(*) FROM public.stay_guests WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'invoices', COUNT(*) FROM public.invoices WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'payments', COUNT(*) FROM public.payments WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'housekeeping_tasks', COUNT(*) FROM public.housekeeping_tasks WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
  UNION ALL SELECT 'maintenance_tickets', COUNT(*) FROM public.maintenance_tickets WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'))
", apiKey: "<admin-key>")

# Teardown
insforge_run-raw-sql(query: "<contents of seed-teardown.sql>", apiKey: "<admin-key>")
```

## Demo Accounts

All accounts use password `Demo123!`.

### Hotel Tarija

| Role | Email |
|------|-------|
| Administrator | `admin+tarija-admin@innhub.dev` |
| Manager | `admin+tarija-manager@innhub.dev` |
| Receptionist | `admin+tarija-reception@innhub.dev` |
| Housekeeping | `admin+tarija-housekeep@innhub.dev` |
| Maintenance | `admin+tarija-maintenance@innhub.dev` |

### Hostal Los Chapacos

| Role | Email |
|------|-------|
| Administrator | `admin+loschapacos-admin@innhub.dev` |
| Manager | `admin+loschapacos-manager@innhub.dev` |
| Receptionist | `admin+loschapacos-reception@innhub.dev` |
| Housekeeping | `admin+loschapacos-housekeep@innhub.dev` |
| Maintenance | `admin+loschapacos-maintenance@innhub.dev` |

## Expected Row Counts

| Table | Count |
|-------|-------|
| properties | 2 |
| profiles | 10 |
| room_types | 6 |
| rooms | 11 |
| guests | 8 |
| reservations | 4 |
| reservation_items | 4 |
| stays | 2 |
| stay_guests | 3 |
| invoices | 6 |
| payments | 2 |
| housekeeping_tasks | 2 |
| maintenance_tickets | 2 |

## Verification

### 1. Login Test

After seeding, verify each demo account can authenticate:

```typescript
import { createClient } from '@insforge/sdk'

const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
})

const accounts = [
  'admin+tarija-admin@innhub.dev',
  'admin+tarija-manager@innhub.dev',
  'admin+tarija-reception@innhub.dev',
  'admin+tarija-housekeep@innhub.dev',
  'admin+tarija-maintenance@innhub.dev',
  'admin+loschapacos-admin@innhub.dev',
  'admin+loschapacos-manager@innhub.dev',
  'admin+loschapacos-reception@innhub.dev',
  'admin+loschapacos-housekeep@innhub.dev',
  'admin+loschapacos-maintenance@innhub.dev',
]

for (const email of accounts) {
  const { error } = await client.auth.signInWithPassword({
    email,
    password: 'Demo123!',
  })
  console.log(email, error ? `FAIL: ${error.message}` : 'OK')
}
```

### 2. Tenant Isolation Smoke Test

After RLS is enabled, use at least one account from each property to confirm isolation:

1. Sign in as `admin+tarija-manager@innhub.dev`. The app should show Hotel Tarija room types and rooms only.
2. Sign out, then sign in as `admin+loschapacos-manager@innhub.dev`. The app should show Hostal Los Chapacos room types and rooms only.
3. Refresh a protected route such as `/app/rooms` or `/app/room-types` to confirm the SPA and RLS-protected queries still work after reload.

A failed profile bootstrap, empty same-property data, or cross-property records in either session means the RLS migration must be rolled back or fixed before production evidence is accepted.

### 3. Idempotency Test

Run `setup-demo-users.sh` twice. The second run must resolve UUIDs via login (no creation errors). Then run `seed.sql` twice. The second SQL run must produce 0 new rows and 0 constraint violations.

### 4. Teardown + Re-seed Test

Run `seed-teardown.sql`, then `setup-demo-users.sh`, then `seed.sql`. All data must restore without errors. Verify row counts match the Expected Row Counts table above.

## Properties

| Name | Slug | Business Type | Currency | Timezone |
|------|------|--------------|----------|----------|
| Hotel Tarija | hotel-tarija | hotel | BOB | America/La_Paz |
| Hostal Los Chapacos | hostal-los-chapacos | hostel | BOB | America/La_Paz |

## Room Summary

### Hotel Tarija

| Room | Floor | Type | Capacity | Price (BOB) |
|------|-------|------|----------|-------------|
| 101 | 1 | Standard Queen | 2 | 350 |
| 102 | 1 | Standard Queen | 2 | 350 |
| 103 | 1 | Standard Queen | 2 | 350 |
| 201 | 2 | Twin Room | 2 | 300 |
| 202 | 2 | Twin Room | 2 | 300 |
| 301 | 3 | Family Suite | 4 | 600 |

### Hostal Los Chapacos

| Room | Floor | Type | Capacity | Price (BOB) |
|------|-------|------|----------|-------------|
| D1 | 1 | Mixed Dorm | 6 | 120 |
| D2 | 1 | Mixed Dorm | 6 | 120 |
| D3 | 1 | Mixed Dorm | 6 | 120 |
| P1 | 2 | Private Twin | 2 | 200 |
| P2 | 2 | Private Double | 2 | 180 |
