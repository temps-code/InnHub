-- Roll back InnHub core schema foundation.
-- Intended for development/validation environments until production policy exists.

drop table if exists payments;
drop table if exists invoices;
drop table if exists maintenance_tickets;
drop table if exists housekeeping_tasks;
drop table if exists stay_guests;
drop table if exists stays;
drop table if exists reservation_items;
drop table if exists reservations;
drop table if exists rooms;
drop table if exists room_types;
drop table if exists guests;
drop table if exists profiles;
drop table if exists properties;

drop type if exists payment_status;
drop type if exists payment_method;
drop type if exists invoice_status;
drop type if exists task_priority;
drop type if exists maintenance_status;
drop type if exists housekeeping_status;
drop type if exists stay_status;
drop type if exists reservation_item_status;
drop type if exists reservation_status;
drop type if exists room_state;
drop type if exists profile_status;
drop type if exists profile_role;
