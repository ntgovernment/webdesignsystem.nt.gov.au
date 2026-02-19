# Left Navigation Component

Responsive left navigation used across NTG documentation pages and Squiz Matrix paint layouts.

## Overview

LeftNav provides a two-level, accessible side navigation with a mobile drawer fallback. It supports server-side HTML (nester) usage and a lightweight vanilla JS implementation for client enhancements.

## Recent updates

- Parent items that have children are dual-purpose: the visible link navigates to the parent landing page while a JS-inserted chevron toggles the submenu (implemented by `convertParentLinksWithChildren()`).
- Hover & focus states use `var(--clr-bg-shade)` and `var(--clr-link-default)`.
- Navigation stretches full page height so its right border runs from header to footer.

## What’s included

- `LeftNav.vanilla.ts` — Class-based client initializer (auto-mounts on DOM ready)
- `LeftNav.css` — Component styles using design tokens
- `dxp/` and `public/squiz/` nesters — Squiz-compatible HTML templates

## Features

- 2-level collapsible menu with auto-expansion for the active page
- Mobile drawer with overlay, escape-to-close and body-scroll lock
- Full keyboard support (Enter/Space to toggle, Escape to close drawer)
- ARIA-ready: `aria-expanded`, `aria-controls`, `aria-current`, `aria-hidden`
- Configurable via `data-default-expanded` and CSS custom properties

## Usage — React

```tsx
import { LeftNav, type NavItem } from "@ntgovernment/web-design-system/components/LeftNav";

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/home', icon: 'fa-light fa-home', isActive: true },
  { id: 'foundations', label: 'Foundations', children: [
      { id: 'colour', label: 'Colour', href: '/colour' },
      { id: 'typography', label: 'Typography', href: '/typography' }
    ]
  }
];

<LeftNav items={navItems} defaultExpanded={["foundations"]} />
```

## Usage — Squiz Matrix / Vanilla JS

1. Add design-system stylesheet to the page head:

```html
<link rel="stylesheet" href="%globals_asset_url:1590990%/web-design-system.css" />
```

2. Include the component script in `footer-js` nester:

```html
<script src="%globals_asset_url:1590990%/js/left-nav.js"></script>
```

3. Insert navigation HTML (or use the provided nester):

```html
<div id="nt-leftnav-root" data-default-expanded="">
  <nav class="nt-leftnav" aria-label="Main navigation">
    <ul class="nt-leftnav__list">
      <li class="nt-leftnav__item">
        <a href="/" class="nt-leftnav__link" aria-current="page"><span>Home</span></a>
      </li>
      <li class="nt-leftnav__item">
        <button class="nt-leftnav__toggle" aria-expanded="false" aria-controls="submenu-foundations">
          <span>Foundations</span>
        </button>
        <ul id="submenu-foundations" class="nt-leftnav__submenu" aria-hidden="true">
          <li class="nt-leftnav__item"><a class="nt-leftnav__link" href="/foundations/colour">Colour</a></li>
          <!-- ... -->
        </ul>
      </li>
    </ul>
  </nav>
</div>
```

## Configuration

- `data-default-expanded`: comma-separated section IDs (vanilla)
- CSS variables (tokens) control colours, spacing and breakpoints (see `src/tokens.css`)

## Accessibility

- Semantic HTML (`<nav>`, `<ul>`, `<li>`) and ARIA attributes
- Keyboard controls and visible focus indicators
- `aria-current="page"` used to indicate the active link

## Testing & Preview

- Preview locally at `http://localhost:5173/` → open the Left Navigation demo
- Verify expand/collapse, mobile drawer, keyboard interaction and ARIA attributes

## Deployment

- Nester: `public/squiz/left-nav.html`
- Deployed script: `deploy/js/left-nav.js`
- Styles included in `deploy/web-design-system.css`

---

*Canonical component documentation — keep this README as the single source of truth for LeftNav.*
