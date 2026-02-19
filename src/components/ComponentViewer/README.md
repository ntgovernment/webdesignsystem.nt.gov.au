# ComponentViewer

Interactive component preview with code display, zoom controls, and Storybook integration.

## Overview

ComponentViewer enables documentation sites to showcase design system components with live, interactive previews. It uses a hybrid architecture: server-side rendering for static structure and client-side hydration for interactivity (zoom, code extraction, syntax highlighting).

## Files

- `manifest.json` — Component metadata and input schema
- `main.js` — Server-side renderer
- `preview.html` — Local development preview
- `ComponentViewer.vanilla.ts` — Client hydration for demos

## Props

| Property            | Type          | Default                      | Description                                                                        |
| ------------------- | ------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `storybookUrl`      | string        | `/storybook/iframe.html`     | Base URL for Storybook iframe                                                      |
| `Introduction`      | FormattedText | —                            | Optional introduction text above preview. Supports rich formatting (lists, links). |
| `storyId`           | string        | `components-button--primary` | Storybook story ID                                                                 |
| `height`            | string        | `200px`                      | Preview height                                                                     |
| `initialZoom`       | number        | `1.0`                        | Starting zoom level                                                                |
| `showCodeByDefault` | boolean       | `false`                      | Whether code panel is visible                                                      |

## How it works

1. `main.js` renders initial HTML structure with `data-component-viewer` attributes.
2. The client bundle (`component-viewer-client.js`) hydrates each instance and provides UI controls.
3. Extracts iframe contents from Storybook and applies syntax highlighting (Prism) and formatting (Prettier).

## Local Preview (development)

This project includes a self-contained `dxp/preview.html` used to test the ComponentViewer examples locally. The full setup and recommended workflow are copied here from the component's previous `dxp/PREVIEW-SETUP.md` so the README is the single source of truth.

### Quick start

- Windows
  ```bash
  .\deploy\dxp-components\component-viewer\serve-preview.bat
  ```
- Mac / Linux
  ```bash
  bash deploy/dxp-components/component-viewer/serve-preview.sh
  ```

The script copies the preview files into your Storybook project's `./.storybook/public/` directory so the preview runs on the same origin as Storybook (prevents CORS and enables iframe content extraction).

### Manual setup

1. Copy files into your Storybook project `./.storybook/public/`:

   ```bash
   copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\preview.html .storybook\public\component-viewer-preview.html
   copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\main.js .storybook\public\component-viewer-main.js
   copy ..\webdesignsystem.nt.gov.au\deploy\dxp-components\component-viewer\example.data.json .storybook\public\component-viewer-data.json
   copy ..\webdesignsystem.nt.gov.au\deploy\web-design-system.css .storybook\public\
   ```

2. Edit the copied `component-viewer-preview.html` to update import and asset paths:
   - `import render from './main.js'` → `import render from './component-viewer-main.js'`
   - `fetch('./example.data.json')` → `fetch('./component-viewer-data.json')`
   - stylesheet `<link>` paths → `./web-design-system.css`

3. Start Storybook and open the preview page:

   ```bash
   npm run storybook
   # then open http://localhost:6006/component-viewer-preview.html
   ```

### Why serve from the same origin?

- No CORS errors — iframe content is accessible.
- Code extraction from Storybook works reliably (necessary for `See code` feature).
- Live reloading works during development.

### Troubleshooting

- Iframes empty: confirm Storybook is running and story IDs in `example.data.json` are correct.
- CORS errors: ensure preview is served from the same host/port as Storybook.
- Changes not showing: hard-refresh or verify the preview files were copied to Storybook's `public/` folder.

### Development workflow

1. Make changes to files in `src/components/ComponentViewer/`.
2. Run the preview setup script (or copy files manually) into your Storybook project.
3. Refresh the preview page.
4. Repeat.

### Production / DXP notes

- The DXP `manifest.json` controls which inputs are exposed to Squiz Matrix editors. Some runtime defaults (e.g., `initialZoom`, `enableCopy`, `enableZoom`) are provided by the server-side renderer and are not exposed in the manifest.

- `codeExample` is a `FormattedText` field with `format: "multi-line"` (textarea / WYSIWYG in the DXP UI).

- Spacing above the action buttons was reduced to the `--sp-xxs` token (4px) to match updated design tokens.

#### Squiz Nester / DXP Nester (usage & dependencies)

This component includes a Nester template used by Squiz Matrix. The Nester provides server-side rendering and maps Squiz metadata fields to the component's attributes.

USAGE:
1. Create a Standard Page asset in Squiz Matrix.
2. Add the following metadata fields to the asset (examples / defaults shown where applicable):
   - `storybookUrl` (default: `/storybook/iframe.html`)
   - `storyId` (required, e.g. `components-button--primary`)
   - `Introduction` (optional — supports rich FormattedText/WYSIWYG)
   - `codeExample` (optional fallback code)
   - `height` (default: `200px`)
   - `initialZoom` (default: `1.0`)
   - `showCodeByDefault` (boolean)
   - `enableCopy` (boolean, default: `true`)
   - `enableZoom` (boolean, default: `true`)
3. Use the nester in your paint layout to render the component server-side.

DEPENDENCIES:
- `head.html` or equivalent must include Prism.js CSS for syntax highlighting.
- `footer-js.html` (or your page footer) must include the client script (`component-viewer-client.js`) plus Prism.js and Prettier if you rely on client-side code extraction/formatting.

NESTER TEMPLATE LOCATION:
- `deploy/nesters/component-viewer.html` (this file is deprecated in the repo once README is the single source of truth)

> Note: the Manifest exposes the inputs editors should use — the nester maps metadata keys to those props when rendering in Squiz.

---

## Usage (DXP)

```html
%dxp_component:{"id":"component-viewer","props":{"storyId":"components-button--primary","height":"300px","showCodeByDefault":true}}%
```
