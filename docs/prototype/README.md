# InnHub Visual Prototype

This directory stores the external visual prototype generated with Google Stitch AI.

The prototype is a **visual reference only**. It should guide layout, screen composition, status presentation, and UI direction, but it must not be ported directly into the React application.

📄 Read this in: **English** | [Español](README.es.md)

---

## Source

- Tool: Google Stitch AI
- Purpose: Explore InnHub's internal SaaS product UI before backend and feature implementation
- Reference identity: violet-based InnHub product identity from `docs/templates/visual-identity-plan.md`

## Contents

| Path                            | Purpose                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `stitch-ai-export/DESIGN.md`    | Stitch-generated design notes and tokens                                          |
| `stitch-ai-export/*/screen.png` | Screen mockups exported from Stitch                                               |
| `stitch-ai-export/*/code.html`  | Static HTML exports kept only for visual inspection                               |
| `evaluation.md`                 | Project evaluation: what to keep, what to reject, and implementation implications |
| `evaluation.es.md`              | Spanish version of the evaluation                                                 |

## Screens Included

- Dashboard overview
- Room status board
- Reservations management
- Guest directory
- Operations and maintenance
- Billing and invoices

## Usage Rules

- Use screenshots and `DESIGN.md` as reference material.
- Rebuild UI in React + TypeScript + Tailwind CSS.
- Keep shared UI generic and presentation-only.
- Do not copy the exported HTML into `src/`.
- Do not use CDN Tailwind, inline scripts, or Chart.js from the export.
- Prefer existing project dependencies such as Recharts for charts.
- Preserve InnHub business rules, especially physical room states: `available`, `occupied`, `cleaning`, `maintenance`, `inactive`.
