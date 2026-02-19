# TwoColumn Component

Responsive two-column layout with WYSIWYG content areas for Squiz DXP Component Service.

## Overview

TwoColumn provides a flexible grid-based layout for displaying content side-by-side on desktop and stacked on mobile. Perfect for documentation, sidebars, feature comparisons, and multi-section content.

Key features:

- WYSIWYG editors for left and right content
- Configurable column widths (CSS grid values)
- Optional background colors per column
- Responsive: side-by-side on desktop (>768px), stacked on mobile (≤768px)
- Server-rendered only (no client JS required)

## Architecture

- Server-side rendering (edge): `main.js` generates complete HTML structure
- No client-side JavaScript: static layout with CSS-only responsive behavior
- Global design system CSS is required for consistent styling

## Input / Props

| Property          | Type          | Default | Description                                           |
| ----------------- | ------------- | ------- | ----------------------------------------------------- |
| `leftContent`     | FormattedText | ``      | HTML content for left column (WYSIWYG editor)         |
| `rightContent`    | FormattedText | ``      | HTML content for right column (WYSIWYG editor)        |
| `leftWidth`       | string        | `1fr`   | CSS grid width for left column (e.g., '1fr', '300px') |
| `rightWidth`      | string        | `1fr`   | CSS grid width for right column                       |
| `gap`             | string        | `2rem`  | Space between columns (e.g., '2rem', '32px')          |
| `leftBackground`  | string        | ``      | CSS background color for left column (optional)       |
| `rightBackground` | string        | ``      | CSS background color for right column (optional)      |
| `cssClass`        | string        | ``      | Additional CSS classes for container                  |

## Local Preview

- Run `npx serve -p 3000` or use provided `serve-preview` scripts in the component folder and open `preview.html`.

## Usage (DXP)

Use the DXP component service or insert server-rendered output into a Matrix nester/paint layout.

## Files

- `manifest.json` — DXP metadata & input schema
- `main.js` — Server-side renderer (ES module)
- `preview.html` — Local development preview
- `TwoColumn.css` — Component styles

## Example

```json
{
  "leftContent": "<h3>Sidebar</h3><p>Navigation</p>",
  "rightContent": "<h2>Main content</h2><p>Text here</p>",
  "leftWidth": "1fr",
  "rightWidth": "2fr"
}
```

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
