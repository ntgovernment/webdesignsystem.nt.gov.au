# Page Banner

Small, accessible page-banner / hero component used across NTG pages.

## Features

- Renders title, description and optional image
- Optional CTA links for Figma and Storybook
- Supports `Primary` and `Secondary` visual variants via `data-page-banner-type`
- Auto-hydrates when `#nt-page-banner-content` is present or when using `data-hydration-component="page-banner"`

## Usage (server-rendered)

Place an empty container and annotate with `data-page-banner-*` attributes:

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

## Usage (manual JS)

```js
import { PageBanner } from "@ntgovernment/web-design-system/components/PageBanner";

const el = document.getElementById("my-banner");
new PageBanner(el, { title: "Hello", description: "..." });
```

## Notes

- The component auto-initialises on DOMContentLoaded for `#nt-page-banner-content` and `[data-hydration-component="page-banner"]`.
- Styling is provided by `PageBanner.css` and is included in the unified bundle.
