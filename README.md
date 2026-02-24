# NT Government Web Design System

Component library for the Northern Territory Government, deployed to Squiz Matrix via Git File Bridge.

All components compile to a single **IIFE bundle** (`NTGDesignSystem`) with no framework dependencies. Two component types:

| Type           | Description                                                       | Deployment                         |
| -------------- | ----------------------------------------------------------------- | ---------------------------------- |
| **Vanilla JS** | Client-side, data-attribute driven, auto-initializes on page load | `deploy/web-design-system.min.js`  |
| **DXP Edge**   | Server-side rendered via Squiz DXP Component Services             | Deployed via `dxp-next cmp deploy` |

## Quick Start

```bash
npm install
npm run dev      # Dev server at http://localhost:5173/preview/
npm run build    # Build bundle and prepare deployment files
```

## Components

> **Note:** Global CSS now includes explicit `:visited` rules for banner CTAs, left-nav links, and footer links. These are added in `src/index.css` to ensure the browser’s default purple colour never appears on visited links when component styles load late.

### Vanilla JS Components

Auto-initialized from element IDs or data attributes on `DOMContentLoaded`:

| Component         | Mount point                                                 | README                                 |
| ----------------- | ----------------------------------------------------------- | -------------------------------------- |
| **Header**        | `#nt-header-root`                                           | src/components/Header/README.md        |
| **LeftNav**       | `#nt-leftnav-root`                                          | src/components/LeftNav/README.md       |
| **ThemeSwitcher** | `#nt-theme-switcher-root`                                   | src/components/ThemeSwitcher/README.md |
| **TwoColumn**     | `#nt-twocolumn-root`                                        | src/components/TwoColumn/README.md     |
| **PageBanner**    | `#nt-page-banner-content`                                   | src/components/PageBanner/README.md    |
| **Tab**           | auto-initialized via data attributes (`data-tab-container`) | src/components/Tab/README.md           |

### DXP Edge Components

Server-rendered components deployed independently via `dxp-next`. Each has `dxp/manifest.json` (schema) and `dxp/main.js` (server-side renderer):

| Component                 | DXP name                             | README                                   |
| ------------------------- | ------------------------------------ | ---------------------------------------- |
| **ColorSwatch**           | `web-design-system/color-swatch`     | src/components/ColorSwatch/README.md     |
| **ComponentViewer**       | `web-design-system/component-viewer` | src/components/ComponentViewer/README.md |
| **MiniPageCard**          | `web-design-system/mini-page-card`   | src/components/MiniPageCard/README.md    |
| **Notification**          | `web-design-system/notification`     | src/components/Notification/README.md    |
| **PageCard**              | `web-design-system/page-card`        | src/components/PageCard/README.md        |
| **PageTile**              | `web-design-system/page-tile`        | src/components/PageTile/README.md        |
| **ThemeSwitcher** _(DXP)_ | `web-design-system/theme-switcher`   | src/components/ThemeSwitcher/README.md   |
| **Tab** _(DXP)_           | `web-design-system/tab`              | src/components/Tab/README.md             |
| **TwoColumn** _(DXP)_     | `web-design-system/two-column`       | src/components/TwoColumn/README.md       |

## Project Structure

```
.
├── src/
│   ├── components/
│   │   └── ComponentName/
│   │       ├── ComponentName.vanilla.ts   # Client-side class
│   │       ├── ComponentName.css          # Styles
│   │       ├── index.ts                   # Exports
│   │       ├── README.md                  # Documentation
│   │       └── dxp/                       # DXP edge components only
│   │           ├── manifest.json          # DXP schema + metadata
│   │           ├── main.js                # Server-side renderer
│   │           └── preview.html           # DXP dev-ui preview wrapper
│   ├── external-tokens/                   # CSS design tokens (committed)
│   ├── dxp-schemas/                       # JSON schemas for manifest validation
│   ├── web-design-system.ts               # Bundle entry (imports all components)
│   ├── web-design-system.css              # Stylesheet entry
│   └── tokens.css                         # Design token imports
├── public/squiz/                          # HTML nester source templates (pre-build)
├── preview/                               # Local dev preview pages
├── scripts/
│   └── deploy-squiz.js                    # Post-build deployment script
├── deploy/                                # Build output (committed for Git File Bridge)
│   ├── web-design-system.min.js           # IIFE bundle (NTGDesignSystem global)
│   ├── web-design-system.min.css          # All component styles
│   ├── external-tokens/                   # Token CSS files
│   ├── nesters/                           # Processed HTML templates (asset IDs injected)
│   └── manifest.json                      # Deployment metadata
├── vite.config.ts
└── package.json
```

## Build & Deployment

### Environment Setup

Create `.env` from the example (git-ignored):

```env
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990
VITE_FONT_AWESOME_KIT_ID=d8e5f638f7
```

### Build

```bash
npm run build
```

Runs `vite build` then `scripts/deploy-squiz.js`:

1. Bundles all components → `deploy/web-design-system.min.js` + `.min.css`
2. Processes HTML nesters (injects Asset ID from `.env`) → `deploy/nesters/`
3. Copies design token CSS → `deploy/external-tokens/`
4. Writes `deploy/manifest.json`

Commit and push `deploy/` — Git File Bridge syncs it to Squiz Matrix automatically.

### DXP Edge Components

Deployed separately via the Squiz DXP CLI:

```bash
dxp-next auth login --tenant ntgov-4670
dxp-next cmp deploy src/components/ComponentViewer/dxp
dxp-next cmp dev-ui src/components/ComponentViewer/dxp   # Local dev preview
```

## Squiz Matrix Integration

Include the bundle in your paint layout (nesters handle this automatically):

```html
<link rel=stylesheet href=%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.css% />

<script src=%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js% defer></script>
```

All components auto-initialize on `DOMContentLoaded`. Use pre-built nesters from `deploy/nesters/` for Squiz Matrix `MySource_AREA` content.

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete integration instructions.

## Design Tokens

CSS custom properties sourced from `src/external-tokens/` (committed from [ntgovernment/web-design-system](https://github.com/ntgovernment/web-design-system)). Local overrides live in `src/tokens.css`. The build copies token files to `deploy/external-tokens/`.

See [src/external-tokens/README.md](src/external-tokens/README.md) for token reference and update process.

## Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Dev server at `http://localhost:5173/preview/` |
| `npm run build`   | Build bundle + run deploy script               |
| `npm run deploy`  | Run deploy script without rebuilding           |
| `npm run lint`    | ESLint                                         |
| `npm run preview` | Preview built output                           |

## Tech Stack

- **Vite** — build tool (IIFE, single JS + CSS output)
- **TypeScript** — type safety (compiled by Vite, no separate tsc emit)
- **Vanilla JavaScript** — zero framework dependency; see [VANILLA_JS_RATIONALE.md](VANILLA_JS_RATIONALE.md)
- **Squiz DXP CLI** — edge component deployment (`dxp-next`)
- **ESLint** — code linting

## Contributing

See each component's `README.md` for component-specific guidelines and versioning policy.

Northern Territory Government
