<!-- markdownlint-disable MD001 MD024 -->

# PageCard Component - Complete Developer Guide

## Overview

The **PageCard** component is a responsive card grid for Squiz DXP. It renders a list of cards using `PageArray` entries that combine `SquizLink` (destination) and `SquizImage` (image) with a required `CardTitle`.

### Key Features

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

### PageCardItem (PageArray entry)

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
  PageArray: PageCardItem[];
  gap?: string; // CSS spacing (default: "var(--sp-md, 16px)")
  cssClass?: string; // Additional CSS classes
}
```

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
  data-hydration-props='{"PageArray":[...]}'
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
  "PageArray": [
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
  data-hydration-props='{"PageArray":[]}'
></div>
```

```php
<?php
$pageArray = array();
foreach ($children as $asset_id => $asset) {
  $pageArray[] = array(
    "PageAsset" => array(
      "url" => $asset->getUrl(),
      "text" => $asset->name,
      "target" => "_self"
    ),
    "CardTitle" => $asset->name
  );
}

$hydration_props = json_encode(array(
  "PageArray" => $pageArray
));
?>
```

### Custom CMS Integration

```javascript
const props = {
  PageArray: data.map((page) => ({
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
