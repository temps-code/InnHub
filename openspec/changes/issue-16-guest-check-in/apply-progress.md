# Apply Progress — `issue-16-guest-check-in`

## Status

- PR boundary: **PR 1 only** — core check-in service boundary (T1–T4)
- Strict TDD: **active**
- Apply status: **completed for PR 1 slice after review-fix pass**
- PR 2 tasks remain intentionally deferred

## Completed tasks

- [x] T1 (RED) add failing `checkInService` tests for the single-item success path and core rejection cases
- [x] T2 (GREEN) add check-in command/result/stay typings and feature exports
- [x] T3 (GREEN) implement `checkInReservationItem(session, command, deps?)`
- [x] T4 (REFACTOR) extract small pure validation helpers inside `checkInService.ts`
- [x] Review fix: reject existing stays in PR 1 instead of rewriting stay lifecycle state
- [x] Review fix: validate `actualCheckInAt` before date-window comparisons or mutations
- [x] Review fix: add focused cross-property parent reservation and room no-mutation coverage
- [x] V1 capture RED evidence before production code
- [x] V2 rerun tests after GREEN/REFACTOR
- [x] V3 run lint for the slice
- [x] V4 run build for the slice
- [ ] V5 keep slice within 400-line review budget
- [x] V6 parent/user approval received before apply

## Files changed

### Production
- `src/features/reservations/checkInService.ts`
- `src/features/reservations/index.ts`
- `src/features/reservations/types.ts`

### Tests
- `src/features/reservations/__tests__/checkInService.test.ts`

### SDD artifacts
- `openspec/changes/issue-16-guest-check-in/tasks.md`
- `openspec/changes/issue-16-guest-check-in/apply-progress.md`

## TDD Cycle Evidence

| Task | Cycle | Evidence |
| --- | --- | --- |
| T1 | RED | `npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts` failed with `Cannot find module '../checkInService'` before production code existed. |
| T2–T3 | GREEN | Added check-in DTO/result/stay types, feature exports, and `checkInReservationItem`; focused suite then passed: 13 tests green. |
| T4 | REFACTOR | Validation helpers were kept feature-local inside `checkInService.ts`; focused suite re-ran green after helper extraction. |
| Review fix | RED | Added tests for malformed `actualCheckInAt` and existing stay conflict; focused suite failed with 2 expected failures before the fix. |
| Review fix | GREEN | Rejected malformed timestamps before mutation and rejected any existing stay in PR 1; focused suite passed with 17 tests. |

## Commands run

```bash
npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts
npm run test:run
npm run lint
npm run build
```

## Command results

- `npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts`
  - Initial RED: failed because `../checkInService` did not exist yet.
  - Initial GREEN/REFACTOR: passed, **13 tests**.
  - Review-fix RED: failed with expected malformed timestamp and existing-stay conflict failures.
  - Review-fix GREEN: passed, **17 tests**.
- `npm run test:run`
  - passed, **54 files / 639 tests**.
- `npm run lint`
  - passed.
- `npm run build`
  - passed.
  - non-blocking Vite chunk-size warning remains (`dist/assets/index-Bjc9RaAm.js` > 500 kB).

## Behavior implemented in PR 1

- Valid single-item confirmed reservation item can check in.
- Successful check-in creates one active stay when none exists.
- Successful check-in updates reservation item status to `checked_in`.
- Successful check-in updates single-item parent reservation status to `checked_in`.
- Successful check-in updates the assigned room state to `occupied` **last**.
- Service rejects:
  - missing property scope;
  - insufficient role;
  - ineligible reservation status;
  - ineligible reservation item status;
  - malformed actual check-in timestamps before mutating data;
  - check-in before planned check-in date;
  - check-in on/after planned check-out date;
  - missing assigned room;
  - explicit room mismatch;
  - room type mismatch;
  - room states `occupied`, `cleaning`, `maintenance`, `inactive`;
  - cross-property reservation item, parent reservation, and room access via scoped lookups.

## Deviations from design

- PR 1 explicitly guards multi-item/group reservations with `group-check-in-pending-pr2` instead of deriving `partially_checked_in`/`checked_in`. That derivation is intentionally deferred to PR 2 to preserve the approved slice boundary.
- Existing stays are rejected in PR 1 with `conflicting-stay-for-reservation-item` to avoid rewriting checked-out/cancelled/deleted lifecycle state. Full retry-safe reconciliation semantics remain deferred to PR 2.

## Workload / PR boundary

- Tracked diff so far:
  - `src/features/reservations/index.ts` **+9**
  - `src/features/reservations/types.ts` **+32**
- New files:
  - `src/features/reservations/checkInService.ts` **334 lines**
  - `src/features/reservations/__tests__/checkInService.test.ts` **440 lines**
- Approximate code/test slice size: **815 added lines before any PR cleanup**, which is **over** the 400-line review budget.
- Consequence: keep this work isolated as **PR 1 only** and consider a follow-up review-size reduction pass before opening a PR if strict 400-line enforcement is required.

## Remaining tasks (PR 2 only — deferred)

- [ ] T5 RED group-status and retry tests
- [ ] T6 GREEN sibling status derivation and retry-safe stay reconciliation
- [ ] T7 TRIANGULATE availability alignment proof
- [ ] T8 REFACTOR helper/test normalization for PR 2

## Notes

- No UI, route, hook, or i18n work was added in PR 1.
- No checkout, housekeeping, billing, or realtime scope was added.
- No transaction/RPC hardening was introduced.

---

## PR 2 Apply Progress — group arrival derivation and retry-safe reconciliation

## Status update

- PR boundary: **PR 2 only** — group arrival derivation and retry-safe reconciliation (T5–T8)
- Strict TDD: **active**
- Apply status: **completed for PR 2 slice**
- Owner decision: **PR1 size exception explicitly approved** before PR2 apply; chained two-slice strategy remains approved.

## Completed PR 2 tasks

- [x] T5 (RED) added failing group-status and retry-safe reconciliation tests.
- [x] T6 (GREEN) implemented sibling status derivation and retry-safe existing-stay success/conflict handling.
- [x] T7 (TRIANGULATE) proved existing availability semantics remain aligned by running the focused reservation availability suite; no availability code change was required.
- [x] T8 (REFACTOR) normalized helper boundaries with `isRetrySafeExistingCheckIn` and `deriveReservationStatusAfterItemCheckIn`.

## Files changed in PR 2

### Production
- `src/features/reservations/checkInService.ts`

### Tests
- `src/features/reservations/__tests__/checkInService.test.ts`

### SDD artifacts
- `openspec/changes/issue-16-guest-check-in/tasks.md`
- `openspec/changes/issue-16-guest-check-in/apply-progress.md`

## PR 2 TDD Cycle Evidence

| Task | Cycle | Evidence |
| --- | --- | --- |
| T5 | RED | `npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts` failed after adding group/retry tests: 4 failing tests for group partial/full status and retry-safe success; a later retry date-window triangulation test also failed before the fix. |
| T6 | GREEN | Implemented multi-item sibling status derivation, retry-safe existing active stay handling, and shared date-window enforcement for retries; focused suite passed with **22 tests**. |
| T7 | TRIANGULATE | `npm run test:run -- src/features/reservations/__tests__/reservationAvailability.service.test.ts` passed with **7 tests**; existing active-stay/checked-in blocker coverage remains aligned, so no `reservationAvailability.ts` change was needed. |
| T8 | REFACTOR | Extracted `isRetrySafeExistingCheckIn` and `deriveReservationStatusAfterItemCheckIn`; full verification remained green. |

## PR 2 commands run

```bash
npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts
npm run test:run -- src/features/reservations/__tests__/reservationAvailability.service.test.ts
npm run test:run
npm run lint
npm run build
```

## PR 2 command results

- `npm run test:run -- src/features/reservations/__tests__/checkInService.test.ts`
  - RED: failed with **4 expected failing tests** after T5.
  - GREEN/REFACTOR: passed, **22 tests**.
- `npm run test:run -- src/features/reservations/__tests__/reservationAvailability.service.test.ts`
  - passed, **7 tests**.
- `npm run test:run`
  - passed, **54 files / 644 tests**.
- `npm run lint`
  - passed.
- `npm run build`
  - passed.
  - non-blocking Vite chunk-size warning remains (`dist/assets/index-Bjc9RaAm.js` > 500 kB).

## Behavior implemented in PR 2

- First check-in of a multi-item reservation sets the parent reservation to `partially_checked_in` when confirmed siblings remain.
- Final eligible item check-in sets the parent reservation to `checked_in`.
- `cancelled` and `no_show` siblings are ignored for full-arrival derivation.
- Retry-safe completed check-in returns success when the existing active stay, checked-in item, parent reservation, occupied room, property, reservation item, room, and requested date window all match.
- Conflicting existing stay data is rejected with `conflicting-stay-for-reservation-item` and does not insert a duplicate stay.
- Active stays and checked-in reservation blockers remain covered by the existing availability service tests.

## Deviations from design

- No availability service code was changed because existing active-stay and checked-in blocker semantics already satisfied T7.
- No UI, route, hook, i18n, check-out, housekeeping, billing, reports, realtime, transaction/RPC, commit, or PR creation work was added.

## Workload / PR boundary update

- PR1 size exception: **approved by owner** after review because the service/test harness was tightly coupled and splitting further would be artificial.
- PR2 incremental code/test growth is approximately **+400 lines** before SDD artifact updates (`checkInService.ts` grew from 334 to 427 lines; `checkInService.test.ts` grew from 440 to 747 lines).
- Current PR2 boundary remains: **group status derivation + retry-safe reconciliation + availability proof only**.

## Remaining tasks

- No PR2 implementation tasks remain.
- Follow-up outside this apply scope: run fresh verify/review before committing or opening PRs.
- Explicit deferrals remain: UI triggers, checkout, housekeeping, billing, reports, realtime, and transaction/RPC hardening.
