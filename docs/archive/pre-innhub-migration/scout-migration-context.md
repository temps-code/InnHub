# Code Context

## Files Retrieved

1. `docs/README.md` (lines 1-18) - documentation index and current tentative project name note.
2. `docs/01-analisis-formal.md` (lines 1-801) - initial formal analysis, actors, requirements, use cases, domain states, business rules, and original hotel-only framing.
3. `docs/02-mvp.md` (lines 1-352) - refined MVP scope, hotel/property data-isolation rule, modules, dashboard, and core state decisions.
4. `docs/03-modulos-entidades.md` (lines 1-939) - domain/module design, entities, relationships, persistence choices, and key decisions.
5. `docs/04-stack-tecnologico.md` (lines 1-353) - selected frontend/BaaS stack, realtime strategy, testing targets, and deploy plan.
6. `docs/05-arquitectura-interna.md` (lines 1-404) - internal frontend architecture, folder structure, feature boundaries, reusable components, and business-rule placement.
7. `docs/06-flujo-github.md` (lines 1-594) - GitHub branch/issue/PR workflow, labels, milestones, and final branching decision.
8. `docs/07-especificacion-funcional.md` (lines 1-582) - consolidated functional specification and MVP acceptance flow.

## Key Code

No source code was inspected; this is documentation migration context.

### Facts and decisions to preserve per file

#### `docs/README.md` (lines 1-18)

- Current docs directory is the canonical documentation index.
- Current name is explicitly tentative: `HotelFlow ERP/CRM` pending final platform name.
- Index points to seven main source documents plus `archive/` for previous/alternative docs.
- Migration should update index filenames/titles only if corresponding docs are renamed; preserve canonical-source vs archive distinction.

#### `docs/01-analisis-formal.md` (lines 1-801)

- Original framing: COTS configurable management system for hotels, not just CRUD (lines 13-29, 727-746).
- MVP modules: rooms, clients/guests, reservations, cleaning, maintenance, billing, occupancy reports (lines 75-236).
- Initial room states include `RESERVED` (lines 626-638), but later docs remove it; treat this as superseded by `docs/02`/`docs/03`.
- Actors to preserve: Administrator, Receptionist, Cleaning Staff, Maintenance Staff, Manager (lines 262-331).
- Functional/non-functional requirements: role-based access, data integrity, traceability, testability, configurability, usability (lines 334-454).
- Core use cases: create/cancel reservation, check-in/out, complete cleaning, register maintenance, generate invoice, occupancy report (lines 456-590).
- Initial entities: `User`, `Role`, `Customer`, `Room`, `RoomType`, `Reservation`, `CleaningTask`, `MaintenanceTicket`, `Invoice`, `Payment`, `OccupancyReport` (lines 593-624).
- Central rules: no overlapping active reservations, checkout creates cleaning task, maintenance blocks reservation, paid invoices not directly modified (lines 681-724).
- Out of scope: payment gateways, full accounting, payroll, inventory, real multi-branch, mobile app, Booking/Airbnb integration, automated email, AI, complex dashboard (lines 238-259).

#### `docs/02-mvp.md` (lines 1-352)

- Refined definition: `HotelFlow ERP/CRM` is a configurable COTS for hotel management; not advanced SaaS multi-tenant (lines 3-8).
- Data isolation rules: each hotel operates its own data; each user belongs to one hotel; operations are filtered by hotel (lines 11-15).
- MVP adds `Hoteles / Propiedades` as the operational root with fiscal, currency, tax, check-in/out time, and status fields (lines 21-50).
- Roles: `ADMIN`, `MANAGER`, `RECEPTIONIST`, `HOUSEKEEPING`, `MAINTENANCE` (lines 52-81).
- Important room-state decision: do not use `RESERVED` as `Room.status`; reservations block availability by date while room can remain physically `AVAILABLE` until check-in (lines 83-115).
- Modules to preserve: properties, users/roles, rooms, room types, customers/guests, reservations, cleaning, maintenance, billing, occupancy reports, operational dashboard (lines 19-339).
- Final MVP definition is multi-hotel registered platform with per-hotel context, not full multi-tenant SaaS (lines 341-352).

#### `docs/03-modulos-entidades.md` (lines 1-939)

- Canonical module/entity design. It reinforces all operational entities belong to a hotel (lines 7-21).
- Modules: hotels, users/roles, rooms, customers/guests, reservations, cleaning, maintenance, billing, reports, dashboard (lines 23-274).
- Persistent entities recommended: `Hotel`, `User`, `RoomType`, `Room`, `Customer`, `Reservation`, `CleaningTask`, `MaintenanceTicket`, `Invoice`, `Payment` (lines 276-801, 813-829).
- Derived/read models: `OccupancyReport`, `RevenueReport`, `DashboardSummary`, `OperationalAlert`; dashboard/report data can be calculated on demand (lines 803-873, 920-929).
- Decisions to preserve exactly in meaning:
  - user belongs to one hotel (lines 875-890);
  - customer belongs to hotel to simplify privacy/permissions (lines 892-904);
  - no `RESERVED` room state; availability is range-based from reservations (lines 906-918);
  - dashboard/report summaries may be calculated, not persisted (lines 920-929).
- Payment is manual only; no real payment gateway integration (lines 711-758).

#### `docs/04-stack-tecnologico.md` (lines 1-353)

- Selected stack: Vite + React + TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, Recharts, Vitest, InsForge, PostgreSQL, InsForge Auth/Storage/Realtime, Vercel/Netlify + InsForge Cloud/self-hosted (lines 20-62).
- BaaS decision: InsForge reduces repetitive backend work and supports PostgreSQL, Auth, Storage, APIs, Realtime, backend functions if needed (lines 149-175).
- Auth rule remains single accommodation/user context: each user belongs to one hotel/accommodation and operations execute within that context (lines 198-209).
- Realtime must be selective, filtered by hotel, subscribed only while mounted, and not global/default everywhere (lines 227-297).
- Test targets: pure business rules such as nights calculation, invoice total, date range, overlap detection, occupancy percentage, check-in/check-out permissions (lines 300-322).
- Deploy goal: functional demo for final defense using simplest stable option (lines 324-345).

#### `docs/05-arquitectura-interna.md` (lines 1-404)

- Internal architecture combines Feature-Sliced Architecture, lightweight Clean Architecture, and pragmatic Atomic Design (lines 15-33).
- Current root folder example is `hotelflow/`; migration should rename to InnHub if docs are normalized (lines 35-95).
- Feature folders: auth, hotels, rooms, room-types, customers, reservations, cleaning, maintenance, billing, reports, dashboard, users (lines 97-131).
- Layer rule: components should not call InsForge directly; use hooks/services (lines 133-167).
- Atomic Design only for shared UI; feature-specific components remain inside feature folders (lines 169-203).
- Realtime is encapsulated through shared services/hooks and feature hooks (lines 265-299).
- Business rules belong in functions/services, not JSX; examples include `validateDateRange`, `detectReservationOverlap`, `calculateInvoiceTotal`, `getRoomAvailabilityStatus` (lines 363-392).

#### `docs/06-flujo-github.md` (lines 1-594)

- Individual-project GitHub workflow with only four permanent branches: `main`, `qa`, `features`, `refactor` (lines 9-37, 39-50, 585-594).
- No temporary `feature/*`, `bugfix/*`, or `docs/*` branches (lines 26-35).
- Normal flow: issue -> work on `features` -> PR to `qa` -> validation -> PR to `main`; failed QA structural corrections use `refactor` -> `qa` (lines 165-215).
- PRs must map to concrete issues, explain changes/tests, include screenshots for UI, and avoid unrelated large mixes (lines 217-338).
- Commit format: `type(scope): descripción corta`; suggested types include feat/fix/docs/refactor/test/style/chore (lines 341-372).
- GitHub Projects columns and milestones are part of defense evidence (lines 439-514).
- Final defense requires stable `main`, updated README, install instructions, screenshots/demo, deploy link, documented data model/stack/architecture/workflow, representative issues/PRs (lines 565-582).

#### `docs/07-especificacion-funcional.md` (lines 1-582)

- Consolidated source for functional scope. Name is still tentative (lines 1-13).
- MVP is configurable COTS, not advanced multi-tenant SaaS; each user belongs to one hotel and operations execute inside that hotel context (lines 7-13).
- Objective: functional ERP/CRM hotel MVP with reservations, rooms, cleaning, maintenance, billing, occupancy reports, modularity, reuse, clean code (lines 15-36).
- Functional requirements RF-01 through RF-16 cover properties, users, room types, rooms, customers/guests, reservations, availability, check-in/out, cleaning, maintenance, billing, payments, reports, dashboard, selective realtime (lines 122-476).
- Non-functional requirements: modularity, reuse, maintainability, separation of responsibilities, security, per-hotel isolation, data integrity, usability, testability, deployment (lines 478-520).
- Out of scope matches refined MVP: no advanced SaaS, multi-hotel users, real payment gateways, full accounting, inventory, external booking integrations, mobile app, advanced CRM/BI, microservices, full custom backend (lines 522-541).
- Acceptance flow: configure hotel, user login, room type/room/customer/reservation/check-in/check-out/cleaning/invoice/payment/report/dashboard (lines 543-574).

### Terminology that must change for InnHub/accommodation migration

Use these replacements carefully; preserve domain rules while broadening beyond hotels:

- Product name:
  - `HotelFlow ERP/CRM` -> `InnHub` or `InnHub ERP/CRM` only if the target brand still wants the ERP/CRM qualifier.
  - `hotelflow/` root example -> `innhub/`.
- Domain root:
  - `Hotel` / `hotel` -> `Accommodation` / `property` / `accommodation property` depending on target naming convention.
  - `Hoteles / Propiedades` -> `Accommodations / Properties` or Spanish equivalent `Alojamientos / Propiedades`.
  - `hotel_id` -> likely `accommodation_id` or `property_id`; choose one and apply consistently.
  - `hotel:<hotel_id>:...` realtime channels -> `accommodation:<accommodation_id>:...` or `property:<property_id>:...`.
- Industry framing:
  - `gestión hotelera`, `sistema hotelero`, `dominio hotelero`, `hotel-only` -> `gestión de alojamientos`, `hospitality/accommodation management`, or project-approved Spanish wording.
  - `distintos hoteles` / `varios hoteles` -> `distintos alojamientos/propiedades`.
  - `habitación` may still be valid for many accommodations, but for broader InnHub consider whether to use `unit`, `accommodation unit`, or `room/unit`. Do not blindly rename if current MVP remains room-based.
- People:
  - `cliente / huésped` can remain, but in English docs prefer `Guest` if the domain means the staying person; `Customer` if it means payer/booker.
  - `Personal de limpieza`, `mantenimiento`, `recepcionista`, `gerente`, `administrador` remain applicable across accommodations.
- Feature folders/entities:
  - `hotels` feature -> likely `accommodations` or `properties`.
  - `Hotel` entity -> `Accommodation`/`Property`.
  - Keep `Room`, `RoomType`, `Reservation`, `CleaningTask`, `MaintenanceTicket`, `Invoice`, `Payment` unless broader unit terminology is approved.

## Architecture

The docs describe a React/Vite/TypeScript SPA backed by InsForge/PostgreSQL/Auth/Realtime. The domain is organized around a root operational entity currently called `Hotel`; every operational entity includes that root context for isolation. Users belong to exactly one root entity, and customer records also belong to that root entity for MVP privacy/permission simplicity.

The application architecture is feature-oriented: each business module lives under `src/features/<module>`, while shared UI/hooks/services/utilities live under `src/shared`. Business rules should live in pure utilities, schemas, hooks, or services rather than JSX. InsForge SDK access should be encapsulated behind services/hooks. Realtime is opt-in and scoped by root entity channel, mainly for dashboard, rooms, cleaning, maintenance, and alerts.

The current documentation evolved: `docs/01` has an older room state model including `RESERVED`; `docs/02`, `docs/03`, and `docs/07` supersede it by explicitly deciding that `RESERVED` is not a physical room state. Migration should preserve that later decision.

## Start Here

Start with `docs/07-especificacion-funcional.md` because it is the consolidated MVP specification. Then use `docs/03-modulos-entidades.md` to migrate canonical entity names/relationships and decisions, especially the root `Hotel` -> accommodation/property rename and the no-`RESERVED` room-state decision.

## Supervisor coordination

No supervisor decision was needed. Important discovery: there is an internal documentation inconsistency where `docs/01-analisis-formal.md` still lists `RESERVED` as a room state, while later docs intentionally remove it. Engram save was requested, but no Engram/memory tool is available in this subagent toolset, so no memory write could be performed.

## Risks

- Inconsistent source terminology: `docs/01` is older and contains `RESERVED` room state; migration must not reintroduce it as canonical.
- Broadening from hotel-only to accommodation may require a product decision on `Hotel` replacement: `Accommodation` vs `Property` vs `Lodging`. This affects entity names, route names, folder names, database columns, realtime channels, and UI copy.
- `Room` may be too hotel-specific for cabins/apartments/hostels. Decide whether the MVP keeps `Room` or broadens to `Unit` before migrating technical docs.
- Current docs are Spanish prose with English code identifiers. Preserve that convention unless the migration goal includes language normalization.
- Git workflow intentionally forbids temporary branches. If migration work is large, this workflow may be awkward; preserve the documented decision unless project process changes.
- InsForge-specific architecture and realtime assumptions are pervasive; avoid renaming docs in a way that implies backend independence unless the stack also changes.
