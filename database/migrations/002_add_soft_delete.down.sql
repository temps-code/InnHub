-- Migration 002 DOWN: Revert soft delete support.
--
-- WARNING: If new records were created with the same UNIQUE values as
-- soft-deleted records (e.g., duplicate room type names, emails, or room
-- identifiers), restoring the UNIQUE constraints will FAIL. Resolve
-- conflicts manually before running this down migration.
--
-- Steps:
--   1. Find duplicates: SELECT property_id, name, COUNT(*) FROM room_types
--      GROUP BY property_id, name HAVING COUNT(*) > 1;
--   2. Resolve by renaming or permanently deleting conflicting records.
--   3. Then run this migration.

-- ── 1. Drop performance indexes ──────────────────────────────────────────

DROP INDEX IF EXISTS room_types_property_deleted_idx;
DROP INDEX IF EXISTS rooms_property_deleted_idx;
DROP INDEX IF EXISTS guests_property_deleted_idx;
DROP INDEX IF EXISTS profiles_property_deleted_idx;
DROP INDEX IF EXISTS reservations_property_deleted_idx;

-- ── 2. Drop partial unique indexes, restore UNIQUE constraints ───────────

DROP INDEX IF EXISTS room_types_property_name_active_idx;
ALTER TABLE room_types ADD CONSTRAINT room_types_property_name_key
    UNIQUE (property_id, name);

DROP INDEX IF EXISTS rooms_property_identifier_active_idx;
ALTER TABLE rooms ADD CONSTRAINT rooms_property_identifier_key
    UNIQUE (property_id, identifier);

DROP INDEX IF EXISTS profiles_property_email_active_idx;
ALTER TABLE profiles ADD CONSTRAINT profiles_property_email_key
    UNIQUE (property_id, email);

-- ── 3. Drop deleted_at column from all 13 tables ────────────────────────

ALTER TABLE properties DROP COLUMN deleted_at;
ALTER TABLE profiles DROP COLUMN deleted_at;
ALTER TABLE guests DROP COLUMN deleted_at;
ALTER TABLE room_types DROP COLUMN deleted_at;
ALTER TABLE rooms DROP COLUMN deleted_at;
ALTER TABLE reservations DROP COLUMN deleted_at;
ALTER TABLE reservation_items DROP COLUMN deleted_at;
ALTER TABLE stays DROP COLUMN deleted_at;
ALTER TABLE stay_guests DROP COLUMN deleted_at;
ALTER TABLE housekeeping_tasks DROP COLUMN deleted_at;
ALTER TABLE maintenance_tickets DROP COLUMN deleted_at;
ALTER TABLE invoices DROP COLUMN deleted_at;
ALTER TABLE payments DROP COLUMN deleted_at;
