# InnHub Brand Assets

This folder contains InnHub logo assets for project documentation, README surfaces, favicons, and the application shell.

## SVG Assets

| File                              | Use                                            | Status                                 |
| --------------------------------- | ---------------------------------------------- | -------------------------------------- |
| `innhub-app-icon.svg`             | App icon and favicon-style runtime usage       | Preferred for app shell/favicon        |
| `innhub-icon.svg`                 | Gradient icon-only mark                        | Usable                                 |
| `innhub-logo-horizontal.svg`      | Gradient horizontal logo for light backgrounds | Draft: wordmark uses live SVG `<text>` |
| `innhub-logo-horizontal-dark.svg` | Gradient horizontal logo for dark backgrounds  | Draft: wordmark uses live SVG `<text>` |

The horizontal SVG logos are kept as draft assets because their wordmark depends on font rendering (`Inter` or fallbacks). Convert the wordmark to paths before treating them as canonical production logos.

## PNG Assets

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

The folder `generated-attempts/` keeps original generator outputs for traceability.

The latest PNG files placed there include real PNG transparency (`PaletteAlpha` with alpha channel), so copies were promoted into this folder with production-oriented names:

| Source file                                               | Promoted file                                  |
| --------------------------------------------------------- | ---------------------------------------------- |
| `generated-attempts/innhub-logo-horizontal-light.png`     | `innhub-logo-horizontal-transparent.png`       |
| `generated-attempts/innhub-icon-transparency-attempt.png` | `innhub-icon-transparent.png`                  |
| `generated-attempts/innhub-logo-monochrome-dark.png`      | `innhub-logo-monochrome-dark-transparent.png`  |
| `generated-attempts/innhub-logo-monochrome-light.png`     | `innhub-logo-monochrome-light-transparent.png` |

## Runtime Copy Policy

Keep canonical/documentation assets in this folder. Copy only the SVGs required by the running app into `public/` to avoid drift and unused runtime assets.

For the current Tailwind foundation slice, the app uses only `public/innhub-app-icon.svg`; horizontal SVG logos are not copied to runtime and remain documentation/draft assets until the wordmark is converted to paths.
