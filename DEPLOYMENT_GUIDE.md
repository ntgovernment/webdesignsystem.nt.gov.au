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
ASSET_ID=1590990

# Backward-compatible alias (optional)
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990

# Font Awesome Kit ID for https://cmsexternal.nt.gov.au URLs
VITE_FONT_AWESOME_KIT_ID=41b791824a
```

These values are automatically substituted during the build process. The `.env` file is git-ignored for security.
`ASSET_ID` is used first when both asset variables are present.

If `VITE_FONT_AWESOME_KIT_ID` is not set, the deploy script falls back to `41b791824a` so `YOUR_KIT_ID` is never emitted in `deploy/nesters/head.html`.

## Quick Reference

### Build Commands

```bash
# Install dependencies
npm install

# Start local development with component previews
npm run dev

# Build all components for deployment
npm run build

# Run deploy script without rebuilding
npm run deploy
```

> 📌 **Note:** For detailed usage, configuration options, data-attribute documentation, and examples for each component, see the README in the corresponding directory under `src/components/<Component>/README.md`.

## Architecture: Why Vanilla JavaScript?

For the full strategic rationale behind the vanilla JS approach, see **[VANILLA_JS_RATIONALE.md](VANILLA_JS_RATIONALE.md)**.

**Summary:** components ship as a single ~30 KB IIFE bundle compared to 500 KB+ when using React, with zero external dependencies and native Squiz Matrix integration.

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
├── web-design-system.min.js    # Single IIFE bundle (NTGDesignSystem global, all components)
├── web-design-system.min.css   # All component styles + design tokens
├── external-tokens/            # Individual token CSS files
├── nesters/                    # HTML nesters for MySource_AREA tags
│   ├── head.html               # <head> content with stylesheets
│   ├── skip-links.html         # Accessibility skip navigation
│   ├── header.html             # NT Government header
│   ├── left-nav.html           # Left navigation sidebar
│   ├── footer.html             # Footer with navigation and branding
│   └── footer-js.html          # JavaScript component loading
└── manifest.json               # Deployment metadata
```

## Squiz Matrix Paint Layout Integration

**Important:** After running `npm run build`, commit and push the `deploy/` directory to trigger the Git File Bridge sync.

### 2. Upload Font Awesome Kit

The NT Design System requires Font Awesome icons. You have two options:

#### Option A: Use Font Awesome CDN Kit (Recommended)

1. Get your Font Awesome kit from https://fontawesome.com
2. For pages served from URLs starting with `https://cmsexternal.nt.gov.au`, use this script in `deploy/nesters/head.html`:
   ```html
   <script
     src="https://kit.fontawesome.com/41b791824a.js"
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
- Font Awesome Kit ID: `41b791824a` (from `.env`, used for `https://cmsexternal.nt.gov.au` URLs)

**Example from deployed head.html:**

```html
<script
  src="https://kit.fontawesome.com/41b791824a.js"
  crossorigin="anonymous"
></script>
<link
  rel="stylesheet"
  href="%globals_asset_url_with_hash:1590990:deploy/web-design-system.css%"
/>
```

### 3.1 Troubleshooting 403 From Font Awesome

If browser console shows:

```text
GET https://kit.fontawesome.com/YOUR_KIT_ID.js 403 (Forbidden)
```

then your Matrix head content is still using an old nester output. Run `npm run deploy` (or `npm run build`), commit `deploy/nesters/head.html`, and push to trigger Git File Bridge sync.

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
      <script
        src="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js%"
        defer
      ></script>
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

<!-- Component configuration examples have been removed from this guide. Refer to the individual component README files under `src/components/<Component>/README.md` for up‑to‑date usage and data‑attribute documentation. -->

## Using in Squiz Matrix

### 1. Configure Environment Variables

Before building, ensure your `.env` file contains the correct IDs:

```env
ASSET_ID=1590990
VITE_SQUIZ_GIT_BRIDGE_ASSET_ID=1590990
VITE_FONT_AWESOME_KIT_ID=41b791824a
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
<link
  rel="stylesheet"
  href="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.css%"
/>

<!-- All Components (single IIFE bundle) -->
<script
  src="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js%"
  defer
></script>
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
- **Check file paths** - Verify paths match deployment structure (e.g., `deploy/web-design-system.min.js`)

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

### Card Images or Icons Missing

- **Confirm Card toggles are enabled** - Verify both `showImage` and/or `showIcon` are enabled on the Card instance
- **Verify destination metadata values** - Ensure linked assets include `content-cardTitle`, `content-cardImagePhoto`, and `content-cardIcon` as needed
- **Check Content API session auth** - Card media lookup requires session-based Content API access in DXP
- **Use the live Card preview** - Run `dxp-next cmp dev-ui src/components/Card/dxp` and open `resolved-asset-cards` to validate resolver behavior with bare links
- **Expect graceful fallback** - If metadata cannot be resolved, cards intentionally render title-only rather than failing the component

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

Detailed, component‑specific documentation (props, configuration, API, examples, tokens, accessibility, etc.) is maintained inside each component directory. Please consult the README in `src/components/<Component>/README.md` for the latest information.

The remainder of this guide focuses on Squiz Matrix deployment and global setup; it does not duplicate component API details.

### Available Squiz Matrix Nesters

| Nester            | MySource_AREA    | Purpose                              | Cache Setting |
| ----------------- | ---------------- | ------------------------------------ | ------------- |
| `head.html`       | `head`           | Stylesheets, meta tags, Font Awesome | `cache="0"`   |
| `skip-links.html` | `skip_links`     | Accessibility skip navigation        | `cache="1"`   |
| `header.html`     | `header_content` | NT Government header with logo       | `cache="1"`   |
| `footer.html`     | `footer_content` | Footer navigation and branding       | `cache="1"`   |
| `footer-js.html`  | `footer_js`      | JavaScript component loading         | `cache="1"`   |

### Tab Marker Transformer

The footer-js nester includes automatic initialization of the Tab Marker Transformer, which converts simple `<hr><p>Title</p><hr>` patterns into interactive DXP-formatted tabs.

**What it does:**

- Scans the page container (default: `#content`) for HR/paragraph/HR patterns
- Transforms these patterns into clickable tab navigation
- Automatically hides/shows content sections based on active tab
- Only renders navigation if 2+ tabs are detected

**Content author workflow (WYSIWYG):**

1. Insert Horizontal Rule (Insert > Horizontal Rule)
2. Add paragraph with tab title text (e.g., "Overview")
3. Insert another Horizontal Rule
4. Add empty paragraph
5. Add tab content below
6. Repeat for each additional tab

**Example HTML pattern:**

```html
<div id="content" class="ntg-body">
  <!-- Tab 1 -->
  <hr />
  <p>Overview</p>
  <hr />
  <p></p>
  <h2>Overview Section</h2>
  <p>Content for overview...</p>

  <!-- Tab 2 -->
  <hr />
  <p>Usage</p>
  <hr />
  <p></p>
  <h2>Usage Guidelines</h2>
  <p>Content for usage...</p>
</div>
```

**Benefits:**

- No HTML knowledge required for content authors
- Works with standard WYSIWYG editor tools
- Automatically styled with DXP-compliant inline styles
- Full theming support via CSS custom properties

For complete documentation including technical details, styling, and troubleshooting, see [src/components/Tab/README.md](src/components/Tab/README.md#tab-marker-transformer-dxp-format).

## Bundle Size Reference

```
deploy/
├── web-design-system.min.js    ~30 KB   (all components, single IIFE)
├── web-design-system.min.css   ~20 KB   (all styles + tokens)
└── nesters/                     ~10 KB   (5 HTML files)
```

**Total:** ~60 KB for the complete design system (uncompressed). Gzip reduces this significantly on the wire.

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
