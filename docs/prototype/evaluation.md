# Stitch Prototype Evaluation

## Verdict

The Stitch prototype is useful as a visual reference for InnHub. It validates the direction of a clean internal SaaS interface with fixed navigation, operational dashboards, cards, tables, filters, and status badges.

It should not be treated as production code or copied directly into the app.

📄 Read this in: **English** | [Español](evaluation.es.md)

---

## What to Keep

- Fixed sidebar plus topbar application shell.
- Light operational workspace with white cards and subtle violet accents.
- Metric cards for dashboard indicators.
- Room status board using cards with left status accents.
- Status badges with small dot indicators.
- Data-heavy tables for reservations, guests, maintenance, and billing.
- Clear separation between dashboard, rooms, reservations, guests, operations, and billing screens.
- Overall product mood: professional, calm, operational, and non-touristic.

## What to Reject or Adjust

- Do not port the static HTML directly.
- Do not keep CDN Tailwind configuration or inline scripts.
- Do not introduce Chart.js; the project already depends on Recharts.
- Fix status color semantics:
  - `occupied` should use violet/active, not red/error.
  - red should be reserved for urgent/error states.
  - maintenance should use amber/warning.
  - cleaning should use teal/info.
- Treat visual glitches as export artifacts, not design decisions.
- Replace icon-only actions with accessible React controls and labels.
- Avoid relying only on color for status meaning.

## Implementation Implications

The export suggests these reusable UI pieces will likely be needed:

- `AppShell`
- `SidebarNav`
- `TopBar`
- `DataTable`
- `FilterBar`
- `RoomCard`
- enhanced `StatusBadge` with optional dot indicator

Feature screens should be rebuilt inside the existing React architecture instead of importing generated HTML.

## Recommended Next Step

Continue with issue #3 (`chore(foundation): define routing and protected layout structure`) and use this prototype as the visual reference for:

- app shell;
- route organization;
- module placeholder screens;
- first screen structure.

The first concrete visual slice should be the **Room Status Board**, because it exercises room states, cards, filters, badges, and MVP domain rules without requiring backend integration.

## Non-goals for the Prototype Reference

- No backend integration.
- No real authentication/session enforcement.
- No persistence.
- No reservation overlap validation.
- No direct source-code port from Stitch HTML.
