<div align="center">

<img src="docs/assets/brand/innhub-logo-horizontal-transparent-dark.png" alt="InnHub Logo" width="420" />

# InnHub — Accommodation Management System

**Management platform for hotels, hostels, residences, and room-based hospitality businesses.**

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/InsForge-7C3AED?style=for-the-badge" alt="InsForge">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Planning-7C3AED?style=for-the-badge" alt="Status: Planning">
  <img src="https://img.shields.io/badge/Type-Academic_MVP-C4B5FD?style=for-the-badge" alt="Academic MVP">
</p>

</div>

---

> InnHub is an academic/professional MVP focused on accommodation operations, clean architecture, and documentation that can be reviewed as a real product case study.

---

📄 Read this in: **English** | [Español](README.es.md)

---

## Preview

<div align="center">

<img src="docs/assets/innhub-hero.png" alt="InnHub product mockup" width="100%" />

</div>

---

## Table of Contents

- [What It Does](#what-it-does)
- [Business Workflow](#business-workflow)
- [Key Features](#key-features)
- [Stack](#stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [Author](#author)

---

## What It Does

InnHub centralizes the operational workflow of accommodation businesses: properties, rooms, guests, reservations, check-ins, housekeeping, maintenance, billing, payments, reports, and dashboard metrics.

It is designed as a configurable COTS-style MVP for room-based hospitality businesses such as hotels, hostels, residences, inns, and similar properties.

**Before InnHub:** reservations, room status, maintenance, cleaning, and billing can be scattered across spreadsheets, WhatsApp messages, notebooks, and informal processes.

**After InnHub:** staff can operate from one web application with clear room availability, reservation lifecycle, operational tasks, invoices, and occupancy indicators.

## Business Workflow

<div align="center">

<img src="docs/assets/business-workflow.png" alt="InnHub business workflow" width="100%" />

</div>

```text
Guest inquiry → Reservation → Check-in → Stay management
      → Housekeeping / Maintenance → Billing → Check-out → Occupancy reports
```

## Key Features

### Dashboard

- Occupancy rate, active reservations, available rooms, and revenue metrics.
- Operational alerts for cleaning, maintenance, check-ins, and check-outs.
- Selective realtime updates for operational visibility.

<div align="center">

<img src="docs/assets/dashboard-preview.png" alt="InnHub dashboard preview" width="100%" />

</div>

### Reservations

- Reservation creation, cancellation, and lifecycle tracking.
- Date-range availability validation.
- Rule preventing overlapping active reservations for the same room.

### Rooms

- Room and room type management.
- Physical room states: `available`, `occupied`, `cleaning`, `maintenance`, `inactive`.
- Availability is calculated from reservations, not stored as a physical `reserved` state.

<div align="center">

<img src="docs/assets/room-status-board.png" alt="InnHub room status board" width="100%" />

</div>

### Guests

- Guest/customer records per property.
- Contact and identification data required for reservations and invoices.

### Housekeeping & Maintenance

- Cleaning tasks generated after check-out.
- Maintenance tickets that can block room availability.
- Operational task states for staff follow-up.

### Billing & Payments

- Manual invoice generation for completed stays or services.
- Manual payment tracking.
- No external payment gateway in the MVP.

## Stack

| Category                  | Technology                   |
| ------------------------- | ---------------------------- |
| Frontend                  | Vite + React + TypeScript    |
| Styling                   | Tailwind CSS                 |
| Routing                   | React Router                 |
| Forms / Validation        | React Hook Form + Zod        |
| Charts                    | Recharts                     |
| Testing                   | Vitest                       |
| Backend / BaaS            | InsForge                     |
| Database                  | PostgreSQL                   |
| Auth / Realtime            | InsForge services            |
| Deployment                | Vercel or Netlify + InsForge |

Storage is intentionally deferred until a scoped file workflow requires it, such as payment receipts, maintenance attachments, or invoice PDFs.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Backend environment

InnHub uses InsForge as the MVP backend. Fill `.env.local` with the project values from InsForge settings or the connected backend metadata:

```env
VITE_INSFORGE_BASE_URL=https://your-project.region.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key
```

Keep real keys in `.env.local` or deployment settings only. Issue #4 prepares the environment foundation; database tables and seed data are handled in later backend slices.

Useful checks:

```bash
npm run build
npm run lint
npm run test:run
```

## Architecture

<div align="center">

<img src="docs/assets/architecture-overview.png" alt="InnHub architecture overview" width="100%" />

</div>

InnHub follows a pragmatic frontend architecture combining feature-based organization, lightweight Clean Architecture boundaries, and Atomic Design only for shared UI primitives.

Core rule: UI components should not talk directly to InsForge. Data access and business rules are encapsulated in services, hooks, schemas, and pure functions.

## Documentation

| Document                                                        | Purpose                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------- |
| [Product Overview](docs/01-product-overview.md)                 | Product idea, problem, users, and goals                       |
| [MVP Scope](docs/02-mvp-scope.md)                               | Included modules, limits, and success criteria                |
| [Domain Model](docs/03-domain-model.md)                         | Main entities, relationships, and business rules              |
| [Tech Stack](docs/04-tech-stack.md)                             | Technologies, reasons, and trade-offs                         |
| [Architecture](docs/05-architecture.md)                         | Internal structure, feature boundaries, and data flow         |
| [Git Workflow](docs/06-git-workflow.md)                         | Branch strategy, issues, PRs, and delivery rules              |
| [Functional Specification](docs/07-functional-specification.md) | Actors, requirements, business rules, and acceptance criteria |

## Project Status

InnHub currently has its planning documentation, Vite React TypeScript scaffold, MIT license, and baseline repository structure prepared for academic review. The next implementation step is to build MVP modules in small, reviewable work units.

## Author

**Diego Vargas** — Full-Stack Developer

- GitHub: [@temps-code](https://github.com/temps-code)
