# TwoColumn Component

Responsive two-column layout with WYSIWYG content areas for Squiz DXP Component Service.

## Overview

TwoColumn provides a flexible CSS Grid–based layout for displaying content side-by-side on desktop and stacked on mobile. Perfect for documentation, sidebars, feature comparisons, and multi-section content.

Key features:

- Inline WYSIWYG editing for left and right content (`FormattedText` — raw HTML from Squiz editor)
- Quick options for column widths, gap, backgrounds, and additional CSS classes
- Configurable column widths (any valid CSS grid track value)
- Optional background colors per column (auto-adds `--sp-xl` padding when set)
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
- **Grid values applied inline**: `grid-template-columns` and `gap` are set as inline styles per instance, so each component instance can have independent widths
- The global design system CSS (`web-design-system.min.css`) must be present on the page for base styling

## Input / Props

| Property          | Type            | Default  | Description                                                         |
| ----------------- | --------------- | -------- | ------------------------------------------------------------------- |
| `leftContent`     | `FormattedText` | `""`     | HTML content for the left column (WYSIWYG editor)                   |
| `rightContent`    | `FormattedText` | `""`     | HTML content for the right column (WYSIWYG editor)                  |
| `leftWidth`       | `string`        | `"1fr"`  | CSS grid track value for the left column (e.g., `"1fr"`, `"300px"`) |
| `rightWidth`      | `string`        | `"1fr"`  | CSS grid track value for the right column                           |
| `gap`             | `string`        | `"2rem"` | Space between columns (e.g., `"2rem"`, `"32px"`)                    |
| `leftBackground`  | `string`        | `""`     | CSS background color for the left column (optional)                 |
| `rightBackground` | `string`        | `""`     | CSS background color for the right column (optional)                |
| `cssClass`        | `string`        | `""`     | Additional CSS classes for the root container                       |

### `FormattedText` type

`FormattedText` is a Squiz DXP content type that provides a rich-text (WYSIWYG) editor in the DXP interface. The value is raw HTML string output. Referenced in `dxp-schemas/content-meta.schema.json`.

## Visual Page Builder Editing

Authors can select and edit both content areas directly on the page. The renderer maps the visible columns to these fields:

- `data-sq-field="leftContent"`
- `data-sq-field="rightContent"`

Both targets are rendered even when empty, allowing authors to add content inline to a new component. The following non-content fields are available as quick options because they control the layout rather than visible text:

- `leftWidth`
- `rightWidth`
- `gap`
- `leftBackground`
- `rightBackground`
- `cssClass`

## CSS Classes

| Class                   | Element       | Notes                                            |
| ----------------------- | ------------- | ------------------------------------------------ |
| `.nt-two-column`        | Root `<div>`  | CSS Grid container; column widths/gap are inline |
| `.nt-two-column__left`  | Left `<div>`  | `min-width: 0` prevents grid overflow            |
| `.nt-two-column__right` | Right `<div>` | `min-width: 0` prevents grid overflow            |

When a column has a `background` inline style, `padding: var(--sp-xl, 24px)` is applied automatically via the CSS attribute selector `[style*="background"]`.

On mobile (≤768px), `grid-template-columns` is forced to `1fr` by a `!important` media query override, stacking both columns vertically.

## Design Tokens

| Token     | Usage                                 | Fallback |
| --------- | ------------------------------------- | -------- |
| `--sp-xl` | Column padding when background is set | `24px`   |

Column widths, gap, and background colors are passed as inline styles from `main.js` (not CSS tokens), so they can vary per instance independently.

## DXP Deployment

```bash
dxp-next auth login --tenant ntgov-4670
dxp-next cmp deploy src/components/TwoColumn/dxp
dxp-next cmp dev-ui src/components/TwoColumn/dxp   # Local dev preview
```

Current version: **1.1.0** (see `dxp/manifest.json`).

## Example

```json
{
  "leftContent": "<h3>Sidebar</h3><p>Navigation</p>",
  "rightContent": "<h2>Main content</h2><p>Text here</p>",
  "leftWidth": "1fr",
  "rightWidth": "2fr",
  "gap": "2rem"
}
```

### Rendered HTML

```html
<div
  class="nt-two-column"
  style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;"
>
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

Three preview configurations are defined in `manifest.json`:

| Preview            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `basic`            | Equal-width two columns (1fr / 1fr)              |
| `sidebar`          | Sidebar + main (1fr / 2fr)                       |
| `with-backgrounds` | Demonstrates per-column background color support |

## Local Preview

Run `npx serve -p 3000` (or use provided serve-preview scripts) and open `dxp/preview.html`.

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
