<!-- markdownlint-disable MD001 MD024 -->

# PageCard Component - Complete Developer Guide

## Overview

The **PageCard** component is a responsive card grid for Squiz DXP. It renders a list of cards using the **web-design-system Card component structure** with `Cards` entries that combine `SquizLink` (destination) and `SquizImage` (image) with a required `CardTitle`.

### Key Features

✅ **Web-Design-System Integration** - Uses `.card .card--full` structure and design tokens  
✅ **Responsive Grid Layout** - Auto-fits cards to available width  
✅ **Design Token Integration** - Uses theme-specific CSS custom properties  
✅ **Vanilla JavaScript** - Zero framework dependencies, ~5KB minified  
✅ **Accessible** - WCAG AAA compliant with keyboard navigation and focus indicators  
✅ **Server/Client Hydration** - Minimal HTML from server, async client rendering  
✅ **DXP-Friendly Inputs** - Supports `SquizLink` and `SquizImage` inputs

---

## Component API

### SquizLink (PageAsset)

```typescript
interface SquizLink {
  url?: string;
  text?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
}
```

### SquizImage (CardImage)

```typescript
interface SquizImageVariation {
  url?: string;
  width?: number;
  height?: number;
  byteSize?: number;
  mimeType?: string;
  aspectRatio?: string;
  sha1Hash?: string;
}

interface SquizImage {
  name?: string;
  alt?: string;
  caption?: string;
  imageVariations?: Record<string, SquizImageVariation>;
}
```

### PageCardItem (Cards entry)

```typescript
interface PageCardItem {
  PageAsset: SquizLink;
  CardImage?: SquizImage;
  CardTitle: string;
}
```

### PageCardProps (Configuration)

```typescript
interface PageCardProps {
  Cards: PageCardItem[]; // Primary prop - recommended for new implementations
  PageArray?: PageCardItem[]; // Backward compatibility (DXP Component Service)
  pages?: PageCardItem[]; // Backward compatibility (Squiz Matrix nesters)
  title?: string; // Optional H2 title above grid (styled with --type-heading-h2-*)
  gap?: string; // CSS spacing (default: "var(--sp-md, 16px)")
  cssClass?: string; // Additional CSS classes
}
```

**Note**: The component supports multiple prop names for backward compatibility:

- **`Cards`** (recommended) - Primary, user-friendly name for content editors
- **`PageArray`** - Legacy DXP Component Service format
- **`pages`** - Legacy Squiz Matrix nester format

The component uses a fallback chain: `Cards` → `PageArray` → `pages`

---

## Card Component Structure

This component uses the **web-design-system Card component** (`.card .card--full` variant) structure. Each card renders:

```html
<!-- Optional grid title (if title prop provided) -->
<h2 class="nt-page-card__title">Page Grid Title</h2>

<!-- Card grid container -->
<div class="card-grid" style="gap: var(--sp-md);">
  <!-- Individual card (clickable link) -->
  <a class="card card--full card--clickable" href="...">
    <!-- Media section: 16:9 aspect ratio image -->
    <div class="card__media card__media--16-9">
      <img
        src="..."
        alt="..."
        style="width: 100%; height: 100%; object-fit: cover;"
      />
    </div>

    <!-- Body content -->
    <div class="card-body">
      <div class="card__body-content">
        <div class="card__body-title-wrapper">
          <h5 class="card-title">Card Title</h5>
        </div>
      </div>
    </div>
  </a>
</div>
```

### CSS Classes Used

| Class                       | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `.card`                     | Main card container                        |
| `.card--full`               | Full variant with all sections             |
| `.card--clickable`          | Interactive card (a href or button)        |
| `.card__media`              | Media/image wrapper                        |
| `.card__media--16-9`        | 16:9 aspect ratio container                |
| `.card-body`                | Body content section                       |
| `.card__body-content`       | Content wrapper with flex layout           |
| `.card__body-title-wrapper` | Title container with alignment             |
| `.card-title`               | Title heading (h5)                         |
| `.nt-page-card__title`      | Grid title heading (h2 with design tokens) |

### Design Tokens

- **Spacing**: Uses `--sp-lg`, `--sp-xl`, `--sp-xxl`, `--sp-md` from design system
- **Colors**: Uses `--clr-bg-default`, `--clr-border-subtle`, `--clr-link-default`, etc.
- **Focus State**: Uses `--shadow-focus-ntg` with `--radii-none` border-radius (NT Government theme)
- **H2 Title Styling**: Uses `--type-heading-h2-size`, `--type-heading-h2-weight`, `--type-heading-h2-lh` design tokens
- **Transitions**: Smooth 0.2s ease transitions on hover and focus

---

## DXP Manifest Notes

The Squiz Component Service expects a `mainFunction` that exists in the `functions` array. The `main` function is called at the component root, so its input should allow empty data for dev-ui.

- `mainFunction` should reference a function named `main`.
- Any object schema with `properties` must include a `required` array (use `[]` when nothing is required).
- Keep `main` input `required` empty so dev-ui can render without input.

---

## Usage

### Client-Side Hydration

```html
<div
  data-hydration-component="page-card"
  data-hydration-props='{"title":"Key Services","Cards":[...]}'
></div>

<script type="module" src="/path/to/page-card-client.js"></script>
```

### DXP Server-Side (main.js)

```javascript
render(input) {
  return input;
}
```

---

## Example Data

```json
{
  "title": "Key Services",
  "Cards": [
    {
      "PageAsset": {
        "url": "/business/licensing",
        "text": "Business Licensing",
        "target": "_self"
      },
      "CardImage": {
        "name": "Business Licensing image",
        "alt": "Business Licensing",
        "caption": "Business Licensing",
        "imageVariations": {
          "original": {
            "url": "https://nt.gov.au/images/licensing.jpg",
            "width": 640,
            "height": 360,
            "byteSize": 0,
            "mimeType": "image/jpeg",
            "aspectRatio": "16:9",
            "sha1Hash": "0000000000000000000000000000000000000000"
          }
        }
      },
      "CardTitle": "Business Licensing"
    }
  ]
}
```

---

## Integration Guides

### Squiz Matrix Integration

```html
<div
  data-hydration-component="page-card"
  data-hydration-props='{"Cards":[]}'
></div>
```

```php
<?php
$cards = array();
foreach ($children as $asset_id => $asset) {
  $cards[] = array(
    "PageAsset" => array(
      "url" => $asset->getUrl(),
      "text" => $asset->name,
      "target" => "_self"
    ),
    "CardTitle" => $asset->name
  );
}

$hydration_props = json_encode(array(
  "Cards" => $cards
));
?>
```

**Note**: Legacy implementations using `PageArray` or `pages` will continue to work.

### Custom CMS Integration

```javascript
const props = {
  Cards: data.map((page) => ({
    PageAsset: {
      url: page.url,
      text: page.title,
      target: "_self",
    },
    CardTitle: page.title,
  })),
  gap: "var(--sp-md)",
};
```

---

## Design Tokens (Quick Reference)

- `--sp-md` for grid gap
- `--clr-bg-default` for card background
- `--clr-border-subtle` for card border
- `--shadow-focus-ntg` for focus ring

---

## Troubleshooting

### dev-ui Validation Errors

1. **`mainFunction` missing or mismatched**
   - Ensure `mainFunction` points to `main` in the functions array.
2. **Missing `required` arrays on objects**
   - Each object schema with `properties` must include `required`.
3. **`main` input validation failures**
   - Keep `main` input `required` empty so dev-ui can render without input.

### Cards Not Rendering

- Confirm valid JSON in `data-hydration-props`.
- Ensure `page-card-client.js` loads before hydration.

---

## Component Files

- Component source: `PageCard.vanilla.ts`
- Styles: `PageCard.css`
- DXP entry: `dxp/main.js`
- DXP schema: `dxp/manifest.json`

---

## Delivery summary 📦

- Version: **1.0.9** — Title property added, preview simplified, footer removed from cards; merged duplicate docs and updated DXP manifest.
- Client bundle: `page-card-client.js` (~5 KB minified) — vanilla JS hydration.
- Styles bundled into `web-design-system.min.css` (deploy bundle).
- DXP preview and manifest configured with inline preview data (Title: "Key Services").

## Quick reference (developer) ⚡

File locations you’ll use most:

- `src/components/PageCard/` — component source, styles and README (single source of truth)
- `src/components/PageCard/dxp/manifest.json` — DXP schema + previews
- `src/components/PageCard/dxp/main.js` — server renderer for DXP
- `src/components/PageCard/dxp/preview.html` — dev-ui preview wrapper (`[component://output]`)
- `public/squiz/page-card.html` — Squiz Matrix nester template
- `deploy/` — generated assets (bundles & nesters) after `npm run build`

Core props / shape:

- `Cards: PageCardItem[]` — array of card items (recommended)
- `PageArray?: PageCardItem[]` — legacy prop (backward compatible)
- `pages?: PageCardItem[]` — legacy prop (backward compatible)
- `title?: string` — optional H2 grid title (uses H2 design tokens)
- `gap?: string` — CSS gap (default: `var(--sp-md)`)

Quick usage example:

```html
<div
  data-hydration-component="page-card"
  data-hydration-props='{"title":"Key Services","Cards":[...]}'
></div>
```

---

## Deployment checklist ✅

1. Run build and verify artifacts:
   - `npm run build` → check `deploy/web-design-system.min.js` and `deploy/web-design-system.min.css`
2. Verify nesters and static files in `deploy/nesters/` and `deploy/`.
3. Commit and push changes so Git File Bridge picks up `deploy/` files.
4. In Squiz Matrix, add `public/squiz/page-card.html` nester to the paint layout and include the `deploy/js` script in footer.
5. Test preview in DXP Console and dev-ui (`dxp-next cmp dev-ui`).

---

## Testing & validation checklist 🧪

- [ ] Component renders with `Cards` input in preview
- [ ] Title renders (when `title` provided) using H2 token styles
- [ ] Cards are keyboard-focusable and show focus ring (`--shadow-focus-ntg`, `--radii-none`)
- [ ] Images maintain 16:9 aspect ratio or show placeholder
- [ ] Mobile/tablet breakpoints behave as expected
- [ ] Accessibility checks: ARIA labels, contrast, reduced motion

---

## Performance & file stats 📊

- `page-card-client.js` (minified): ~5 KB
- `PageCard.css` (minified in bundle): ~8 KB
- Total bundle (approx): ~13 KB

---

## Cleanup — duplicates removed 🧹

All component-specific documentation has been consolidated into this file (`src/components/PageCard/README.md`). The following duplicate documents were removed from the repository to avoid drift:

- `PAGECARD_IMPLEMENTATION_GUIDE.md`
- `PAGECARD_QUICKREF.md`
- `PAGECARD_DELIVERY_SUMMARY.md`
- `DEPLOY_PAGECARD.md`

> If you need any of the removed files restored, they can be retrieved from the repository history.

---

### Where to look next

- Developer walkthrough: start with this README
- DXP schema / preview: `src/components/PageCard/dxp/manifest.json`
- Demo & manual tests: `src/components/PageCard/dxp/preview.html`
