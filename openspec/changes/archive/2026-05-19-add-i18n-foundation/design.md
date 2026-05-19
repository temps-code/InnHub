# Design — add-i18n-foundation

Add a small `i18next` + `react-i18next` foundation that makes the current InnHub app shell render from English and Spanish resources. The change stays infrastructure-focused: provider wiring, resource conventions, locale validation/persistence helpers, and tests only.

## Decision Summary

| Area              | Decision                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Library           | Add runtime dependencies `i18next` and `react-i18next`.                                                                                    |
| Scope             | Translate only current app shell copy and planned module labels visible in `src/app/App.tsx`.                                              |
| Default locale    | `en`.                                                                                                                                      |
| Supported locales | `en`, `es`.                                                                                                                                |
| Persistence       | Store validated locale values in `localStorage` key `innhub.locale`; ignore invalid values.                                                |
| Provider location | Introduce `src/app/providers/AppProviders.tsx` and wrap `<App />` from `src/main.tsx`.                                                     |
| Resource location | Keep translation resources under `src/shared/i18n/resources/`.                                                                             |
| Tests             | Cover locale validation/storage, i18n initialization/fallback, and rendered English/Spanish shell copy.                                    |
| Out of scope      | Settings UI, language switcher UI, backend preference persistence, locale routing, external UI libraries, and broader module translations. |

## Current State

- `src/main.tsx` mounts `<App />` directly inside `StrictMode`.
- `src/app/App.tsx` contains hardcoded shell text and a local `foundationModules` string array.
- `package.json` has React 19, Vitest, Testing Library, and no i18n dependencies.
- `src/index.css` already imports Tailwind CSS and needs no i18n-related changes.
- Architecture docs place cross-cutting shared utilities under `src/shared/` and provider composition under `src/app/providers/`.

## Target File Structure

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
│       └── AppProviders.tsx
├── shared/
│   └── i18n/
│       ├── config.ts
│       ├── locales.ts
│       ├── storage.ts
│       ├── resources/
│       │   ├── en.ts
│       │   ├── es.ts
│       │   └── index.ts
│       └── __tests__/
│           ├── locales.test.ts
│           └── storage.test.ts
└── test/
    └── render.tsx              # optional shared Testing Library helper if needed
```

App rendering tests can live near the app shell:

```text
src/app/__tests__/App.i18n.test.tsx
```

Only create `src/test/render.tsx` if the implementation needs a reusable render helper; otherwise keep test helpers local to the test file.

## Runtime Design

### Provider wiring

`src/app/providers/AppProviders.tsx` is the app-level composition boundary:

```tsx
import { I18nextProvider } from "react-i18next";
import { i18n } from "../../shared/i18n/config";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

`src/main.tsx` should become:

```tsx
<StrictMode>
  <AppProviders>
    <App />
  </AppProviders>
</StrictMode>
```

This preserves the current app shell while giving future providers a stable composition point.

### i18next configuration

`src/shared/i18n/config.ts` initializes i18next exactly once:

- import `i18next` and `initReactI18next`;
- import `resources` from `./resources`;
- import `DEFAULT_LOCALE` and `getStoredLocale`;
- initialize with:
  - `lng: getStoredLocale() ?? DEFAULT_LOCALE`;
  - `fallbackLng: DEFAULT_LOCALE`;
  - `supportedLngs: SUPPORTED_LOCALES`;
  - `resources`;
  - `interpolation.escapeValue: false` because React escapes rendered values;
  - `defaultNS: "app"`;
  - `ns: ["app"]`.

Export the configured instance as `i18n`. Avoid initializing inside React components.

## Locale Contract

`src/shared/i18n/locales.ts` owns locale constants and validation:

```ts
export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}
```

Do not use arbitrary string locale codes in components. Future locales must be added here first, then in `resources/index.ts`.

## Storage Helper Behavior

`src/shared/i18n/storage.ts` owns browser storage access:

```ts
export const LOCALE_STORAGE_KEY = "innhub.locale";

export function getStoredLocale(
  storage: Storage | undefined = globalThis.localStorage,
): Locale | null;
export function setStoredLocale(
  locale: Locale,
  storage: Storage | undefined = globalThis.localStorage,
): void;
```

Required behavior:

- `getStoredLocale` returns a `Locale` only when the stored value passes `isSupportedLocale`.
- Missing, invalid, or unavailable storage returns `null`.
- Storage read errors must be caught and treated as `null`.
- `setStoredLocale` accepts only `Locale`; write errors must be caught and ignored.
- The helper must not call `i18n.changeLanguage` directly. It only persists values.

This keeps persistence testable and avoids coupling storage to the i18next instance.

## Translation Resources

Use one initial namespace, `app`, because the current code has only an app shell. Keep the structure nested by screen area rather than by visual component.

### Resource index shape

`src/shared/i18n/resources/index.ts`:

```ts
import { en } from "./en";
import { es } from "./es";

export const resources = {
  en: { app: en },
  es: { app: es },
} as const;

export type AppTranslationResource = typeof en;
```

`es` must satisfy the English resource shape, for example with TypeScript `satisfies AppTranslationResource`, so missing keys fail during type checking.

### Key naming

Use lower camelCase object keys. Do not encode English prose in keys.

```ts
export const en = {
  hero: {
    eyebrow: "Accommodation management MVP",
    title: "InnHub",
    description:
      "A foundation for managing properties, rooms, guests, reservations, operations, billing, and reporting in one hospitality workspace.",
  },
  foundation: {
    eyebrow: "Foundation status",
    title: "Ready for the first implementation slice",
    description:
      "The default starter has been replaced with an InnHub-specific shell. Reusable UI, routing, and backend integration remain intentionally out of scope for this step.",
  },
  modules: {
    ariaLabel: "Planned InnHub modules",
    items: {
      properties: "Properties",
      rooms: "Rooms",
      guests: "Guests",
      reservations: "Reservations",
      operations: "Operations",
      billing: "Billing",
      reports: "Reports",
    },
  },
} as const;
```

Components should call keys such as:

- `hero.eyebrow`
- `hero.title`
- `hero.description`
- `foundation.eyebrow`
- `foundation.title`
- `foundation.description`
- `modules.ariaLabel`
- `modules.items.properties`

For module lists, define a typed key array in `App.tsx` or a nearby constant:

```ts
const foundationModuleKeys = [
  "properties",
  "rooms",
  "guests",
  "reservations",
  "operations",
  "billing",
  "reports",
] as const;
```

Render with `t(`modules.items.${moduleKey}`)`. Use the stable key (`moduleKey`) as the React `key`, not translated text.

## Component Changes

`src/app/App.tsx` should:

- import `useTranslation` from `react-i18next`;
- call `const { t } = useTranslation();`;
- replace current hardcoded user-facing shell strings with translation lookups;
- keep layout, classes, and accessibility structure unchanged;
- keep the logo `alt=""` and `aria-hidden="true"` unchanged because the image is decorative;
- use translated `aria-label` for the module list.

No new language switcher UI should be added. Tests can switch language through the exported i18n instance or a test-local i18n instance.

## Library Compatibility Check

During apply, install dependencies with npm so `package-lock.json` is updated:

```bash
npm install i18next react-i18next
```

Before implementation is reported complete, verify:

- installed `react-i18next` has a peer dependency compatible with React 19;
- installed `i18next` version is compatible with the selected `react-i18next` version;
- `npm run lint`, `npm run test:run`, and `npm run build` pass.

If npm resolves a peer conflict with React 19, pause apply and request a dependency/version decision instead of forcing install flags.

## Testing Approach

### Unit tests

`src/shared/i18n/__tests__/locales.test.ts`:

- accepts `en` and `es`;
- rejects unknown values such as `pt`, `en-US`, empty string, `null`, and objects;
- confirms `DEFAULT_LOCALE` is supported.

`src/shared/i18n/__tests__/storage.test.ts`:

- returns `null` when no value exists;
- returns stored `en`/`es` when valid;
- returns `null` for invalid stored values;
- does not throw when storage `getItem`/`setItem` fails;
- writes using key `innhub.locale`.

Use a simple in-memory `Storage` test double or a minimal object cast to `Storage` to avoid depending on global state.

### Integration/rendering tests

`src/app/__tests__/App.i18n.test.tsx`:

- renders default English shell copy through the provider;
- switches to Spanish with `i18n.changeLanguage("es")` and renders at least one Spanish hero/foundation string and one module label;
- confirms invalid/missing locale falls back to English at initialization through `getStoredLocale`/config behavior.

Reset i18n language between tests to avoid cross-test leakage. If the global configured instance is awkward to reset, create a test helper that builds an isolated i18next instance using the same resources.

## Tradeoffs

| Option                                        | Decision                 | Rationale                                                                                                                                           |
| --------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `i18next` vs custom dictionary                | Use `i18next`.           | The user explicitly selected the future-ready library path; it supports future interpolation, pluralization, namespaces, and ecosystem conventions. |
| Provider in `main.tsx` only vs `AppProviders` | Add `AppProviders`.      | Slightly more structure now, but aligns with architecture docs and prevents provider clutter as routing/auth/query providers are added.             |
| One namespace vs per-feature namespaces now   | Use one `app` namespace. | Current scope is only the shell; feature namespaces can be introduced when real feature screens exist.                                              |
| Browser language detection package            | Do not add.              | Stored preference plus deterministic English fallback is enough and avoids extra dependency/scope.                                                  |
| Settings/language switcher UI                 | Do not add.              | Issue #26 is foundation-only; UI preference controls can be a later feature.                                                                        |

## Review Workload Forecast

Expected implementation size: about 250–360 changed lines.

| Area                                             |             Estimated changed lines |
| ------------------------------------------------ | ----------------------------------: |
| Dependencies and lockfile                        | 40–120, depending on npm resolution |
| i18n config/locales/storage/resources            |                             110–150 |
| Provider wiring and `App.tsx` string replacement |                               35–60 |
| Tests                                            |                              70–120 |

This should fit the 400 changed-line review budget if implementation avoids optional docs and UI additions. If npm lockfile churn or test helper extraction pushes the forecast above 400 changed lines, pause before apply and ask for a delivery split.

## Rollout and Rollback

Rollout is a single frontend PR on `features`:

1. Add dependencies and lockfile updates.
2. Add shared i18n files and provider.
3. Move current shell strings into resources.
4. Add tests.
5. Run `npm run lint`, `npm run test:run`, and `npm run build`.

Rollback is safe: remove dependencies, provider wiring, shared i18n files, and restore hardcoded shell strings. No backend data or migrations are involved. Existing `localStorage` values under `innhub.locale` can be ignored by older code.

## Acceptance Checklist

- [ ] `i18next` and `react-i18next` are installed without forced peer overrides.
- [ ] `AppProviders` wraps the app at the top-level render boundary.
- [ ] `shared/i18n` centralizes config, resources, locale constants, and storage helpers.
- [ ] Current shell copy and module labels render through translations.
- [ ] English and Spanish resources have matching keys.
- [ ] Invalid stored locale values fall back to English safely.
- [ ] Tests cover validation, persistence, default English rendering, and Spanish rendering.
- [ ] No settings UI, locale routes, backend persistence, or external UI library is added.
- [ ] `npm run lint`, `npm run test:run`, and `npm run build` pass.
