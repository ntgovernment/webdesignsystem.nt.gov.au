# ComponentViewer - DXP Component Service

Interactive component preview with code display, zoom controls, and Storybook integration for Squiz DXP Component Service.

## Overview

ComponentViewer enables public documentation sites to showcase design system components with live, interactive previews. It uses a hybrid architecture:

- **Server-side rendering** (edge): Generates HTML structure via `main.js`
- **Client-side hydration**: Global JavaScript bundle handles interactivity (zoom, code extraction, syntax highlighting)

## Files

- **manifest.json** - Component metadata and input schema
- **main.js** - Server-side renderer (ES module export)
- **example.data.json** - Sample configurations for local testing
- **preview.html** - Local development preview environment

## Configuration

### Input Properties

| Property            | Type    | Default                      | Description                              |
| ------------------- | ------- | ---------------------------- | ---------------------------------------- |
| `storybookUrl`      | string  | `/storybook/iframe.html`     | Base URL for Storybook iframe            |
| `storyId`           | string  | `components-button--primary` | Storybook story ID (required)            |
| `codeExample`       | text    | ``                           | Fallback code if iframe extraction fails |
| `height`            | string  | `200px`                      | CSS height for preview area              |
| `initialZoom`       | number  | `1.0`                        | Starting zoom level (0.5 - 2.0)          |
| `showCodeByDefault` | boolean | `false`                      | Whether code panel is visible initially  |
| `enableCopy`        | boolean | `true`                       | Show copy-to-clipboard button            |
| `enableZoom`        | boolean | `true`                       | Show zoom controls                       |
| `cssClass`          | string  | ``                           | Additional CSS class for container       |

## Local Preview

1. **Start a local server** (required for ES module imports):

   ```bash
   npx serve deploy/dxp-components/component-viewer
   ```

2. **Open preview.html** in browser:

   ```
   http://localhost:3000/preview.html
   ```

3. **Test examples**:
   - Basic - Simple component preview
   - With Code - Code panel visible by default
   - Custom Zoom - Initial zoom at 1.5x
   - Minimal - No copy/zoom controls

## Squiz DXP Integration

### Option A: DXP Component Service (Recommended)

```html
<!-- In Squiz paint layout -->
%dxp_component:{ "id": "component-viewer", "props": { "storyId":
"components-button--primary", "height": "300px", "showCodeByDefault": true } }%
```

### Option B: HTML Nester (Fallback)

Use server-rendered output from `main.js` in Squiz Matrix nester template with metadata replacement.

## Dependencies

The following must be loaded in the page `<head>`:

- **Prism.js** (syntax highlighting):

  ```html
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-okaidia.min.css"
  />
  <script
    src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/prism.min.js"
    defer
  ></script>
  <script
    src="https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-markup.min.js"
    defer
  ></script>
  ```

- **Prettier** (code formatting):

  ```html
  <script
    src="https://cdn.jsdelivr.net/npm/prettier@3.8.1/standalone.js"
    defer
  ></script>
  <script
    src="https://cdn.jsdelivr.net/npm/prettier@3.8.1/plugins/html.js"
    defer
  ></script>
  ```

- **Font Awesome** (icons):

  ```html
  <script
    src="https://kit.fontawesome.com/YOUR_KIT_ID.js"
    crossorigin="anonymous"
  ></script>
  ```

- **Global client bundle**:
  ```html
  <script
    src="%globals_asset_url_with_hash:ASSET_ID:deploy/js/component-viewer-client.js%"
    defer
  ></script>
  ```

## How It Works

1. **Server renders** HTML structure with `data-component-viewer` attribute
2. **Browser loads** `component-viewer-client.js` (once per page)
3. **Auto-detection** finds all `[data-component-viewer]` elements
4. **Hydration** creates `ComponentViewerClient` instance for each component
5. **Event listeners** handle zoom, copy, code toggle
6. **Iframe extraction** pulls HTML from Storybook iframe
7. **Syntax highlighting** applies Prism.js formatting
8. **Code formatting** uses Prettier for clean output

## Architecture

```
┌─────────────────────────────────────────┐
│   Server (Edge)                         │
│   main.js renders HTML structure        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Browser (Client)                      │
│                                         │
│   1. component-viewer-client.js loads  │
│   2. Auto-detects [data-component-      │
│      viewer] elements                   │
│   3. Creates ComponentViewerClient      │
│      instance per element               │
│   4. Handles interactivity:             │
│      - Zoom controls                    │
│      - Code extraction from iframe      │
│      - Syntax highlighting (Prism)      │
│      - Code formatting (Prettier)       │
│      - Copy to clipboard               │
└─────────────────────────────────────────┘
```

## Development

The React version remains at `src/components/ComponentViewer/` for internal development and the component viewer application.

## Version History

- **1.0.0** - Initial DXP Component Service implementation
