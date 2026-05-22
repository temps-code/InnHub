# InnHub — Domain Model

> This document defines the main business entities, relationships, and rules that shape the MVP.

📄 Read this in: **English** | [Español](03-domain-model.es.md)

---

## Executive Summary

InnHub is organized around a root `Property`. Every operational entity is scoped to a property to keep permissions, reports, reservations, and data visibility simple for the MVP.

## Domain Model Diagram

![InnHub domain model](assets/domain-model.png)

The diagram shows `Property` as the operational root. The database-level ERD expands this model with reservation items, stays, and stay guests so planned bookings and real room occupation stay separate.

## Main Entities

| Entity              | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `Property`          | Accommodation business configuration and operational root                |
| `Profile`           | Internal staff profile linked to an auth user and assigned to a property |
| `RoomType`          | Category/template for similar rooms                                      |
| `Room`              | Physical accommodation room/unit with a flexible identifier              |
| `Guest`             | Person/customer used as contact, occupant, invoice recipient, or payer   |
| `Reservation`       | Commercial booking header with planned dates and primary contact         |
| `ReservationItem`   | One requested room/category inside a reservation                         |
| `Stay`              | Actual room occupation, either from a reservation item or a walk-in       |
| `StayGuest`         | Occupant linked to a stay                                                |
| `HousekeepingTask`  | Cleaning task, often generated after check-out                           |
| `MaintenanceTicket` | Operational issue that may block room availability                       |
| `Invoice`           | Billing document for a reservation deposit, stay, or manual charge       |
| `Payment`           | Manual payment record linked to an invoice                               |

## Relationship Overview

```text
Property
├── Profiles
├── Guests
├── RoomTypes ─── Rooms
├── Reservations ─── ReservationItems ─── Stays ─── StayGuests
├── HousekeepingTasks
├── MaintenanceTickets
└── Invoices ─── Payments
```

## Derived Read Models

These can be calculated on demand:

- `OccupancyReport`
- `RevenueReport`
- `DashboardSummary`
- `OperationalAlert`

## Business Rules

| Rule                                  | Explanation                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Property-scoped operations            | Operational records include `property_id` for data isolation               |
| No physical `reserved` room state     | Future commitments live in reservation items, not in `rooms.state`         |
| Confirmed reservation items block     | Only confirmed reservation items reserve future availability               |
| Active stays block current occupancy  | Real occupation is represented by active stays                             |
| Check-out creates cleaning work       | After check-out, the room should enter cleaning flow                       |
| Maintenance blocks availability       | Rooms under maintenance cannot be assigned to new stays                    |
| Paid invoices are protected           | Paid invoices should not be freely modified                                |
| Reports are derived                   | Reports summarize operational data; they do not need to be persisted first |

## Naming Decision

Use `Property` as the broad domain root because InnHub supports more than hotels. Keep `Room` for the MVP because the project remains room-based and must stay simple.

## Related Documents

- [Database ERD](08-database-erd.md)
- [MVP Scope](02-mvp-scope.md)
- [Functional Specification](07-functional-specification.md)
- [Architecture](05-architecture.md)
