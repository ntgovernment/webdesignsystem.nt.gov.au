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
| `Introduction`      | FormattedText       | —       | no       | Rich text displayed above the preview. Rendered as raw HTML (supports lists, links, etc.).                                                                               |
| `codeExample`       | string (multi-line) | —       | no       | Plain-text code snippet shown in the code panel. If empty, the client attempts to extract code from the iframe document.                                                 |
| `height`            | string              | `400px` | no       | Height of the preview iframe.                                                                                                                                            |
| `showCodeByDefault` | boolean             | `false` | no       | Opens the code panel on load.                                                                                                                                            |
| `cssClass`          | string              | —       | no       | Additional CSS classes on the root element.                                                                                                                              |

### Server-side-only props (not in manifest)

These are hardcoded defaults in `main.js` and not exposed to editors:

| Property      | Default | Description                    |
| ------------- | ------- | ------------------------------ |
| `initialZoom` | `1.0`   | Starting zoom level.           |
| `enableCopy`  | `true`  | Show copy-to-clipboard button. |
| `enableZoom`  | `true`  | Show zoom controls.            |

## How it works

1. `main.js` renders the static HTML shell with `data-component-viewer` attributes and embeds the `storybookUrl` in the iframe `src`.
2. On page load, `ComponentViewer.vanilla.ts` hydrates each instance:
   - Calls `positionActionButtons()` to place the action bar at the correct vertical offset.
   - Calls `updateOpenTabButton()` to replace the default icon and label with the Storybook SVG and "Open in Storybook" text.
   - Attaches zoom/copy/code-toggle button event listeners.
   - If no `codeExample` was provided, waits for the iframe to load and extracts rendered HTML from the iframe document.
3. Extracted code is formatted with **Prettier** and highlighted with **Prism.js**.
4. The code panel has a `600px` max-height with `overflow-y: auto` and slim (6px) scrollbars.

### storybookUrl conversion

`main.js` automatically converts Storybook URL patterns to iframe format:

- `?path=/story/components-button--primary` → `iframe.html?id=components-button--primary`
- `?path=/docs/components-button--primary` → `iframe.html?id=components-button--primary&viewMode=docs`

## Button Positioning Architecture

The action toolbar (Copy, Show/Hide Code, Open in Storybook) must remain stationary when the code panel opens and closes. This is achieved with a combination of CSS and a small JS calculation at init time.

**Layout rules:**

- `.component-viewer__code` stays in **normal document flow** — it expands via `max-height` animation and pushes content below it downwards. It has `position: relative` to serve as a positioning context for the action bar.
- `.component-viewer__actions` is `position: absolute` with `left: 0; right: 0` and a transparent background. Its `top` is **not set in CSS** — it is calculated by JS.

**JS positioning (`positionActionButtons`):**

```typescript
private positionActionButtons(): void {
  const preview = this.container.querySelector(".component-viewer__preview") as HTMLElement;
  const actionsContainer = this.container.querySelector(".component-viewer__actions") as HTMLElement;
  if (!preview || !actionsContainer) return;

  const previewHeightPx = parseInt(preview.style.height || "200px", 10);
  actionsContainer.style.top = `${previewHeightPx + 64}px`;
}
```

The `+ 64` offset accounts for the `toolbar` bar at the bottom of the preview area (zoom controls, refresh, etc.). This keeps the action bar visually aligned with the exact boundary between the preview and the code panel, regardless of the configured `height` prop.

**Why `position: relative` on the code panel, not the root container?**  
The code panel is in document flow — when hidden it has `max-height: 0` and when shown it expands. Placed as a child of `.component-viewer__code` (which has `position: relative`), the absolutely-positioned action bar sits at the top of the dark code block, covered by `64px` of top padding in the code panel so code text never renders underneath the buttons.

## CSS Notes

### Code panel top padding

`.component-viewer__code` has `padding-top: 64px` (both in collapsed and expanded states). This prevents the first line of code from being obscured by the absolutely-positioned action toolbar that overlaps the top of the code panel.

### Show Code button fixed width

`.component-viewer__actions .component-viewer__button:nth-child(2)` is set to `width: 128px`. This keeps the button the same size when the label changes between "See code" and "Hide code", avoiding layout shifts in the action bar.

### Scrollbars

Both vertical (code panel) and horizontal (code line overflow) scrollbars use slim styling to avoid competing visually with the code content:

```css
/* Applied to .component-viewer__code (vertical) and .component-viewer__code-content (horizontal) */
scrollbar-width: thin;
scrollbar-color: rgba(255, 255, 255, 0.35) transparent;

&::-webkit-scrollbar { width: 6px; height: 6px; }
&::-webkit-scrollbar-track { background: transparent; }
&::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.35); border-radius: 999px; }
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

**Dependencies** — the paint layout must include:

- `head.html` nester for Prism.js CSS
- `footer-js.html` nester for `web-design-system.min.js` (includes Prism and Prettier)

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
