# PageTile Component - Complete Developer Guide

## Overview

The **PageTile** component is a responsive text-only tile grid for the NT Design System. It renders a list of content pages as minimal, icon-optional tiles without imagery—ideal for linking to resources, guides, or navigation sections where visual previews aren't necessary.

**Key Differentiators from PageCard:**

- No image support (text-only tiles)
- More compact content representation
- Configurable optional icons
- Slightly wider minimum width (240px vs 220px for better text readability)

## Features

- ✅ **Responsive grid layout** — Auto-fill columns with 240px minimum, scales to full viewport width
- ✅ **Server-side rendering (SSR)** — Full HTML generation on server via DXP Component Service
- ✅ **Design token integration** — All spacing, colors, typography, and focus states use design system tokens
- ✅ **Theme-aware** — Focus outline uses NTG-specific theme tokens; border-radius is 0px for sharp corners
- ✅ **Accessible** — ARIA roles, focus management, high-contrast support, reduced-motion aware
- ✅ **Hyperlink or static tiles** — Tiles render as `<a>` if URL provided, else `<div>`
- ✅ **Client-side rendering available** — Optional client-side hydration for DEV preview
- ✅ **Multiple compatibility layers** — Supports `Cards` (primary), `PageArray`, and `pages` prop names

## Installation & Setup

### Component Files

```
src/components/PageTile/
├── PageTile.vanilla.ts          — Client-side component logic
├── PageTile.css                 — Styles with design token imports
├── index.ts                     — TypeScript exports
├── README.md                    — This file
└── dxp/
    ├── manifest.json            — DXP schema and UI configuration
    ├── main.js                  — Server-side renderer
    └── preview.html             — DXP preview wrapper
```

### Import in Main Bundle

In `src/web-design-system.ts`, add:

```typescript
import "./components/PageTile/PageTile.vanilla";
```

This auto-registers the component to detect and initialize all `[data-hydration-component="page-tile"]` elements on page load.

## API Reference

### Props Interface: `PageTileProps`

```typescript
interface PageTileProps {
  Cards?: PageTileItem[]; // Primary prop (recommended)
  PageArray?: PageTileItem[]; // DXP Component Service compatibility
  pages?: PageTileItem[]; // Squiz Matrix nester compatibility
  Title?: string; // Optional H2 grid heading
  title?: string; // Alternate Title prop
  Description?: string; // Optional description below title
  description?: string; // Alternate Description prop
  gap?: string; // CSS grid gap (default: var(--sp-md, 16px))
  cssClass?: string; // Additional CSS classes for container
}
```

### Item Interface: `PageTileItem`

```typescript
interface PageTileItem {
  PageAsset?: SquizLinkValue; // Link destination (required for clickable tiles)
  CardTitle?: string; // Tile heading text (required)
}

type SquizLinkValue =
  | string
  | {
      assetId?: string;
      url?: string;
      href?: string;
      text?: string;
      title?: string;
      name?: string;
      target?: string;
    };
```

## Usage Examples

### Basic Example (HTML)

```html
<div
  class="nt-page-tile"
  data-hydration-component="page-tile"
  data-hydration-props='{
       "Title": "Quick Links",
       "Cards": [
         {
           "CardTitle": "Foundations",
           "PageAsset": { "url": "/foundations", "target": "_self" }
         },
         {
           "CardTitle": "Components",
           "PageAsset": { "url": "/components", "target": "_self" }
         },
         {
           "CardTitle": "Help",
           "PageAsset": { "url": "/help", "target": "_self" }
         }
       ]
     }'
></div>
```

### JavaScript (Programmatic)

```javascript
import { PageTileClient } from "@ntgovernment/web-design-system";

const container = document.getElementById("my-page-tile");
const data = {
  Title: "Resources",
  Cards: [
    {
      CardTitle: "API Docs",
      PageAsset: { url: "/api", target: "_blank" },
    },
    {
      CardTitle: "GitHub",
      PageAsset: { url: "https://github.com", target: "_blank" },
    },
  ],
};

// Manually set hydration props and initialize
container.dataset.hydrationProps = JSON.stringify(data);
new PageTileClient(container);
```

### TypeScript with Types

```typescript
import {
  PageTileClient,
  PageTileProps,
  PageTileItem,
} from "@ntgovernment/web-design-system";

const tileProps: PageTileProps = {
  Title: "Explore",
  Description: "Navigate to key sections of the system.",
  Cards: [
    {
      CardTitle: "Design Tokens",
      PageAsset: { url: "/tokens" },
    } as PageTileItem,
  ],
  gap: "var(--sp-lg)",
  cssClass: "custom-tiles",
};

const container = document.querySelector(
  '[data-hydration-component="page-tile"]',
)!;
container.dataset.hydrationProps = JSON.stringify(tileProps);
new PageTileClient(container);
```

## Design Tokens

All styling uses design system tokens for consistency and theme-switching support.

### Spacing Tokens (`--sp-*`)

- `--sp-xs` (8px) — Icon/text gaps
- `--sp-md` (16px) — Default grid gap
- `--sp-lg` (20px) — Tile body padding (vertical)
- `--sp-xl` (24px) — Tile body padding (horizontal)

### Color Tokens

- `--clr-bg-default` — Tile background
- `--clr-border-subtle` — Border (default and hover state)
- `--clr-text-default` — Description/body text
- `--clr-link-default` — Tile title color
- `--clr-link-hover` — Tile title on hover
- `--clr-status-danger*` — Error state background/text

### Typography Tokens

- `--type-heading-h2-*` — Grid title (H2)
- `--type-body-md-*` — Description paragraph
- (Font styling falls back to `--type-font-default` ("Lato", system-ui, sans-serif))

### Theme-Specific Tokens (NTG)

- `--ntg-radii-none` (0px) — Tile border-radius (always 0px for sharp corners)
- `--shadow-focus-ntg` — NTG focus ring (4px offset orange shadow)
- `--shadow-md` — Tile shadow on hover
- `--border-width-md` (1px) — Default tile border

## Rendering Pattern

### Server-Side Rendering (DXP Component Service) - Primary Method

The PageTile component uses **full server-side rendering (SSR)** via DXP Component Service.

The `dxp/main.js` file exports a `main()` function that:

1. **Accepts input:** Component props (Title, Description, Cards, etc.)
2. **Generates HTML:** Complete tile grid markup with all styling
3. **Returns HTML string:** Fully-rendered component ready to display

**Example DXP main() function output:**

```html
<div class="nt-page-tile" style="width: 100%;">
  <div
    class="nt-page-tile__grid"
    role="list"
    data-page-count="3"
    style="gap: var(--sp-md, 16px);"
  >
    <div role="listitem" data-page-index="0">
      <a class="tile tile--text tile--clickable" href="/feedback">
        <div class="tile-body">
          <div class="page-tile__content">
            <div class="page-tile__text">
              <h5 class="tile-title">Feedback</h5>
            </div>
          </div>
        </div>
      </a>
    </div>
    <!-- Additional tiles... -->
  </div>
</div>
```

**Benefits of SSR:**

- **No JavaScript required:** Component works without client-side JS
- **Instant rendering:** No hydration delay or flash of unstyled content
- **SEO-friendly:** Search engines see complete HTML immediately
- **Performance:** Reduces client-side processing and bundle size

### Client-Side Rendering (DEV Preview Only)

For local development preview, `PageTile.vanilla.ts` provides client-side rendering:

1. **Script loads:** Auto-detects `[data-hydration-component="page-tile"]` elements
2. **Parses props:** Reads `data-hydration-props` JSON attribute
3. **Renders HTML:** Generates tile grid and injects into container

This is used **only** in the preview environment (`preview/index.html`) for testing. Production deployments use SSR exclusively.

## Accessibility Features

### ARIA & Semantics

- Grid container: `role="list"` with `data-page-count` attribute
- Each tile: `role="listitem"` with `data-page-index` attribute
- Icon spans: `aria-hidden="true"` (icon is decorative, text is primary content)
- Tiles: Semantic `<a>` or `<div>` (JS infers from presence of URL)

### Focus Management

- `:focus-visible` pseudo-class ensures keyboard users see focus outline
- Focus ring on tiles: `var(--shadow-focus-ntg)` (4px orange shadow for NTG theme)
- Focus state uses `--ntg-radii-none` for sharp corners (accessibility best practice)
- High-contrast mode: Border width increases and outline becomes solid line

### Motion & Perception

- Transitions disable under `prefers-reduced-motion: reduce`
- High-contrast mode: `prefers-contrast: more` increases border width and focus outline

### Keyboard Navigation

- Tab through tiles naturally
- Enter/Space activates tile link (if `<a>` tag)

## CSS Classes Reference

| Class                        | Purpose                          |
| ---------------------------- | -------------------------------- |
| `.nt-page-tile`              | Root container                   |
| `.nt-page-tile__grid`        | Grid wrapper (auto-fill layout)  |
| `.nt-page-tile__title`       | H2 grid heading                  |
| `.nt-page-tile__description` | Description paragraph            |
| `.tile`                      | Individual tile element          |
| `.tile--text`                | Tile variant (text-only)         |
| `.tile--clickable`           | Applied when tile is a hyperlink |
| `.tile-body`                 | Tile inner content wrapper       |
| `.page-tile__content`        | Text content wrapper             |
| `.page-tile__text`           | Title text wrapper               |
| `.tile-title`                | Tile heading (H5)                |
| `.page-tile-error`           | Error state container            |

## Responsive Breakpoints

| Breakpoint               | Behavior                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| **Desktop (≥769px)**     | Full padding: `var(--sp-lg)` vertical, `var(--sp-xl)` horizontal |
| **Tablet (481px–768px)** | Compact padding: `var(--sp-md)` horizontal/vertical; title: 14px |
| **Mobile (≤480px)**      | Minimal padding: `var(--sp-md)` all                              |

Grid uses `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`, so tiles flow responsively.

## DXP Component Service Integration

### Schema File: `dxp/manifest.json`

Defines:

- Component display name: "Page Tile"
- Icon: Grid view (orange)
- Main function: `main` (entry point for rendering)
- Input schema with `Title`, `Description`, `Cards` array
- Backward-compatible props: `PageArray`, `pages`
- Each card item requires `PageAsset` and `CardTitle`

### Server Renderer: `dxp/main.js`

Exports `main()` function that:

1. Accepts input object (props)
2. Escapes all user input for security
3. Generates complete tile grid HTML
4. Returns HTML string for immediate rendering

**Example DXP Input:**

```json
{
  "Title": "Get Support",
  "Description": "Access our help resources.",
  "Cards": [
    {
      "CardTitle": "FAQ",
      "PageAsset": { "url": "/faq", "target": "_self" }
    }
  ]
}
```

**Output HTML:**

```html
<div class="nt-page-tile" style="width: 100%;">
  <h2 class="nt-page-tile__title">Get Support</h2>
  <p class="nt-page-tile__description">Access our help resources.</p>
  <div
    class="nt-page-tile__grid"
    role="list"
    data-page-count="1"
    style="gap: var(--sp-md, 16px);"
  >
    <div role="listitem" data-page-index="0">
      <a class="tile tile--text tile--clickable" href="/faq">
        <div class="tile-body">
          <div class="page-tile__content">
            <div class="page-tile__text">
              <h5 class="tile-title">FAQ</h5>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
```

### Preview File: `dxp/preview.html`

Minimal wrapper that:

- Contains inline CSS with all PageTile component styles (full raw CSS values)
- Uses `[component://output]` marker for DXP preview rendering
- No external dependencies or Font Awesome required
- Renders complete component with border-radius: 0px (sharp corners)

## Performance Considerations

### Bundle Impact

- **Server-side (DXP):** No JavaScript sent to client
- **Client-side (DEV only):** ~5 KB (minified) for preview functionality
- **CSS:** ~3 KB (minified) — Includes all media queries and theme tokens
- **Total Production:** ~3 KB CSS only (SSR requires no client JS)

### Runtime Performance

- **Server rendering:** Fast string concatenation, single HTML generation
- **Client rendering (DEV):** Single DOM query + Array.forEach per container
- **Reflows:** One `.innerHTML` assignment per component instance (DEV only)
- **Paints:** Grid layout → no forced reflows for individual tiles

### Optimization Tips

- Use `gap` prop strategically (fewer grid-gap recalculations)
- Limit tile count per grid to <20 for optimal UX
- Defer non-critical component initialization if many tiles on page

## Testing & Debugging

### Enable Debug Logging

```javascript
localStorage.setItem("DEBUG_NTG_COMPONENTS", "true");
// Reload page to see [PageTile], [PageCard], [MiniPageCard] logs in console
```

Debug logs are emitted via `debugLog()` and `debugError()` utility functions in:

- `utils/debug.ts` — Debug output control

### Inspector Tips

1. **Check hydration props:**

   ```javascript
   document.querySelector('[data-hydration-component="page-tile"]').dataset
     .hydrationProps;
   ```

2. **Verify client initialization:**

   ```javascript
   window.NTGPageTile instanceof Function; // Should be true
   console.log(window.NTGPageTile); // Constructor function
   ```

3. **Test responsive layout:**
   - Resize browser to <480px, 480–768px, >768px
   - Check icon and text size changes via Inspector

4. **Verify theme tokens:**
   - Open Inspector → Elements tab
   - Select `.nt-page-tile` element
   - Check computed styles for `--clr-*`, `--sp-*`, `--radii-*` variables

## Migration & Compatibility

### From MiniPageCard to PageTile

| Aspect         | MiniPageCard          | PageTile      | Migration                       |
| -------------- | --------------------- | ------------- | ------------------------------- |
| Icon display   | **Required**          | Not supported | Remove `IconCode` from data     |
| Min width      | 220px                 | 240px         | Adjust grid if width-sensitive  |
| Image support  | ❌                    | ❌            | N/A                             |
| Compact height | ✅                    | ✅            | Same                            |
| Border-radius  | 4px (var(--radii-sm)) | 0px (sharp)   | Visual change only              |
| Prop shape     | Same                  | Same          | Direct props swap (minus icons) |

**Example Migration:**

```javascript
// Before (MiniPageCard)
const miniCardData = {
  Cards: [
    {
      CardTitle: "Help",
      PageAsset: {...},
      IconCode: "fa-light fa-circle-info"  // Remove this
    }
  ]
};

// After (PageTile)
const pageTileData = {
  Cards: [
    {
      CardTitle: "Help",
      PageAsset: {...}
      // IconCode removed - not supported
    }
  ]
};
```

### Backward Compatibility

PageTile supports three prop names for card arrays:

1. **`Cards`** (primary) — Recommended for all new implementations
2. **`PageArray`** — DXP Component Service fallback
3. **`pages`** — Squiz Matrix nester fallback

Component resolves in order and renders first non-empty array.

## Deployment Checklist

- [ ] Component files created in `src/components/PageTile/`
- [ ] Import added to `src/web-design-system.ts`
- [ ] DXP manifest deployed to Squiz Component Services
- [ ] DXP server renderer (`main.js`) deployed
- [ ] CSS tokens imported in `PageTile.css`
- [ ] Preview demo added to `preview/index.html`
- [ ] Minified CSS created (`web-design-system.min.css`)
- [ ] Preview tested in DXP dev-ui interface
- [ ] Server-side rendering verified (component works without JavaScript)
- [ ] Theme switching tested (if multiple themes in use)
- [ ] Accessibility tested (keyboard nav, focus outline, screen reader)
- [ ] Responsive design tested on mobile/tablet/desktop

## Source Files & References

| File                                                               | Purpose                              |
| ------------------------------------------------------------------ | ------------------------------------ |
| [src/components/PageTile/PageTile.vanilla.ts](PageTile.vanilla.ts) | Client-side component logic          |
| [src/components/PageTile/PageTile.css](PageTile.css)               | Styles with design token imports     |
| [src/components/PageTile/index.ts](index.ts)                       | TypeScript exports                   |
| [src/components/PageTile/dxp/manifest.json](dxp/manifest.json)     | DXP schema + UI config               |
| [src/components/PageTile/dxp/main.js](dxp/main.js)                 | Server-side renderer                 |
| [src/components/PageTile/dxp/preview.html](dxp/preview.html)       | Dev-UI preview wrapper               |
| [src/web-design-system.ts](../../web-design-system.ts)             | Main bundle import (update required) |
| [preview/index.html](../../../preview/index.html)                  | Demo page (update required)          |
| [src/external-tokens/](../../external-tokens/)                     | Design token definitions             |

## FAQ

**Q: When should I use PageTile vs. MiniPageCard vs. PageCard?**  
A: Use PageTile for text-only navigation/links without imagery (most compact, no icon support). Use MiniPageCard when icons are essential. Use PageCard for high-visual-impact patterns with images.

**Q: How do I hide the grid title/description?**  
A: Omit `Title` and `Description` from props—component only renders them if provided.

**Q: Can tiles be static (non-clickable)?**  
A: Yes! Omit `PageAsset` or provide an empty link. Tile renders as `<div>` with `.tile` class (no `.tile--clickable`).

**Q: Does PageTile work without JavaScript?**  
A: Yes! The component uses full server-side rendering (SSR) via DXP Component Service. No client-side JavaScript is required in production. The PageTile.vanilla.ts file is only used for local development preview.

**Q: How do I customize grid spacing?**  
A: Pass `gap: "var(--sp-lg)"` (or any CSS value) in props. Default is `var(--sp-md)`.

**Q: Are there any SEO implications?**  
A: No negative impact. Tiles render as semantic `<a>` links with descriptive text. Grid structure is semantic (list/listitem ARIA).

---

**Last Updated:** February 19, 2026  
**Component Version:** 1.0.2  
**Design System:** NT Government Design System  
**Status:** Production-ready

### Changelog
- **1.0.2** — Minor documentation & preview cleanup; migrated remaining inline styles to CSS and bumped DXP manifest version.
