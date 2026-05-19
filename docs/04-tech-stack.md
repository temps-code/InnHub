# InnHub — Tech Stack

> This document explains the selected technologies and the reasons behind them.

📄 Read this in: **English** | [Español](04-tech-stack.es.md)

---

## Stack Summary

| Layer          | Technology                  | Reason                                                                  |
| -------------- | --------------------------- | ----------------------------------------------------------------------- |
| Frontend       | Vite + React + TypeScript   | Fast, familiar, strongly typed SPA development                          |
| Styling        | Tailwind CSS                | Fast UI iteration and consistent design system                          |
| Routing        | React Router                | Standard client-side routing                                            |
| Forms          | React Hook Form + Zod       | Typed validation and clean form handling                                |
| Charts         | Recharts                    | Dashboard/report visualizations                                         |
| Testing        | Vitest                      | Fast tests for business rules and utilities                             |
| Backend / BaaS | InsForge                    | PostgreSQL, Auth, Storage, APIs, Realtime with reduced backend overhead |
| Database       | PostgreSQL                  | Relational model fits reservations, invoices, rooms, and reports        |
| Deployment     | Vercel / Netlify + InsForge | Simple deploy path for demo and defense                                 |

## Why This Stack

The project has a limited delivery window and should prioritize a functional, deployable MVP. InsForge reduces repetitive backend work while preserving relational database power. React/TypeScript/Tailwind match existing experience and are suitable for a polished product UI.

## Styling Strategy

Tailwind CSS is configured through the Vite plugin and imported from `src/index.css`. Global CSS should stay limited to document-level defaults, semantic color variables, and base resets; feature and shared UI styling should use Tailwind utilities.

Light and dark mode are prepared for future manual switching through the `data-theme` attribute on the root `<html>` element. Use `data-theme="light"` or `data-theme="dark"` instead of relying only on the operating system preference.

## Realtime Strategy

Realtime is selective, not global. Use it where operational visibility matters:

- dashboard alerts;
- room status changes;
- cleaning tasks;
- maintenance tickets;
- recent reservations.

All subscriptions should be scoped by `property_id` and mounted only while the relevant screen is active.

## Testing Targets

- nights calculation;
- date-range validation;
- overlap detection;
- room availability status;
- invoice total calculation;
- check-in/check-out permission rules;
- occupancy percentage.

## Related Documents

- [Architecture](05-architecture.md)
- [Functional Specification](07-functional-specification.md)
