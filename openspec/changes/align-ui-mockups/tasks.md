# Tasks — align-ui-mockups (Issue #99)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 370–770 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (tokens + shared primitives) → PR 2 (landing + login) → PR 3 (shell/sidebar/topbar) |
| Delivery strategy | auto-chain |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

## Scope Inputs Reviewed

- `openspec/changes/align-ui-mockups/proposal.md`
- `openspec/changes/align-ui-mockups/design.md`
- `openspec/config.yaml` (`strict_tdd: true`)
- Spec artifact not found at `openspec/changes/align-ui-mockups/spec.md` (discovery target for apply kickoff)

## Delivery Plan (strict TDD, review-budget protected)

### PR 1 — Tokens and shared primitives

1. **RED: lock visual/behavior contracts before style edits**  
   - Targets:  
     - `src/app/shell/__tests__/SidebarNav.test.tsx`  
     - shared primitive tests under `src/shared/**/__tests__/*` (or add focused tests if missing)  
   - Add/update tests only for user-observable class/state contracts that must remain true during restyle (drawer close paths, focus-visible, disabled/loading button states, generic card semantics).  
   - **Verification:** `npm run test:run` (fails first for intended contract deltas).

2. **GREEN: align global tokens/base styles**  
   - Targets: `src/index.css`  
   - Refine semantic variables, focus ring, surface/border/shadow/radius rhythm per design without behavior changes.  
   - **Verification:** `npm run test:run`.

3. **GREEN: align shared primitives with tokenized styles**  
   - Targets:  
     - `src/shared/components/atoms/Button.tsx`  
     - `src/shared/components/organisms/PageSection.tsx`  
     - `src/shared/components/molecules/ModuleCard.tsx`  
   - Keep API contracts unchanged; update visuals only.  
   - **Verification:** `npm run test:run`.

4. **TRIANGULATE/REFACTOR for PR 1**  
   - Remove duplicated utility clusters; keep semantic-variable usage centralized and generic.  
   - **Verification:** `npm run test:run && npm run lint && npm run build`.

### PR 2 — Landing and login visual alignment

5. **RED: add/update focused page/auth presentation regression tests**  
   - Targets (existing tests or new focused files):  
     - `src/app/__tests__/App.routing.test.tsx`  
     - `src/app/__tests__/PreferenceIntegration.test.tsx`  
     - `src/features/auth/**/__tests__/*`  
   - Protect login alerts/labels/demo actions and public-page preference visibility while allowing visual class updates.  
   - **Verification:** `npm run test:run` (intentional fail before page/form updates if contracts changed).

6. **GREEN: align public landing layout to mockup direction**  
   - Target: `src/app/pages/PublicHomePage.tsx`  
   - Update hero/sections/CTA/card rhythm only; keep routes and semantics unchanged.  
   - **Verification:** `npm run test:run`.

7. **GREEN: align login page + form presentation**  
   - Targets:  
     - `src/app/pages/LoginPage.tsx`  
     - `src/features/auth/components/LoginForm.tsx`  
   - Preserve auth flow, validation behavior, and alert semantics; style-only updates.  
   - **Verification:** `npm run test:run`.

8. **TRIANGULATE/REFACTOR for PR 2**  
   - Consolidate repeated classes into existing primitives where it reduces churn and stays domain-neutral.  
   - **Verification:** `npm run test:run && npm run lint && npm run build`.

### PR 3 — App shell, sidebar, and topbar visual alignment

9. **RED: preserve shell interaction contracts before shell restyle**  
   - Targets: `src/app/shell/__tests__/SidebarNav.test.tsx` and any shell/topbar tests that assert menu/drawer interactions.  
   - Assert drawer toggle/backdrop close/link close/scroll wrapper and accessible controls remain intact.  
   - **Verification:** `npm run test:run` (fail first if required assertions change).

10. **GREEN: apply shell visual updates without logic changes**  
    - Targets:  
      - `src/app/shell/AppShell.tsx`  
      - `src/app/shell/SidebarNav.tsx`  
      - `src/app/shell/TopBar.tsx`  
    - Align spacing, surfaces, active/hover/focus visuals, and responsive drawer styling only.  
    - **Verification:** `npm run test:run`.

11. **TRIANGULATE/REFACTOR for PR 3**  
    - Ensure token reuse across shell/public/auth surfaces; remove one-off colors where possible.  
    - **Verification:** `npm run test:run && npm run lint && npm run build`.

## Repair Pass — approved single-PR size exception

The first apply passed technical verification but failed visual review because login and landing did not match prototype composition closely enough. The user approved a repair pass in the same change and a single PR with a size exception.

12. **Repair login composition**  
    - Target: `src/app/pages/LoginPage.tsx`, `src/features/auth/components/LoginForm.tsx`, related tests.  
    - Replace the centered-only login with a prototype-aligned two-column desktop composition: left product story/modules/overview, right real login card.  
    - Keep colors token/theme-driven; login must work in light and dark mode.  
    - Preserve auth behavior, validation, demo account modal, redirects, labels, and alerts.  
    - **Verification:** targeted tests for accessible layout/form contracts, then `npm run test:run`.

13. **Repair landing composition**  
    - Target: `src/app/pages/PublicHomePage.tsx`, related i18n/tests as needed.  
    - Replace the old landing card/status-section layout with a prototype-aligned header, two-column hero, dashboard-preview-style UI mockup, and module cards below.  
    - Remove the foundation/project-status card entirely.  
    - Preserve CTA routes: `/login` and `/app/dashboard`.  
    - **Verification:** targeted tests for landmarks, links, header/nav, module list, and no fake functional controls.

14. **Final acceptance gate**  
    - Confirm no backend/auth-routing/business-rule changes were introduced.  
    - Record final changed-line count and size-exception rationale in `apply-progress.md`.  
    - Re-run required gates from config.  
    - **Verification:** `npm run test:run && npm run lint && npm run build`.
