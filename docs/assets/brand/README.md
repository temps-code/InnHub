# InnHub Brand Assets

This folder contains the organized InnHub logo assets generated for the project documentation, README, favicons, and future application shell.

## Usable Assets

| File                                           | Use                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `innhub-logo-horizontal-transparent-dark.png`  | Main horizontal logo with real transparency; preferred for GitHub dark surfaces |
| `innhub-logo-horizontal-transparent.png`       | Horizontal transparent logo for light or neutral surfaces                       |
| `innhub-icon-transparent.png`                  | Icon-only mark with real transparency                                           |
| `innhub-logo-monochrome-dark-transparent.png`  | Monochrome transparent logo for light backgrounds                               |
| `innhub-logo-monochrome-light-transparent.png` | Monochrome transparent logo for dark backgrounds                                |
| `innhub-logo-horizontal-light.png`             | Horizontal logo with light/background treatment                                 |
| `innhub-logo-horizontal-dark.png`              | Horizontal logo for dark sections/backgrounds                                   |
| `innhub-icon-light.png`                        | Icon-only mark on a light background                                            |
| `innhub-app-icon.png`                          | App-style icon generated from the logo mark                                     |
| `innhub-icon-512.png`                          | 512px resized icon for app/PWA-style use                                        |
| `innhub-icon-192.png`                          | 192px resized icon for app/PWA-style use                                        |
| `favicon-64.png`                               | 64px favicon PNG                                                                |
| `favicon-32.png`                               | 32px favicon PNG                                                                |
| `favicon-16.png`                               | 16px favicon PNG                                                                |
| `favicon.ico`                                  | ICO generated from 16/32/64px PNG variants                                      |

## Generated Attempts

The folder `generated-attempts/` keeps the original generator outputs for traceability.

The latest files placed there do include real PNG transparency (`PaletteAlpha` with alpha channel), so copies were promoted into this folder with production-oriented names:

| Source file                                               | Promoted file                                  |
| --------------------------------------------------------- | ---------------------------------------------- |
| `generated-attempts/innhub-logo-horizontal-light.png`     | `innhub-logo-horizontal-transparent.png`       |
| `generated-attempts/innhub-icon-transparency-attempt.png` | `innhub-icon-transparent.png`                  |
| `generated-attempts/innhub-logo-monochrome-dark.png`      | `innhub-logo-monochrome-dark-transparent.png`  |
| `generated-attempts/innhub-logo-monochrome-light.png`     | `innhub-logo-monochrome-light-transparent.png` |

## Current Limitation

There is still no SVG/vector source yet.

Recommended next step if production-grade brand assets are needed:

1. Recreate/vectorize the mark manually in Figma, Illustrator, Inkscape, or Penpot.
2. Export from the vector source as:
   - SVG horizontal logo;
   - SVG icon-only mark;
   - transparent PNG horizontal logo;
   - transparent PNG icon;
   - favicon set.

Until then, use the transparent PNG assets above for documentation and README surfaces.
