status: block

blockers:
- Edit flow is not functional enough for PR2 scope. `ReservationsPage` opens edit with `room_type_id: ""`, `room_id: null`, and `guest_count: 1` from list rows (`src/features/reservations/ReservationsPage.tsx:275-287`), but `reservationService.update` validates the full create/update schema requiring `room_type_id` and then writes item fields (`src/features/reservations/reservationService.ts:267-339`). Result: a normal edit submit will fail unless the user manually re-enters missing item data, and may overwrite guest count/room data incorrectly.
- Tests do not catch this: page tests cover render/filter/cancel dialog only, not create/edit submit payloads (`src/features/reservations/__tests__/ReservationsPage.test.tsx:195-276`).

non-blocking notes:
- Scope containment mostly holds for UI: no trash/restore/purge UI found. Service/index already expose `listTrash`, `restore`, `purge`, etc.; acceptable only if PR2 intentionally includes service groundwork before PR3.
- Hook behavior looks solid: default active load, pagination/filter reset, mutation reloads, and stale session request protection are covered (`src/features/reservations/useReservations.ts:79-179`, tests `useReservations.test.ts:106-210`).
- Route wiring is correct: reservations route now renders `ReservationsPage` (`src/app/routes/routes.tsx:13,41-42`).
- EN/ES i18n keys are aligned for the added reservation UI (`en.ts:389-457`, `es.ts:400-468`).
- Icons are accessible/hidden appropriately; icon-only cancel has an aria-label (`ReservationsPage.tsx:301-305`, `ReservationStatusBadge.tsx:75-82`).

recommendation: start PR3? no — fix PR2 edit prefill/update behavior and add submit tests first.

files reviewed:
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/useReservations.ts`
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/types.ts`
- `src/features/reservations/components/ReservationStatusBadge.tsx`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/features/reservations/__tests__/useReservations.test.ts`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `src/app/routes/routes.tsx`
- `src/app/routes/routeMetadata.ts`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

verification:
- Ran focused reservation tests: 3 files passed, 21 tests passed.

Note: I did not write `openspec/changes/issue-14-reservations-management/review-pr2.md` because the task also said “Review only; do not edit files,” and no-edit instructions take precedence.