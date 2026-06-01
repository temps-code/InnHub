# Guests Specification

## Purpose

Define property-scoped guest record management for InnHub MVP, including safe lifecycle controls (soft delete, trash restore, and purge) under authenticated RLS-constrained service behavior.

## Requirements

### Requirement: Property-Scoped Authenticated Guest Service

The system MUST execute all guest operations through authenticated, property-scoped service behavior aligned with active RLS.

#### Scenario: Session-scoped guest list query

- GIVEN an authenticated user with a current `property_id`
- WHEN the system lists guests
- THEN the query MUST include an explicit `property_id` filter matching the session property
- AND the system MUST NOT use service-role bypass behavior

#### Scenario: Cross-property access attempt

- GIVEN a guest record from another property
- WHEN a user attempts to read, update, delete, restore, or purge it
- THEN the operation MUST fail safely without cross-property data leakage

### Requirement: Guest Record Fields

The system MUST support guest records with first name, last name, document type, document number, email, phone, and notes.

#### Scenario: Create guest with required fields

- GIVEN a valid guest payload for the active property
- WHEN the user creates a guest
- THEN the persisted record MUST include first name, last name, document type, and document number
- AND it SHOULD persist email, phone, and notes when provided

### Requirement: Active List, Search, Filters, and Pagination

The system MUST provide server-side guest listing with safe states, search, activity filtering, and pagination.

#### Scenario: Active list excludes soft-deleted guests

- GIVEN active and soft-deleted guests exist in the same property
- WHEN the active list is requested
- THEN records with `deleted_at` set MUST be excluded

#### Scenario: Trash list includes only soft-deleted guests

- GIVEN active and soft-deleted guests exist in the same property
- WHEN the trash list is requested
- THEN only records with `deleted_at` set MUST be returned
- AND each trash row MUST expose `deleted_at`

#### Scenario: Search and pagination

- GIVEN guests exist for the active property
- WHEN the user searches by name, email, or document number
- THEN the system MUST apply server-side filtering
- AND the default page size MUST be 20

#### Scenario: Safe UI states

- GIVEN list data is loading, empty, no-match, or failed
- WHEN the page renders
- THEN the system MUST show safe loading, empty/no-results, and error states

### Requirement: Soft Delete Guard and Authorization

The system MUST allow soft delete only for manager/administrator roles and MUST block soft delete when active/current/future reservation guards fail.

#### Scenario: Allowed role soft delete

- GIVEN the user role is manager or administrator
- AND the guest has no blocking non-deleted reservation in status `pending`, `confirmed`, or `checked-in` for current/future relevance
- WHEN soft delete is confirmed
- THEN the system MUST set `deleted_at`
- AND the guest MUST move to trash

#### Scenario: Soft delete blocked by reservation guard

- GIVEN the guest has a non-deleted reservation in status `pending`, `confirmed`, or `checked-in` with current/future relevance
- WHEN soft delete is requested
- THEN the system MUST reject soft delete
- AND it MUST return a safe blocking result

### Requirement: Restore from Trash

The system MUST allow restore only from trash for authorized roles and MUST clear `deleted_at` when restoration succeeds.

#### Scenario: Restore guest

- GIVEN a soft-deleted guest in the active property
- AND the acting role is authorized by route/service policy
- WHEN restore is confirmed
- THEN `deleted_at` MUST be cleared
- AND the guest MUST reappear in the active list

### Requirement: Admin-Only Purge with Strict Confirmation

The system MUST restrict permanent purge to administrator role, require strict destructive confirmation, and enforce reservation-reference blocking.

#### Scenario: Purge confirmation required

- GIVEN an administrator selects a guest in trash
- WHEN purge is attempted without strict confirmation
- THEN purge MUST NOT execute

#### Scenario: Purge blocked by reservation references

- GIVEN any reservation references the guest regardless of reservation status
- WHEN an administrator requests purge with strict confirmation
- THEN the system MUST block purge
- AND it MUST return the blocking reference count

#### Scenario: Successful purge

- GIVEN an administrator provides strict confirmation
- AND no reservation references exist for the guest
- WHEN purge executes
- THEN the guest record MUST be permanently removed

## Acceptance Criteria

- All guest operations use authenticated, property-scoped service behavior aligned with RLS and explicit `property_id` filters.
- Active list excludes `deleted_at` records; trash list includes only `deleted_at` records and shows deletion timestamp.
- Server-side search supports name/email/document number; default page size is 20.
- Safe loading/empty/no-results/error states are present.
- Soft delete is manager/administrator only and blocked by non-deleted active/current/future reservations in statuses `pending`, `confirmed`, `checked-in`.
- Restore works from trash for authorized roles and clears `deleted_at`.
- Purge is administrator-only, requires strict confirmation, and is blocked by any reservation reference with returned blocking count.
- Requirements are testable under strict TDD using `npm run test:run`.
