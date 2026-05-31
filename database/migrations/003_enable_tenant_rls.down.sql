-- =============================================================================
-- Down migration for 003_enable_tenant_rls.sql
-- Restores the pre-RLS public-table access model used during early MVP setup.
-- Use only for development/validation rollback.
-- =============================================================================

begin;

-- Drop policies first so tables can be returned to the previous non-RLS state.
drop policy if exists properties_select_current_property on public.properties;
drop policy if exists properties_update_administrator on public.properties;
drop policy if exists profiles_select_own_or_same_property on public.profiles;
drop policy if exists profiles_update_own_basic_fields on public.profiles;
drop policy if exists guests_tenant_isolation on public.guests;
drop policy if exists room_types_tenant_isolation on public.room_types;
drop policy if exists rooms_tenant_isolation on public.rooms;
drop policy if exists reservations_tenant_isolation on public.reservations;
drop policy if exists reservation_items_tenant_isolation on public.reservation_items;
drop policy if exists stays_tenant_isolation on public.stays;
drop policy if exists stay_guests_tenant_isolation on public.stay_guests;
drop policy if exists housekeeping_tasks_tenant_isolation on public.housekeeping_tasks;
drop policy if exists maintenance_tickets_tenant_isolation on public.maintenance_tickets;
drop policy if exists invoices_tenant_isolation on public.invoices;
drop policy if exists payments_tenant_isolation on public.payments;

alter table public.properties disable row level security;
alter table public.profiles disable row level security;
alter table public.guests disable row level security;
alter table public.room_types disable row level security;
alter table public.rooms disable row level security;
alter table public.reservations disable row level security;
alter table public.reservation_items disable row level security;
alter table public.stays disable row level security;
alter table public.stay_guests disable row level security;
alter table public.housekeeping_tasks disable row level security;
alter table public.maintenance_tickets disable row level security;
alter table public.invoices disable row level security;
alter table public.payments disable row level security;

-- Restore broad grants that existed before tenant RLS was introduced.
grant select, insert, update, delete on table
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
to anon, authenticated;

drop function if exists public.innhub_has_role_at_least(public.profile_role);
drop function if exists public.innhub_role_rank(public.profile_role);
drop function if exists public.innhub_current_profile_role();
drop function if exists public.innhub_current_property_id();
drop function if exists public.innhub_current_profile_id();

commit;
