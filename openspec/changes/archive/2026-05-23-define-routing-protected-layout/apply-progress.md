# Apply Progress — define-routing-protected-layout

## Status

Applied with approved single-PR review budget exception.

## Scope

Implemented issue #3 only:

- public and protected React Router structure;
- structural protected layout boundary;
- protected app shell with sidebar, topbar, and main workspace;
- compact MVP module placeholders;
- centralized protected route metadata;
- bilingual i18n copy for route, shell, public, and placeholder text;
- routing/layout smoke tests.

Explicitly not implemented:

- real auth/session enforcement;
- RBAC;
- backend/InsForge integration;
- feature services;
- browser persistence/session checks;
- Room Status Board;
- dashboard metrics/charts;
- feature workflows/forms/tables;
- direct Stitch HTML/CSS/script port.

## TDD Cycle Evidence

| Cycle       | Action                                                                                                             | Evidence                                                                                                                                                         | Result                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| RED         | Added routing/layout smoke tests before implementation.                                                            | `npm run test:run` failed because `../routes/routeMetadata` and `../routes/routes` did not exist yet.                                                            | Expected failure confirmed.                           |
| GREEN       | Implemented route metadata, route tree, public pages, protected layout, shell, module placeholders, and i18n copy. | `npm run test:run` passed with 9 test files and 39 tests.                                                                                                        | Behavior satisfied the new tests.                     |
| TRIANGULATE | Verified all protected destinations by iterating `protectedRoutes` in the routing test.                            | Each route `href` rendered its sidebar link and translated heading.                                                                                              | Route/navigation metadata stayed the source of truth. |
| REFACTOR    | Checked scope boundaries and architecture constraints.                                                             | Shell/layout components do not call backend, InsForge, auth providers, services, browser storage, or feature hooks; Stitch prototype was used only as reference. | Scope remained issue #3 only.                         |

## Validation Evidence

```text
npm run lint
npm run test:run
npm run build
```

Results:

- `npm run lint`: passed.
- `npm run test:run`: passed — 9 test files, 39 tests.
- `npm run build`: passed — TypeScript build and Vite production build completed.

## Review Workload

The original review budget was 400 changed lines with a mandatory pause around 420 lines.

During apply, the implementation exceeded the pause threshold. The user approved option A: continue as a single PR with a size exception because the scope stayed within issue #3 and splitting the structural route/shell work would create artificial overhead.

## Changed Areas

- `src/app/App.tsx`
- `src/app/__tests__/App.routing.test.tsx`
- `src/app/layouts/ProtectedLayout.tsx`
- `src/app/pages/*`
- `src/app/routes/*`
- `src/app/shell/*`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

## Next Phase

Proceed to SDD verify.
