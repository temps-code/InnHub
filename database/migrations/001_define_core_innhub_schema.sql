-- InnHub core schema foundation.
-- Work Unit A: repository migration only. Apply to InsForge in Work Unit B.

create extension if not exists pgcrypto;

-- Domain enums
create type profile_role as enum ('administrator', 'manager', 'receptionist', 'housekeeping', 'maintenance');
create type profile_status as enum ('active', 'inactive');
create type room_state as enum ('available', 'occupied', 'cleaning', 'maintenance', 'inactive');
create type reservation_status as enum ('pending', 'confirmed', 'partially_checked_in', 'checked_in', 'cancelled', 'no_show');
create type reservation_item_status as enum ('pending', 'confirmed', 'checked_in', 'cancelled', 'no_show');
create type stay_status as enum ('active', 'checked_out', 'cancelled');
create type housekeeping_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type maintenance_status as enum ('open', 'in_progress', 'resolved', 'cancelled');
create type task_priority as enum ('low', 'normal', 'high', 'urgent');
create type invoice_status as enum ('pending', 'partial', 'paid', 'void');
create type payment_method as enum ('cash', 'card', 'bank_transfer', 'other');
create type payment_status as enum ('recorded', 'voided');

-- Root and identity
create table properties (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text not null unique,
	business_type text,
	timezone text not null default 'UTC',
	currency text not null default 'USD',
	address text,
	phone text,
	email text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table profiles (
	id uuid primary key default gen_random_uuid(),
	auth_user_id uuid not null unique,
	property_id uuid not null references properties(id) on delete restrict,
	email text not null,
	full_name text not null,
	role profile_role not null default 'receptionist',
	status profile_status not null default 'active',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint profiles_id_property_id_key unique (id, property_id),
	constraint profiles_property_email_key unique (property_id, email)
);

create table guests (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	first_name text not null,
	last_name text not null,
	document_type text,
	document_number text,
	email text,
	phone text,
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint guests_id_property_id_key unique (id, property_id)
);

-- Inventory
create table room_types (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	name text not null,
	description text,
	capacity integer not null check (capacity > 0),
	base_price numeric(12, 2) not null check (base_price >= 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint room_types_id_property_id_key unique (id, property_id),
	constraint room_types_property_name_key unique (property_id, name)
);

create table rooms (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	room_type_id uuid not null,
	identifier text not null,
	floor text,
	state room_state not null default 'available',
	description text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint rooms_id_property_id_key unique (id, property_id),
	constraint rooms_property_identifier_key unique (property_id, identifier),
	constraint rooms_room_type_property_fk foreign key (room_type_id, property_id) references room_types(id, property_id) on delete restrict
);

-- Reservations and actual stays
create table reservations (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	primary_guest_id uuid not null,
	planned_check_in_date date not null,
	planned_check_out_date date not null,
	status reservation_status not null default 'pending',
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint reservations_id_property_id_key unique (id, property_id),
	constraint reservations_date_order_check check (planned_check_out_date > planned_check_in_date),
	constraint reservations_primary_guest_property_fk foreign key (primary_guest_id, property_id) references guests(id, property_id) on delete restrict
);

create table reservation_items (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	reservation_id uuid not null,
	room_type_id uuid not null,
	room_id uuid,
	status reservation_item_status not null default 'pending',
	guest_count integer not null check (guest_count > 0),
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint reservation_items_id_property_id_key unique (id, property_id),
	constraint reservation_items_reservation_property_fk foreign key (reservation_id, property_id) references reservations(id, property_id) on delete cascade,
	constraint reservation_items_room_type_property_fk foreign key (room_type_id, property_id) references room_types(id, property_id) on delete restrict,
	constraint reservation_items_room_property_fk foreign key (room_id, property_id) references rooms(id, property_id) on delete restrict
);

create table stays (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	reservation_item_id uuid,
	primary_guest_id uuid not null,
	room_id uuid not null,
	actual_check_in_at timestamptz not null default now(),
	expected_check_out_date date not null,
	actual_check_out_at timestamptz,
	status stay_status not null default 'active',
	guest_count integer not null check (guest_count > 0),
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint stays_id_property_id_key unique (id, property_id),
	constraint stays_reservation_item_key unique (reservation_item_id),
	constraint stays_expected_checkout_check check (expected_check_out_date >= actual_check_in_at::date),
	constraint stays_reservation_item_property_fk foreign key (reservation_item_id, property_id) references reservation_items(id, property_id) on delete restrict,
	constraint stays_primary_guest_property_fk foreign key (primary_guest_id, property_id) references guests(id, property_id) on delete restrict,
	constraint stays_room_property_fk foreign key (room_id, property_id) references rooms(id, property_id) on delete restrict
);

create table stay_guests (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	stay_id uuid not null,
	guest_id uuid not null,
	is_primary boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint stay_guests_id_property_id_key unique (id, property_id),
	constraint stay_guests_stay_guest_key unique (stay_id, guest_id),
	constraint stay_guests_stay_property_fk foreign key (stay_id, property_id) references stays(id, property_id) on delete cascade,
	constraint stay_guests_guest_property_fk foreign key (guest_id, property_id) references guests(id, property_id) on delete restrict
);

-- Operations
create table housekeeping_tasks (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	room_id uuid not null,
	stay_id uuid,
	assigned_to_profile_id uuid,
	status housekeeping_status not null default 'pending',
	priority task_priority not null default 'normal',
	due_at timestamptz,
	completed_at timestamptz,
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint housekeeping_tasks_id_property_id_key unique (id, property_id),
	constraint housekeeping_tasks_room_property_fk foreign key (room_id, property_id) references rooms(id, property_id) on delete restrict,
	constraint housekeeping_tasks_stay_property_fk foreign key (stay_id, property_id) references stays(id, property_id) on delete restrict,
	constraint housekeeping_tasks_assignee_property_fk foreign key (assigned_to_profile_id, property_id) references profiles(id, property_id) on delete restrict
);

create table maintenance_tickets (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	room_id uuid not null,
	reported_by_profile_id uuid,
	assigned_to_profile_id uuid,
	title text not null,
	description text,
	status maintenance_status not null default 'open',
	priority task_priority not null default 'normal',
	blocks_availability boolean not null default false,
	resolved_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint maintenance_tickets_id_property_id_key unique (id, property_id),
	constraint maintenance_tickets_room_property_fk foreign key (room_id, property_id) references rooms(id, property_id) on delete restrict,
	constraint maintenance_tickets_reporter_property_fk foreign key (reported_by_profile_id, property_id) references profiles(id, property_id) on delete restrict,
	constraint maintenance_tickets_assignee_property_fk foreign key (assigned_to_profile_id, property_id) references profiles(id, property_id) on delete restrict
);

-- Billing
create table invoices (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	guest_id uuid,
	reservation_id uuid,
	stay_id uuid,
	invoice_number text not null,
	status invoice_status not null default 'pending',
	currency text not null,
	subtotal_amount numeric(12, 2) not null default 0 check (subtotal_amount >= 0),
	tax_amount numeric(12, 2) not null default 0 check (tax_amount >= 0),
	total_amount numeric(12, 2) not null check (total_amount >= 0),
	paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
	issued_at timestamptz not null default now(),
	due_at timestamptz,
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint invoices_id_property_id_key unique (id, property_id),
	constraint invoices_property_number_key unique (property_id, invoice_number),
	constraint invoices_has_subject_check check (guest_id is not null or reservation_id is not null or stay_id is not null),
	constraint invoices_paid_not_above_total_check check (paid_amount <= total_amount),
	constraint invoices_guest_property_fk foreign key (guest_id, property_id) references guests(id, property_id) on delete restrict,
	constraint invoices_reservation_property_fk foreign key (reservation_id, property_id) references reservations(id, property_id) on delete restrict,
	constraint invoices_stay_property_fk foreign key (stay_id, property_id) references stays(id, property_id) on delete restrict
);

create table payments (
	id uuid primary key default gen_random_uuid(),
	property_id uuid not null references properties(id) on delete restrict,
	invoice_id uuid not null,
	amount numeric(12, 2) not null check (amount > 0),
	method payment_method not null,
	status payment_status not null default 'recorded',
	paid_at timestamptz not null default now(),
	reference text,
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint payments_id_property_id_key unique (id, property_id),
	constraint payments_invoice_property_fk foreign key (invoice_id, property_id) references invoices(id, property_id) on delete restrict
);

-- Review-friendly lookup indexes
create index profiles_property_idx on profiles(property_id);
create index guests_property_idx on guests(property_id);
create index room_types_property_idx on room_types(property_id);
create index rooms_property_state_idx on rooms(property_id, state);
create index reservations_property_status_dates_idx on reservations(property_id, status, planned_check_in_date, planned_check_out_date);
create index reservation_items_property_status_idx on reservation_items(property_id, status);
create index stays_property_status_room_idx on stays(property_id, status, room_id);
create index housekeeping_tasks_property_status_idx on housekeeping_tasks(property_id, status);
create index maintenance_tickets_property_status_idx on maintenance_tickets(property_id, status);
create index invoices_property_status_idx on invoices(property_id, status);
create index payments_property_paid_at_idx on payments(property_id, paid_at);
