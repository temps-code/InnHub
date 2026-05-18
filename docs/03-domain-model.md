# InnHub — Domain Model

> This document defines the main business entities, relationships, and rules that shape the MVP.

📄 Read this in: **English** | [Español](03-domain-model.es.md)

---

## Executive Summary

InnHub is organized around a root `Property`. Every operational entity is scoped to a property to keep permissions, reports, reservations, and data visibility simple for the MVP.

## Domain Model Diagram

![InnHub domain model](assets/domain-model.png)

The diagram shows `Property` as the operational root. Reservations connect guests, rooms, invoices, payments, cleaning tasks, and availability-related maintenance decisions.

## Main Entities

| Entity              | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `Property`          | Accommodation business configuration and operational root |
| `User`              | Authenticated staff member assigned to one property       |
| `RoomType`          | Category/configuration for similar rooms                  |
| `Room`              | Physical accommodation room/unit managed by the property  |
| `Guest`             | Person or customer associated with reservations/invoices  |
| `Reservation`       | Date-range booking for one guest and room                 |
| `CleaningTask`      | Housekeeping task, often generated after check-out        |
| `MaintenanceTicket` | Operational issue that may block room availability        |
| `Invoice`           | Billing document for a reservation/stay                   |
| `Payment`           | Manual payment record linked to an invoice                |

## Relationship Overview

```text
Property
├── Users
├── RoomTypes ─── Rooms
├── Guests ────── Reservations ─── Invoices ─── Payments
│                    │
│                    └── CleaningTasks
└── MaintenanceTickets ─── Rooms
```

## Derived Read Models

These can be calculated on demand:

- `OccupancyReport`
- `RevenueReport`
- `DashboardSummary`
- `OperationalAlert`

## Business Rules

| Rule                               | Explanation                                                                |
| ---------------------------------- | -------------------------------------------------------------------------- |
| No overlapping active reservations | A room cannot have two active reservations for the same date range         |
| Check-out creates cleaning work    | After check-out, the room should enter cleaning flow                       |
| Maintenance blocks availability    | Rooms under maintenance cannot be assigned to new stays                    |
| Paid invoices are protected        | Paid invoices should not be freely modified                                |
| Reports are derived                | Reports summarize operational data; they do not need to be persisted first |

## Naming Decision

Use `Property` as the broad domain root because InnHub supports more than hotels. Keep `Room` for the MVP because the project remains room-based and must stay simple.

## Related Documents

- [MVP Scope](02-mvp-scope.md)
- [Functional Specification](07-functional-specification.md)
- [Architecture](05-architecture.md)
