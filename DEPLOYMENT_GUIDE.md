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

# Start local development
npm run dev

# Build component viewer
npm run build

# Build individual components (React-based)
npm run build:components

# Build Squiz Matrix nesters (Vanilla JS - Recommended)
npm run build:squiz

# Prepare for Squiz deployment (legacy)
npm run deploy:squiz
```

## Deployment Options

The NT Design System supports two deployment modes:

### 1. **Squiz Matrix HTML Nesters (Recommended)**

Lightweight vanilla JavaScript components designed for direct embedding in Squiz Matrix paint layouts. This is the recommended approach for production sites.

**Benefits:**

- ✅ Small bundle sizes (~30KB JS per component vs 380KB React)
- ✅ No React dependency
- ✅ Direct integration with MySource_AREA tags
- ✅ Single global stylesheet for entire design system
- ✅ Pre-built HTML nesters ready to embed

**Build Command:**

```bash
npm run build:squiz
```

### 2. **React Component Viewer**

Interactive component gallery for testing and documentation. Useful for development but not recommended for production integration.

**Build Command:**

```bash
npm run build
```

## Deployment Structure

After running `npm run build:squiz`, files are organized as:

```
deploy/
├── nesters/                    # HTML nesters for MySource_AREA tags
│   ├── head.html               # <head> content with stylesheets
│   ├── skip-links.html         # Accessibility skip navigation
│   ├── header.html             # NT Government header
│   ├── footer.html             # Footer with navigation and branding
│   └── footer-js.html          # JavaScript component loading
├── js/                          # Vanilla JavaScript components
│   ├── header.js               # Header component (~25KB)
│   └── theme-switcher.js       # Theme switcher (~10KB)
├── ntg-design-system.css       # Global stylesheet with all design tokens
├── components/                  # Legacy React components
├── viewer/                      # Component viewer app
└── manifest.json               # Deployment metadata
```

## Squiz Matrix Paint Layout Integration

**Important:** After running `npm run build:squiz`, commit and push the `deploy/` directory to trigger the Git File Bridge sync.

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

After running `npm run build:squiz`, the HTML nesters in `deploy/nesters/` will contain:

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
  href="%globals_asset_url_with_hash:1590990:deploy/ntg-design-system.css%"
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
      <script
        src="%globals_asset_url_with_hash:ASSET_ID:deploy/js/header.js%"
        defer
      ></script>
      <script
        src="%globals_asset_url_with_hash:ASSET_ID:deploy/js/theme-switcher.js%"
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

These values are automatically injected into all HTML nesters during `npm run build:squiz`.

### 2. Git File Bridge Setup

Configure your Git File Bridge in Squiz Matrix to sync the `deploy/` directory from this repository.

**Important:** After running `npm run build:squiz`, commit and push the `deploy/` directory to trigger the Git File Bridge sync.

### 3. Reference Assets in Paint Layouts

The HTML nesters in `deploy/nesters/` already contain the correct asset references with your configuration from `.env`. Simply copy and paste them into your Squiz Matrix paint layout MySource_AREA tags.

In your Squiz Matrix paint layouts, reference the compiled files:

```html
<!-- Component Viewer Application -->
<link
  rel="stylesheet"
  href="%globals_asset_url_with_hash:ASSET_ID%/assets/index-[hash].css"
/>
<script
  type="module"
  src="%globals_asset_url_with_hash:ASSET_ID%/assets/index-[hash].js"
></script>

<!-- Container for the app -->
<div id="root"></div>
```

Replace `ASSET_ID` with your Squiz Matrix asset ID and `[hash]` with the actual hash from the build.

### 3. Component Usage

The component viewer provides an interactive way to browse and test all available components:

- **Two Column Component** - Responsive layout that stacks on mobile

### For Squiz Matrix Integration

1. **First time setup:** Copy `.env.example` to `.env` and configure your asset IDs
2. Make changes to components in `src/components/`
3. Update vanilla JS versions in `*.vanilla.ts` files if needed
4. Update HTML nesters in `public/squiz/` if needed
5. Test locally with `npm run dev`
6. Run linter with `npm run lint`
7. Build Squiz nesters with `npm run build:squiz` (automatically injects .env values)
8. Review output in `deploy/nesters/` directory
9. Commit and push to trigger Git File Bridge sync
10. Copy updated nesters to Squiz Matrix paint layouts if needed

**Note:** The `.env` file is git-ignored. Team members need to create their own from `.env.example`.

### For Component Viewer Development

1. Make changes to React components in `src/components/`
2. Test with `npm run dev`
3. Run linter with `npm run lint`
4. Build with `npm run build`
5. Deploy viewer with `npm run deploy:squiz`
6. Commit and push to trigger Git File Bridge sync

### Squiz Matrix Integration

1. **Always use the vanilla JS build** (`npm run build:squiz`) for production sites
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

- **Check stylesheet loading** - Verify `ntg-design-system.css` loads in Network tab
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

- **Use vanilla JS build** - Avoid using React components in production
- **Check build output** - Run `npm run build:squiz` and verify file sizes in `deploy/`
- **Minimize Font Awesome** - Use kit configuration to include only needed icons
- **Code splitting** - For custom components, consider lazy loading

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

| Component      | File                   | Size  | Auto-Mount ID             |
| -------------- | ---------------------- | ----- | ------------------------- |
| Header         | `js/header.js`         | ~25KB | `#nt-header-root`         |
| Theme Switcher | `js/theme-switcher.js` | ~10KB | `#nt-theme-switcher-root` |

### Configuration Reference

#### Header Data Attributes

| Attribute       | Type   | Default               | Description             |
| --------------- | ------ | --------------------- | ----------------------- |
| `data-title`    | string | "Web Design System"   | Header title text       |
| `data-logo-src` | URL    | NT Gov logo           | Logo image URL          |
| `data-logo-alt` | string | "NT Government Logo"  | Logo alt text           |
| `data-icon`     | string | "fa-magnifying-glass" | Font Awesome icon class |

#### Theme Switcher Data Attributes

| Attribute            | Type       | Default                  | Description            |
| -------------------- | ---------- | ------------------------ | ---------------------- |
| `data-themes`        | CSV string | "light,dark"             | Available themes       |
| `data-default-theme` | string     | "light"                  | Default theme          |
| `data-storage-key`   | string     | "nt-design-system-theme" | localStorage key       |
| `data-class`         | string     | ""                       | Additional CSS classes |

## File Size Reference

### Vanilla JS Build (Squiz Mode)

```
deploy/
├── ntg-design-system.css    ~20-30KB (minified, all components)
├── js/
│   ├── header.js            ~25KB (includes dependencies)
│   └── theme-switcher.js    ~10KB (includes dependencies)
└── nesters/                5 HTML files, <5KB total
```

**Total bundle size:** ~60-70KB (complete design system)

### React Build (Legacy Component Mode)

```
deploy/components/
├── header/
│   ├── header.js            ~380KB (includes React runtime)
│   └── header.css           ~5KB
```

**Note:** React build is ~5-6x larger and not recommended for production.
To find the current hashes:

1. Check `deploy/manifest.json` after running deployment
2. Or check the `deploy/viewer/index.html` file which contains the correct references

## Best Practices

1. Always run `npm run deploy:squiz` before committing deployment files
2. Test the component viewer locally before deploying
3. Keep the `deploy/` directory in version control for Git File Bridge
4. Document any custom components added to the system
5. Update paint layout references when asset hashes change

## Troubleshooting

### Assets not loading

- Verify the Git File Bridge is syncing correctly
- Check that asset URLs match the deployed file names
- Ensure CORS settings allow loading from the asset server

### Components not rendering

- Check browser console for JavaScript errors
- Verify the `#root` div exists in your HTML
- Ensure both CSS and JS files are loaded

### Theme not persisting

- Check that localStorage is enabled in the browser
- Verify no conflicting theme scripts on the page
