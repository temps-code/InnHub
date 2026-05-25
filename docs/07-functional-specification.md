# InnHub — Functional Specification

> This document consolidates the MVP requirements, actors, rules, and acceptance criteria.

📄 Read this in: **English** | [Español](07-functional-specification.es.md)

---

## Actors

| Actor | Responsibilities |
|---|---|
| Administrator | Property configuration, users, roles, room setup |
| Manager | Reports, dashboard, operational monitoring |
| Receptionist | Guests, reservations, check-ins, check-outs, billing, payments |
| Housekeeping Staff | Cleaning task execution |
| Maintenance Staff | Maintenance ticket execution |

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Manage property profile and operational settings |
| FR-02 | Manage users and role-based access |
| FR-03 | Manage room types |
| FR-04 | Manage rooms and physical states |
| FR-05 | Manage guests/customers |
| FR-06 | Create, update, and cancel reservations |
| FR-07 | Validate room availability by date range |
| FR-08 | Execute check-in and check-out |
| FR-09 | Generate cleaning tasks after check-out |
| FR-10 | Register and resolve maintenance tickets |
| FR-11 | Generate invoices |
| FR-12 | Register manual payments |
| FR-13 | Generate occupancy and revenue reports |
| FR-14 | Show operational dashboard metrics |
| FR-15 | Use selective realtime for operational updates |
| FR-16 | Preserve data isolation by property |

## Non-functional Requirements

| Area | Requirement |
|---|---|
| Maintainability | Feature-based organization and clear boundaries |
| Security | Authenticated access and role-based permissions |
| Data integrity | Reservation overlap prevention and protected paid invoices |
| Usability | Clear operational screens and readable status indicators |
| Testability | Core business rules implemented as testable functions |
| Deployability | MVP can be deployed for demo/defense |

## Business Rules

- A user belongs to exactly one property in the MVP.
- Operational records are filtered by property.
- A room cannot have overlapping active reservations.
- For physical room states and transition rules, see [MVP Scope](02-mvp-scope.md#room-states). A future reservation does not change physical room state to `reserved`.
- Check-out triggers the housekeeping/cleaning workflow.
- Maintenance blocks room availability.
- Paid invoices cannot be modified.

## Acceptance Flow

```text
Configure property
→ create user
→ create room type
→ create room
→ create guest
→ create reservation
→ validate availability
→ check-in
→ check-out
→ create cleaning task
→ generate invoice
→ register payment
→ view report/dashboard
```

## Related Documents

- [Product Overview](01-product-overview.md)
- [MVP Scope](02-mvp-scope.md)
- [Domain Model](03-domain-model.md)
