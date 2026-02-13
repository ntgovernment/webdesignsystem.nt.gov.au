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
- Placement: the banner container must be placed *outside* and immediately above the page `#content` element so it visually spans from the right edge of the left navigation to the right page edge.

  Example placement:

  ```html
  <main class="nt-main-content">
    <div id="nt-page-banner-content" data-page-banner-title="..." data-page-banner-description="..." ...></div>
    <div id="content">…</div>
  </main>
  ```

- Icons & CTAs: the component renders inline SVG icons for the Figma and Storybook CTAs. SVGs use `currentColor` so they match the CTA text colour.
- Hover behaviour: Figma/Storybook CTA hover colour remains the same as the default (no colour shift); hover only adds an underline for affordance.
- Accessibility: SVG icons are marked `aria-hidden="true"` and `focusable="false"` to avoid redundant announcements; the CTA anchors remain keyboard-focusable and include `rel="noopener noreferrer" target="_blank"` when URLs are present.

