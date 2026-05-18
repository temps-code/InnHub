# InnHub — Product Overview

> This document defines what InnHub is, who it serves, and why the project exists.

📄 Read this in: **English** | [Español](01-product-overview.es.md)

---

## Document Purpose

Explain the product vision and business context before implementation details.

## Executive Summary

InnHub is a configurable accommodation management system for hotels, hostels, residences, inns, and similar room-based hospitality businesses. The MVP focuses on operational clarity: reservations, rooms, guests, housekeeping, maintenance, billing, payments, occupancy reports, and dashboard metrics.

## Problem

Small and medium accommodation businesses often manage operations with fragmented tools: spreadsheets, WhatsApp messages, paper notes, and informal staff coordination. This creates weak traceability, room-status confusion, booking conflicts, delayed cleaning/maintenance follow-up, and limited reporting.

## Proposed Solution

InnHub centralizes the operational workflow in one web application. Each property manages its own users, rooms, guests, reservations, tasks, invoices, payments, and reports within an isolated property context.

## Target Users

| Actor | Main Need |
|---|---|
| Administrator | Configure the property, users, roles, rooms, and system settings |
| Manager | Monitor occupancy, revenue, operations, and reports |
| Receptionist | Manage guests, reservations, check-ins, check-outs, invoices, and payments |
| Housekeeping Staff | Follow and complete cleaning tasks |
| Maintenance Staff | Register and resolve room maintenance issues |

## Core Workflow

![InnHub business workflow](assets/business-workflow.png)

```text
Guest inquiry → Reservation → Check-in → Stay management
      → Housekeeping / Maintenance → Billing → Check-out → Occupancy reports
```

## Project Goals

- Build a serious academic MVP with professional documentation.
- Keep scope realistic while preserving business value.
- Use a known frontend stack and InsForge to reduce backend overhead.
- Demonstrate clean architecture, modularity, and testable business rules.
- Present the project as a GitHub/CV-ready product case study.

## Non-Goals

- Full accounting system.
- Payroll or inventory management.
- External booking integrations.
- Real payment gateway processing.
- Mobile app.
- Advanced BI/AI features.
- Enterprise multi-tenant SaaS complexity.

## Related Documents

- [MVP Scope](02-mvp-scope.md)
- [Domain Model](03-domain-model.md)
- [Functional Specification](07-functional-specification.md)
