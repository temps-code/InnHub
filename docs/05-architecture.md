# InnHub — Internal Architecture

> This document defines the internal frontend structure and the boundaries that keep the MVP maintainable.

📄 Read this in: **English** | [Español](05-architecture.es.md)

---

## Architecture Goals

- Keep feature code close to its business context.
- Keep shared UI reusable without overengineering.
- Encapsulate InsForge access behind services/hooks.
- Keep business rules out of JSX.
- Make important rules testable with pure functions.

## Architecture Overview

![InnHub architecture overview](assets/architecture-overview.png)

## COTS Component View

![InnHub COTS component diagram](assets/cots-component-diagram.png)

InnHub is designed as a configurable COTS-style product. Business modules such as reservations, rooms, billing, reports, and dashboard features are supported by reusable technical components such as shared UI, hooks, services, validation schemas, and utility functions.

## Frontend Architecture Map

![InnHub frontend architecture map](assets/frontend-architecture-map.png)

The frontend combines three architectural decisions: Feature-Based Architecture organizes business capabilities, lightweight Clean Architecture controls dependency direction inside each feature, and Atomic Design keeps shared UI primitives reusable across modules.

## Suggested Folder Structure

```text
src/
├── app/
│   ├── routes/
│   └── providers/
├── features/
│   ├── auth/
│   ├── properties/
│   ├── users/
│   ├── rooms/
│   ├── room-types/
│   ├── guests/
│   ├── reservations/
│   ├── housekeeping/
│   ├── maintenance/
│   ├── billing/
│   ├── reports/
│   └── dashboard/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
└── main.tsx
```

## Layer Rules

| Rule                                     | Why                                           |
| ---------------------------------------- | --------------------------------------------- |
| Components do not call InsForge directly | Keeps UI testable and replaceable             |
| Feature services own data access         | Keeps business context local                  |
| Shared UI is generic                     | Prevents domain leakage into atoms/components |
| Business rules are pure when possible    | Enables reliable unit tests                   |
| Realtime is wrapped in hooks/services    | Avoids duplicated subscription logic          |

## Atomic Design Usage

Use Atomic Design for shared UI only: buttons, badges, inputs, cards, modals, tables, layout primitives. Feature-specific components stay inside their feature folders.

## Related Documents

- [Tech Stack](04-tech-stack.md)
- [Domain Model](03-domain-model.md)
