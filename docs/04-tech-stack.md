# InnHub — Tech Stack

> This document explains the selected technologies and the reasons behind them.

📄 Read this in: **English** | [Español](04-tech-stack.es.md)

---

## Stack Summary

| Layer          | Technology                  | Reason                                                                                |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| Frontend       | Vite + React + TypeScript   | Fast, familiar, strongly typed SPA development                                        |
| Styling        | Tailwind CSS                | Fast UI iteration and consistent design system                                        |
| Routing        | React Router                | Standard client-side routing                                                          |
| Forms          | React Hook Form + Zod       | Typed validation and clean form handling                                              |
| Charts         | Recharts                    | Dashboard/report visualizations                                                       |
| Icons          | Lucide React                | Tree-shakeable, consistent icon set for navigation and UI affordances                 |
| Testing        | Vitest                      | Fast tests for business rules and utilities                                           |
| Backend / BaaS | InsForge                    | PostgreSQL, Auth, APIs, selective Realtime, and future Storage with reduced overhead   |
| Database       | PostgreSQL                  | Relational model fits reservations, invoices, rooms, and reports                      |
| Deployment     | Vercel / Netlify + InsForge | Simple deploy path for demo and defense                                               |

## Why This Stack

The project has a limited delivery window and should prioritize a functional, deployable MVP. InsForge reduces repetitive backend work while preserving relational database power. React/TypeScript/Tailwind match existing experience and are suitable for a polished product UI.

## Styling Strategy

Tailwind CSS is configured through the Vite plugin and imported from `src/index.css`. Global CSS should stay limited to document-level defaults, semantic color variables, and base resets; feature and shared UI styling should use Tailwind utilities.

Light and dark mode are prepared for future manual switching through the `data-theme` attribute on the root `<html>` element. Use `data-theme="light"` or `data-theme="dark"` instead of relying only on the operating system preference.

## Icon System

InnHub uses **Lucide React** as its project-wide icon library. Lucide was chosen for its tree-shakeable bundle, consistent 24px design grid, TypeScript support, and compatibility with React 19.

Conventions:

- **Navigation icons**: 20px, `aria-hidden="true"`, rendered before the label in the sidebar.
- **Button icons**: 16px, placed before the label, optional.
- **Status/indicator icons**: match StatusBadge semantic tones, decorative with `aria-hidden`.
- **Empty state icons**: 48px+, decorative, accompanied by a descriptive text message.
- **Accessibility**: decorative icons use `aria-hidden="true"`; standalone icons require `aria-label` or `title`.

Each protected route in `ProtectedRouteMeta` references a Lucide icon component. The mapping follows the module domain (e.g., `LayoutDashboard` for dashboard, `Building2` for properties, `CalendarCheck` for reservations).

## Demo Authentication Setup

The login screen may expose an optional demo account for MVP validation when `VITE_DEMO_LOGIN_EMAIL` and `VITE_DEMO_LOGIN_PASSWORD` are configured. Because Vite frontend variables are bundled into the browser, these values are public demo-only credentials, not secrets. Never commit production credentials, personal accounts, API keys, JWTs, or private tokens.

Demo login still uses the normal InsForge authentication flow. Before it works, the backend environment must already contain:

- an InsForge Auth user for the demo credentials;
- an active `profiles` row whose `auth_user_id` matches that Auth user;
- a valid `property_id` on that profile that references an existing property.

Repository code does not provision the external Auth user or create production seed data as part of demo login.

## Storage Strategy

InsForge Storage is part of the selected backend capability, but it is deferred for the current MVP implementation until a concrete file workflow needs it.

Likely future uses include:

- manual payment receipts;
- maintenance ticket attachments;
- invoice PDFs;
- property logos or room photos.

Do not add storage buckets, upload UI, or file metadata tables as part of the core schema unless a scoped issue explicitly requires them. When introduced, storage should define bucket names, `property_id`-scoped paths, access rules, and PostgreSQL metadata references before implementation.

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
