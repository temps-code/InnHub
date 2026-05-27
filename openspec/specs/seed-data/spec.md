# Seed Data Specification

## Purpose

Versioned, idempotent seed data for MVP demo across 2 Tarija-Bolivia properties with 5 roles each.

## Requirements

### Requirement: Idempotent Seed Script

The seed script MUST use `INSERT ... ON CONFLICT DO NOTHING` and run repeatedly without duplicates or errors.

#### Scenario: First run inserts all demo data

- GIVEN schema tables exist
- WHEN the seed script executes
- THEN it MUST insert 10 auth users, 10 profiles, 2 properties, and all operational records
- AND it MUST complete without errors

#### Scenario: Re-run produces no duplicates

- GIVEN the seed script already executed
- WHEN the same script runs again
- THEN it MUST NOT insert duplicate rows
- AND it MUST complete without constraint violations

### Requirement: Auth User Seeding

Auth users MUST be created via `POST /api/auth/users` REST API (InsForge write-protects `auth.users` schema). The password `Demo123!` is set by the API, and `email_verified` may be `false` but `requireEmailVerification` MUST be disabled project-wide so login works without verification.

#### Scenario: All demo auth users exist

- GIVEN `scripts/setup-demo-users.sh` executes
- WHEN reviewers query `auth.users`
- THEN they MUST find users matching `admin+{property}-{role}@innhub.dev` for both properties
- AND each MUST authenticate with `Demo123!` via `signInWithPassword`

#### Scenario: Auth user authenticates

- GIVEN a seeded auth user exists
- WHEN InsForge `signInWithPassword` receives the email and `Demo123!`
- THEN authentication MUST succeed

### Requirement: Profile and Property Seeding

The seed MUST create 2 properties and 10 profiles linked to auth users with correct role and `property_id`.

#### Scenario: Both properties created

- GIVEN the seed runs
- WHEN reviewers query `properties`
- THEN Hotel Tarija MUST have `business_type = hotel`, currency `BOB`, timezone `America/La_Paz`
- AND Hostal Los Chapacos with `business_type = hostel`, same currency/timezone

#### Scenario: Profiles link correctly

- GIVEN the seed runs
- WHEN reviewers check `profiles`
- THEN each property MUST have 5 profiles, one per role
- AND each `auth_user_id` MUST match the corresponding auth user
- AND each profile MUST belong to the correct `property_id`

### Requirement: Operational Demo Data

The seed MUST create room types, rooms, guests, reservations, stays, invoices, payments, housekeeping, and maintenance — all property-scoped.

#### Scenario: Room types and rooms match spec

- GIVEN the seed runs
- WHEN reviewers query `room_types`
- THEN Hotel MUST have Standard Queen (2pax), Twin Room (2pax), Family Suite (4pax)
- AND Hostal MUST have Mixed Dorm (6pax), Private Twin (2pax), Private Double (2pax)
- AND 6 hotel rooms and 5 hostel rooms MUST exist with valid `room_state`

#### Scenario: Operations data is property-scoped

- GIVEN the seed runs
- WHEN reviewers check reservations, stays, invoices, payments, housekeeping, maintenance
- THEN each record MUST include a valid `property_id`
- AND reservations MUST be confirmed with future dates
- AND stays MUST be `active` or `checked_out` for at least one property
- AND invoices MUST support manual payments without gateway fields
- AND housekeeping MUST reference rooms in valid states
- AND maintenance MUST block availability for affected rooms

### Requirement: Seed Documentation

The system MUST document seed execution, verification, and teardown in `docs/seed-data.md`.

#### Scenario: Docs describe execution

- GIVEN reviewers inspect `docs/seed-data.md`
- WHEN they read the document
- THEN it MUST describe executing via InsForge `run-raw-sql`
- AND list expected row counts and a login example per role

#### Scenario: Teardown reverses seed

- GIVEN seed data exists
- WHEN the teardown script executes
- THEN it MUST delete seeded auth users by email pattern and cascade through all linked data
- AND re-seeding after teardown MUST restore all data without errors

## Acceptance Criteria

- First seed run inserts all data; re-run produces zero duplicates.
- 10 auth users authenticate with `Demo123!`.
- 2 properties and 10 profiles exist (5 per property, one per role), correctly linked.
- Room types, rooms, guests, reservations, stays, invoices, payments, housekeeping, maintenance seeded — all property-scoped.
- `docs/seed-data.md` documents execution, verification, and teardown.
- Teardown removes all seeded records; re-seed after teardown restores cleanly.
