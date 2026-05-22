# Design — configure-insforge-backend-environment

Configure the minimum InsForge backend environment foundation for InnHub. This design covers environment variable naming, SDK dependency usage, client/config boundaries, setup documentation, tests, and review controls only.

## Decision Summary

| Area | Decision |
| --- | --- |
| Backend platform | Use the connected InsForge project as the official MVP backend environment. |
| SDK | Use `@insforge/sdk@latest` and the documented `createClient({ baseUrl, anonKey })` pattern. |
| Env names | Use `VITE_INSFORGE_BASE_URL` and `VITE_INSFORGE_ANON_KEY` to match Vite exposure rules and SDK terminology. |
| Secret handling | Commit placeholders only; real values belong in `.env.local` or deployment environment settings. |
| Client boundary | Add one shared infrastructure module that owns environment parsing and client creation. |
| Component access | Components must not create InsForge clients directly; future feature services import the shared boundary. |
| Scope | Infrastructure-only; no schema, auth flow, feature CRUD, realtime, storage, functions, seed data, or deployment. |
| Tests | Add focused unit tests for env/config behavior if the module contains meaningful logic. |
| Review budget | Keep expected diff under 400 changed lines; pause if dependency/docs churn grows beyond that. |

## Current State

- `.env.example` exists but uses `VITE_INSFORGE_URL` instead of the preferred `VITE_INSFORGE_BASE_URL` name.
- The repo does not currently include `@insforge/sdk`.
- No InsForge client/config module exists.
- InsForge MCP is connected and reports the project API base URL as `https://d572u4n6.us-east.insforge.app`.
- InsForge backend metadata currently has no tables, buckets, or functions.
- `docs/05-architecture.md` requires InsForge access to be encapsulated behind services/hooks and kept out of JSX components.

## Official SDK Facts Used

Fetched from InsForge MCP before this design:

- Install command: `npm install @insforge/sdk@latest`.
- Client creation:

```ts
import { createClient } from "@insforge/sdk";

const insforge = createClient({
  baseUrl: "https://d572u4n6.us-east.insforge.app",
  anonKey: "your-anon-key",
});
```

- SDK operations return `{ data, error }`-style results.
- Application logic should use SDK code; MCP tools are for infrastructure and metadata.

Issue #4 should only prepare the SDK boundary. Actual database calls belong to later feature/backend slices.

## Target File Structure

```text
.env.example
src/
└── shared/
    └── services/
        ├── insforgeClient.ts
        └── insforgeClient.test.ts   # optional if config logic is added
```

Alternative naming accepted during apply if clearer:

```text
src/shared/services/insforge.ts
src/shared/services/insforge.test.ts
```

Keep this in `shared/services` because it is generic infrastructure, not a domain feature service. Later modules such as reservations or rooms should wrap this client inside their own feature services.

## Environment Design

### `.env.example`

Use placeholders and comments only:

```dotenv
# InnHub environment variables
# Copy this file to .env.local and fill values when backend services are configured.

# InsForge backend URL, for example: https://your-project.region.insforge.app
VITE_INSFORGE_BASE_URL=

# Public anonymous key from the InsForge project. Do not commit real keys.
VITE_INSFORGE_ANON_KEY=
```

Do not commit the real connected project's anon key. The base URL may be referenced in documentation as a non-secret project URL, but `.env.example` should remain generic unless the user explicitly wants project-specific defaults.

## Client/Config Design

Create a small module responsible for reading and validating Vite env values.

Recommended shape:

```ts
import { createClient } from "@insforge/sdk";

const requiredEnv = {
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
};

function requireEnvValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getInsForgeConfig() {
  return {
    baseUrl: requireEnvValue("VITE_INSFORGE_BASE_URL", requiredEnv.baseUrl),
    anonKey: requireEnvValue("VITE_INSFORGE_ANON_KEY", requiredEnv.anonKey),
  };
}

export function createInsForgeClient() {
  return createClient(getInsForgeConfig());
}

export const insforge = createInsForgeClient();
```

Design considerations for apply:

- If eager client creation makes tests or local boot fail too early, prefer lazy creation through `createInsForgeClient()` and export `getInsForgeConfig()`.
- Error messages should name missing variables but never print values.
- The module should not include table names, auth flows, feature queries, or business rules.
- If SDK types make direct testing hard, test the pure config helper and rely on TypeScript/build for SDK integration.

## Documentation Design

Update the smallest appropriate setup location. Prefer a concise root README or dedicated setup section only if it already exists. The documentation should explain:

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_INSFORGE_BASE_URL`.
3. Set `VITE_INSFORGE_ANON_KEY` from InsForge project settings or MCP metadata.
4. Never commit `.env.local` or real keys.
5. Issue #4 does not create database tables; schema setup comes later.

If numbered docs are meaningfully changed, update the Spanish counterpart according to project rules. For a tiny local setup note, prefer a smaller non-numbered location if available to avoid broad bilingual churn.

## Test Strategy

Strict TDD is active. Use `npm run test:run` as the primary test command.

Recommended tests if config helper is implemented:

- valid env values produce `{ baseUrl, anonKey }`;
- missing base URL throws `Missing required environment variable: VITE_INSFORGE_BASE_URL`;
- missing anon key throws `Missing required environment variable: VITE_INSFORGE_ANON_KEY`;
- error messages do not include secret values.

If the implementation is only dependency + documentation + direct client creation with no testable logic, add a tiny pure helper to make configuration behavior testable instead of leaving env handling implicit.

## Apply Sequence

1. Fetch current InsForge SDK docs via MCP before coding.
2. Add failing config tests for missing/valid env behavior.
3. Install `@insforge/sdk@latest`.
4. Update `.env.example` naming and comments.
5. Add the shared InsForge config/client module.
6. Add/update local setup documentation.
7. Run `npm run test:run`.
8. Run `npm run lint`.
9. Run `npm run build`.

## Tradeoffs

| Option | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| `VITE_INSFORGE_BASE_URL` | Matches SDK `baseUrl` terminology and is explicit. | Requires replacing existing `VITE_INSFORGE_URL` placeholder. | Chosen. |
| `VITE_INSFORGE_URL` | Shorter and already present. | Less aligned with SDK docs and easier to confuse with non-API URLs. | Rejected. |
| Eager exported singleton client | Simple for future imports. | Can throw at app startup if env is missing. | Acceptable only if tests/docs make behavior clear; lazy factory preferred if needed. |
| Lazy client factory | Easier to test and avoids import-time failure. | Future callers must call factory or import a wrapper. | Preferred if eager singleton causes local/test friction. |
| Root README setup note | Easy for developers to find. | May require bilingual public README updates if meaningful. | Use only if setup docs belong there; otherwise choose smallest appropriate doc. |

## Review Workload Forecast

| Field | Value |
| --- | --- |
| Estimated changed lines | ~120–250 plus lockfile churn |
| 400-line budget risk | Low to medium because package lock updates may be noisy |
| Chained PRs recommended | No |
| Suggested split | Single PR; pause only if docs/dependency churn exceeds budget |
| Delivery strategy | auto-forecast |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Real keys committed | Use placeholders only; inspect diff before completion. |
| Runtime crashes in tests due eager env validation | Prefer testable pure helper and lazy client creation if needed. |
| Scope creeps into schema or auth | Keep issue #4 infrastructure-only and reject table/auth/service additions. |
| Components import SDK directly | Centralize SDK imports in shared service boundary. |
| Documentation becomes too broad | Add only setup guidance needed for this issue. |
