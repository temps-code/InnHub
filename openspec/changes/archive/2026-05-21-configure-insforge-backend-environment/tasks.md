# Tasks — configure-insforge-backend-environment

Issue: #4 `chore(insforge): configure backend environment`

## Review Workload Forecast

| Field | Value |
| --- | --- |
| Estimated changed lines | ~120–250 plus package lock churn |
| 400-line budget risk | Low to medium |
| Chained PRs recommended | No |
| Suggested split | Single PR; pause only if dependency/docs churn pushes review beyond ~400 changed lines |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low to medium

## Scope Guardrails

- Implement issue #4 only: InsForge env documentation, SDK dependency, shared client/config boundary, local/demo setup guidance, and focused tests.
- Exclude database tables, migrations, RLS, seed data, storage buckets, edge functions, deployment, auth UI/flows, realtime subscriptions, feature CRUD services, and UI library/Tailwind installation.
- Never commit real API keys, anon keys, JWTs, access tokens, or private secrets.
- Components must not call `createClient` or import InsForge SDK directly.

## Implementation Tasks

### 1. RED — Add failing config tests ✅

- Files: `src/shared/services/insforgeClient.test.ts` or equivalent.
- Add tests for a pure config helper or factory-friendly API before implementation.
- Cover:
  - valid env-like values produce `{ baseUrl, anonKey }`;
  - missing base URL reports `VITE_INSFORGE_BASE_URL`;
  - missing anon key reports `VITE_INSFORGE_ANON_KEY`;
  - thrown errors do not print secret values.
- Verification before implementation: `npm run test:run` should fail because the helper/module does not exist yet.
- Evidence expected in apply notes: failing test names or concise failure summary.

### 2. GREEN — Fetch current InsForge SDK docs and add SDK dependency ✅

- Use InsForge MCP before coding integration details:
  - `insforge_fetch-sdk-docs` for TypeScript database SDK or the relevant SDK setup docs.
- Install the official SDK:
  - `npm install @insforge/sdk@latest`
- Files: `package.json`, `package-lock.json`.
- Do not install auth components, Tailwind, UI libraries, or unrelated backend SDKs.
- Verification: dependency is present and lockfile is consistent.

### 3. GREEN — Update environment example ✅

- File: `.env.example`.
- Replace the old placeholder naming with:
  - `VITE_INSFORGE_BASE_URL=`
  - `VITE_INSFORGE_ANON_KEY=`
- Add concise comments explaining:
  - copy to `.env.local`;
  - base URL example shape;
  - anon key is public but must not be committed as a real value;
  - no real secrets belong in the example file.
- Do not commit the real connected anon key.

### 4. GREEN — Add shared InsForge config/client boundary ✅

- File: `src/shared/services/insforgeClient.ts` or equivalent.
- Implement a small, typed boundary that:
  - reads `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` from Vite env;
  - validates missing required values with clear errors;
  - creates the SDK client using `createClient({ baseUrl, anonKey })`;
  - exports a reusable factory/helper for future feature services.
- Prefer pure helper functions for testability.
- Avoid table names, auth flows, feature services, business rules, realtime subscriptions, and JSX.
- Verification: config tests from task 1 pass.

### 5. TRIANGULATE — Document local/demo setup ✅

- Files: choose the smallest appropriate docs location during apply, likely `README.md` plus `README.es.md` only if the public setup instructions are meaningfully changed, or another focused setup doc if available.
- Document:
  - copy `.env.example` to `.env.local`;
  - set `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY`;
  - obtain values from InsForge project settings / connected backend metadata;
  - keep `.env.local` and real keys out of commits;
  - schema/table setup will be handled by a later issue.
- Keep documentation concise and bilingual if modifying paired public docs.

### 6. REFACTOR — Verify architecture and secret hygiene ✅

- Inspect diff for:
  - no real keys or JWT-like values;
  - no InsForge SDK imports from JSX components;
  - no schema/auth/feature/realtime/storage/function/deployment additions;
  - no unrelated Tailwind/UI dependency installation.
- Keep the client/config module in shared infrastructure and leave future feature data access to feature services.
- If changed-line forecast exceeds ~400 lines excluding package lock noise, pause and ask before continuing.

### 7. VERIFY — Run project validation ✅

- Run validation commands:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`
- Record evidence in apply/verify notes.
- If failures are unrelated to this issue, document them clearly and do not mark the issue complete without user approval.

## Apply Evidence Checklist

- RED evidence: initial config tests fail before implementation.
- SDK evidence: InsForge MCP SDK docs fetched before integration code.
- GREEN evidence: config tests pass after implementation.
- Quality evidence: `npm run lint` passes.
- Test evidence: `npm run test:run` passes.
- Build evidence: `npm run build` passes.
- Scope evidence: no secrets, schema, auth flow, feature CRUD, realtime, storage, functions, deployment, or UI library work included.
