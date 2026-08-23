# Squiz Matrix HTML Nesters

This directory contains HTML nesters designed for direct embedding in Squiz Matrix paint layouts.

## Nesters Overview

| File              | Purpose                                  | MySource_AREA    | Cache       |
| ----------------- | ---------------------------------------- | ---------------- | ----------- |
| `head.html`       | Stylesheets, meta tags, Font Awesome kit | `head`           | `cache="0"` |
| `skip-links.html` | Accessibility skip navigation            | `skip_links`     | `cache="1"` |
| `header.html`     | NT Government header with logo           | `header_content` | `cache="1"` |
| `footer.html`     | Footer navigation and branding           | `footer_content` | `cache="1"` |
| `footer-js.html`  | JavaScript component loading             | `footer_js`      | `cache="1"` |

## Usage

### Build and Deploy

```bash
# Build nesters and all components
npm run build
```

This copies all nesters to `deploy/nesters/` along with the vanilla JS components and global stylesheet.

### Embedding in Squiz Matrix

Set `ASSET_ID=1590990` in your `.env` (or `VITE_SQUIZ_GIT_BRIDGE_ASSET_ID` as a backward-compatible alias) before running `npm run build`.

1. **Copy nester content** directly into MySource_AREA tags in your paint layout
2. **Or upload as file assets** and reference with `%asset_file_contents:ASSET_ID%`
3. **Update asset references** - Replace `ASSET_ID` with your Git File Bridge asset ID
4. **Configure Font Awesome** - For pages under `https://cmsexternal.nt.gov.au`, set `VITE_FONT_AWESOME_KIT_ID=41b791824a` and run `npm run build` to inject it into `head.html` (fallback is also `41b791824a` if the variable is missing)

### Example Paint Layout Structure

```html
<MySource_AREA id_name="head" design_area="nest_content" cache="0">
  <!-- Copy head.html content here -->
</MySource_AREA>

<MySource_AREA id_name="skip_links" design_area="nest_content" cache="1">
  <!-- Copy skip-links.html content here -->
</MySource_AREA>

<MySource_AREA id_name="header_content" design_area="nest_content" cache="1">
  <!-- Copy header.html content here -->
</MySource_AREA>

<MySource_AREA id_name="body" design_area="body" />

<MySource_AREA id_name="footer_content" design_area="nest_content" cache="1">
  <!-- Copy footer.html content here -->
</MySource_AREA>

<MySource_AREA id_name="footer_js" design_area="nest_content" cache="1">
  <!-- Copy footer-js.html content here -->
</MySource_AREA>
```

## Customization

Each nester can be customized by editing the HTML files in this directory. After making changes:

1. Run `npm run build` to rebuild
2. Update the corresponding MySource_AREA in your paint layout
3. Commit and push to trigger Git File Bridge sync

## Documentation

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete Squiz Matrix integration documentation.
For component-specific usage, data attributes, and examples, use each component's README under `src/components/<Component>/README.md`.
