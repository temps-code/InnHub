# Tasks: manage-guest-records

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900-1500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (service/types/tests) → PR 2 (shared reusable UI primitives) → PR 3 (page/hook/routing/i18n/tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

## Implementation Tasks (Strict TDD)

1. **Baseline discovery + prototype alignment targets**
   - Confirm existing reusable components and route test patterns in:
     - `src/shared/components/**`
     - `src/app/routes/routes.tsx`
     - `src/features/rooms/**`, `src/features/room-types/**`
   - Review visual reference `docs/assets/guests.png` and document concrete UI elements to mirror (header, summary cards, list/details split, trash mode visuals) without introducing unsupported/fake data.
   - Output: short checklist in task notes used by PR 3 tests.

2. **PR 1 — RED: guest service contract tests**
   - Add failing tests in `src/features/guests/__tests__/guestService.test.ts` for:
     - Explicit `property_id` filters on all guest and reservation guard queries.
     - Active list excludes `deleted_at`; trash list includes only `deleted_at`.
     - Server-side search (name/email/document), default `pageSize=20`, pagination metadata.
     - Role gates: create/update (receptionist+), soft delete/restore (manager or administrator), purge (administrator only).
     - Soft-delete reservation guard (`pending|confirmed|checked_in`, current/future, non-deleted reservations).
     - Purge guard blocks on any reservation reference and returns blocking count.
     - Safe not-found/cross-property behavior.
   - Evidence checkpoint (RED): `npm run test:run` shows guest service failures first.

3. **PR 1 — GREEN: implement guest types + service**
   - Create/implement:
     - `src/features/guests/types.ts`
     - `src/features/guests/guestService.ts`
   - Ensure authenticated client usage and explicit `property_id` scoping on every query/mutation.
   - Implement create/update/list/listTrash/getById/softDelete/restore/purge per spec.
   - Evidence checkpoint (GREEN): `npm run test:run` passes service tests.

4. **PR 1 — TRIANGULATE + REFACTOR**
   - Add/adjust edge-case tests in `guestService.test.ts` (trim/null normalization, strict confirmation input contract, guard date boundary behavior).
   - Refactor service internals for clarity (shared scoped query helpers, error normalization) without behavior change.
   - Evidence checkpoint: `npm run test:run` green; small diff-only cleanup.

5. **PR 2 — RED: reusable shared component tests (only if reuse gap confirmed)**
   - If prototype alignment cannot be met with existing shared components, add failing tests for generic components:
     - `src/shared/components/**/__tests__/InitialsAvatar.test.tsx`
     - `src/shared/components/**/__tests__/PaginationControls.test.tsx`
     - `src/shared/components/**/__tests__/StrictConfirmDialog.test.tsx`
   - Keep components domain-agnostic.
   - Evidence checkpoint (RED): new component tests fail before implementation.

6. **PR 2 — GREEN: implement generic shared components**
   - Create only needed generic components in shared layer (exact paths based on existing structure), e.g.:
     - `src/shared/components/atoms/InitialsAvatar.tsx`
     - `src/shared/components/molecules/PaginationControls.tsx`
     - `src/shared/components/organisms/StrictConfirmDialog.tsx`
   - Export through existing shared component barrels as needed.
   - Evidence checkpoint: `npm run test:run` green for shared tests.

7. **PR 2 — TRIANGULATE + REFACTOR**
   - Improve accessibility/keyboard flows and API consistency for new shared components.
   - Remove duplication and confirm no guest-specific logic leaked into shared layer.
   - Evidence checkpoint: `npm run test:run` green.

8. **PR 3 — RED: hook behavior tests**
   - Add failing tests in `src/features/guests/__tests__/useGuests.test.ts` for:
     - Active vs trash loading path.
     - Search/activity/page interactions and page reset behavior.
     - Mutation actions (create/update/remove/restore/purge) refresh list and surface errors.
     - Stale request/session safety behavior.
   - Evidence checkpoint (RED): hook tests fail first.

9. **PR 3 — GREEN: implement `useGuests` hook**
   - Create `src/features/guests/useGuests.ts` with list mode, filters, pagination, mutation handlers, and refresh flow.
   - Evidence checkpoint: `npm run test:run` passes hook tests.

10. **PR 3 — RED: page/routing/i18n tests**
    - Add failing tests in:
      - `src/features/guests/__tests__/GuestsPage.test.tsx`
      - route tests near `src/app/routes/routes.tsx` (or create if absent)
      - i18n key presence tests (if project pattern exists)
    - Cover:
      - `/app/guests` renders real page (not placeholder).
      - Prototype-aligned layout (header, summary, list/details behavior, trash mode clarity).
      - No fake out-of-scope data in detail/summary panels.
      - Loading/empty/no-results/error states.
      - Soft-delete manager/admin gate.
      - Restore flow in trash.
      - Admin-only purge + typed strict confirmation + blocking count messages.
      - English/Spanish guest key coverage.
    - Evidence checkpoint (RED): tests fail before page implementation.

11. **PR 3 — GREEN: implement page, route wiring, and localization**
    - Create:
      - `src/features/guests/GuestsPage.tsx`
      - `src/features/guests/index.ts`
    - Modify:
      - `src/app/routes/routes.tsx` (render guests module page)
      - `src/shared/i18n/resources/en.ts`
      - `src/shared/i18n/resources/es.ts`
    - Ensure action permissions: soft delete + restore (manager/administrator), purge (administrator only), recycle bin/restore/purge mandatory flows.
    - Evidence checkpoint: `npm run test:run` green.

12. **PR 3 — TRIANGULATE + REFACTOR + final quality gates**
    - Add focused UI edge-case tests (confirmation disable/enable transitions, localized blocking errors, pagination state retention).
    - Refactor page composition for reuse/readability while keeping behavior stable.
    - Final verification commands:
      - `npm run test:run`
      - `npm run lint`
      - `npm run build`
    - Collect command outputs as apply/verify evidence.

## Delivery Decision Gate (before apply)

- Because forecast risk is **High** and likely exceeds the 400-line review budget, confirm chained delivery before implementation starts.
- If chain strategy remains undecided, keep as `pending` and request explicit parent/user delivery decision at apply start.
