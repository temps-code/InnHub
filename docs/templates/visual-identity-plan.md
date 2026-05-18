# InnHub Visual Identity Plan

This file defines the approved visual direction for InnHub documentation, README assets, and AI-generated images.

## Core Direction

InnHub should use a clean violet-based product identity aligned with Diego's personal portfolio and OptiFlow visual system: minimal, polished, technical, and calm.

Hospitality should appear through product context, workflows, and UI mockups — not through generic hotel-themed colors or luxury imagery.

## Brand Positioning

InnHub is a professional accommodation management system for hotels, hostels, residences, inns, and similar room-based businesses.

The identity should communicate:

- operational clarity;
- clean software/product design;
- trust and reliability;
- calm modern SaaS polish;
- broad accommodation use, not only hotels;
- continuity with Diego's existing portfolio/OptiFlow visual language.

InnHub should not feel like:

- a travel booking app;
- a luxury hotel landing page;
- a generic blue/green SaaS template;
- an old corporate ERP;
- an aggressive or overly decorative brand.

## Suggested Taglines

Primary option:

> Accommodation management for hotels, hostels, residences, and modern hospitality teams.

Short option:

> One hub for modern accommodation operations.

Spanish counterpart:

> Gestión integral para hoteles, hostales, residenciales y equipos de alojamiento modernos.

## Tone

| Context              | Tone                                              |
| -------------------- | ------------------------------------------------- |
| Root README          | Polished, concise, product-oriented               |
| Technical docs       | Clear, structured, decision-focused               |
| Spanish docs         | Natural Spanish, not literal machine translation  |
| Academic explanation | Formal enough for evaluation, but still practical |
| Visual assets        | Clean, calm, technical, not stock-photo driven    |

## Color System

Use a variant of the OptiFlow / portfolio visual system.

### Brand Colors

| Role                  | Color             | Hex                   | Usage                                   |
| --------------------- | ----------------- | --------------------- | --------------------------------------- |
| Dark background       | Near black        | `#0e0e0e`             | Dark hero sections, dark UI mockups     |
| Dark elevated surface | Charcoal          | `#141414`             | Cards, panels, navigation               |
| Light surface         | Soft violet white | `#f8f7ff`             | Light backgrounds and README graphics   |
| Light container       | Pale violet       | `#ede9ff`             | Secondary surfaces                      |
| Primary accent        | Violet            | `#7c3aed`             | CTAs, highlights, badges, active states |
| Accent gradient       | Bright violet     | `#8a4cfc`             | Gradients, glows, hero emphasis         |
| Soft outline          | Lavender          | `#c4b5fd`             | Borders, pills, low-emphasis accents    |
| Dark text             | Deep ink          | `#1a1a2e`             | Text on light surfaces                  |
| Light text            | Warm light gray   | `#e5e2e1`             | Text on dark surfaces                   |
| Muted text            | Neutral gray      | `#888888` / `#6b6b80` | Secondary copy                          |

### Functional Product Colors

These should support the accommodation-management UI, not replace the brand identity.

| State                  | Color   | Hex       | Example                                        |
| ---------------------- | ------- | --------- | ---------------------------------------------- |
| Available / success    | Emerald | `#10b981` | Available room, paid invoice, confirmed action |
| Occupied / active      | Violet  | `#7c3aed` | Active stay, selected reservation              |
| Cleaning / operational | Teal    | `#14b8a6` | Cleaning task, room turnover                   |
| Maintenance / warning  | Amber   | `#f59e0b` | Maintenance request, pending issue             |
| Error / urgent         | Red     | `#ef4444` | Cancelled booking, failed action               |

## Typography Direction

Preferred families, aligned with the user's existing projects:

| Use             | Preferred Fonts           |
| --------------- | ------------------------- |
| Headlines       | Epilogue or Space Grotesk |
| Body text       | Manrope or DM Sans        |
| Code / diagrams | System monospace          |

Headlines should feel modern and confident. Body text should stay readable and calm.

## Visual Style

Use a product-first style:

- soft violet gradients;
- calm glow effects;
- dark/light compatibility;
- rounded cards;
- subtle borders;
- clean dashboard mockups;
- operational UI states;
- structured layouts with generous spacing;
- optional grid or dotted background patterns.

Avoid:

- luxury-only hotel imagery;
- generic reception/lobby stock photos;
- travel booking aesthetics;
- cartoon mascots;
- excessive gradients or neon effects;
- images that imply the product is only for large hotels;
- Spanish text embedded in images, because README primary language is English.

## UI Mood

InnHub visuals should look like a real software product case study.

Preferred UI elements:

- dashboard cards;
- reservation calendar/list;
- room status board;
- occupancy metrics;
- guest profile panel;
- billing summary;
- housekeeping and maintenance task states;
- architecture/workflow diagrams.

Example UI direction:

```txt
Dark or soft-violet background
White or charcoal cards
Violet primary actions
Lavender borders
Functional status chips:
  Available    → emerald
  Occupied     → violet
  Cleaning     → teal
  Maintenance  → amber
  Urgent/error → red
```

## Badge Style

Use `for-the-badge` shields for the root README.

Suggested badges:

- React
- TypeScript
- Tailwind CSS
- Vite
- InsForge
- PostgreSQL
- Vercel
- Status: Planning / In Progress
- Academic MVP

Badge colors should follow the tech brand colors where useful, but custom project/status badges can use the violet identity.

## Documentation Visual Rules

- Every major doc starts with a title, short summary, language switch, and separator.
- Prefer tables for decisions and scope.
- Prefer ASCII diagrams for workflows and architecture when they are easier to maintain than images.
- Use generated images only where they improve first impression or comprehension.
- Keep diagrams clean and readable in both GitHub light and dark modes.

## Logo Assets

Approved generated logo assets are organized under `docs/assets/brand/`.

| Asset                | Path                                                                                  | Usage                         |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------- |
| Main horizontal logo | `docs/assets/brand/innhub-logo-horizontal-light.png`                                  | README hero / light sections  |
| Dark horizontal logo | `docs/assets/brand/innhub-logo-horizontal-dark.png`                                   | Dark sections                 |
| Icon mark            | `docs/assets/brand/innhub-icon-light.png`                                             | Documentation, app previews   |
| App icon             | `docs/assets/brand/innhub-app-icon.png`                                               | App-style presentation        |
| Favicons             | `docs/assets/brand/favicon-16.png`, `favicon-32.png`, `favicon-64.png`, `favicon.ico` | Browser/repository icon usage |

Generated transparency/monochrome attempts are kept in `docs/assets/brand/generated-attempts/`, but they are not production-ready because the checkerboard background is baked into the PNG.

## Generated Image Set

These assets were generated and are available under `docs/assets/`.

Current first batch:

| Image                     | Target Path                             | Usage                          |
| ------------------------- | --------------------------------------- | ------------------------------ |
| Hero product mockup       | `docs/assets/innhub-hero.png`           | Root README Preview            |
| Dashboard mockup          | `docs/assets/dashboard-preview.png`     | Root README Preview / features |
| Room status board         | `docs/assets/room-status-board.png`     | Feature section                |
| Business workflow diagram | `docs/assets/business-workflow.png`     | What It Does / workflow        |
| Architecture diagram      | `docs/assets/architecture-overview.png` | Architecture docs              |

## Image Prompt Direction

AI-generated images should reference this identity:

- modern SaaS dashboard;
- violet accent system;
- soft dark/light surfaces;
- clean cards and tables;
- accommodation operations context;
- no brand text unless explicitly needed;
- no hotel stock photography as the main subject.

## Next Step

Use the generated assets in the root README and documentation rewrite. Generate additional images only if a specific document needs a diagram that cannot be explained clearly with tables or text.
