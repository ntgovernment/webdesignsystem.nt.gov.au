# ComponentViewer

Interactive component preview with live iframe, code extraction, syntax highlighting, zoom controls, and Storybook integration.

## Overview

ComponentViewer embeds a Storybook story in an iframe alongside a code panel. It uses a hybrid architecture: `main.js` (server-side) renders the static HTML structure; `ComponentViewer.vanilla.ts` (client-side) hydrates it with zoom/copy controls, extracts + formats code from the iframe document, and applies UI polish including button positioning and icon updates.

## Files

| File                            | Role                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `dxp/manifest.json`             | DXP schema + input definitions                              |
| `dxp/main.js`                   | Server-side renderer                                        |
| `dxp/preview.html`              | DXP dev-ui preview wrapper                                  |
| `dxp/example.data.json`         | Example props for local preview                             |
| `dxp/serve-preview.bat` / `.sh` | Copy preview files into a running Storybook                 |
| `ComponentViewer.vanilla.ts`    | Client-side hydration (zoom, copy, code extraction, layout) |
| `ComponentViewer.css`           | All component styles                                        |

## DXP Props

These props are defined in `manifest.json` and are exposed to Squiz Matrix editors:

| Property            | Type                | Default | Required | Description                                                                                                                                                              |
| ------------------- | ------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `storybookUrl`      | string              | —       | **yes**  | Full URL to the Storybook story for the iframe. Accepts `?path=/docs/` and `?path=/story/` patterns — `main.js` converts them to `iframe.html?id=` format automatically. |
| `Introduction`      | FormattedText       | —       | no       | Inline-editable rich text displayed above the preview. Rendered as raw HTML (supports lists, links, etc.).                                                               |
| `codeExample`       | string (multi-line) | —       | no       | Plain-text code snippet shown in the code panel. If empty, the client attempts to extract code from the iframe document.                                                 |
| `height`            | string              | `400px` | no       | Height of the preview iframe.                                                                                                                                            |
| `showCodeByDefault` | boolean             | `false` | no       | Opens the code panel on load.                                                                                                                                            |

### Server-side-only props (not in manifest)

These are hardcoded defaults in `main.js` and not exposed to editors:

| Property      | Default | Description                    |
| ------------- | ------- | ------------------------------ |
| `initialZoom` | `1.0`   | Starting zoom level.           |
| `enableCopy`  | `true`  | Show copy-to-clipboard button. |
| `enableZoom`  | `true`  | Show zoom controls.            |

## How it works

1. `main.js` renders the static HTML shell with hydration attributes (`data-hydration-component="component-viewer"` and `data-hydration-props`) and embeds the `storybookUrl` in the iframe `src`.
2. On page load, `ComponentViewer.vanilla.ts` hydrates each instance:
   - Calls `updateOpenTabButton()` to replace the default icon and label with the Storybook SVG and "Open in Storybook" text.
   - Attaches zoom/copy/code-toggle button event listeners.
   - If no `codeExample` was provided, waits for the iframe to load and extracts rendered HTML from the iframe document.
3. Extracted code is formatted with **Prettier** and highlighted with **Prism.js**.
4. The code panel has a `600px` max-height with `overflow-y: auto` and slim (6px) scrollbars.

### storybookUrl conversion

`main.js` automatically converts Storybook URL patterns to iframe format:

- `?path=/story/components-button--primary` → `iframe.html?id=components-button--primary`
- `?path=/docs/components-button--primary` → `iframe.html?id=components-button--primary&viewMode=story`

## Button Positioning Architecture

The action toolbar (Copy, Show/Hide Code, Open in Storybook) stays anchored below the preview regardless of whether the code panel is open or closed. This is achieved entirely in CSS — no JavaScript positioning.

**Layout:**

```
.component-viewer__preview   ← fixed-height iframe box
.component-viewer__actions   ← margin-top: 12px; z-index: 1 (sits 12px below preview)
.component-viewer__code      ← margin-top: -66px (pulls panel top up to preview bottom)
                               padding-top: 60px (code text appears below the buttons)
```

**Why it works:**

- `.component-viewer__actions` sits in normal document flow directly after the preview with `margin-top: 12px`. Its height is approximately 54px (button + padding).
- `.component-viewer__code` has `margin-top: -66px` (`-(12px gap + 54px action bar)`) so its top edge aligns with the bottom of the preview. When `max-height` expands from 0 → 600px via CSS transition, the panel grows downward from that seam.
- `z-index: 1` on `.component-viewer__actions` ensures the buttons paint above the dark code panel when it expands underneath them.
- `padding-top: 60px` on `.component-viewer__code` reserves space so code text is never hidden under the overlapping buttons.

## CSS Notes

### Code panel top padding

`.component-viewer__code` has `padding-top: 60px` (both in collapsed and expanded states). This reserves space between the top of the code panel and the first line of code, keeping the text below the action bar that visually overlaps the panel.

### Show Code button fixed width

`.component-viewer__actions .component-viewer__button:nth-child(2)` is set to `width: 128px`. This keeps the button the same size when the label changes between "See code" and "Hide code", avoiding layout shifts in the action bar.

### Scrollbars

Both vertical (code panel) and horizontal (code line overflow) scrollbars use slim styling to avoid competing visually with the code content:

```css
/* Applied to .component-viewer__code (vertical) and .component-viewer__code-content (horizontal) */
scrollbar-width: thin;
scrollbar-color: rgba(255, 255, 255, 0.35) transparent;

&::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
&::-webkit-scrollbar-track {
  background: transparent;
}
&::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}
```

## "Open in Storybook" button

The server-side HTML (`main.js`) renders a generic "Open canvas" button with a Font Awesome icon for the `[data-action="open-new-tab"]` control. On init, `updateOpenTabButton()` replaces it client-side with the Storybook SVG icon (same icon used in the PageBanner component) and updates the label text and accessibility attributes:

```typescript
private updateOpenTabButton(): void {
  const btn = this.container.querySelector('[data-action="open-new-tab"]') as HTMLElement;
  if (!btn) return;

  btn.setAttribute("aria-label", "Open in Storybook");
  btn.setAttribute("title", "Open in Storybook");

  // Storybook logo SVG (matches PageBanner component)
  const storybookSvg = `<svg width="11" height="13" viewBox="0 0 11 13" ...>...</svg>`;

  const iconEl = btn.querySelector("i");
  if (iconEl) iconEl.outerHTML = storybookSvg;

  const labelEl = btn.querySelector(".component-viewer__control-label");
  if (labelEl) labelEl.textContent = "Open in Storybook";
}
```

This is a client-side-only change. `main.js` is not modified because the server renders for DXP and does not know the Storybook context at render time.

## Local Preview (development)

The `serve-preview` scripts copy the preview files into a running Storybook project so the preview runs on the same origin (required to extract iframe content — avoids CORS).

### Quick start

**Windows:**

```bat
src\components\ComponentViewer\dxp\serve-preview.bat
```

**Mac / Linux:**

```bash
bash src/components/ComponentViewer/dxp/serve-preview.sh
```

Before running, open the script and set `STORYBOOK_DIR` to the absolute path of your local Storybook project (e.g. `C:\Projects\web-design-system`). The script copies `preview.html`, `main.js`, `example.data.json`, and `web-design-system.min.css` into `.storybook/public/`.

### Manual setup

1. Copy preview files into your Storybook project's `.storybook/public/`:

   ```bash
   copy src\components\ComponentViewer\dxp\preview.html .storybook\public\component-viewer-preview.html
   copy src\components\ComponentViewer\dxp\main.js      .storybook\public\component-viewer-main.js
   copy src\components\ComponentViewer\dxp\example.data.json .storybook\public\component-viewer-data.json
   copy deploy\web-design-system.min.css .storybook\public\
   ```

2. Update paths inside the copied `component-viewer-preview.html`:
   - `import render from './main.js'` → `import render from './component-viewer-main.js'`
   - `fetch('./example.data.json')` → `fetch('./component-viewer-data.json')`
   - stylesheet `<link>` → `./web-design-system.min.css`

3. Start Storybook and open the preview:

   ```bash
   npm run storybook
   # open http://localhost:6006/component-viewer-preview.html
   ```

### Troubleshooting

- **Iframes empty** — confirm Storybook is running and story IDs in `example.data.json` are correct.
- **CORS errors** — ensure preview is served from the same host/port as Storybook.
- **Changes not showing** — hard-refresh or re-run the serve-preview script.

## Squiz Matrix integration

Add a ComponentViewer to a page by setting these metadata fields on a Squiz Standard Page asset:

| Field               | Notes                                 |
| ------------------- | ------------------------------------- |
| `storybookUrl`      | URL of the Storybook story (required) |
| `Introduction`      | Rich text above preview (optional)    |
| `codeExample`       | Fallback code snippet (optional)      |
| `height`            | Preview iframe height, e.g. `400px`   |
| `showCodeByDefault` | `true` / `false`                      |

The nester template at `deploy/nesters/component-viewer.html` maps these fields to the component's props.

`Introduction` is editable directly in Visual Page Builder. In editor mode, an empty `Introduction` still renders an editable target; published pages omit the empty target so it does not create a layout gap. The component root always uses the fixed `nt-component-viewer` class and does not accept additional CSS classes.

**Dependencies** — the paint layout must include:

- `head.html` nester for Prism.js CSS
- `footer-js.html` nester for `web-design-system.min.js` (includes Prism and Prettier)

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
