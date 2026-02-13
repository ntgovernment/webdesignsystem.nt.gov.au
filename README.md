# NT Design System

Documentation website and component library for the Northern Territory Government design system.

This repository hosts vanilla JavaScript components and compiled CSS files for deployment to Squiz Matrix via Git File Bridge, along with preview pages for local development and testing.

## 🚀 Quick Start

### Installation

```bash
npm install
```

**Note**: This project depends on external design tokens from a private GitHub repository (`@ntgovernment/web-design-system`). Ensure you have GitHub authentication configured. See the [🎨 Design Tokens Integration](#-design-tokens-integration) section for setup instructions.

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

1. Bundle all vanilla JS components into a single IIFE bundle
2. Extract CSS stylesheets into a single file
3. Copy files to `deploy/` directory
4. Create deployment manifest
5. Copy external design tokens to deployment

### Deployment to Squiz DXP

The build process automatically prepares files for Squiz DXP deployment. After building, commit and push the `deploy/` directory to trigger Git File Bridge sync.

The deployment structure:

```
deploy/
├── nesters/                        # HTML templates for Squiz Matrix
│   ├── header.html
│   ├── left-nav.html
│   ├── skip-links.html
│   ├── footer.html
│   └── head.html
├── external-tokens/                # External design system tokens
├── web-design-system.min.js        # All components (IIFE global)
├── web-design-system.min.css       # All styles
└── manifest.json                   # Deployment metadata
```

## 📦 Components

### Page Banner Component

A hero banner component for page introductions with optional Figma and Storybook CTAs.

**HTML Usage:**

```html
<div
  id="nt-page-banner-content"
  data-page-banner-title="Page title"
  data-page-banner-description="Short description"
  data-page-banner-type="Primary"
  data-page-banner-image="https://.../image.jpg"
  data-page-banner-figma-url="https://..."
  data-page-banner-storybook-url="https://..."
></div>
```

**Configuration:**

- `data-page-banner-title`: Banner title text
- `data-page-banner-description`: Description text
- `data-page-banner-type`: Visual variant ('Primary' or 'Secondary', default: 'Primary')
- `data-page-banner-image`: Optional image URL
- `data-page-banner-figma-url`: Optional Figma link (shows icon + link)
- `data-page-banner-storybook-url`: Optional Storybook link (shows icon + link)

**Features:**

- Auto-hydrates on page load
- Inline SVG icons with currentColor for theming
- Content-driven height (auto-adjusts)
- Accessible CTAs with proper ARIA attributes
- Must be placed outside `#content` element

See [src/components/PageBanner/README.md](src/components/PageBanner/README.md) for detailed documentation.

### Two Column Component

A responsive two-column layout that automatically stacks on mobile devices.

**HTML Usage:**

```html
<div
  class="nt-two-column"
  style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem"
>
  <div class="nt-two-column__left">
    <!-- Left content -->
  </div>
  <div class="nt-two-column__right">
    <!-- Right content -->
  </div>
</div>
```

**Configuration (via CSS custom properties):**

- Use standard CSS Grid properties: `grid-template-columns`, `gap`, etc.
- Automatically stacks to single column on mobile (≤ 768px)

### Theme Switcher Component

A component that allows users to switch between light and dark themes.

**HTML Usage:**

```html
<div
  id="nt-theme-switcher-root"
  data-themes="light,dark"
  data-default-theme="light"
></div>
```

The global `NTGDesignSystem` object will auto-initialize this component on page load.

**Configuration:**

- `data-themes`: Comma-separated list of theme options (default: 'light,dark')
- `data-default-theme`: Initial theme (default: 'light')
- `data-class`: Additional CSS classes

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

**Behavior note:**

- Parent items with children now act as regular landing-page links while a JS-inserted chevron (toggle) controls submenu expand/collapse. This avoids server-side conditionals — the vanilla component enhances plain HTML on init (`convertParentLinksWithChildren()`).

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
<link
  rel="stylesheet"
  href="%globals_asset_url:XXXXX%/web-design-system.min.css"
/>

<!-- All Components (IIFE Bundle) -->
<script src="%globals_asset_url:XXXXX%/web-design-system.min.js"></script>

<!-- Components auto-initialize via NTGDesignSystem global -->
<script>
  document.addEventListener("DOMContentLoaded", function () {
    // All components are already initialized
    // Access via window.NTGDesignSystem if needed
  });
</script>
```

Replace `XXXXX` with your Squiz Matrix Git File Bridge asset ID.

### Component Auto-Initialization

Once the bundle is loaded, components auto-initialize by looking for specific element IDs and data attributes:

- `#nt-header-root` → Header component
- `#nt-leftnav-root` → Left navigation component
- `#nt-theme-switcher-root` → Theme switcher component
- `[data-hydration-component="component-viewer"]` → Component viewer

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
- **External Design Tokens** - Shared tokens from @ntgovernment/web-design-system

## 🎨 Design Tokens Integration

This project integrates CSS design tokens from the centralized NT Government Web Design System repository:

- **Source Repository**: [ntgovernment/web-design-system](https://github.com/ntgovernment/web-design-system)
- **Package**: `@ntgovernment/web-design-system`
- **Token Files**: base-variables.css, common.css, grid.css, typography.css, theme-ntg.css

### Setup External Tokens

The external design system tokens are referenced in [src/tokens.css](src/tokens.css). To enable them:

**Option A: NPM Package (Recommended)**

Requires GitHub authentication for private repository access:

```bash
# Install dependencies (includes external design system)
npm install

# Tokens will be available at:
# node_modules/@ntgovernment/web-design-system/src/themes/
```

**Option B: Manual Sync**

Copy CSS files manually from the external repository:

```bash
# Clone external design system repository
git clone https://github.com/ntgovernment/web-design-system.git ../temp-design-system

# Copy theme files to local directory
cp ../temp-design-system/src/themes/*.css ./src/external-tokens/

# Uncomment imports in src/tokens.css
# Clean up
rm -rf ../temp-design-system
```

**Configure GitHub Authentication**

For npm install to work with private GitHub repositories, ensure Git credential manager is configured:

```bash
# Check current git credential helper
git config --get credential.helper

# Should return: manager (on Windows) or osxkeychain (on macOS)

# If not set, configure it:
git config --global credential.helper manager  # Windows
git config --global credential.helper osxkeychain  # macOS
```

### Token Architecture

1. **External tokens** (from @ntgovernment/web-design-system) provide the foundation
2. **Local tokens** (in src/tokens.css) override or extend external tokens
3. **CSS cascade** ensures local customizations take precedence

See [src/external-tokens/README.md](src/external-tokens/README.md) for detailed documentation.

## 🎯 Why Vanilla JavaScript?

This design system uses **vanilla JavaScript instead of React** for strategic reasons:

### Performance

- **92% smaller bundle size** (30 KB vs 500+ KB with React)
- **10x faster initial load time** (50ms vs 500ms)
- Zero framework overhead or virtual DOM reconciliation
- Better performance on slower connections typical in rural NT

### Simplicity

- No framework concepts to learn (hooks, lifecycle, context, etc.)
- Direct DOM manipulation is transparent and easy to debug
- Easier onboarding for new NT Government team members
- Simpler build process with fewer configuration options

### Squiz Matrix Native Integration

- Components embed directly with `<div id="nt-*-root">` elements
- Configuration via standard HTML data attributes
- Works seamlessly with Squiz's MySource_AREA tags
- No React hydration conflicts or workarounds needed

### Independence & Maintenance

- No reliance on React version updates or breaking changes
- Can maintain and update indefinitely without external dependencies
- Smaller security attack surface (7 fewer npm packages)
- Components remain compatible with future browsers

### Cost Savings

- Reduced dependency auditing and security updates
- Faster development and simpler maintenance
- Lower infrastructure costs from smaller builds
- No framework training costs for developers

**For a complete analysis and strategic rationale, see [VANILLA_JS_RATIONALE.md](VANILLA_JS_RATIONALE.md).**

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
