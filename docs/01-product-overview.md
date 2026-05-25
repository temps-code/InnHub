# InnHub — Product Overview

> This document defines what InnHub is, who it serves, and why the project exists.  
> For the academic framework and evaluation guidelines, see [Academic & Refactoring Criteria](ACADEMIC.md).

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

See [Functional Specification](07-functional-specification.md#actors) for the detailed list of project actors and their specific operational needs.

## Core Workflow

![InnHub business workflow](assets/business-workflow.png)

```text
Guest inquiry → Reservation → Check-in → Stay management
      → Housekeeping / Maintenance → Billing → Check-out → Occupancy reports
```

## Project Goals

- Keep scope realistic while preserving business value.
- Use a known frontend stack and InsForge to reduce backend overhead.
- For academic-specific evaluation goals, see [Academic & Refactoring Criteria](ACADEMIC.md).

## Non-Goals

See [MVP Scope](02-mvp-scope.md#out-of-scope) for the project boundaries, limitations, and out-of-scope definitions.

## Related Documents

- [Academic Criteria](ACADEMIC.md)
- [MVP Scope](02-mvp-scope.md)
- [Domain Model](03-domain-model.md)
- [Functional Specification](07-functional-specification.md)
