-- =============================================================================
-- Seed Data for MVP Validation — InnHub
-- Properties: Hotel Tarija (Tarija) + Hostal Los Chapacos (Tarija, Bolivia)
-- 10 profiles, 5 roles per property, full operational data
-- Idempotent via ON CONFLICT DO NOTHING
-- =============================================================================
-- PREREQUISITE: Run scripts/setup-demo-users.sh FIRST to create auth users.
--   The auth.users schema is write-protected by InsForge; users must be created
--   via the REST API (POST /api/auth/users) before seeding public tables.
--   After running setup-demo-users.sh, the resulting demo-user-uuids.json
--   will contain the UUIDs used in the profiles section below.
--
-- Execute via InsForge MCP:
--   insforge_run-raw-sql(query: "<file content>", apiKey: "<admin-key>")
-- =============================================================================

BEGIN;

-- =============================================================================
-- Section 1: Properties (2)
-- =============================================================================

INSERT INTO public.properties (id, name, slug, business_type, timezone, currency, address, phone, email)
VALUES
  (
    '00000000-0000-0000-0010-000000000001',
    'Hotel Tarija',
    'hotel-tarija',
    'hotel',
    'America/La_Paz',
    'BOB',
    'Calle Sucre 123, Tarija, Bolivia',
    '+591 4 6631234',
    'hotel.tarija@innhub.dev'
  ),
  (
    '00000000-0000-0000-0010-000000000002',
    'Hostal Los Chapacos',
    'hostal-los-chapacos',
    'hostel',
    'America/La_Paz',
    'BOB',
    'Av. Las Barrancas 456, Tarija, Bolivia',
    '+591 4 6635678',
    'chapacos@innhub.dev'
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- Section 2: Profiles (10 — 5 per property)
-- auth_user_id values must match the UUIDs produced by scripts/setup-demo-users.sh.
-- Before enabling RLS, compare these UUIDs with scripts/demo-user-uuids.json;
-- RLS profile bootstrap depends on auth.uid() = profiles.auth_user_id.
-- =============================================================================

INSERT INTO public.profiles (id, auth_user_id, property_id, email, full_name, role, status)
VALUES
  -- Hotel Tarija
  ('00000000-0000-0000-0011-010000000001', 'd08783ab-0854-48ff-9d9e-8d676d3dd3cb', '00000000-0000-0000-0010-000000000001', 'admin+tarija-admin@innhub.dev',       'Admin Tarija',       'administrator', 'active'),
  ('00000000-0000-0000-0011-010000000002', 'a0ba1ce4-4cb7-43c2-9b3a-514f958aaf17', '00000000-0000-0000-0010-000000000001', 'admin+tarija-manager@innhub.dev',     'Gerente Tarija',     'manager',        'active'),
  ('00000000-0000-0000-0011-010000000003', '9995019b-bbee-4fdd-9818-50f596dfb98e', '00000000-0000-0000-0010-000000000001', 'admin+tarija-reception@innhub.dev',   'Recepcionista Tarija','receptionist',   'active'),
  ('00000000-0000-0000-0011-010000000004', 'dc452f77-b628-41bb-bd23-568a71213e84', '00000000-0000-0000-0010-000000000001', 'admin+tarija-housekeep@innhub.dev',   'Limpieza Tarija',    'housekeeping',   'active'),
  ('00000000-0000-0000-0011-010000000005', 'a3f6c76f-fdee-43e6-a479-96ff162ade43', '00000000-0000-0000-0010-000000000001', 'admin+tarija-maintenance@innhub.dev', 'Mantenimiento Tarija','maintenance',    'active'),
  -- Hostal Los Chapacos
  ('00000000-0000-0000-0011-020000000001', '50d30aab-c0e7-4f47-aa8a-26591418d197', '00000000-0000-0000-0010-000000000002', 'admin+loschapacos-admin@innhub.dev',    'Admin Chapacos',       'administrator', 'active'),
  ('00000000-0000-0000-0011-020000000002', 'e355ec75-eaf0-4458-80f4-d08b31a5c510', '00000000-0000-0000-0010-000000000002', 'admin+loschapacos-manager@innhub.dev',  'Gerente Chapacos',     'manager',        'active'),
  ('00000000-0000-0000-0011-020000000003', '1e6cb2a0-19ba-4fc0-a8c7-30fd9475bbb7', '00000000-0000-0000-0010-000000000002', 'admin+loschapacos-reception@innhub.dev', 'Recepcionista Chapacos','receptionist',   'active'),
  ('00000000-0000-0000-0011-020000000004', 'd3448b58-b1b5-4dc4-91a4-0cf851422b60', '00000000-0000-0000-0010-000000000002', 'admin+loschapacos-housekeep@innhub.dev', 'Limpieza Chapacos',    'housekeeping',   'active'),
  ('00000000-0000-0000-0011-020000000005', '92055925-6dd2-443d-882d-5c31a911ec77', '00000000-0000-0000-0010-000000000002', 'admin+loschapacos-maintenance@innhub.dev','Mantenimiento Chapacos','maintenance',    'active')
ON CONFLICT (auth_user_id) DO NOTHING;

-- =============================================================================
-- Section 3: Room Types (6 — 3 per property)
-- =============================================================================

INSERT INTO public.room_types (id, property_id, name, description, capacity, base_price)
VALUES
  -- Hotel Tarija
  ('00000000-0000-0000-0020-010000000001', '00000000-0000-0000-0010-000000000001', 'Standard Queen', 'Habitación estándar con cama queen size', 2, 350.00),
  ('00000000-0000-0000-0020-010000000002', '00000000-0000-0000-0010-000000000001', 'Twin Room',      'Habitación con dos camas individuales',   2, 300.00),
  ('00000000-0000-0000-0020-010000000003', '00000000-0000-0000-0010-000000000001', 'Family Suite',   'Suite familiar con cama queen + litera',  4, 600.00),
  -- Hostal Los Chapacos
  ('00000000-0000-0000-0020-020000000001', '00000000-0000-0000-0010-000000000002', 'Mixed Dorm',     'Dormitorio compartido mixto',             6, 120.00),
  ('00000000-0000-0000-0020-020000000002', '00000000-0000-0000-0010-000000000002', 'Private Twin',   'Habitación privada con dos camas',        2, 200.00),
  ('00000000-0000-0000-0020-020000000003', '00000000-0000-0000-0010-000000000002', 'Private Double', 'Habitación privada con cama matrimonial', 2, 180.00)
ON CONFLICT (property_id, name) DO NOTHING;

-- =============================================================================
-- Section 4: Rooms (11 — 6 Hotel + 5 Hostal)
-- =============================================================================

INSERT INTO public.rooms (id, property_id, room_type_id, identifier, floor, state, description)
VALUES
  -- Hotel Tarija: Standard Queen x3 (101-103), Twin x2 (201-202), Family Suite x1 (301)
  ('00000000-0000-0000-0030-010000000001', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000001', '101', '1', 'available', 'Standard Queen — vista a la calle'),
  ('00000000-0000-0000-0030-010000000002', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000001', '102', '1', 'available', 'Standard Queen — vista al patio'),
  ('00000000-0000-0000-0030-010000000003', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000001', '103', '1', 'available', 'Standard Queen — silenciosa'),
  ('00000000-0000-0000-0030-010000000004', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000002', '201', '2', 'available', 'Twin Room — dos camas individuales'),
  ('00000000-0000-0000-0030-010000000005', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000002', '202', '2', 'available', 'Twin Room — amplia'),
  ('00000000-0000-0000-0030-010000000006', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0020-010000000003', '301', '3', 'available', 'Family Suite — queen + litera'),
  -- Hostal Los Chapacos: Mixed Dorm x3 (D1-D3), Private Twin x1 (P1), Private Double x1 (P2)
  ('00000000-0000-0000-0030-020000000001', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0020-020000000001', 'D1', '1', 'available', 'Dormitorio mixto — 6 camas'),
  ('00000000-0000-0000-0030-020000000002', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0020-020000000001', 'D2', '1', 'available', 'Dormitorio mixto — 6 camas'),
  ('00000000-0000-0000-0030-020000000003', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0020-020000000001', 'D3', '1', 'available', 'Dormitorio mixto — 6 camas'),
  ('00000000-0000-0000-0030-020000000004', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0020-020000000002', 'P1', '2', 'available', 'Privada twin — dos camas individuales'),
  ('00000000-0000-0000-0030-020000000005', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0020-020000000003', 'P2', '2', 'available', 'Privada double — cama matrimonial')
ON CONFLICT (property_id, identifier) DO NOTHING;

-- =============================================================================
-- Section 5: Guests (8 — 4 per property)
-- =============================================================================

INSERT INTO public.guests (id, property_id, first_name, last_name, document_type, document_number, email, phone)
VALUES
  -- Hotel Tarija
  ('00000000-0000-0000-0040-010000000001', '00000000-0000-0000-0010-000000000001', 'Juan',   'Pérez',     'CI',  '1234567',   'juan.perez@email.com',    '+591 72210001'),
  ('00000000-0000-0000-0040-010000000002', '00000000-0000-0000-0010-000000000001', 'María',  'López',     'CI',  '7654321',   'maria.lopez@email.com',   '+591 72210002'),
  ('00000000-0000-0000-0040-010000000003', '00000000-0000-0000-0010-000000000001', 'Carlos', 'García',    'NIT', '123456701', 'carlos.garcia@email.com',  '+591 72210003'),
  ('00000000-0000-0000-0040-010000000004', '00000000-0000-0000-0010-000000000001', 'Ana',    'Mendoza',   'CI',  '9876543',   'ana.mendoza@email.com',   '+591 72210004'),
  -- Hostal Los Chapacos
  ('00000000-0000-0000-0040-020000000001', '00000000-0000-0000-0010-000000000002', 'Pedro',  'Morales',   'CI',  '4567890',   'pedro.morales@email.com', '+591 72210005'),
  ('00000000-0000-0000-0040-020000000002', '00000000-0000-0000-0010-000000000002', 'Lucía',  'Fernández', 'CI',  '8901234',   'lucia.fernandez@email.com','+591 72210006'),
  ('00000000-0000-0000-0040-020000000003', '00000000-0000-0000-0010-000000000002', 'Roberto','Quispe',    'NIT', '456789012', 'roberto.quispe@email.com', '+591 72210007'),
  ('00000000-0000-0000-0040-020000000004', '00000000-0000-0000-0010-000000000002', 'Carmen', 'Vaca',      'CI',  '5678901',   'carmen.vaca@email.com',   '+591 72210008')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 6: Reservations (4 — 2 per property) + Reservation Items (4)
-- Future dates: +14 days (2026-06-09) and +21 days (2026-06-16)
-- =============================================================================

INSERT INTO public.reservations (id, property_id, primary_guest_id, planned_check_in_date, planned_check_out_date, status, notes)
VALUES
  -- Hotel Tarija
  (
    '00000000-0000-0000-0050-010000000001',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0040-010000000001',
    CURRENT_DATE + INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '16 days',
    'confirmed',
    'Reserva de Juan Pérez — Standard Queen'
  ),
  (
    '00000000-0000-0000-0050-010000000002',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0040-010000000003',
    CURRENT_DATE + INTERVAL '21 days',
    CURRENT_DATE + INTERVAL '23 days',
    'confirmed',
    'Reserva de Carlos García — Family Suite'
  ),
  -- Hostal Los Chapacos
  (
    '00000000-0000-0000-0050-020000000001',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0040-020000000001',
    CURRENT_DATE + INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '16 days',
    'confirmed',
    'Reserva de Pedro Morales — Private Double'
  ),
  (
    '00000000-0000-0000-0050-020000000002',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0040-020000000003',
    CURRENT_DATE + INTERVAL '21 days',
    CURRENT_DATE + INTERVAL '23 days',
    'confirmed',
    'Reserva de Roberto Quispe — Mixed Dorm'
  )
ON CONFLICT (id) DO NOTHING;

-- Reservation Items
INSERT INTO public.reservation_items (id, property_id, reservation_id, room_type_id, room_id, status, guest_count, notes)
VALUES
  -- Hotel Tarija — item 1 links to active stay (checked in early), item 2 is future confirmed
  (
    '00000000-0000-0000-0050-010000000011',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0050-010000000001',
    '00000000-0000-0000-0020-010000000001',
    '00000000-0000-0000-0030-010000000001',
    'checked_in',
    2,
    'Standard Queen 101 — huésped registrado'
  ),
  (
    '00000000-0000-0000-0050-010000000012',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0050-010000000002',
    '00000000-0000-0000-0020-010000000003',
    '00000000-0000-0000-0030-010000000006',
    'confirmed',
    3,
    'Family Suite 301 — confirmada'
  ),
  -- Hostal Los Chapacos
  (
    '00000000-0000-0000-0050-020000000011',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0050-020000000001',
    '00000000-0000-0000-0020-020000000003',
    '00000000-0000-0000-0030-020000000005',
    'checked_in',
    2,
    'Private Double P2 — huésped registrado'
  ),
  (
    '00000000-0000-0000-0050-020000000012',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0050-020000000002',
    '00000000-0000-0000-0020-020000000001',
    '00000000-0000-0000-0030-020000000001',
    'confirmed',
    4,
    'Mixed Dorm D1 — confirmada'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 7: Stays (2 — 1 active per property) + Stay Guests
-- =============================================================================

INSERT INTO public.stays (id, property_id, reservation_item_id, primary_guest_id, room_id, actual_check_in_at, expected_check_out_date, status, guest_count)
VALUES
  (
    '00000000-0000-0000-0050-010000000021',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0050-010000000011',
    '00000000-0000-0000-0040-010000000001',
    '00000000-0000-0000-0030-010000000001',
    now() - interval '4 hours',
    CURRENT_DATE + INTERVAL '16 days',
    'active',
    2
  ),
  (
    '00000000-0000-0000-0050-020000000021',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0050-020000000011',
    '00000000-0000-0000-0040-020000000001',
    '00000000-0000-0000-0030-020000000005',
    now() - interval '2 hours',
    CURRENT_DATE + INTERVAL '16 days',
    'active',
    1
  )
ON CONFLICT (id) DO NOTHING;

-- Stay Guests
INSERT INTO public.stay_guests (id, property_id, stay_id, guest_id, is_primary)
VALUES
  (
    '00000000-0000-0000-0050-010000000031',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0050-010000000021',
    '00000000-0000-0000-0040-010000000001',
    true
  ),
  (
    '00000000-0000-0000-0050-010000000032',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0050-010000000021',
    '00000000-0000-0000-0040-010000000002',
    false
  ),
  (
    '00000000-0000-0000-0050-020000000031',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0050-020000000021',
    '00000000-0000-0000-0040-020000000001',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 8: Invoices (6 — 1 pending per reservation + 1 paid per property)
-- =============================================================================

INSERT INTO public.invoices (id, property_id, guest_id, reservation_id, stay_id, invoice_number, status, currency, subtotal_amount, tax_amount, total_amount, paid_amount, issued_at, notes)
VALUES
  -- Hotel Tarija — pending per reservation
  (
    '00000000-0000-0000-0060-010000000001',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0040-010000000001',
    '00000000-0000-0000-0050-010000000001',
    NULL,
    'INV-2026-0001',
    'pending',
    'BOB',
    700.00, 0, 700.00, 0,
    now(),
    'Factura pendiente — Reserva Juan Pérez'
  ),
  (
    '00000000-0000-0000-0060-010000000002',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0040-010000000003',
    '00000000-0000-0000-0050-010000000002',
    NULL,
    'INV-2026-0002',
    'pending',
    'BOB',
    1200.00, 0, 1200.00, 0,
    now(),
    'Factura pendiente — Reserva Carlos García'
  ),
  -- Hotel Tarija — paid from active stay
  (
    '00000000-0000-0000-0060-010000000003',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0040-010000000001',
    NULL,
    '00000000-0000-0000-0050-010000000021',
    'INV-2026-0003',
    'paid',
    'BOB',
    700.00, 0, 700.00, 700.00,
    now(),
    'Factura pagada — Anticipo estadía Juan Pérez'
  ),
  -- Hostal Los Chapacos — pending per reservation
  (
    '00000000-0000-0000-0060-020000000001',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0040-020000000001',
    '00000000-0000-0000-0050-020000000001',
    NULL,
    'INV-2026-0001',
    'pending',
    'BOB',
    360.00, 0, 360.00, 0,
    now(),
    'Factura pendiente — Reserva Pedro Morales'
  ),
  (
    '00000000-0000-0000-0060-020000000002',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0040-020000000003',
    '00000000-0000-0000-0050-020000000002',
    NULL,
    'INV-2026-0002',
    'pending',
    'BOB',
    480.00, 0, 480.00, 0,
    now(),
    'Factura pendiente — Reserva Roberto Quispe'
  ),
  -- Hostal Los Chapacos — paid from active stay
  (
    '00000000-0000-0000-0060-020000000003',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0040-020000000001',
    NULL,
    '00000000-0000-0000-0050-020000000021',
    'INV-2026-0003',
    'paid',
    'BOB',
    360.00, 0, 360.00, 360.00,
    now(),
    'Factura pagada — Anticipo estadía Pedro Morales'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 9: Payments (2 — 1 per property, cash)
-- =============================================================================

INSERT INTO public.payments (id, property_id, invoice_id, amount, method, status, paid_at, reference, notes)
VALUES
  (
    '00000000-0000-0000-0060-010000000011',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0060-010000000003',
    700.00,
    'cash',
    'recorded',
    now(),
    'REC-2026-0001',
    'Pago en efectivo — anticipo Hotel Tarija'
  ),
  (
    '00000000-0000-0000-0060-020000000011',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0060-020000000003',
    360.00,
    'cash',
    'recorded',
    now(),
    'REC-2026-0001',
    'Pago en efectivo — anticipo Hostal Los Chapacos'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 10: Housekeeping (2 — 1 per property)
-- =============================================================================

INSERT INTO public.housekeeping_tasks (id, property_id, room_id, assigned_to_profile_id, status, priority, due_at, notes)
VALUES
  (
    '00000000-0000-0000-0070-010000000001',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0030-010000000002',
    '00000000-0000-0000-0011-010000000004',
    'pending',
    'normal',
    now() + interval '2 hours',
    'Limpiar habitación 102 — check-out teórico'
  ),
  (
    '00000000-0000-0000-0070-020000000001',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0030-020000000002',
    '00000000-0000-0000-0011-020000000004',
    'pending',
    'normal',
    now() + interval '1 hour',
    'Limpiar habitación D2 — check-out teórico'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 11: Maintenance Tickets (2 — 1 per property, blocks availability)
-- =============================================================================

INSERT INTO public.maintenance_tickets (id, property_id, room_id, reported_by_profile_id, assigned_to_profile_id, title, description, status, priority, blocks_availability)
VALUES
  (
    '00000000-0000-0000-0070-010000000011',
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0030-010000000006',
    '00000000-0000-0000-0011-010000000001',
    '00000000-0000-0000-0011-010000000005',
    'Aire acondicionado no funciona',
    'El aire acondicionado de la Family Suite 301 no enfría. Revisar compresor.',
    'open',
    'high',
    true
  ),
  (
    '00000000-0000-0000-0070-020000000011',
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0030-020000000001',
    '00000000-0000-0000-0011-020000000001',
    '00000000-0000-0000-0011-020000000005',
    'Calefón del agua caliente',
    'El calefón del Mixed Dorm D1 no prende. Revisar piloto y termocupla.',
    'open',
    'urgent',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Section 12: Room State Updates
-- Update room states based on active stays and maintenance tickets
-- =============================================================================

UPDATE public.rooms SET state = 'occupied' WHERE id = '00000000-0000-0000-0030-010000000001';  -- 101 — active stay
UPDATE public.rooms SET state = 'occupied' WHERE id = '00000000-0000-0000-0030-020000000005';  -- P2  — active stay
UPDATE public.rooms SET state = 'maintenance' WHERE id = '00000000-0000-0000-0030-010000000006'; -- 301 — AC repair
UPDATE public.rooms SET state = 'maintenance' WHERE id = '00000000-0000-0000-0030-020000000001'; -- D1  — water heater

COMMIT;
