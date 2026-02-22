# Header Component

NT Government site header with logo, site title, and an action button (typically a search or menu icon). Vanilla JS only — part of the main bundle, no DXP edge component.

## Overview

- Renders the NTG primary reverse logo, a site title, and a single icon button
- Auto-initializes from a `#nt-header-root` element on `DOMContentLoaded`
- Fully configurable via `data-*` attributes or JavaScript constructor options
- Exposed as `window.NTGHeader` for non-module contexts

## File Structure

```
src/components/Header/
├── Header.vanilla.ts   — Component class + auto-mount logic
├── Header.css          — Styles with design tokens
├── index.ts            — TypeScript exports
└── README.md           — This file
```

## Usage

Add a container element with the ID `nt-header-root`. The component auto-initializes on `DOMContentLoaded` by reading configuration from data attributes.

```html
<div
  id="nt-header-root"
  data-title="NT Design System"
  data-logo-src="%globals_asset_url:ASSET_ID:deploy/assets/ntg-primary-reverse.svg%"
  data-logo-alt="NT Government Logo"
  data-icon="fa-magnifying-glass"
></div>
```

The bundle initializes it automatically — no additional script call required beyond loading `web-design-system.min.js`.

## Data Attributes

| Attribute       | Default                                                           | Description                                    |
| --------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| `data-title`    | `"Web Design System"`                                             | Site title displayed next to the logo.         |
| `data-logo-src` | `https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg` | Logo `<img>` `src`.                            |
| `data-logo-alt` | `"NT Government Logo"`                                            | Logo `<img>` `alt` text.                       |
| `data-icon`     | `"fa-magnifying-glass"`                                           | Font Awesome icon class for the action button. |

## JavaScript API

The component is also available as a class for programmatic use:

```ts
import { HeaderComponent } from "./Header";

const header = new HeaderComponent(containerEl, {
  title: "My Site",
  logoSrc: "/logo.svg",
  logoAlt: "My Logo",
  icon: "fa-bell",
  onMenuClick: () => console.log("menu clicked"),
});

// Update config at runtime
header.updateConfig({ title: "Updated Title" });

// Remove component and clear container
header.destroy();
```

### `HeaderConfig` interface

```ts
interface HeaderConfig {
  title?: string;     // Site title (default: "Web Design System")
  logoSrc?: string;   // Logo image URL
  logoAlt?: string;   // Logo alt text
  icon?: string;      // Font Awesome icon class, e.g. "fa-magnifying-glass"
  onMenuClick?: () => void;  // Callback fired when the action button is clicked
}
```

`window.NTGHeader` is also exposed as a global for use in non-module contexts.

## CSS Classes

| Class                      | Element              | Notes                                   |
| -------------------------- | -------------------- | --------------------------------------- |
| `.nt-header`               | Root `<div>`         | Full-width flex container               |
| `.nt-header__inner`        | Inner wrapper        | Space-between layout for left/right     |
| `.nt-header__left`         | Left section         | Logo + title group                      |
| `.nt-header__logo-section` | Logo + title wrapper | Flex row, `var(--sp-xs)` gap            |
| `.nt-header__logo`         | `<img>`              | 28px height, auto width                 |
| `.nt-header__title`        | Site title `<div>`   | H5-sized, bold, inverse text color      |
| `.nt-header__right`        | Right section        | Holds action buttons                    |
| `.nt-header__actions`      | Actions container    | Vertical flex, `var(--sp-md)` left pad  |
| `.nt-header__menu-button`  | `<button>`           | Transparent, no border; fires `onMenuClick` |
| `.nt-header__icon-container` | Icon wrapper `<div>` | 24×24px, centers the `<i>` icon        |

## Design Tokens

| Token                  | Usage                        | Fallback         |
| ---------------------- | ---------------------------- | ---------------- |
| `--clr-bg-header`      | Header background color      | `#1f1f5f`        |
| `--clr-text-inverse`   | Title and icon color         | `white`          |
| `--sp-md`              | Header padding               | `16px`           |
| `--sp-xs`              | Logo-to-title gap            | `8px`            |
| `--sp-xl`              | Right section gap            | `24px`           |
| `--sp-sm`              | Action group gap             | `12px`           |
| `--shadow-md`          | Drop shadow below header     | —                |
| `--type-heading-h5-size`   | Title font size          | `1.125rem`       |
| `--type-heading-h5-weight` | Title font weight        | `700`            |
| `--type-heading-h5-lh`     | Title line height        | `1.25rem`        |
| `--font-family-primary`    | Title font family        | `"Lato", sans-serif` |

## Rendered HTML Structure

```html
<div id="nt-header-root">
  <div class="nt-header">
    <div class="nt-header__inner">
      <div class="nt-header__left">
        <div class="nt-header__logo-section">
          <img src="..." alt="..." class="nt-header__logo" />
          <div class="nt-header__title">Site Title</div>
        </div>
      </div>
      <div class="nt-header__right">
        <div class="nt-header__actions">
          <button class="nt-header__menu-button" aria-label="Menu">
            <div class="nt-header__icon-container">
              <i class="fa-light fa-magnifying-glass"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Accessibility

- The action button is a native `<button>` with `aria-label="Menu"` — keyboard-focusable by default
- Logo `<img>` always has an `alt` attribute (defaults to `"NT Government Logo"`)
- Icon `<i>` inside the button is presentational; the button's `aria-label` provides the accessible name
- Font Awesome icons require the kit to be loaded (see `deploy/nesters/head.html`)

## Notes

- The action button (`nt-header__menu-button`) fires `onMenuClick` if provided; otherwise it has no default behavior
- Icon requires Font Awesome Light (`fa-light`) — ensure the Font Awesome kit is loaded in the page head
- The component is **vanilla JS only** — there is no DXP edge component for Header; it is deployed as part of `web-design-system.min.js`
- `onMenuClick` is only settable via the JavaScript constructor (not via data attributes); wire it up in a nester or inline script if needed
