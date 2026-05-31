# Tasks — polish-app-shell-navigation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 235–460 (target ≤400) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR (shell-only) |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

## Scope Guard

- In scope only: `src/app/shell/AppShell.tsx`, `src/app/shell/SidebarNav.tsx`, `src/app/shell/TopBar.tsx`, `src/app/shell/__tests__/SidebarNav.test.tsx`, and minimal shell keys in `src/shared/i18n/resources/en.ts` + `src/shared/i18n/resources/es.ts`.
- Out of scope: auth logic, route metadata model, permissions, backend/InsForge/RLS, feature pages, deps/config.
- If forecast rises above 400 changed lines, pause apply and request delivery decision before continuing.

## Implementation Tasks (Strict TDD)

1. **RED — express shell-polish expectations in tests**
   - Edit `src/app/shell/__tests__/SidebarNav.test.tsx` to add/adjust failing tests for:
     - sidebar property context card visibility and accessible context text;
     - topbar route title + route description rendering for active route;
     - topbar compact action cluster affordances (date/notification/avatar/property) while keeping logout/preference controls available;
     - stronger active nav visual contract (single targeted class assertion allowed);
     - existing mobile drawer open/close/link-close behavior remains asserted.
   - Evidence to capture in apply-progress: failing `npm run test:run` output tied to new assertions.

2. **GREEN — implement bounded shell visual updates**
   - Edit `src/app/shell/AppShell.tsx`:
     - keep drawer state behavior unchanged;
     - add sidebar footer property context card;
     - keep nav landmark/workspace landmark semantics;
     - adjust spacing/layering only as needed for prototype alignment.
   - Edit `src/app/shell/SidebarNav.tsx`:
     - preserve props/data flow;
     - apply stronger active treatment + readable inactive/hover/focus states;
     - keep pinned item behavior unchanged.
   - Edit `src/app/shell/TopBar.tsx`:
     - preserve `useAuthSession` + logout callback;
     - show route title + description/fallback context;
     - render compact right cluster with presentational affordances only.
   - Edit i18n keys minimally in:
     - `src/shared/i18n/resources/en.ts`
     - `src/shared/i18n/resources/es.ts`
   - Evidence to capture: passing `npm run test:run` after implementation.

3. **TRIANGULATE/REFACTOR — reduce duplication without scope growth**
   - Refactor only shell-local class/helper constants in:
     - `src/app/shell/SidebarNav.tsx`
     - `src/app/shell/TopBar.tsx`
   - Keep behavior and text outputs unchanged; avoid new abstractions outside shell.
   - Re-run `npm run test:run`; capture pass evidence.

4. **Final quality gates (required)**
   - Run and record:
     - `npm run test:run`
     - `npm run lint`
     - `npm run build`
   - Confirm changed-file boundary is still shell-only + minimal i18n/tests.

5. **Review-budget gate before handoff**
   - Check `git diff --stat` and total changed lines.
   - If `additions + deletions > 400`: stop and request user decision (split vs approved exception) before commit/PR prep.
   - If `<= 400`: proceed with normal single-PR handoff notes.
