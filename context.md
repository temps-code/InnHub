# Code Context

## Files Retrieved

1. `README.md` (lines 1-160) - primary English landing page; richer source for parity work.
2. `README.es.md` (lines 1-105) - Spanish landing page; currently shorter than English by 55 lines.
3. `docs/README.md` (lines 1-45) - English documentation index.
4. `docs/README.es.md` (lines 1-43) - Spanish documentation index.
5. `docs/01-product-overview.md` (lines 1-66) and `docs/01-product-overview.es.md` (lines 1-66) - product vision pair.
6. `docs/02-mvp-scope.md` (lines 1-75) and `docs/02-mvp-scope.es.md` (lines 1-73) - MVP scope pair.
7. `docs/03-domain-model.md` (lines 1-67) and `docs/03-domain-model.es.md` (lines 1-67) - domain model pair.
8. `docs/04-tech-stack.md` (lines 1-52) and `docs/04-tech-stack.es.md` (lines 1-52) - tech stack pair.
9. `docs/05-architecture.md` (lines 1-67) and `docs/05-architecture.es.md` (lines 1-67) - architecture pair.
10. `docs/06-git-workflow.md` (lines 1-75) and `docs/06-git-workflow.es.md` (lines 1-75) - Git workflow pair.
11. `docs/07-functional-specification.md` (lines 1-83) and `docs/07-functional-specification.es.md` (lines 1-83) - functional specification pair.
12. `docs/assets/*` (file listing only) - available images for candidate visual sections.

## Key Code

### English/Spanish documentation pairs found

- Root: `README.md` ↔ `README.es.md`.
- Docs index: `docs/README.md` ↔ `docs/README.es.md`.
- Numbered docs all have `.es.md` counterparts:
  - `01-product-overview`
  - `02-mvp-scope`
  - `03-domain-model`
  - `04-tech-stack`
  - `05-architecture`
  - `06-git-workflow`
  - `07-functional-specification`

### Main parity gap: root README

`README.es.md` is materially less complete than `README.md`.

Missing or compressed Spanish content:

1. Header status/type badges:
   - English has `Status-Planning` and `Type-Academic_MVP` at `README.md` lines 19-22.
   - Spanish header stops after stack badges at `README.es.md` lines 9-18.
2. Table of Contents:
   - English has full TOC at `README.md` lines 46-55.
   - Spanish has no TOC.
3. Problem framing under “What It Does”:
   - English includes “Before InnHub” and “After InnHub” paragraphs at `README.md` lines 65-67.
   - Spanish `README.es.md` lines 42-45 only has the generic product summary.
4. Key Features detail:
   - English has feature subsections and detailed bullets for Dashboard, Reservations, Rooms, Guests, Housekeeping & Maintenance, Billing & Payments at `README.md` lines 82-120.
   - Spanish compresses this into a 7-item flat list at `README.es.md` lines 61-69.
   - Specific missing Spanish details include operational alerts, selective realtime, cancellation/lifecycle tracking, overlap rule, physical room states, calculated availability vs physical `reserved`, contact/ID data, cleaning after check-out, maintenance blocking availability, completed-stay/service invoices, and no external payment gateway.
5. Architecture section:
   - English includes heading, image, architectural approach, and core rule at `README.md` lines 128-138.
   - Spanish has no architecture section between stack and documentation (`README.es.md` lines 71-85).
6. Documentation table labels remain English in Spanish:
   - `README.es.md` lines 89-95 use “Product Overview”, “MVP Scope”, etc. while linking Spanish files. This may be intentional, but if full localization is desired, translate display labels.

### Docs parity status

The numbered `docs/*.md` files are mostly structurally aligned: headings, tables, related links, and image references match across languages.

Minor content differences worth normalizing:

- `docs/03-domain-model.md` line 22 says `Reservation` is “Date-range booking for one guest and room”; Spanish line 22 only says “Reserva por rango de fechas”. Add “para un huésped y una habitación”.
- `docs/03-domain-model.md` lines 25-26 specify `Invoice` is “for a reservation/stay” and `Payment` is “linked to an invoice”; Spanish lines 25-26 are shorter. Consider matching that specificity.
- `docs/04-tech-stack.md` line 19 says PostgreSQL fits reservations, invoices, rooms, and reports; Spanish line 19 omits reports.
- `docs/05-architecture.md` line 60 includes “layout primitives”; Spanish line 60 omits that detail.
- `docs/07-functional-specification.md` uses `FR-01`...`FR-16`; Spanish uses `RF-01`...`RF-16` at lines 21-37. That is fine for localization, but risky if issue/task references expect stable IDs across languages. Decide whether IDs should be language-neutral.

### Current image usage

Existing image references:

- `README.md` lines 3, 40, 73, 132: logo, hero, business workflow, architecture overview.
- `README.es.md` lines 3, 35, 51: logo, hero, business workflow. Missing architecture overview.
- `docs/01-product-overview.md`/`.es.md` line 37: business workflow.
- `docs/05-architecture.md`/`.es.md` line 19: architecture overview.

Available assets under `docs/assets/` include:

- `architecture-overview.png`
- `business-workflow.png`
- `dashboard-preview.png`
- `innhub-hero.png`
- `room-status-board.png`
- brand logos/icons under `docs/assets/brand/`

Candidate sections for images:

1. `README.es.md` architecture section: reuse `docs/assets/architecture-overview.png` to match `README.md` lines 128-138.
2. Root README feature section: consider `docs/assets/dashboard-preview.png` near Dashboard details and/or `docs/assets/room-status-board.png` near Rooms/Housekeeping.
3. `docs/02-mvp-scope.md` / `.es.md`: add a module/scope map image if one is created; no current specific asset.
4. `docs/03-domain-model.md` / `.es.md`: add an ERD-style domain model diagram if one is created; current ASCII relationship tree is text-only.
5. `docs/06-git-workflow.md` / `.es.md`: add a branch flow diagram if one is created; current flow is text-only.
6. `docs/07-functional-specification.md` / `.es.md`: add an acceptance-flow diagram if one is created; current flow is text-only.

## Architecture

This repository is documentation-first at the current stage. The root README is the public project landing page, while `docs/README*.md` indexes deeper product/technical documentation. Each numbered document has an English source and a Spanish `.es.md` counterpart. Language switch links are consistently present near the top of each pair.

The parity issue is concentrated in the root Spanish README, not the deeper docs. The English root README appears to be the canonical richer version and includes visual/product-marketing sections that the Spanish root README has not caught up with. The numbered docs are close translations with only small precision gaps.

## Start Here

Open `README.md` and `README.es.md` first. Bring `README.es.md` up to parity with the English root README before touching the numbered docs; that gives the highest impact and fixes the largest information gap.

Recommended order:

1. Add missing status/type badges to `README.es.md` header.
2. Add a Spanish TOC mirroring `README.md`.
3. Translate the “Before InnHub / After InnHub” framing.
4. Expand “Funcionalidades clave” into the same subsection structure as English.
5. Add an “Arquitectura” section with `docs/assets/architecture-overview.png` and translated core rule.
6. Then normalize the small precision gaps in `docs/03-domain-model.es.md`, `docs/04-tech-stack.es.md`, and `docs/05-architecture.es.md`.

## Supervisor coordination

No supervisor decision was needed. No Engram memory tool was available in this child session, so findings could not be saved to Engram despite the request.
