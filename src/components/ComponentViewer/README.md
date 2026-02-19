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

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storybookUrl` | string | `/storybook/iframe.html` | Base URL for Storybook iframe |
| `storyId` | string | `components-button--primary` | Storybook story ID |
| `height` | string | `200px` | Preview height |
| `initialZoom` | number | `1.0` | Starting zoom level |
| `showCodeByDefault` | boolean | `false` | Whether code panel is visible |

## How it works

1. `main.js` renders initial HTML structure with `data-component-viewer` attributes.
2. The client bundle (`component-viewer-client.js`) hydrates each instance and provides UI controls.
3. Extracts iframe contents from Storybook and applies syntax highlighting (Prism) and formatting (Prettier).

## Local Preview

Run a static server and open `dxp/preview.html` to test examples and behaviors.

## Usage (DXP)

```html
%dxp_component:{"id":"component-viewer","props":{"storyId":"components-button--primary","height":"300px","showCodeByDefault":true}}%
```
