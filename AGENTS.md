# AGENTS.md — InnHub Project Context

This file gives coding agents the minimum project context needed to work safely on InnHub. Treat it as an operating contract, not as product documentation.

## Project Summary

InnHub is an academic/professional MVP for managing accommodation businesses such as hotels, hostels, residences, inns, and similar room-based hospitality operations.

The product centralizes:

- properties;
- rooms and room types;
- guests/customers;
- reservations;
- check-in and check-out;
- housekeeping;
- maintenance;
- billing and manual payments;
- reports and dashboard metrics.

The current project is documentation-first and is transitioning into implementation.

## Current State

- The repository already contains strong bilingual documentation under `README*.md` and `docs/*.md`.
- The React app is still close to the default Vite starter and should be replaced with InnHub-specific structure before building UI features.
- Backend/database implementation is not finalized yet.
- The documented target stack mentions InsForge + PostgreSQL, but the backend decision must be confirmed before implementation.
- `package.json` currently includes React, TypeScript, React Router, React Hook Form, Zod, Recharts, Vitest, and Vite.
- Tailwind CSS is documented as the intended styling choice, but it is not currently installed/configured in the project. Do not assume Tailwind is available without checking.

## Primary Documents

Read these before making architectural or product decisions:

| File                                  | Purpose                                  |
| ------------------------------------- | ---------------------------------------- |
| `README.md`                           | Public English landing page              |
| `README.es.md`                        | Public Spanish landing page              |
| `docs/01-product-overview.md`         | Product vision and operational problem   |
| `docs/02-mvp-scope.md`                | MVP boundaries and non-goals             |
| `docs/03-domain-model.md`             | Core domain entities and relationships   |
| `docs/04-tech-stack.md`               | Intended technology choices              |
| `docs/05-architecture.md`             | Frontend architecture and layer rules    |
| `docs/06-git-workflow.md`             | Branch, issue, commit, and PR workflow   |
| `docs/07-functional-specification.md` | Requirements, rules, and acceptance flow |

Spanish counterparts exist as `.es.md` files and should stay aligned with the English documents when documentation changes are meaningful.

## Language and Documentation Rules

- Code, filenames, identifiers, commit messages, and technical artifacts should use English by default.
- User-facing documentation has bilingual pairs: English source plus Spanish `.es.md` counterpart.
- When changing a numbered documentation file, update its Spanish pair unless the change is explicitly language-specific.
- Keep documentation concise, reviewable, and structured for academic evaluation.
- Do not rename the project back to earlier names such as HotelFlow.

## Architecture Rules

Follow the architecture described in `docs/05-architecture.md`.

Suggested frontend shape:

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

Layer rules:

- Components must not call backend/InsForge services directly.
- Feature services own data access for their business context.
- Shared UI must remain generic and must not leak domain-specific behavior.
- Business rules should be pure functions when possible.
- Realtime logic must be wrapped in hooks/services and scoped by `property_id`.

## MVP Business Rules

Preserve these unless the project owner explicitly changes scope:

- Every operational record belongs to one property.
- Each user belongs to exactly one property in the MVP.
- Guests/customers are scoped to one property.
- A room cannot have overlapping active reservations.
- A future reservation must not change the physical room state to `reserved`.
- Physical room states are: `available`, `occupied`, `cleaning`, `maintenance`, `inactive`.
- Check-out should trigger a cleaning workflow.
- Maintenance can block room availability.
- Paid invoices should not be freely modified.
- Payments are manual tracking only; no payment gateway in the MVP.

## Backend Direction

Backend/database work should be designed before building large frontend features.

Current documented target:

- InsForge as Backend/BaaS;
- PostgreSQL as database;
- property-scoped data isolation;
- selective realtime only where operationally useful.

Before implementing backend code, confirm:

1. whether InsForge is still the selected backend path;
2. how local development and environment variables should work;
3. the first vertical slice to build;
4. seed data required for frontend and tests.

Recommended first backend slice:

1. properties;
2. room types;
3. rooms;
4. guests;
5. reservations;
6. availability/overlap validation;
7. seed data.

## Git Workflow

Follow `docs/06-git-workflow.md`.

Permanent branches:

- `main` — stable, deployable, defense-ready version;
- `qa` — validation branch before production/main;
- `features` — normal feature development branch;
- `refactor` — structural corrections and cleanup before returning to QA.

Rules:

- Every meaningful task should start from an issue.
- PRs should reference their issue.
- Do not create per-issue or short-lived feature branches for this individual project.
- Implement approved work directly on `features`.
- Promote completed work from `features` to `qa` for validation.
- If validation fails in `qa`, move the fix work to `refactor`, then return it to `qa`.
- Promote to `main` only after the work is validated and ready.
- Keep changes reviewable and avoid unrelated mixes.
- Do not commit, push, merge, or publish unless the user explicitly asks.

Commit format:

```text
type(scope): short description
```

Examples:

```text
feat(reservations): add date overlap validation
docs(agents): add project agent context
refactor(rooms): extract availability calculation
```

## Commands

Use these commands when relevant:

```bash
npm run lint
npm run build
npm run test:run
npm run dev
```

Notes:

- Run `npm run build` before reporting implementation work as complete when code changes affect the app.
- Run `npm run lint` for TypeScript/React changes.
- Use `npm run test:run` for non-watch test execution.

## Implementation Priorities

Prefer this order unless the user changes priorities:

1. Keep project context current (`AGENTS.md`, README/docs alignment).
2. Decide and prepare backend/database path.
3. Build a minimal backend vertical slice with real data and validation.
4. Connect frontend screens to real services.
5. Expand UI features module by module.
6. Add tests for business rules before polishing UI.

## Do Not Do Without Approval

- Do not introduce a different backend stack without asking.
- Do not install Tailwind or major UI libraries just because the docs mention them.
- Do not remove bilingual documentation structure.
- Do not collapse domain rules into JSX components.
- Do not create large multi-area rewrites without a plan.
- Do not commit, push, or create PRs without explicit user approval.
