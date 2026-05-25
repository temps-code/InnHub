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

## Service Layer Convention

Backend-backed features must expose data access through hooks and services, not JSX components. Services should return typed `ServiceResult<T>` style values, normalize backend failures into safe local errors before UI-facing callers see them, and keep raw SDK/backend objects behind service boundaries.

## Property-Scoped Data Access

Operational services must derive the current property scope from the authenticated session, not from component props, forms, routes, URLs, or caller-provided payloads. Service reads and mutations for property-owned records should use the shared property-scope helpers before building InsForge queries.

Use `property_id` filters for property-owned operational tables and constrain the `properties` root by `id = session.propertyId`. If a payload includes a different `property_id` than the session scope, services must reject it instead of trusting UI input.

These repository helpers are the required frontend/service pattern, but they are not complete database-level isolation. Remote InsForge/PostgreSQL policies require a separate approved, versioned, and validated slice.

## Atomic Design Usage

Use Atomic Design for shared UI only: buttons, badges, inputs, cards, modals, tables, layout primitives. Feature-specific components stay inside their feature folders.

## Reuse and Refactoring Strategy

InnHub prioritizes reusable components before feature-specific UI growth. The existing architecture and component diagrams above are the reference views for this strategy; a new diagram is not required unless the implementation introduces a new architectural boundary.

### Implemented Shared UI Primitives

The first reusable shared UI primitives are implemented under `src/shared/components` and specified in `openspec/specs/shared-ui/spec.md`. They are intentionally small, domain-neutral, and presentation-only.

| Component     | Current status | Reuse target                                                                                             | Technical justification                                                                                                |
| ------------- | -------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Button`      | Implemented    | Primary and secondary actions across reservations, check-in/check-out, billing, and settings             | Centralizes interaction states, accessibility behavior, and visual consistency for repeated user actions               |
| `StatusBadge` | Implemented    | Room states, reservation states, cleaning tasks, maintenance tickets, invoices, and payments             | Keeps status presentation consistent while preventing domain-specific styling from being duplicated in feature screens |
| `MetricCard`  | Implemented    | Dashboard indicators, occupancy reports, revenue summaries, and operational alerts                       | Provides a reusable display pattern for caller-provided metrics without calculating business values                    |
| `ModuleCard`  | Implemented    | Navigation or summaries for rooms, reservations, guests, billing, housekeeping, maintenance, and reports | Lets the product line expose different modules with a consistent reusable card pattern                                 |
| `PageSection` | Implemented    | Shared page spacing, headings, descriptions, actions, and responsive sections                            | Separates section structure from business content and avoids repeating page scaffolding in every feature               |

`PageSection` was implemented instead of a full `AppLayout` for this stage because routing, authentication, navigation, and protected layout decisions belong to later work. These primitives should remain generic: room-specific labels, reservation rules, metric calculations, and business decisions belong in feature code, schemas, services, or utility functions.

### Refactoring Techniques

| Technique                                 | Problem detected                                                                                   | Project strategy                                                                                                                                                | Expected improvement                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Extract Component                         | Large screens can mix JSX, layout, styling, and repeated UI fragments                              | Move repeated UI into shared components only when at least two modules can reuse it or when a component has a clear generic role                                | Improves cohesion, reduces duplication, and supports the product-line goal of reusable building blocks |
| Extract Constants / Replace Magic Strings | Status names, labels, module names, routes, and UI messages can become scattered hard-coded values | Define typed constants or configuration objects for repeated states, labels, dashboard metrics, and module metadata                                             | Improves consistency, reduces typo-prone changes, and makes future module variation easier             |
| Extract Pure Function                     | Business rules can accidentally move into JSX or event handlers                                    | Move reusable calculations and decisions, such as status-to-tone mapping or availability checks, into feature utilities or shared utilities when domain-neutral | Makes rules testable, easier to review, and independent from UI rendering                              |

Refactoring should be incremental. The goal is not to build a large design system early, but to extract stable patterns as the MVP grows.

### Academic Presentation Criteria

For the refactoring assignment, the project will present at least two techniques with explicit evidence:

1. **Extract Component** will be demonstrated through repeated UI patterns such as buttons, status indicators, cards, and layout sections.
2. **Extract Constants / Replace Magic Strings** will be demonstrated through shared configuration for repeated status names, route labels, module metadata, or dashboard metrics.
3. **Extract Pure Function** may be added when business rules or UI mappings need testable logic outside JSX.

The implementation phase should only extract a component or rule when the duplication is visible or the reusable role is clear. This keeps the documentation aligned with the code and avoids artificial refactoring.

## Related Documents

- [Tech Stack](04-tech-stack.md)
- [Domain Model](03-domain-model.md)
