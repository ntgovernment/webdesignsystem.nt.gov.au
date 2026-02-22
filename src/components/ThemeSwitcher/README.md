# ThemeSwitcher Component

Multi-URL theme switcher with tab navigation supporting up to 3 themes with iframe previews. Works as both a vanilla JS component (embedded in the main bundle) and a DXP edge component.

## Overview

The ThemeSwitcher component lets users switch between theme variations using a tab-based interface. Each theme displays content in an iframe; all iframes load upfront for instant, flicker-free switching.

## File Structure

```
src/components/ThemeSwitcher/
├── ThemeSwitcher.vanilla.ts   — Client-side hydration class + auto-mount
├── ThemeSwitcher.css          — Styles with design tokens
├── index.ts                   — TypeScript exports
└── dxp/
    ├── manifest.json          — DXP schema + metadata
    ├── main.js                — Server-side renderer (minimal hydration container)
    └── preview.html           — DXP dev-ui preview wrapper
```

## Features

- 1–3 theme support (each with `name` and `url` properties)
- Tab navigation for switching themes (hidden when only 1 theme)
- Instant switching — all iframes preloaded on first render
- Responsive: tabs scroll horizontally on mobile
- Hydration pattern: DXP server renders a minimal container; client JS hydrates with full UI
- No framework dependencies (vanilla JS + CSS)

## Props

| Prop           | Type          | Required | Default     | Description                                   |
| -------------- | ------------- | -------- | ----------- | --------------------------------------------- |
| `themes`       | `ThemeItem[]` | **Yes**  | -           | 1–3 theme objects each with `name` and `url`  |
| `height`       | `string`      | No       | `"600px"`   | CSS height of the iframe container            |
| `defaultTheme` | `string`      | No       | First theme | `name` of the theme to display initially      |
| `cssClass`     | `string`      | No       | `""`        | Additional CSS classes for the root container |

### `ThemeItem` interface

```ts
interface ThemeItem {
  name: string; // Tab label
  url: string; // URL loaded in the iframe
}
```

## Usage (vanilla JS hydration)

The component auto-mounts on all `[data-hydration-component="theme-switcher"]` elements on `DOMContentLoaded`. Pass props as JSON in `data-hydration-props`:

```html
<div
  data-hydration-component="theme-switcher"
  data-hydration-props='{
    "themes": [
      { "name": "Light", "url": "https://example.com/light" },
      { "name": "Dark",  "url": "https://example.com/dark"  }
    ],
    "height": "500px"
  }'
></div>
```

## Usage (DXP Component Service)

The DXP server renderer (`dxp/main.js`) returns a minimal hydration container. The client-side code in the bundle performs the actual rendering.

```js
// Example DXP input
{
  "themes": [
    { "name": "NTG Theme", "url": "https://design.nt.gov.au/" }
  ],
  "height": "600px"
}
```

### Deploying to DXP

```bash
dxp-next auth login --tenant ntgov-4670
dxp-next cmp deploy src/components/ThemeSwitcher/dxp
dxp-next cmp dev-ui src/components/ThemeSwitcher/dxp   # Local preview
```

## CSS Classes

| Class                             | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `.nt-theme-switcher`              | Root container (flex column)                          |
| `.nt-theme-switcher__tabs`        | Tab bar; scrollable on mobile                         |
| `.nt-theme-switcher__tab`         | Individual `<button>` tab                             |
| `.nt-theme-switcher__tab--active` | Active tab state (underline + color change)           |
| `.nt-theme-switcher__content`     | Iframe container; bordered                            |
| `.nt-theme-switcher__iframe`      | The `<iframe>` element                                |
| `.nt-theme-switcher-error`        | Error state container (renders on validation failure) |

## Design Tokens

| Token                      | Usage                                   | Fallback   |
| -------------------------- | --------------------------------------- | ---------- |
| `--clr-bg-shade`           | Tab bar and scrollbar track background  | `#f5f5f7`  |
| `--clr-bg-default`         | Active tab and content background       | `white`    |
| `--clr-border-subtle`      | Tab bar bottom border, content border   | `#d3d3d7`  |
| `--clr-text-muted`         | Inactive tab text                       | `#666774`  |
| `--clr-link-default`       | Active tab text and underline           | `#1f1f5f`  |
| `--clr-link-hover`         | Hovered active tab text/underline       | `#c33826`  |
| `--clr-status-danger`      | Error state border and text             | `#a60f37`  |
| `--clr-status-danger-bg`   | Error state background                  | `#f7e7eb`  |
| `--sp-sm`                  | Tab padding (vertical)                  | `12px`     |
| `--sp-md`                  | Mobile tab padding (horizontal)         | `16px`     |
| `--sp-xl`                  | Tab padding (horizontal, desktop)       | `24px`     |
| `--sp-xxl`                 | Root bottom margin                      | `32px`     |
| `--border-width-md`        | Content area border width               | `1px`      |
| `--border-width-lg`        | Tab bar border, active underline, focus | `2px`      |
| `--radii-sm`               | Error state border-radius               | `4px`      |
| `--ntg-neutral-03`         | Mobile scrollbar thumb                  | `#d3d3d7`  |
| `--type-body-default-size` | Tab font size                           | `1rem`     |
| `--type-body-sm-size`      | Tab font size on mobile                 | `0.875rem` |

## Accessibility

- Tabs use `role="tab"` with `aria-selected` managed by JS
- Tab bar has `role="tablist"`
- Each iframe has a `title` attribute matching the theme name
- Focus ring on tabs: `outline: 2px solid var(--clr-link-default)`
- Reduced motion: tab transitions disabled under `prefers-reduced-motion: reduce`

## Error Handling

The component renders a visible error state (`.nt-theme-switcher-error`) for:

- `themes` array missing or empty
- More than 3 themes provided
- Any theme object missing `name` or `url`
- Malformed JSON in `data-hydration-props`

## Debug Logging

Enable verbose console output by setting a localStorage flag before page load:

```js
localStorage.setItem("DEBUG_NTG_COMPONENTS", "true");
// Reload the page — logs appear under the [ThemeSwitcher] prefix
```

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
