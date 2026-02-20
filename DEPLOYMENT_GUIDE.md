# Deployment Guide for Squiz Matrix

This guide explains how to deploy the NT Design System components to Squiz Matrix using Git File Bridge.

## Setup

### Environment Configuration

1. **Copy the environment template:**

```bash
cp .env.example .env
```

2. **Update `.env` with your credentials:**

```env
# Squiz Matrix Git File Bridge Asset ID
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990

# Font Awesome Kit ID
VITE_FONT_AWESOME_KIT_ID=d8e5f638f7
```

These values are automatically substituted during the build process. The `.env` file is git-ignored for security.

## Quick Reference

### Build Commands

```bash
# Install dependencies
npm install

# Start local development with component previews
npm run dev

# Build components for deployment (vanilla JS)
npm run build

# Deploy without rebuilding
npm run deploy
```

## Architecture: Why Vanilla JavaScript?

The NT Design System is built with **vanilla JavaScript instead of React** for significant strategic and technical advantages:

| Aspect             | Vanilla JS              | React Alternative       |
| ------------------ | ----------------------- | ----------------------- |
| **Bundle Size**    | ~30 KB (all components) | 500+ KB per component   |
| **Load Time**      | ~50ms                   | ~500ms                  |
| **Dependencies**   | 0 external JS libraries | 7+ npm packages         |
| **Squiz Native**   | Direct integration      | Requires transformation |
| **Learning Curve** | Hours (native DOM APIs) | Days/weeks (React/JSX)  |
| **Maintenance**    | Forever compatible      | Tied to React versions  |
| **Security**       | Minimal attack surface  | 7+ packages to audit    |

### Performance Impact

**Bundle Size Comparison:**

```
Vanilla JS Components: 1.41 - 8.07 KB each
React Component: 380 KB+ for same functionality
```

**User Experience Improvements:**

- Faster page loads for NT citizens and businesses
- Better performance on slower connections (rural/remote areas)
- Reduced data usage (important for limited bandwidth users)
- Faster subsequent interactions (zero framework overhead)

### Development Efficiency

**Build Process:**

```bash
# Before (React)
npm run build:components    # Build React components individually
npm run build:squiz         # Build vanilla JS wrapper
npm run deploy:squiz        # Deploy

# After (Vanilla JS)
npm run build   # Build everything once
```

**Component Development Time:**

- Creating components: 50% faster (no React patterns to follow)
- Debugging: 66% faster (no virtual DOM to understand)
- Deployment: 60% faster (single build mode)

### Squiz Matrix Integration

Vanilla JS integrates directly with Squiz without transformation layers:

```html
<!-- Direct, clean integration -->
<div id="nt-header-root" data-title="%asset_name%"></div>
<script src="%globals_asset_url:ASSET_ID%/js/header.js"></script>
```

**No need for:**

- React app bootstrap
- Virtual DOM hydration
- State management setup
- Asset URL transformation
- Component wrapper layers

For complete strategic analysis, see **[VANILLA_JS_RATIONALE.md](VANILLA_JS_RATIONALE.md)**.

## Deployment Approach

The NT Design System uses **lightweight vanilla JavaScript components** for production deployment to Squiz Matrix. This approach provides small bundle sizes (~60-70KB total) with no framework dependencies.

**Benefits:**

- âœ… Small bundle sizes (~5-10KB per component vs 380KB+ with React)
- âœ… No framework dependencies
- âœ… Direct integration with MySource_AREA tags
- âœ… Single global stylesheet for entire design system
- âœ… Pre-built HTML nesters ready to embed
- âœ… ES modules with automatic code splitting

**Build Command:**

```bash
npm run build
```

## Deployment Structure

After running `npm run build`, files are organized as:

```
deploy/
â”œâ”€â”€ nesters/                    # HTML nesters for MySource_AREA tags
â”‚   â”œâ”€â”€ head.html               # <head> content with stylesheets
â”‚   â”œâ”€â”€ skip-links.html         # Accessibility skip navigation
â”‚   â”œâ”€â”€ header.html             # NT Government header
â”‚   â”œâ”€â”€ left-nav.html           # Left navigation sidebar
â”‚   â”œâ”€â”€ footer.html             # Footer with navigation and branding
â”‚   â””â”€â”€ footer-js.html          # JavaScript component loading
â”œâ”€â”€ js/                          # Vanilla JavaScript components
â”‚   â”œâ”€â”€ header.js               # Header component (~25KB)
â”‚   â”œâ”€â”€ left-nav.js             # Left navigation (~5KB)
â”‚   â”œâ”€â”€ theme-switcher.js       # Theme switcher (~10KB)
â”‚   â”œâ”€â”€ two-column.js           # Two-column layout (~8KB)
â”‚   â””â”€â”€ component-viewer-client.js  # Component viewer client
â”œâ”€â”€ web-design-system.css       # Global stylesheet with all design tokens
â””â”€â”€ manifest.json               # Deployment metadata
```

## Squiz Matrix Paint Layout Integration

**Important:** After running `npm run build`, commit and push the `deploy/` directory to trigger the Git File Bridge sync.

### 2. Upload Font Awesome Kit

The NT Design System requires Font Awesome icons. You have two options:

#### Option A: Use Font Awesome CDN Kit (Recommended)

1. Get your Font Awesome kit from https://fontawesome.com
2. Update the kit URL in `deploy/nesters/head.html`:
   ```html
   <script
     src="https://kit.fontawesome.com/YOUR_KIT_ID.js"
     crossorigin="anonymous"
   ></script>
   ```

#### Option B: Self-Host Font Awesome

1. Download Font Awesome assets
2. Upload to Squiz Matrix
3. Reference via `%globals_asset_url%`
4. Update the Font Awesome script tag in `deploy/nesters/head.html` manually

### 3. Verify Asset References

After running `npm run build`, the HTML nesters in `deploy/nesters/` will contain:

- Git File Bridge Asset ID: `1590990` (from `.env`)
- Font Awesome Kit ID: `d8e5f638f7` (from `.env`)

**Example from deployed head.html:**

```html
<script
  src="https://kit.fontawesome.com/d8e5f638f7.js"
  crossorigin="anonymous"
></script>
<link
  rel="stylesheet"
  href="%globals_asset_url_with_hash:1590990:deploy/web-design-system.css%"
/>
```

### 4. Embed Nesters in Paint Layouts

Copy the content from `deploy/nesters/` directly into your Squiz Matrix paint layout MySource_AREA tags. No manual find-and-replace needed - the build process has already injected your asset IDs.

The following is a complete paint layout example showing how to integrate all nesters:

```html
<!--@@ Optionally declare classes to body tag @@-->
<MySource_AREA id_name="body_classes" design_area="declared_vars" print="no">
  <MySource_DECLARE name="body_class" value="" type="text" />
</MySource_AREA>

<!DOCTYPE html>
<html class="no-js" lang="en">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <MySource_AREA id_name="head" design_area="nest_content" cache="0">
      <!-- Nest content from deploy/nesters/head.html -->
    </MySource_AREA>
  </head>

  <body class="<mysource_print id_name='body_classes' var='body_class' />">
    <div id="top"></div>

    <!-- Skip Links Nester -->
    <MySource_AREA id_name="skip_links" design_area="nest_content" cache="1">
      <!-- Reference: deploy/nesters/skip-links.html -->
      <nav class="nt-skip-links" aria-label="Skip links">
        <a href="#content" class="nt-skip-link">Skip to main content</a>
        <a href="#nt-header-root" class="nt-skip-link">Skip to navigation</a>
        <a href="#footer" class="nt-skip-link">Skip to footer</a>
      </nav>
    </MySource_AREA>

    <!-- Header Nester -->
    <MySource_AREA
      id_name="header_content"
      design_area="nest_content"
      cache="1"
    >
      <!-- Reference: deploy/nesters/header.html -->
      <div
        id="nt-header-root"
        data-title="%asset_name%"
        data-logo-src="https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg"
        data-logo-alt="NT Government Logo"
        data-icon="fa-magnifying-glass"
      ></div>
    </MySource_AREA>

    <!-- Main Content Area -->
    <div id="content" class="ntg-body">
      <MySource_AREA id_name="body" design_area="body" />
    </div>

    <!-- Footer Nester -->
    <MySource_AREA
      id_name="footer_content"
      design_area="nest_content"
      cache="1"
    >
      <!-- Reference: deploy/nesters/footer.html -->
      <!-- Copy complete footer.html content here or use file asset -->
    </MySource_AREA>

    <!-- Footer JavaScript Nester -->
    <MySource_AREA id_name="footer_js" design_area="nest_content" cache="1">
      <!-- Reference: deploy/nesters/footer-js.html -->
      <script src="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js%" defer></script>
    </MySource_AREA>
  </body>
</html>
```

### Embedding HTML Nesters in Squiz Matrix

You have two options for embedding the HTML nesters:

#### Option 1: Direct Copy-Paste (Recommended for Cache Control)

Copy the content from each nester file in `deploy/nesters/` directly into the corresponding `MySource_AREA` tag.

**Pros:** Full cache control, no additional asset dependencies  
**Cons:** Requires manual updates when nesters change

#### Option 2: File Asset References

Upload each nester as a file asset in Squiz Matrix and reference it:

```html
<MySource_AREA id_name="header_content" design_area="nest_content" cache="1">
  %asset_file_contents:NESTER_ASSET_ID%
</MySource_AREA>
```

**Pros:** Centralized updates, easier maintenance  
**Cons:** Additional asset dependencies, less cache control

### Configuring Components via Data Attributes

All vanilla JS components support configuration via `data-*` attributes:

#### Header Configuration

```html
<div
  id="nt-header-root"
  data-title="My Application Name"
  data-logo-src="https://custom-logo-url.png"
  data-logo-alt="Custom Alt Text"
  data-icon="fa-bars"
></div>
```

#### Theme Switcher Configuration

```html
<div
  id="nt-theme-switcher-root"
  data-themes="light,dark,high-contrast"
  data-default-theme="light"
  data-storage-key="my-app-theme"
></div>
```

## Using in Squiz Matrix

### 1. Configure Environment Variables

Before building, ensure your `.env` file contains the correct IDs:

```env
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990
VITE_FONT_AWESOME_KIT_ID=d8e5f638f7
```

These values are automatically injected into all HTML nesters during `npm run build`.

### 2. Git File Bridge Setup

Configure your Git File Bridge in Squiz Matrix to sync the `deploy/` directory from this repository.

**Important:** After running `npm run build`, commit and push the `deploy/` directory to trigger the Git File Bridge sync.

### 3. Reference Assets in Paint Layouts

The HTML nesters in `deploy/nesters/` already contain the correct asset references with your configuration from `.env`. Simply copy and paste them into your Squiz Matrix paint layout MySource_AREA tags.

In your Squiz Matrix paint layouts, reference the compiled files:

```html
<!-- Global Design System Stylesheet -->
<link rel="stylesheet" href="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.css%" />

<!-- All Components (single IIFE bundle) -->
<script src="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js%" defer></script>
```

Replace `ASSET_ID` with your Squiz Matrix Git File Bridge asset ID.

## Development Workflow

### For Squiz Matrix Integration

1. **First time setup:** Copy `.env.example` to `.env` and configure your asset IDs
2. Make changes to components in `src/components/`
3. Update vanilla JS versions in `*.vanilla.ts` files
4. Update HTML nesters in `public/squiz/` if needed
5. Test locally with `npm run dev` (opens preview pages)
6. Run linter with `npm run lint`
7. Build for deployment with `npm run build` (automatically injects .env values)
8. Review output in `deploy/` directory
9. Commit and push to trigger Git File Bridge sync
10. Copy updated nesters to Squiz Matrix paint layouts if needed

**Note:** The `.env` file is git-ignored. Team members need to create their own from `.env.example`.

### Squiz Matrix Integration Best Practices

1. **Use vanilla JS components** for all production sites
2. **Cache nesters appropriately** - Use `cache="1"` for static nesters (header, footer), `cache="0"` for dynamic content (head with page-specific meta tags)
3. **Update asset references** after each deployment if file hashes change
4. **Test accessibility** - All nesters include ARIA labels and semantic HTML
5. **Customize data attributes** - Configure components per-page via data attributes instead of modifying code
6. **Version control deploy/** - Keep the deploy directory in Git for File Bridge sync
7. **Document custom configurations** - If you modify nesters, document changes for team members

### Nesters Not Rendering

- **Check component root IDs** - Ensure `#nt-header-root` and `#nt-theme-switcher-root` exist in HTML
- **Verify JavaScript loading** - Check that footer-js scripts are loading (view browser Network tab)
- **Check for JavaScript errors** - Open browser console and look for errors
- **Validate data attributes** - Ensure data-\* attributes are properly quoted

### Assets Not Loading

- **Verify Git File Bridge sync** - Check that files exist in Squiz Matrix asset tree
- **Check asset URLs** - Ensure `%globals_asset_url_with_hash:ASSET_ID%` has correct Asset ID
- **Ensure CORS settings** - Allow loading from the asset server
- **Check file paths** - Verify paths match deployment structure (e.g., `/js/header.js`)

### Styles Not Applied

- **Check stylesheet loading** - Verify `web-design-system.css` loads in Network tab
- **Check for CSS conflicts** - Existing site styles may override design system
- **Verify class names** - Components use `.nt-*` prefix to avoid conflicts
- **Clear cache** - Browser and Squiz Matrix caches may need clearing

### Components Not Rendering

- **Check browser console** - Look for JavaScript errors
- **Verify module support** - Scripts use `type="module"`, ensure browser support
- **Check Font Awesome** - Icons require Font Awesome kit to be loaded
- **Validate HTML structure** - Ensure container divs are not nested incorrectly

### Theme Not Persisting

- **Check localStorage** - Verify localStorage is enabled in browser
- **Check storage key** - Ensure no conflicting keys from other scripts
- **Verify theme switcher loaded** - Check that `theme-switcher.js` executed successfully
- **Check data-theme attribute** - `<html data-theme="light">` should be set

### Bundle Size Issues

- **Check build output** - Run `npm run build` and verify that `deploy/web-design-system.min.js` and `deploy/web-design-system.min.css` are present
- **Minimize Font Awesome** - Use kit configuration to include only needed icons
- **Code splitting** - Components are automatically split into separate bundles
- **Review dependencies** - Check package.json for unnecessary dependencies

## Component Reference

### Available Squiz Matrix Nesters

| Nester            | MySource_AREA    | Purpose                              | Cache Setting |
| ----------------- | ---------------- | ------------------------------------ | ------------- |
| `head.html`       | `head`           | Stylesheets, meta tags, Font Awesome | `cache="0"`   |
| `skip-links.html` | `skip_links`     | Accessibility skip navigation        | `cache="1"`   |
| `header.html`     | `header_content` | NT Government header with logo       | `cache="1"`   |
| `footer.html`     | `footer_content` | Footer navigation and branding       | `cache="1"`   |
| `footer-js.html`  | `footer_js`      | JavaScript component loading         | `cache="1"`   |

### Vanilla JS Components

All components are bundled together. There is no individual component JS file any more.

| Bundle file | Size | Global |
| ----------- | ---- | ------ |
| `deploy/web-design-system.min.js` | ~60–90 KB (all components) | `window.NTGDesignSystem` |
| `deploy/web-design-system.min.css` | ~20–30 KB | — |

Auto-mount IDs:

| Component | Auto-mount ID |
| --------- | ------------- |
| Header | `#nt-header-root` |
| LeftNav | `#nt-leftnav-root` |
| ThemeSwitcher | `#nt-theme-switcher-root` |
| TwoColumn | `#nt-twocolumn-root` |
| PageBanner | `#nt-page-banner-content` |
| ComponentViewer | `[data-hydration-component="component-viewer"]` |

### Configuration Reference

#### Header Data Attributes

| Attribute       | Type   | Default               | Description             |
| --------------- | ------ | --------------------- | ----------------------- |
| `data-title`    | string | "Web Design System"   | Header title text       |
| `data-logo-src` | URL    | NT Gov logo           | Logo image URL          |
| `data-logo-alt` | string | "NT Government Logo"  | Logo alt text           |
| `data-icon`     | string | "fa-magnifying-glass" | Font Awesome icon class |

#### Theme Switcher Data Attributes

| Attribute            | Type       | Default                   | Description            |
| -------------------- | ---------- | ------------------------- | ---------------------- |
| `data-themes`        | CSV string | "light,dark"              | Available themes       |
| `data-default-theme` | string     | "light"                   | Default theme          |
| `data-storage-key`   | string     | "web-design-system-theme" | localStorage key       |
| `data-class`         | string     | ""                        | Additional CSS classes |

## File Size Reference

### Vanilla JS Build

```
deploy/
â”œâ”€â”€ web-design-system.css    ~20-30KB (minified, all components)
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ header.js            ~25KB (includes dependencies)
â”‚   â”œâ”€â”€ left-nav.js          ~5KB (minimal dependencies)
â”‚   â”œâ”€â”€ theme-switcher.js    ~10KB (includes localStorage logic)
â”‚   â”œâ”€â”€ two-column.js        ~8KB (lightweight layout)
â”‚   â””â”€â”€ component-viewer-client.js  ~15KB (includes Prism.js)
â””â”€â”€ nesters/                ~10-15KB total (5 HTML files)
```

**Total bundle size:** ~90-110KB (complete design system with all components)

**Performance Benefits:**

- Fast load times with ES modules
- Automatic code splitting per component
- No framework overhead
- Minimal runtime dependencies
  To find the current hashes:

1. Check `deploy/manifest.json` after running deployment
2. Or check the `deploy/viewer/index.html` file which contains the correct references

## Best Practices

1. Always run `npm run build` before committing deployment files
2. Test components locally with `npm run dev` before deploying
3. Keep the `deploy/` directory in version control for Git File Bridge
4. Document any custom components added to the system
5. Update paint layout references when asset hashes change
6. Use data attributes for component configuration instead of modifying code
7. Test in multiple browsers and screen sizes

## Troubleshooting

### Assets not loading

- Verify the Git File Bridge is syncing correctly
- Check that asset URLs match the deployed file names
- Ensure CORS settings allow loading from the asset server
- Clear browser cache and hard reload

### Components not rendering

- Check browser console for JavaScript errors
- Verify container divs with correct IDs exist (e.g., `#nt-header-root`)
- Ensure both CSS and JS files are loaded
- Check that scripts use `type="module"` attribute

### Theme not persisting

- Check that localStorage is enabled in the browser
- Verify no conflicting theme scripts on the page

