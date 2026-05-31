-- =============================================================================
-- InnHub tenant Row Level Security (RLS)
--
-- Enables database-enforced property isolation for the MVP schema.
-- Scope: tenant isolation only. Fine-grained RBAC remains enforced in the
-- application/service layer and should be hardened in a later dedicated slice.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Helper functions
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER avoids recursive policy checks when policies need to derive
-- the current user's active profile from public.profiles.

create or replace function public.innhub_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
	select p.id
	from public.profiles p
	where p.auth_user_id = auth.uid()
		and p.status = 'active'
		and p.deleted_at is null
	limit 1
$$;

create or replace function public.innhub_current_property_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
	select p.property_id
	from public.profiles p
	where p.auth_user_id = auth.uid()
		and p.status = 'active'
		and p.deleted_at is null
	limit 1
$$;

create or replace function public.innhub_current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public, auth
as $$
	select p.role
	from public.profiles p
	where p.auth_user_id = auth.uid()
		and p.status = 'active'
		and p.deleted_at is null
	limit 1
$$;

create or replace function public.innhub_role_rank(role_value public.profile_role)
returns integer
language sql
immutable
as $$
	select case role_value
		when 'administrator' then 100
		when 'manager' then 80
		when 'receptionist' then 60
		when 'housekeeping' then 40
		when 'maintenance' then 30
		else 0
	end
$$;

create or replace function public.innhub_has_role_at_least(required_role public.profile_role)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
	select coalesce(
		public.innhub_role_rank(public.innhub_current_profile_role()) >= public.innhub_role_rank(required_role),
		false
	)
$$;

-- Helper execution is needed by policies for authenticated API users only.
-- PostgreSQL grants function EXECUTE to PUBLIC by default, so revoke it first.
revoke execute on function public.innhub_current_profile_id() from public;
revoke execute on function public.innhub_current_property_id() from public;
revoke execute on function public.innhub_current_profile_role() from public;
revoke execute on function public.innhub_role_rank(public.profile_role) from public;
revoke execute on function public.innhub_has_role_at_least(public.profile_role) from public;

grant execute on function public.innhub_current_profile_id() to authenticated;
grant execute on function public.innhub_current_property_id() to authenticated;
grant execute on function public.innhub_current_profile_role() to authenticated;
grant execute on function public.innhub_role_rank(public.profile_role) to authenticated;
grant execute on function public.innhub_has_role_at_least(public.profile_role) to authenticated;

-- -----------------------------------------------------------------------------
-- Baseline privileges
-- -----------------------------------------------------------------------------
-- Public data tables are not readable/writable by unauthenticated clients.
-- Authenticated users keep table privileges, but RLS policies below constrain
-- rows by the active profile's property_id.

revoke all on table
	public.properties,
	public.profiles,
	public.guests,
	public.room_types,
	public.rooms,
	public.reservations,
	public.reservation_items,
	public.stays,
	public.stay_guests,
	public.housekeeping_tasks,
	public.maintenance_tickets,
	public.invoices,
	public.payments
from anon;

grant select, insert, update, delete on table
	public.properties,
	public.guests,
	public.room_types,
	public.rooms,
	public.reservations,
	public.reservation_items,
	public.stays,
	public.stay_guests,
	public.housekeeping_tasks,
	public.maintenance_tickets,
	public.invoices,
	public.payments
 to authenticated;

-- Profiles are sensitive because role/status changes affect authorization.
-- Current MVP only needs authenticated users to read profile rows and update
-- their own display name; staff management gets a dedicated RBAC slice later.
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, updated_at) on table public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------

alter table public.properties enable row level security;
alter table public.profiles enable row level security;
alter table public.guests enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.stays enable row level security;
alter table public.stay_guests enable row level security;
alter table public.housekeeping_tasks enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- -----------------------------------------------------------------------------
-- Root and identity policies
-- -----------------------------------------------------------------------------

create policy properties_select_current_property
on public.properties
for select
to authenticated
using (id = public.innhub_current_property_id());

create policy properties_update_administrator
on public.properties
for update
to authenticated
using (
	id = public.innhub_current_property_id()
	and public.innhub_has_role_at_least('administrator')
)
with check (
	id = public.innhub_current_property_id()
	and public.innhub_has_role_at_least('administrator')
);

-- Bootstrap rule: a signed-in user can always read their own active profile by
-- auth_user_id. Once bootstrapped, active users can read profiles in the same
-- property for staff references and UI context.
create policy profiles_select_own_or_same_property
on public.profiles
for select
to authenticated
using (
	(
		auth_user_id = auth.uid()
		and status = 'active'
		and deleted_at is null
	)
	or (
		property_id = public.innhub_current_property_id()
		and public.innhub_current_property_id() is not null
	)
);

-- Only the current authenticated user can update their own profile row, and
-- column grants limit that update to full_name/updated_at.
create policy profiles_update_own_basic_fields
on public.profiles
for update
to authenticated
using (
	auth_user_id = auth.uid()
	and status = 'active'
	and deleted_at is null
)
with check (
	auth_user_id = auth.uid()
	and property_id = public.innhub_current_property_id()
	and status = 'active'
	and deleted_at is null
);

-- -----------------------------------------------------------------------------
-- Property-owned operational table policies
-- -----------------------------------------------------------------------------

create policy guests_tenant_isolation on public.guests
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy room_types_tenant_isolation on public.room_types
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy rooms_tenant_isolation on public.rooms
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy reservations_tenant_isolation on public.reservations
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy reservation_items_tenant_isolation on public.reservation_items
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy stays_tenant_isolation on public.stays
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy stay_guests_tenant_isolation on public.stay_guests
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy housekeeping_tasks_tenant_isolation on public.housekeeping_tasks
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy maintenance_tickets_tenant_isolation on public.maintenance_tickets
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy invoices_tenant_isolation on public.invoices
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

create policy payments_tenant_isolation on public.payments
for all to authenticated
using (property_id = public.innhub_current_property_id())
with check (property_id = public.innhub_current_property_id());

commit;
