-- Migration 002: Add soft delete support to all 13 core tables.
-- Adds deleted_at timestamptz column, converts 3 UNIQUE constraints to partial
-- unique indexes, and adds 5 performance indexes for filtered queries.

-- ── 1. Add deleted_at column to all 13 tables ────────────────────────────

ALTER TABLE properties ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE guests ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE room_types ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE rooms ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE reservations ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE reservation_items ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE stays ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE stay_guests ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE housekeeping_tasks ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE maintenance_tickets ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE invoices ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE payments ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- ── 2. Drop 3 UNIQUE constraints, recreate as partial unique indexes ──────
-- These constraints must allow duplicate names/emails/identifiers among
-- soft-deleted records while still enforcing uniqueness among active records.

-- room_types: UNIQUE(property_id, name) → partial index
ALTER TABLE room_types DROP CONSTRAINT room_types_property_name_key;
CREATE UNIQUE INDEX room_types_property_name_active_idx
    ON room_types(property_id, name)
    WHERE deleted_at IS NULL;

-- rooms: UNIQUE(property_id, identifier) → partial index
ALTER TABLE rooms DROP CONSTRAINT rooms_property_identifier_key;
CREATE UNIQUE INDEX rooms_property_identifier_active_idx
    ON rooms(property_id, identifier)
    WHERE deleted_at IS NULL;

-- profiles: UNIQUE(property_id, email) → partial index
ALTER TABLE profiles DROP CONSTRAINT profiles_property_email_key;
CREATE UNIQUE INDEX profiles_property_email_active_idx
    ON profiles(property_id, email)
    WHERE deleted_at IS NULL;

-- ── 3. Add (property_id, deleted_at) performance indexes ──────────────────
-- These composite indexes support efficient filtered queries that exclude
-- soft-deleted records.

CREATE INDEX room_types_property_deleted_idx ON room_types(property_id, deleted_at);
CREATE INDEX rooms_property_deleted_idx ON rooms(property_id, deleted_at);
CREATE INDEX guests_property_deleted_idx ON guests(property_id, deleted_at);
CREATE INDEX profiles_property_deleted_idx ON profiles(property_id, deleted_at);
CREATE INDEX reservations_property_deleted_idx ON reservations(property_id, deleted_at);
