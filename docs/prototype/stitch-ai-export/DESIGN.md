---
name: InnHub Management System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#484456'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#797488'
  outline-variant: '#c9c3d9'
  surface-tint: '#6135ef'
  primary: '#4a05da'
  on-primary: '#ffffff'
  primary-container: '#6338f1'
  on-primary-container: '#e0d7ff'
  inverse-primary: '#cabeff'
  secondary: '#006c44'
  on-secondary: '#ffffff'
  secondary-container: '#6ffcb5'
  on-secondary-container: '#007349'
  tertiary: '#6c3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8e5200'
  on-tertiary-container: '#ffd4ad'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4800d6'
  secondary-fixed: '#6ffcb5'
  secondary-fixed-dim: '#4fdf9b'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005232'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#ffb870'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
  stat-value:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system for this internal accommodation SaaS is built upon a **Corporate / Modern** aesthetic, prioritizing operational clarity and administrative efficiency. The brand personality is professional, systematic, and calm, designed to reduce cognitive load for staff managing high-density data.

The visual language avoids "vacation" or "lifestyle" imagery in favor of a utilitarian, data-driven interface. Key stylistic markers include:
- **Cleanliness:** Ample white space and high-contrast typography to ensure readability in fast-paced operational environments.
- **Precision:** A strict adherence to grid systems and consistent component logic.
- **Subtle Depth:** The use of soft shadows and tonal layering to differentiate interactive elements from static content.
- **State-Driven:** Color is used primarily as a functional tool to communicate status (Available, Occupied, etc.) rather than for mere decoration.

## Colors

The palette is anchored by a vibrant **Violet** primary color, used for core branding, active navigation states, and the "Occupied" room status. The color system is heavily functional, with specific semantic meanings assigned to each hue:

- **Primary (Violet):** Core interactions, brand elements, and Occupied status.
- **Success (Green):** Available status and positive confirmations.
- **Warning (Orange):** Maintenance requirements and pending actions.
- **Info (Blue):** Cleaning status and general informative badges.
- **Danger (Red):** Urgent alerts or critical maintenance issues.

Backgrounds utilize a tiered light-mode approach. The main canvas is a very light grey-blue to provide a soft contrast against pure white cards, while the sidebar utilizes a slightly deeper neutral to anchor the navigation.

## Typography

This design system uses a dual-sans-serif approach to balance character with utility. 

**Hanken Grotesk** is used for headlines and dashboard metrics. Its contemporary, sharp geometry provides a modern SaaS feel that looks authoritative yet fresh. 

**Inter** is the workhorse for all body text, tables, and labels. It is chosen for its exceptional legibility at small sizes, which is critical for the data-dense lists and schedules found in accommodation management.

For dashboard screens, "stat-value" should be used for primary KPIs to ensure they are the first things a user sees. All labels for status badges should use "label-md" with a slight letter spacing for improved scannability.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area utilizes a 12-column fluid grid. 

- **Grid:** 12-column layout with 20px gutters. 
- **Margins:** 32px standard padding for dashboard containers to allow the UI to "breathe."
- **Mobile Adaption:** On mobile devices, the 12-column grid collapses to a single column. The sidebar transforms into a bottom navigation bar or a hidden drawer menu.
- **Rhythm:** An 8px linear scale is used for all internal component spacing (padding/margins), ensuring a mathematical harmony across the interface.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

1.  **Level 0 (Canvas):** The base background layer (#F8FAFC).
2.  **Level 1 (Cards/Surface):** Pure white surfaces (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)). This is used for all dashboard modules and room tiles.
3.  **Level 2 (Active/Hover):** When a card or element is interacted with, the shadow deepens (0px 8px 30px rgba(99, 56, 241, 0.1)) to provide tactile feedback.
4.  **Level 3 (Overlays):** Modals and dropdowns use a crisp border (1px solid #E2E8F0) combined with a high-depth shadow to separate them from the work surface.

Navigation elements use flat, low-contrast outlines rather than shadows to keep the interface feeling "app-like" and structured.

## Shapes

The design system employs a **Rounded** shape language to soften the industrial nature of the data. 

- **Standard Elements:** Buttons, input fields, and status badges use a 0.5rem (8px) radius.
- **Large Elements:** Dashboard cards and containers use a 1rem (16px) radius to create a distinct, modular appearance.
- **Status Indicators:** Small dots and avatar containers use a full pill/circle shape for immediate recognition.
- **Room Tiles:** Use a 12px radius, striking a balance between the card-level containers and smaller UI controls.

## Components

### Buttons
- **Primary:** Solid Violet with white text. High-contrast, 8px rounded corners.
- **Secondary:** Transparent background with Violet border and text.
- **Ghost:** No border, Violet text, used for less frequent actions like "View All."

### Status Badges
- **Format:** Rounded pills with a light background tint of the status color and a high-contrast label. 
- **Indicator:** Include a small 6px solid circle to the left of the text for extra visual reinforcement.

### Cards (Room Tiles)
- White background, 16px padding, 12px radius.
- Left-side accent border (4px width) colored according to room status (e.g., Green for Available).
- Header contains Room Number (Bold) and Type (Subtle Body).

### Input Fields
- Subtle grey border (1px #E2E8F0).
- On focus: Border changes to Primary Violet with a soft 2px outer glow.
- 8px border radius.

### Tables
- Clean, borderless design. 
- Subtle horizontal dividers only (1px #F1F5F9).
- Zebra striping is avoided to maintain a minimal aesthetic; instead, use high row-height (56px) for legibility.