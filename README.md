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

#### Tab Marker Transformer

The bundle also includes `window.transformTabMarkers()`, a helper function that converts simple `<hr><p>Title</p><hr>` patterns into DXP-formatted tabs. This is automatically called by the footer-js nester for containers with `id="content"`.

**Use case:** Squiz Matrix WYSIWYG editors where content authors create tabs using horizontal rules instead of custom data-attributes.

See [src/components/Tab/README.md](src/components/Tab/README.md#tab-marker-transformer-dxp-format) for complete documentation.

### DXP Edge Components

Server-rendered components deployed independently via `dxp-next`. Each has `dxp/manifest.json` (schema) and `dxp/main.js` (server-side renderer):

| Component                 | DXP name                             | README                                   |
| ------------------------- | ------------------------------------ | ---------------------------------------- |
| **Card**                  | `web-design-system/card`             | src/components/Card/README.md            |
| **ColorSwatch**           | `web-design-system/color-swatch`     | src/components/ColorSwatch/README.md     |
| **ComponentViewer**       | `web-design-system/component-viewer` | src/components/ComponentViewer/README.md |
| **MiniPageCard** _(deprecated)_ | `web-design-system/mini-page-card` | src/components/MiniPageCard/README.md |
| **Notification**          | `web-design-system/notification`     | src/components/Notification/README.md    |
| **PageCard** _(deprecated)_ | `web-design-system/page-card`      | src/components/PageCard/README.md        |
| **PageTile**              | `web-design-system/page-tile`        | src/components/PageTile/README.md        |
| **ThemeSwitcher** _(DXP)_ | `web-design-system/theme-switcher`   | src/components/ThemeSwitcher/README.md   |
| **Tab** _(DXP)_           | `web-design-system/tab`              | src/components/Tab/README.md             |
| **TwoColumn** _(DXP)_     | `web-design-system/two-column`       | src/components/TwoColumn/README.md       |

#### Card

`Card` is the preferred replacement for `PageCard` and `MiniPageCard`. It uses one repeatable, fully optional `Cards` collection and independent `showImage` and `showIcon` quick options:

- Image and Icon can be enabled separately, together, or both disabled.
- Enabled media is populated from `content-cardImagePhoto` and `content-cardIcon`; titles use `content-cardTitle`.

Visual Page Builder provides TinyMCE inline editing for FormattedText Content and inline editing for card destinations. Card titles and media are fetched from destination asset metadata by the DXP edge renderer, so editors do not specify them separately. All Card fields are optional, allowing blank or partially configured components to be saved.

Content values are rendered as trusted FormattedText HTML from Squiz, so rich text such as paragraphs, lists, links, and emphasis appears as authored in TinyMCE.

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
ASSET_ID=1590990
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990
VITE_FONT_AWESOME_KIT_ID=41b791824a
```

`ASSET_ID` is the preferred variable for the Git File Bridge asset; `VITE_SQUIZ_GIT_BRIDGE_ASSET_ID` remains as a backward-compatible alias.

Use this Font Awesome kit value for pages served from URLs starting with `https://cmsexternal.nt.gov.au`.
If `VITE_FONT_AWESOME_KIT_ID` is omitted, deployment falls back to `41b791824a`.

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

# Card component
dxp-next cmp deploy src/components/Card/dxp
dxp-next cmp dev-ui src/components/Card/dxp
```

The Card dev UI includes `image-cards`, `icon-cards`, `image-icon-cards`, `text-only-cards`, and `resolved-asset-cards` previews. The `resolved-asset-cards` preview intentionally uses bare destination links (no embedded metadata) to validate live metadata lookup. CLI 5.29.1 supports `ui:metadata.inlineEditable`; it does not support `previewPlaceholder`.

Card edge renderer media resolution uses Squiz late-bound utility functions (`resolveMatrixAssetByUrl` and `resolveUri`) and requires session-based Content API access. If destination metadata cannot be resolved, cards continue to render title-only.

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

## Table Component Styles

**Added:** February 2026

Table component styles have been imported from `@ntgovernment/web-design-system` and are available via the `.content-table__*` class namespace:

```html
<table class="table table-striped table-hover content-table__table">
  <caption class="content-table__caption">
    Table description
  </caption>
  <thead>
    <tr>
      <th>
        <div class="content-table__header">
          <span>Column Name</span>
          <div class="content-table__sort">
            <i class="fa-solid fa-caret-up content-table__sort-icon"></i>
            <i class="fa-solid fa-caret-down content-table__sort-icon"></i>
          </div>
        </div>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

**Features:**

- Striped rows (`.table-striped`)
- Hover states (`.table-hover`)
- Sortable headers with indicators
- Accessible caption styling
- Responsive and design token-driven

**Documentation:** [src/external-tokens/table.css](src/external-tokens/table.css)  
**Demo:** [preview/table.html](preview/table.html)

Table styles are automatically bundled in `deploy/web-design-system.min.css`.

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
