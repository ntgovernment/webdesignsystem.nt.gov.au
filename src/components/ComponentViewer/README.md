# ComponentViewer

Interactive component preview with live iframe, code extraction, syntax highlighting, zoom controls, and Storybook integration.

## Overview

ComponentViewer embeds a Storybook story in an iframe alongside a code panel. It uses a hybrid architecture: `main.js` (server-side) renders the static HTML structure; `ComponentViewer.vanilla.ts` (client-side) hydrates it with zoom/copy controls and extracts + formats code from the iframe document.

## Files

| File | Role |
| ---- | ---- |
| `dxp/manifest.json` | DXP schema + input definitions |
| `dxp/main.js` | Server-side renderer |
| `dxp/preview.html` | DXP dev-ui preview wrapper |
| `dxp/example.data.json` | Example props for local preview |
| `dxp/serve-preview.bat` / `.sh` | Copy preview files into a running Storybook |
| `ComponentViewer.vanilla.ts` | Client-side hydration (zoom, copy, code extraction) |

## DXP Props

These props are defined in `manifest.json` and are exposed to Squiz Matrix editors:

| Property | Type | Default | Required | Description |
| -------- | ---- | ------- | -------- | ----------- |
| `storybookUrl` | string | — | **yes** | Full URL to the Storybook story for the iframe. Accepts `?path=/docs/` and `?path=/story/` patterns — `main.js` converts them to `iframe.html?id=` format automatically. |
| `Introduction` | FormattedText | — | no | Rich text displayed above the preview. Rendered as raw HTML (supports lists, links, etc.). |
| `codeExample` | string (multi-line) | — | no | Plain-text code snippet shown in the code panel. If empty, the client attempts to extract code from the iframe document. |
| `height` | string | `400px` | no | Height of the preview iframe. |
| `showCodeByDefault` | boolean | `false` | no | Opens the code panel on load. |
| `cssClass` | string | — | no | Additional CSS classes on the root element. |

### Server-side-only props (not in manifest)

These are hardcoded defaults in `main.js` and not exposed to editors:

| Property | Default | Description |
| -------- | ------- | ----------- |
| `initialZoom` | `1.0` | Starting zoom level. |
| `enableCopy` | `true` | Show copy-to-clipboard button. |
| `enableZoom` | `true` | Show zoom controls. |

## How it works

1. `main.js` renders the static HTML shell with `data-component-viewer` attributes and embeds the `storybookUrl` in the iframe `src`.
2. On page load, `ComponentViewer.vanilla.ts` hydrates each instance: attaches zoom/copy button handlers and — if no `codeExample` was provided — extracts rendered HTML from the iframe document.
3. Extracted code is formatted with **Prettier** and highlighted with **Prism.js**.
4. The code panel has a `600px` max-height with `overflow-y: auto`.

### storybookUrl conversion

`main.js` automatically converts Storybook URL patterns to iframe format:

- `?path=/story/components-button--primary` → `iframe.html?id=components-button--primary`
- `?path=/docs/components-button--primary` → `iframe.html?id=components-button--primary&viewMode=docs`

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

| Field | Notes |
| ----- | ----- |
| `storybookUrl` | URL of the Storybook story (required) |
| `Introduction` | Rich text above preview (optional) |
| `codeExample` | Fallback code snippet (optional) |
| `height` | Preview iframe height, e.g. `400px` |
| `showCodeByDefault` | `true` / `false` |

The nester template at `deploy/nesters/component-viewer.html` maps these fields to the component's props.

**Dependencies** — the paint layout must include:
- `head.html` nester for Prism.js CSS
- `footer-js.html` nester for `web-design-system.min.js` (includes Prism and Prettier)

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
