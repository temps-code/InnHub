## Exploration: expose-preference-controls

### Current State

**Language (i18n)** — Fully functional infrastructure exists:
- `i18next` + `react-i18next` with `en`/`es` locale bundles (`src/shared/i18n/resources/en.ts`, `es.ts`)
- `locales.ts` exports `SUPPORTED_LOCALES`, `Locale` type, and `isSupportedLocale()` guard
- `storage.ts` provides `getStoredLocale()` / `setStoredLocale()` using `localStorage` key `innhub.locale`, with full error handling for unavailable storage
- `config.ts` initializes i18next with stored locale on boot
- Solid test coverage in `storage.test.ts` (memory storage mock, throwing storage, read/write/fallback)
- All UI strings are already translated in both locales
- **Gap**: No UI control exists to trigger `i18n.changeLanguage()` + `setStoredLocale()`

**Theme** — CSS variables only, no JS layer:
- `index.css` defines light/dark via `data-theme` attribute on `:root`, with Tailwind 4 custom variant `@custom-variant dark`
- 12 CSS custom properties per theme (background, surface, heading, text, muted, primary, primary-soft, border, shadow-panel, color-scheme)
- **Gap**: Zero TypeScript/JavaScript code for theme — no storage key, no reading/writing, no hook, no `prefers-color-scheme` detection, no `data-theme` attribute setter

**Shell layout** — Two distinct surfaces for controls:
- **Authenticated**: `AppShell.tsx` → sidebar (`SidebarNav.tsx`) + `TopBar.tsx`. TopBar has a right-side `div` with profile label + logout button — natural insertion point for preference toggles
- **Public/Login**: `PublicHomePage.tsx` and `LoginPage.tsx` are standalone fullscreen pages with no shared header/toolbar — controls need a different mounting strategy

**Component library** — Atoms/molecules design system:
- `Button` atom (primary/secondary/ghost/danger, sm/md/lg) available for toggle interactions
- `StatusBadge` atom exists as reference for small inline indicators
- `shared/hooks/` directory exists but is empty — first hooks will be created here

**Provider tree**: `AppProviders.tsx` wraps `I18nextProvider` → `AuthSessionProvider`. A `ThemeProvider` could be inserted here, or theme can be managed via a standalone hook.

### Affected Areas

| File | Why affected |
|------|-------------|
| `src/shared/hooks/useTheme.ts` | **New** — Theme state hook: read/write `data-theme`, persist to localStorage, detect `prefers-color-scheme` |
| `src/shared/hooks/useLocale.ts` | **New** — Locale switcher hook: wraps `i18n.changeLanguage()` + `setStoredLocale()` |
| `src/shared/hooks/index.ts` | **New** — Barrel exports for shared hooks |
| `src/shared/components/atoms/ThemeToggle.tsx` | **New** — Icon button toggling light/dark |
| `src/shared/components/atoms/LanguageToggle.tsx` | **New** — Toggle or dropdown for en/es |
| `src/shared/components/molecules/PreferenceBar.tsx` | **New** — Composition of theme + language toggles for reuse across shell and public pages |
| `src/app/shell/TopBar.tsx` | Add `PreferenceBar` next to profile/logout |
| `src/app/pages/LoginPage.tsx` | Add preference controls (top-right corner or inside card) |
| `src/app/pages/PublicHomePage.tsx` | Add preference controls (top area) |
| `src/shared/i18n/resources/en.ts` | Add translation keys for toggle labels/aria |
| `src/shared/i18n/resources/es.ts` | Same for Spanish |
| `src/shared/components/atoms/index.ts` | Export new atoms |
| `src/shared/components/molecules/index.ts` | Export new molecule |
| Tests (new files) | `useTheme.test.ts`, `useLocale.test.ts`, `ThemeToggle.test.tsx`, `LanguageToggle.test.tsx` |

### Approaches

#### 1. **Hook + Atom Composition** — Separate hooks + small toggle atoms, composed in a `PreferenceBar` molecule

Each concern (theme, locale) gets an independent hook under `shared/hooks/`. Each gets a minimal toggle atom. A `PreferenceBar` molecule composes them and is dropped into `TopBar`, `LoginPage`, and `PublicHomePage`.

- **Theme hook**: reads `data-theme` from `<html>`, falls back to `prefers-color-scheme`, persists to `innhub.theme` in localStorage, sets `document.documentElement.dataset.theme`
- **Locale hook**: wraps `useTranslation().i18n.changeLanguage()` + `setStoredLocale()`, exposes current locale and toggle/cycle function
- **PreferenceBar**: simple flex container with both toggles, styled to fit any context

- Pros: Follows existing architecture layers exactly (hooks → atoms → molecules). Each piece is independently testable. Hooks are reusable beyond the toggles. No provider overhead.
- Cons: Public pages need to manually add the `PreferenceBar` in different layout positions.
- Effort: **Low–Medium** (~8–10 new files including tests)

#### 2. **Context Provider Pattern** — `ThemeProvider` wraps the app, provides theme via React context

A `ThemeProvider` in `AppProviders.tsx` manages theme state and exposes it via context. Components consume via `useTheme()` context hook.

- Pros: Single source of truth, provider guarantees initialization order, elegant for many consumers.
- Cons: Overkill — only 2–3 components consume theme. Adds provider nesting. The i18n side already has `useTranslation()` from react-i18next, so a symmetric provider for theme is architecturally inconsistent (one uses context, one uses hook). Theme state is inherently global (DOM attribute) so React context adds no real benefit over a hook reading the DOM.
- Effort: **Medium** (~10–12 files)

#### 3. **Feature Module** — `src/features/preferences/` with its own hooks, components, and services

Full feature module for preferences (theme + locale + future settings).

- Pros: Follows the `features/` pattern used by auth. Scales if preferences grow (notification prefs, date format, etc.).
- Cons: Over-engineered for two toggles. The issue explicitly says "Not creating a full user settings module." Shared components shouldn't import from features (layer violation for TopBar/public pages). The toggles are cross-cutting UI concerns, not a domain feature.
- Effort: **Medium–High** (~12–15 files)

### Recommendation

**Approach 1: Hook + Atom Composition**

This is the right fit because:

1. **Architecture alignment**: `shared/hooks/` exists but is empty — this is exactly the right first use. The atoms/molecules design system (Button, StatusBadge, ModuleCard) already establishes the pattern.
2. **Minimal surface area**: Two hooks + two atoms + one molecule + tests. No providers, no feature module overhead.
3. **Reuse without coupling**: Both hooks are pure utility — `useTheme()` manages DOM attribute + localStorage, `useLocale()` wraps existing i18n APIs. The `PreferenceBar` molecule is a simple layout container dropped into 3 locations.
4. **Test strategy mirrors existing**: `storage.test.ts` uses injectable `memoryStorage()` mocks — the theme storage layer should follow the exact same pattern. Hook tests use `renderHook` from `@testing-library/react`. Toggle tests render the atoms and assert DOM changes.
5. **Non-goal compliance**: No new frameworks, no i18n resource rewrite, no settings module, no auth dependency.

**Theme storage key**: `innhub.theme` (mirrors `innhub.locale` convention).

**Theme values**: `"light" | "dark"` — matches existing `data-theme` CSS selectors.

**Initial theme resolution order**: localStorage → `prefers-color-scheme` → `"light"` default.

**Public page placement**: A lightweight fixed or absolute-positioned `PreferenceBar` in the top-right corner of `LoginPage` and `PublicHomePage`, outside the main content card. This avoids layout disruption while keeping controls always reachable.

### Risks

- **FOUC (Flash of Unstyled Content)**: If theme is applied only after React hydrates, users may see a light flash before dark theme activates. Mitigation: add a tiny inline `<script>` in `index.html` that reads localStorage and sets `data-theme` before the app renders, OR accept the minor flash for MVP simplicity.
- **`prefers-color-scheme` listener**: The system theme can change while the app is open. Deciding whether to react to OS changes or only to explicit user toggles needs a clear policy. Recommendation for MVP: only respond to OS theme on initial load when no stored preference exists; after user manually toggles, ignore OS changes.
- **i18n key shape enforcement**: The `WidenStrings` type in `resources/index.ts` ensures `es.ts` must structurally match `en.ts`. New keys added to `en.ts` must also be added to `es.ts` or the build will fail (desired behavior — enforces bilingual parity).
- **Accessibility**: Toggle buttons need `aria-label` or `aria-pressed` attributes and visible text or icons that convey meaning without color alone.

### Ready for Proposal

Yes
