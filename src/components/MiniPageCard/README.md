# MiniPageCard Component

Compact, responsive card grid layout displaying page assets with FontAwesome icons and titles. Part of the NT Government Web Design System.

## Overview

MiniPageCard renders a grid of icon-based cards, each linking to a page asset. It's designed for quick navigation and resource discovery with a minimal, icon-first design. The component uses **server-side rendering (SSR)** on the DXP platform to generate complete, static HTML.

### Key Features

- **Server-Side Rendering**: Complete HTML generated on server (dxp/main.js) - no client-side hydration needed
- **Icon Support**: FontAwesome icons via `IconCode` prop
- **Flexible Layout**: Responsive grid with CSS variables for dynamic gap control
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation via links
- **Design System Integration**: Uses NT Government design tokens for colors, spacing, and typography
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference

## Architecture

### Rendering Pattern: Full Server-Side Rendering

Unlike older hydration patterns, MiniPageCard uses **complete server-side rendering**:

**Server (dxp/main.js)**:

- Receives input with Title, Description, and Cards array
- Validates required props (Cards must be non-empty)
- Generates complete HTML string with all card markup
- Returns ready-to-display HTML (no JavaScript needed)

**Client (MiniPageCard.vanilla.ts)**:

- Provided for **dev/preview only** (auto-initialization with `[data-hydration-component]`)
- Not used in production DXP deployment
- Imports CSS and manages component lifecycle for local testing

**Why Full SSR?**

- Icons are static FontAwesome classes (no dynamic rendering)
- No complex interactivity requiring client state
- Reduces client-side bundle size
- Improves initial page performance
- Aligns with PageCard/PageTile architecture

## Props & Input Schema

### `main()` Function Input

```typescript
{
  Title?: string;                    // Optional grid heading (rendered as H2)
  Description?: string;              // Optional description below title
  Cards: MiniPageCardItem[];          // Required: array of 1+ cards
  cssClass?: string;                 // Optional: additional CSS class for container
}
```

### Card Item Structure

```typescript
interface MiniPageCardItem {
  PageAsset: SquizLink; // Required: link object with url, text, target
  CardTitle: string; // Required: card title text
  IconCode?: string; // Optional: FontAwesome class (e.g., 'fa-light fa-circle-info')
}

type SquizLink =
  | string // Plain URL
  | {
      url?: string; // URL
      href?: string; // Alternative URL property
      text?: string; // Link text
      title?: string; // Alternative text property
      name?: string; // Alternative text property (fallback)
      target?: string; // Link target (_self, _blank, etc.)
    };
```

### Example Input

```json
{
  "Title": "Explore the design system",
  "Description": "Quick links to system resources.",
  "Cards": [
    {
      "CardTitle": "About",
      "IconCode": "fa-light fa-circle-info",
      "PageAsset": {
        "url": "https://example.com/about",
        "text": "About",
        "target": "_self"
      }
    },
    {
      "CardTitle": "Foundations",
      "IconCode": "fa-light fa-puzzle-piece",
      "PageAsset": {
        "url": "https://example.com/foundations",
        "target": "_self"
      }
    }
  ]
}
```

## Styling & Design Tokens

### CSS Variables Used

**Colors**:

- `--clr-bg-default`: Card background (#ffffff)
- `--clr-border-subtle`: Card border color (#d3d3d7)
- `--clr-text-default`: Title/description text color (#1F1E27)
- `--clr-text-emphasis`: Icon color (#c33826 - burnt orange)
- `--clr-link-default`: Card title color (#1f1f5f - dark blue)
- `--clr-link-hover`: Title color on hover (#0046a8)
- `--clr-status-danger`: Error text color (#d32f2f)
- `--clr-status-danger-bg`: Error background (#fde3e3)

**Spacing**:

- `--sp-xs`: Icon-to-title gap (8px)
- `--sp-md`: Card padding internal gaps (16px)
- `--sp-lg`: Card body padding (24px)
- `--sp-sm`: Grid title bottom margin (12px)
- `--sp-xl`: Error box padding (32px)

**Typography**:

- `--type-font-default`: Primary font ("Lato", system-ui, sans-serif)
- `--type-heading-h2-*`: Grid/description title styles
- `--type-body-md-*`: Description text styles

**Effects**:

- `--shadow-md`: Card hover shadow
- `--shadow-focus-ntg`: Focus ring glow
- `--radii-none`: Border radius (0px)

**Border**:

- `--border-width-md`: 1px (default)
- `--border-width-lg`: 2px (high contrast mode)

### CSS Classes Structure

```
.nt-mini-page-card                           // Container
  .nt-mini-page-card__title                  // Grid title (H2)
  .nt-mini-page-card__description            // Grid description (P)
  .nt-mini-page-card__grid                   // Card grid container
    > div (list items)
      .card                                  // Card wrapper (A or DIV)
        .card.card--full                     // Full-height variant
        .card.card--mini                     // Mini variant with icon
        .card--clickable                     // When href present
        .card--clickable:hover               // Hover state
        .card--clickable:focus-visible       // Focus state
        .card-body                           // Card content area
          .mini-page-card__content           // Icon + text container
            .mini-page-card__icon            // FontAwesome icon
            .mini-page-card__text            // Text wrapper
              .card-title                    // Card title (H5)

.page-card-error                             // Error state container
  h3                                         // Error heading
  p                                          // Error message
```

## Layout & Responsive Design

### Grid Layout

- **Default**: `repeat(auto-fill, minmax(220px, 1fr))`
- **Minimum card width**: 220px
- **Gap**: 16px (can be overridden via CSS variable `--grid-gap`)
- **Responsive padding**:
  - Desktop (> 768px): 16px sides, 24px top/bottom
  - Tablet (768px): 16px all
  - Mobile (< 480px): 12px all

### Icon Sizing

- **Desktop**: 22px font size
- **Mobile (< 480px)**: 20px font size

### Typography Sizing

- **Card title**: 18px / 22px line height
- **Tablet**: 16px / 20px
- **Grid title (H2)**: 24px / 1.33 line height
- **Description**: 16px / 24px

## Accessibility Features

### Semantic HTML

- Uses `<a>` tags for linked cards (native keyboard navigation)
- Uses `<div>` for non-linked cards
- Grid container has `role="list"` and items have `role="listitem"`
- Icons are `aria-hidden="true"` (decorative via FontAwesome)

### Focus Management

- Focus-visible ring: `box-shadow: 0px 0px 0px 4px #FFAB00`
- Outline offset: proper spacing on high-contrast mode
- Native link focus handling (no custom outline removal)

### Reduced Motion

- Transition disabled when `prefers-reduced-motion: reduce`
- All animations (hover, focus) respect user preference

### High Contrast Mode

- Card borders thicken (`border-width-lg`)
- Focus ring becomes outline with custom color
- Improves visibility for users with vision impairments

## Development Notes

### File Structure

```
src/components/MiniPageCard/
  ├── README.md                    // This file
  ├── MiniPageCard.css             // Styling with tokens/variables
  ├── MiniPageCard.vanilla.ts      // Client-side dev/preview only
  ├── index.ts                     // TypeScript export
  └── dxp/
      ├── main.js                  // Server-side renderer (PRIMARY)
      ├── manifest.json            // DXP configuration & schema
      └── preview.html             // Local dev preview with raw CSS values
```

### Important: SSR vs Hydration

**Current approach (SSR)**: Server generates HTML, no client needed.
**Previous approach (Hydration)**: Not used here anymore (but MiniPageCard.vanilla.ts kept for local dev).

The DXP deployment uses `dxp/main.js` exclusively. The vanilla component is for local development only.

### CSS Variable Override Strategy

To dynamically change grid gap from props, the component uses CSS custom properties:

**In SSR** (dxp/main.js):

```javascript
// Future: could support dynamic gap if needed
// style="--grid-gap: ${escapeAttr(gap)}"
```

**In CSS**:

```css
gap: var(--grid-gap, var(--sp-md, 16px));
```

This allows three levels of fallback:

1. Inline style (if provided)
2. CSS variable `--sp-md` (16px)
3. Hardcoded fallback (16px)

### Error Handling

When Cards array is empty or missing:

- Renders error container with semantic `role="alert"`
- Displays user-friendly message
- Uses danger color tokens for visibility
- Proper spacing and typography

### Sanitization

All user input is escaped:

- `escapeHtml()`: For text content (titles, descriptions)
- `escapeAttr()`: For HTML attributes (hrefs, classes)
- Prevents XSS attacks in DXP environment

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.

## Usage Example in DXP

```json
{
  "Title": "Quick Links",
  "Cards": [
    {
      "CardTitle": "Documentation",
      "IconCode": "fa-light fa-book",
      "PageAsset": {
        "url": "/docs",
        "text": "Read docs",
        "target": "_self"
      }
    }
  ]
}
```

## Integration with Web Design System

MiniPageCard aligns with design system patterns:

- Uses same color tokens as other components
- Card styling inherited from `.card` base class
- Spacing and typography follow system scale
- Icon color uses `--clr-text-emphasis` token

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- FontAwesome 6+ for icons
- No IE11 support

## Future Considerations

- Add optional image variant (mini cards with top image)
- Support for badges/status indicators
- Customizable icon position (left/right/top)
- Card count display option
- Lazy loading for large grids
