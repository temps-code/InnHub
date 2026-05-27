-- =============================================================================
-- Seed Data Teardown — InnHub
-- Reverses all seed data inserts from seed.sql in reverse dependency order
-- =============================================================================
-- Execute via InsForge MCP:
--   insforge_run-raw-sql(query: "<file content>", apiKey: "<admin-key>")
--
-- NOTE: Auth users are NOT removed here. The auth.users schema is
-- write-protected by InsForge. To remove demo auth users, use the API:
-- Run scripts/setup-demo-users.sh again to get UUIDs, then DELETE on each.
-- =============================================================================

BEGIN;

-- Section 11: Maintenance Tickets (blocking availability)
DELETE FROM public.maintenance_tickets
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 10: Housekeeping Tasks
DELETE FROM public.housekeeping_tasks
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 9: Payments (FK to invoices)
DELETE FROM public.payments
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 8: Invoices (FK to guests, reservations, stays)
DELETE FROM public.invoices
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 7: Stay Guests (FK to stays, guests)
DELETE FROM public.stay_guests
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 7: Stays (FK to reservation_items, guests, rooms)
DELETE FROM public.stays
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 6: Reservation Items (FK to reservations, room_types, rooms)
DELETE FROM public.reservation_items
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 6: Reservations (FK to guests)
DELETE FROM public.reservations
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 5: Guests (FK to properties)
DELETE FROM public.guests
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 4: Rooms (FK to room_types, properties)
DELETE FROM public.rooms
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 3: Room Types (FK to properties)
DELETE FROM public.room_types
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 2: Profiles (FK to properties)
DELETE FROM public.profiles
WHERE property_id IN (SELECT id FROM public.properties WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos'));

-- Section 1: Properties
DELETE FROM public.properties
WHERE slug IN ('hotel-tarija', 'hostal-los-chapacos');

COMMIT;
