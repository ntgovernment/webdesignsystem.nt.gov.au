# NT Design System

Documentation website and component library for the Northern Territory Government design system.

This repository hosts vanilla JavaScript components and compiled CSS files for deployment to Squiz Matrix via Git File Bridge, along with preview pages for local development and testing.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

View component previews locally:

```bash
npm run dev
```

This will start a development server at `http://localhost:5173/preview/` where you can view and test all components.

### Building

Build components for deployment:

```bash
npm run build
```

This will:

1. Compile vanilla JS components
2. Generate CSS stylesheets
3. Copy files to `deploy/` directory
4. Create deployment manifest

### Deployment to Squiz DXP

The build process automatically prepares files for Squiz DXP deployment. After building, commit and push the `deploy/` directory to trigger Git File Bridge sync.

The deployment structure:

```
deploy/
├── js/                      # Vanilla JS components
│   ├── header.js
│   ├── left-nav.js
│   ├── theme-switcher.js
│   ├── two-column.js
│   └── component-viewer-client.js
├── nesters/                 # HTML templates for Squiz Matrix
├── ntg-design-system.css    # Global stylesheet
└── manifest.json            # Deployment metadata
```

## 📦 Components

### Two Column Component

A responsive two-column layout that automatically stacks on mobile devices.

**Vanilla JS Usage:**

```html
<div
  id="nt-twocolumn-root"
  data-left-width="2fr"
  data-right-width="1fr"
  data-gap="2rem"
></div>

<script type="module" src="%globals_asset_url:XXXXX%/js/two-column.js"></script>
```

**Manual Initialization:**

```javascript
import { TwoColumnComponent } from "./path/to/TwoColumn.vanilla.js";

const container = document.getElementById("my-container");
new TwoColumnComponent(container, {
  leftContent: "<div>Left content</div>",
  rightContent: "<div>Right content</div>",
  leftWidth: "2fr",
  rightWidth: "1fr",
  gap: "2rem",
});
```

**Configuration:**

- `data-left-content` / `leftContent`: HTML content for the left column
- `data-right-content` / `rightContent`: HTML content for the right column
- `data-left-width` / `leftWidth`: CSS grid width for left column (default: '1fr')
- `data-right-width` / `rightWidth`: CSS grid width for right column (default: '1fr')
- `data-gap` / `gap`: Gap between columns (default: '2rem')
- `data-class` / `className`: Additional CSS classes

### Theme Switcher Component

A component that allows users to switch between light and dark themes with localStorage persistence.

**Vanilla JS Usage:**

```html
<div
  id="nt-theme-switcher-root"
  data-themes="light,dark"
  data-default-theme="light"
></div>

<script
  type="module"
  src="%globals_asset_url:XXXXX%/js/theme-switcher.js"
></script>
```

**Manual Initialization:**

```javascript
import { ThemeSwitcherComponent } from "./path/to/ThemeSwitcher.vanilla.js";

const container = document.getElementById("my-container");
new ThemeSwitcherComponent(container, {
  themes: ["light", "dark"],
  defaultTheme: "light",
  storageKey: "web-design-system-theme",
});
```

**Configuration:**

- `data-themes` / `themes`: Comma-separated list of theme options (default: 'light,dark')
- `data-default-theme` / `defaultTheme`: Initial theme (default: 'light')
- `data-storage-key` / `storageKey`: localStorage key for persistence
- `data-class` / `className`: Additional CSS classes

### Left Navigation Component

A responsive left navigation sidebar with 2-level collapsible menu. Features auto-expansion of sections containing the active page and mobile drawer functionality.

**Vanilla JS Usage:**

```html
<!-- Include in Squiz nester -->
<div id="nt-leftnav-root" data-default-expanded="foundations">
  <nav class="nt-leftnav" aria-label="Main navigation">
    <ul class="nt-leftnav__list">
      <li class="nt-leftnav__item">
        <a href="#home" class="nt-leftnav__link" aria-current="page">
          <span>Home</span>
        </a>
      </li>
      <!-- Collapsible section -->
      <li class="nt-leftnav__item">
        <button
          class="nt-leftnav__toggle"
          aria-expanded="false"
          aria-controls="submenu-foundations"
        >
          <span>Foundations</span>
          <div class="nt-leftnav__chevron">
            <i class="fa-light fa-chevron-right"></i>
          </div>
        </button>
        <ul id="submenu-foundations" class="nt-leftnav__submenu">
          <li class="nt-leftnav__item">
            <a href="#colour" class="nt-leftnav__link">
              <span>Colour</span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</div>

<script src="%globals_asset_url:XXXXX%/js/left-nav.js"></script>
```

**Configuration:**

- `data-default-expanded`: Comma-separated list of section IDs to expand
- `data-mobile-breakpoint`: Mobile breakpoint in pixels (default: 768)
- `data-nav-items`: JSON string of navigation items (alternative to HTML markup)

**Features:**

- Auto-expands sections containing active page (via `aria-current="page"`)
- Mobile drawer with overlay backdrop
- Keyboard navigation (Enter, Space, Escape)
- Smooth expand/collapse animations
- ARIA compliant for accessibility

### Header Component

The NT Government header with logo and navigation elements.

**Vanilla JS Usage:**

```html
<div
  id="nt-header-root"
  data-title="NT Design System"
  data-logo-src="%globals_asset_url:XXXXX%/logo.svg"
  data-logo-alt="NT Government"
></div>

<script type="module" src="%globals_asset_url:XXXXX%/js/header.js"></script>
```

**Configuration:**

- `data-title`: Header title text
- `data-logo-src`: Logo image URL
- `data-logo-alt`: Logo alt text for accessibility

## 🎨 Using with Squiz Matrix

### Referencing in Paint Layouts

After deploying via Git File Bridge, reference the compiled assets in your Squiz Matrix paint layouts:

```html
<!-- Global Stylesheet -->
<link rel="stylesheet" href="%globals_asset_url:XXXXX%/ntg-design-system.css" />

<!-- Vanilla JS Components -->
<script type="module" src="%globals_asset_url:XXXXX%/js/header.js"></script>
<script
  type="module"
  src="%globals_asset_url:XXXXX%/js/theme-switcher.js"
></script>
<script type="module" src="%globals_asset_url:XXXXX%/js/left-nav.js"></script>
<script type="module" src="%globals_asset_url:XXXXX%/js/two-column.js"></script>
```

Replace `XXXXX` with your Squiz Matrix Git File Bridge asset ID.

### Using HTML Nesters

The `deploy/nesters/` directory contains ready-to-use HTML templates with MySource_AREA tags for easy integration in Squiz Matrix:

- `header.html` - NT Government header
- `left-nav.html` - Left navigation sidebar
- `skip-links.html` - Accessibility skip links
- `footer.html` - Page footer
- `head.html` - Common `<head>` elements

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed integration instructions.

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Vanilla JavaScript** - No framework dependencies
- **ESLint** - Code linting

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── Header/              # Header component
│   │   │   ├── Header.vanilla.ts
│   │   │   ├── Header.css
│   │   │   └── index.ts
│   │   ├── LeftNav/             # Left navigation
│   │   │   ├── LeftNav.vanilla.ts
│   │   │   ├── LeftNav.css
│   │   │   └── index.ts
│   │   ├── ThemeSwitcher/       # Theme switcher
│   │   │   ├── ThemeSwitcher.vanilla.ts
│   │   │   ├── ThemeSwitcher.css
│   │   │   └── index.ts
│   │   ├── TwoColumn/           # Two-column layout
│   │   │   ├── TwoColumn.vanilla.ts
│   │   │   ├── TwoColumn.css
│   │   │   └── index.ts
│   │   └── ComponentViewer/     # Component viewer client
│   │       ├── ComponentViewer.vanilla.ts
│   │       └── index.ts
│   ├── global-styles.ts         # Global stylesheet imports
│   ├── tokens.css               # Design tokens
│   └── ntg-design-system.css    # Main stylesheet
├── preview/                     # Development preview pages
│   ├── index.html               # Preview landing page
│   ├── header.html
│   ├── left-nav.html
│   ├── theme-switcher.html
│   └── two-column.html
├── public/
│   └── squiz/                   # HTML nester templates (source)
├── scripts/
│   └── deploy-squiz.js          # Deployment script
├── deploy/                      # Deployment output (committed to git)
│   ├── js/                      # Compiled components
│   ├── nesters/                 # HTML templates
│   ├── ntg-design-system.css    # Global stylesheet
│   └── manifest.json            # Deployment metadata
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=your_asset_id
VITE_FONT_AWESOME_KIT_ID=your_kit_id
```

- `VITE_SQUIZ_GIT_BRIDGE_ASSET_ID` - Squiz Matrix Git File Bridge asset ID
- `VITE_FONT_AWESOME_KIT_ID` - Font Awesome kit ID (for icon support)
- `SQUIZ_DEPLOY_PATH` - Custom deployment path (default: `./deploy`)

### Vite Configuration

The `vite.config.ts` builds vanilla JS components as ES modules with automatic code splitting and CSS extraction.

## 📝 Scripts

- `npm run dev` - Start development server with component previews
- `npm run build` - Build components and prepare deployment
- `npm run lint` - Run ESLint
- `npm run preview` - Preview built components
- `npm run deploy` - Copy built files to deploy directory (without rebuilding)

## 📄 License

Northern Territory Government

## 🤝 Contributing

This repository is managed by the Northern Territory Government. For contributions or issues, please contact the design system team.
