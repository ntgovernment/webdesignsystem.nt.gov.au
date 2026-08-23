# TwoColumn Component

Responsive two-column layout with WYSIWYG content areas for Squiz DXP Component Service.

## Overview

TwoColumn provides a responsive CSS Grid layout. Left content spans the available width when right content is empty; populated columns display side-by-side on desktop and stack on mobile.

Key features:

- Inline WYSIWYG editing for left and right content (`FormattedText` — raw HTML from Squiz editor)
- Full-width left content when the right column is empty
- Equal-width columns with design-system spacing when right content is populated
- Responsive: side-by-side on desktop (>768px), stacked on mobile (≤768px)
- Server-rendered only — no client JavaScript required

## File Structure

```
src/components/TwoColumn/
├── TwoColumn.css          — Base structural styles with design tokens
├── README.md              — This file
└── dxp/
    ├── manifest.json      — DXP schema, previews, and metadata
    ├── main.js            — Server-side renderer (edge function)
    └── preview.html       — DXP dev-ui preview wrapper
```

## Architecture

- **Server-side rendering (edge)**: `dxp/main.js` generates the complete HTML structure at the edge
- **No client-side JavaScript**: layout is purely CSS Grid with responsive media queries
- **Content-aware layout**: CSS uses one track by default and two equal tracks when the right column is populated
- The global design system CSS (`web-design-system.min.css`) must be present on the page for base styling

## Input / Props

| Property       | Type            | Default | Description                                       |
| -------------- | --------------- | ------- | ------------------------------------------------- |
| `leftContent`  | `FormattedText` | `""`    | HTML content for the left column (WYSIWYG editor) |
| `rightContent` | `FormattedText` | `""`    | HTML content for the right column                 |

### `FormattedText` type

`FormattedText` is a Squiz DXP content type that provides a rich-text (WYSIWYG) editor in the DXP interface. The value is raw HTML string output. Referenced in `dxp-schemas/content-meta.schema.json`.

## Visual Page Builder Editing

Authors can select and edit both content areas directly on the page. The renderer maps the visible columns to these fields:

- `data-sq-field="leftContent"`
- `data-sq-field="rightContent"`

Both targets are rendered even when empty, allowing authors to add content inline to a new component. These are the component's only input fields.

## CSS Classes

| Class                   | Element       | Notes                                 |
| ----------------------- | ------------- | ------------------------------------- |
| `.nt-two-column`        | Root `<div>`  | Content-aware CSS Grid container      |
| `.nt-two-column__left`  | Left `<div>`  | `min-width: 0` prevents grid overflow |
| `.nt-two-column__right` | Right `<div>` | `min-width: 0` prevents grid overflow |

On mobile (≤768px), `grid-template-columns` is forced to `1fr` by a `!important` media query override, stacking both columns vertically.

## Design Tokens

| Token      | Usage               | Fallback |
| ---------- | ------------------- | -------- |
| `--sp-xxl` | Gap between columns | `2rem`   |

## DXP Deployment

```bash
dxp-next auth login --tenant ntgov-4670
dxp-next cmp deploy src/components/TwoColumn/dxp
dxp-next cmp dev-ui src/components/TwoColumn/dxp   # Local dev preview
```

Current version: **2.0.0** (see `dxp/manifest.json`).

## Example

```json
{
  "leftContent": "<h3>Sidebar</h3><p>Navigation</p>",
  "rightContent": "<h2>Main content</h2><p>Text here</p>"
}
```

### Rendered HTML

```html
<div class="nt-two-column">
  <div class="nt-two-column__left" data-sq-field="leftContent">
    <h3>Sidebar</h3>
    <p>Navigation</p>
  </div>
  <div class="nt-two-column__right" data-sq-field="rightContent">
    <h2>Main content</h2>
    <p>Text here</p>
  </div>
</div>
```

## DXP Previews

The `basic` manifest preview demonstrates the equal-width responsive layout.

## Local Preview

Run `npx serve -p 3000` (or use provided serve-preview scripts) and open `dxp/preview.html`.

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
