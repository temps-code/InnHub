## Review

status: **block**

blockers:
- `src/shared/components/organisms/StrictConfirmDialog.tsx:35-43` + `src/features/reservations/ReservationsPage.tsx:680-698`: strict confirmation text is only cleared on cancel, not after successful confirm/close. After one successful purge, reopening the purge dialog can leave `PURGE` already typed and the irreversible action enabled without re-confirmation. This weakens the required StrictConfirmDialog purge behavior before PR4/final verification.

non-blocking notes:
- Scope looks contained: no PR4 KPI/side-panel/prototype polish found in reservation changes.
- Trash mode is wired through `showTrash`, `toggleTrash`, and `listTrash`; archived rows are post-filtered before pagination.
- Role gates are mostly correct: manager+ trash/restore/soft delete via UI/service; admin-only purge via UI/service.
- Purge blocker count parsing from `invoiceCount=... paymentCount=...` is fragile but acceptable as a follow-up because service/UI currently share the format and tests cover it.
- Focused reservation tests passed locally: 3 files, 26 tests.

recommendation: start PR4? **no** — fix strict confirmation reset first.

files reviewed:
- `src/features/reservations/ReservationsPage.tsx`
- `src/features/reservations/useReservations.ts`
- `src/features/reservations/reservationService.ts`
- `src/features/reservations/types.ts`
- `src/features/reservations/components/ReservationStatusBadge.tsx`
- `src/features/reservations/__tests__/ReservationsPage.test.tsx`
- `src/features/reservations/__tests__/useReservations.test.ts`
- `src/features/reservations/__tests__/reservationService.test.ts`
- `src/shared/components/organisms/StrictConfirmDialog.tsx`
- `src/shared/i18n/resources/en.ts`
- `src/shared/i18n/resources/es.ts`

Note: I did not write `openspec/changes/issue-14-reservations-management/review-pr3.md` because the task also said “Review only; do not edit files.” Engram tools were not available in this subagent.