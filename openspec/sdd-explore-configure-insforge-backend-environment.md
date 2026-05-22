# SDD Explore — Configure InsForge Backend Environment

## Change Slug

`configure-insforge-backend-environment`

## Issue

GitHub issue #4: `chore(insforge): configure backend environment`

## Problem

InnHub has selected InsForge as the MVP backend path, but the React app does not yet have a committed, reviewable backend environment foundation. The project needs documented environment variables, a thin SDK client/config boundary, and local/demo setup guidance before database schema or feature integrations are implemented.

## Current Findings

- `.env.example` exists and currently lists commented placeholders:
  - `VITE_INSFORGE_URL`
  - `VITE_INSFORGE_ANON_KEY`
- InsForge MCP is connected and exposes infrastructure/documentation tools.
- InsForge MCP instructions report the project API base URL as `https://d572u4n6.us-east.insforge.app`.
- Backend metadata currently shows:
  - Auth providers: GitHub and Google.
  - Email verification required.
  - No database tables.
  - No storage buckets.
  - No functions.
- No InsForge SDK/client code is currently present in the app.

## Proposed Scope

In scope for issue #4:

- Document required Vite environment variables in `.env.example` without real secrets.
- Install and prepare the official InsForge TypeScript SDK if confirmed by current docs.
- Create a thin frontend InsForge client/config module.
- Document local/demo setup steps for developers.
- Keep the change infrastructure-only and safe to review.

Out of scope for issue #4:

- Creating database schema/tables.
- Implementing auth flows or UI.
- Creating feature data services.
- Creating realtime subscriptions.
- Creating seed data.
- Creating storage buckets or functions.

## Open Decisions

- Env var naming should align with SDK terminology. Preferred direction: `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` rather than the current `VITE_INSFORGE_URL`.
- The implementation phase must fetch current InsForge SDK docs before writing integration code.

## Risks

- Scope creep into database/auth/schema work.
- Accidentally committing real backend secrets.
- Env var naming drift from SDK terminology.
- Review size growth if docs, dependency installation, client code, and tests are not kept narrow.

## Next Recommended Phase

Proceed to SDD proposal for `configure-insforge-backend-environment`.
