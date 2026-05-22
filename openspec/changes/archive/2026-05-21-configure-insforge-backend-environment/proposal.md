# Proposal — configure-insforge-backend-environment

## Change ID

`configure-insforge-backend-environment`

## Related Issue

- Issue #4: `chore(insforge): configure backend environment`

## Intent

Configure InsForge as InnHub's official backend environment foundation before implementing database schema, authentication flows, or feature data services. This change creates the minimum safe frontend/backend integration boundary needed for later MVP slices: documented Vite environment variables, an InsForge SDK client/config module, and local/demo setup guidance.

The goal is infrastructure readiness, not product workflow implementation.

## Problem

InnHub's documentation already identifies InsForge + PostgreSQL as the target backend path, and the project now has a connected InsForge MCP project. However, the React application does not yet contain a committed backend configuration foundation. Without one, future backend slices may duplicate environment handling, leak secrets, call InsForge directly from components, or mix schema/auth decisions into unrelated UI work.

## Proposed Change

Implement a narrow InsForge backend environment foundation:

- document required Vite environment variables in `.env.example` using placeholder values only;
- standardize frontend variable names around SDK terminology:
  - `VITE_INSFORGE_BASE_URL`;
  - `VITE_INSFORGE_ANON_KEY`;
- install and prepare the official InsForge TypeScript SDK after confirming current MCP SDK documentation;
- create a thin shared InsForge client/config boundary that reads from `import.meta.env`;
- ensure the client/config layer is reusable by future feature services without letting JSX components call InsForge directly;
- document local/demo setup steps, including where developers should obtain backend URL and anon key;
- keep secrets out of source control and avoid committing real project keys.

## Scope

In scope:

- `.env.example` updates;
- dependency setup for the official InsForge SDK if confirmed by current docs;
- a small frontend configuration/client module, likely under `src/shared/services` or another design-approved shared infrastructure path;
- optional focused unit tests for environment/config behavior if practical;
- local/demo setup documentation in an appropriate README or docs section;
- validation with the project's existing lint/build/test commands during apply.

## Acceptance Boundary

The change is acceptable when:

- `.env.example` documents the required InsForge Vite variables without real secrets;
- the app has a single, typed place to create or access the InsForge client/config;
- the implementation uses the official SDK pattern confirmed by InsForge MCP docs;
- missing environment values fail clearly or are handled intentionally for local development;
- documentation tells a developer how to configure `.env.local` for the connected InsForge project;
- no real API keys, anon keys, JWTs, or private project secrets are committed;
- no database schema, tables, auth screens, feature CRUD, realtime subscriptions, storage buckets, functions, or seed data are introduced;
- the change stays within the 400 changed-line review budget or pauses before apply.

## Non-goals

Explicitly out of scope:

- creating or migrating PostgreSQL tables;
- implementing RLS policies;
- implementing login, signup, logout, or auth UI;
- using InsForge auth components;
- adding feature services for rooms, guests, reservations, billing, housekeeping, maintenance, reports, or dashboard;
- implementing reservation overlap validation;
- creating seed/demo records;
- creating storage buckets or edge functions;
- adding realtime subscriptions;
- deploying the frontend through InsForge;
- installing Tailwind CSS or unrelated UI libraries.

## Affected Areas

Likely implementation areas for later phases:

- `.env.example`;
- `package.json` and `package-lock.json` if the SDK is added;
- `src/shared/services/*` or another shared infrastructure path selected in design;
- optional config/client tests near the implementation;
- `README.md`, `docs/04-tech-stack.md`, or a focused setup doc if setup documentation needs to be expanded.

Exact paths should be finalized in the design phase.

## Dependencies

- InsForge MCP is connected and should be used to fetch current docs before implementation.
- `docs/04-tech-stack.md` confirms InsForge + PostgreSQL as the target backend/database path.
- `docs/05-architecture.md` requires components not to call InsForge directly; feature services should own data access.
- Vite requires frontend-exposed env vars to use the `VITE_` prefix.
- OpenSpec config enables strict TDD with `npm run test:run` for apply/verify.

## Issue Interactions

- Issue #4 provides the backend environment foundation.
- Later backend/schema work should create the actual MVP tables and data rules.
- Future auth work should build on this environment foundation but must not be implemented here.
- Future feature services should import the approved InsForge client/config boundary rather than creating new clients in components.

## Rollout and Review Considerations

Recommended rollout style:

1. fetch current InsForge SDK documentation via MCP;
2. update env variable documentation without secrets;
3. add SDK dependency if needed;
4. add the smallest client/config boundary;
5. add focused tests if there is meaningful config behavior;
6. update setup documentation;
7. run `npm run test:run`, `npm run lint`, and `npm run build` as relevant.

The expected diff should be small. If dependency lockfile churn and documentation updates push the review beyond 400 changed lines, pause before implementation and ask whether to split.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Real secrets are committed | Use placeholders in `.env.example`; keep real values in `.env.local` only. |
| Env naming drifts from SDK language | Use `VITE_INSFORGE_BASE_URL` to match `baseUrl`. |
| Components call InsForge directly | Put the client/config in shared infrastructure and reserve feature calls for future services. |
| Scope expands into schema/auth/features | Keep this issue infrastructure-only and defer tables, auth flows, and feature CRUD. |
| SDK usage is outdated | Fetch InsForge MCP SDK docs immediately before implementation. |
| Missing env values cause unclear runtime failures | Design explicit validation or clear error handling before apply. |

## Rollback

Rollback should be low risk. Revert the env example updates, SDK dependency changes, client/config module, tests, and setup documentation. No database, storage, function, auth provider, or remote infrastructure changes should be required by this proposal.

## Success Criteria

- InnHub has a committed InsForge environment foundation.
- Developers know which env vars to configure locally and where to get values.
- Future feature services have a single approved client/config boundary to reuse.
- The change respects architecture rules and does not implement backend schema or product workflows.
- The implementation remains reviewable within the approved 400-line budget or is split before apply.
