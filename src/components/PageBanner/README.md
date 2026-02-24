# Page Banner Component

Small, accessible page-banner / hero component used across NTG pages. Vanilla JS only — no DXP edge component.

## Overview

- Renders a full-width hero banner with an optional image, title (H1), description, and Figma/Storybook CTA links
- Supports `Primary` (dark blue) and `Secondary` (light grey) visual variants
- Auto-initializes from `#nt-page-banner-content` or `[data-hydration-component="page-banner"]` on `DOMContentLoaded`
- Content adjusts height automatically; no fixed viewport height
- Exposed as `window.NTGPageBanner` for non-module contexts

## File Structure

```
src/components/PageBanner/
├── PageBanner.vanilla.ts   — Component class + auto-mount logic
├── PageBanner.css          — Styles with design tokens
├── index.ts                — TypeScript exports
└── README.md               — This file
```

## Features

- Renders title, description, and optional image
- Optional CTA links for Figma and Storybook (inline SVG icons, `currentColor`)
- Supports `Primary` and `Secondary` visual variants via `data-page-banner-type`
- Two auto-mount patterns: ID-based (`#nt-page-banner-content`) and hydration-attribute-based (`[data-hydration-component="page-banner"]`)

## Usage (server-rendered — ID-based)

Place an empty container with `id="nt-page-banner-content"` and annotate with `data-page-banner-*` attributes:

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

## Usage (hydration-attribute pattern)

```html
<div
  data-hydration-component="page-banner"
  data-title="Page title"
  data-description="Short description"
  data-type="Primary"
  data-image="https://.../image.jpg"
  data-figma-url="https://..."
  data-storybook-url="https://..."
></div>
```

## Data Attributes

### ID-based pattern (`#nt-page-banner-content`)

| Attribute                        | Type   | Default     | Description                           |
| -------------------------------- | ------ | ----------- | ------------------------------------- |
| `data-page-banner-title`         | string | `""`        | Banner heading rendered as `<h1>`     |
| `data-page-banner-description`   | string | `""`        | Description paragraph below the title |
| `data-page-banner-type`          | string | `"Primary"` | Variant: `"Primary"` or `"Secondary"` |
| `data-page-banner-image`         | string | `""`        | Optional image URL (hidden on mobile) |
| `data-page-banner-figma-url`     | string | `""`        | CTA link to Figma file                |
| `data-page-banner-storybook-url` | string | `""`        | CTA link to Storybook story           |

### Hydration-attribute pattern (`[data-hydration-component="page-banner"]`)

| Attribute            | Type   | Default     | Description                           |
| -------------------- | ------ | ----------- | ------------------------------------- |
| `data-title`         | string | `""`        | Banner heading rendered as `<h1>`     |
| `data-description`   | string | `""`        | Description paragraph                 |
| `data-type`          | string | `"Primary"` | Variant: `"Primary"` or `"Secondary"` |
| `data-image`         | string | `""`        | Optional image URL                    |
| `data-figma-url`     | string | `""`        | Figma CTA link                        |
| `data-storybook-url` | string | `""`        | Storybook CTA link                    |

## Props Interface (`PageBannerProps`)

```ts
interface PageBannerProps {
  title?: string; // Heading text (rendered as <h1>)
  description?: string; // Body paragraph
  type?: string; // "Primary" (default) | "Secondary"
  image?: string; // Optional image URL
  figmaUrl?: string; // Optional Figma CTA URL
  storybookUrl?: string; // Optional Storybook CTA URL
}
```

## JavaScript API

```ts
import { PageBanner } from "./PageBanner";

const el = document.getElementById("my-banner")!;
const banner = new PageBanner(el, { title: "Hello", description: "..." });

banner.destroy(); // Clears innerHTML and removes variant CSS classes
```

`window.NTGPageBanner` is exposed as a global.

## CSS Classes

| Class                          | Element             | Notes                                      |
| ------------------------------ | ------------------- | ------------------------------------------ |
| `.nt-page-banner`              | Root container      | Added to the element by the component      |
| `.nt-page-banner--primary`     | Root (variant)      | Dark blue background (`--clr-bg-dark-alt`) |
| `.nt-page-banner--secondary`   | Root (variant)      | Light grey background (`--clr-bg-muted`)   |
| `.nt-page-banner__inner`       | Inner width wrapper | Max-width 1200px, centered                 |
| `.nt-page-banner__content`     | Text content column | Flex column, grows to fill space           |
| `.nt-page-banner__title`       | `<h1>` heading      | H1-sized, bold, inverse text               |
| `.nt-page-banner__description` | `<p>` body text     | Body size, inverse text                    |
| `.nt-page-banner__actions`     | CTA row             | Flex row with `--sp-md` gap                |
| `.nt-page-banner__cta`         | `<a>` CTA link      | Inline SVG icon + text; underline on hover |
| `.nt-page-banner__graphics`    | Image wrapper       | Hidden on mobile (`≤768px`)                |
| `.nt-page-banner__image`       | `<img>`             | Max-height 191px, `object-fit: cover`      |

## Design Tokens

| Token                        | Usage                              | Fallback             |
| ---------------------------- | ---------------------------------- | -------------------- |
| `--clr-bg-dark-alt`          | Primary variant background         | `#44447a`            |
| `--clr-bg-muted`             | Secondary variant background       | `#f5f5f7`            |
| `--clr-text-inverse`         | Text color on dark backgrounds     | `#ffffff`            |
| `--clr-text-default`         | Text color on light (secondary)    | `#1f1f27`            |
| `--clr-link-inverse`         | CTA link color on dark backgrounds | `white`              |
| `--sp-xs`                    | CTA icon-to-text gap               | `8px`                |
| `--sp-xxs`                   | SVG icon margin                    | `4px`                |
| `--sp-md`                    | CTA row gap                        | `16px`               |
| `--sp-xl`                    | Inner side padding                 | `24px`               |
| `--sp-xxl`                   | Left padding                       | `32px`               |
| `--sp-xxxl`                  | Bottom padding                     | `48px`               |
| `--sp-sm`                    | Container gap between sections     | `12px`               |
| `--type-heading-h1-size`     | Title font size                    | `2.5rem`             |
| `--type-heading-h1-weight`   | Title font weight                  | `700`                |
| `--type-heading-h1-lh`       | Title line height                  | `2.75rem`            |
| `--type-mobile-h2-size`      | Title on mobile                    | `1.75rem`            |
| `--type-body-default-size`   | Description font size              | `1rem`               |
| `--type-body-sm-bold-size`   | CTA font size                      | `0.875rem`           |
| `--type-body-sm-bold-weight` | CTA font weight                    | `700`                |
| `--font-family-primary`      | All text                           | `"Lato", sans-serif` |

## Placement in Squiz Matrix

The banner container must be placed **outside and immediately above** the page `#content` element so it spans from the right edge of the left navigation to the right page edge.

```html
<main class="nt-main-content">
  <div
    id="nt-page-banner-content"
    data-page-banner-title="Page Title"
    data-page-banner-description="Description"
    data-page-banner-type="Primary"
  ></div>
  <div id="content">…</div>
</main>
```

## Accessibility

- SVG icons inside CTAs are `aria-hidden="true"` and `focusable="false"` to avoid redundant announcements
- CTA `<a>` elements include `rel="noopener noreferrer" target="_blank"` when URLs are present
- The title renders as `<h1>` — only include one PageBanner per page
- The image `<img>` has `alt=""` (decorative) since the title provides context

## Notes

- **Icons & CTAs**: Figma and Storybook icons are rendered as inline SVGs using `fill="currentColor"` / `stroke="currentColor"`, so they inherit the CTA text color automatically
- **Height behavior**: the banner uses `height: auto` and adjusts to its content; no fixed viewport height
- **Hover behaviour**: CTA hover color is the same as the default; hover only adds an underline
- **Visited link colour**: `.nt-page-banner__cta:visited` is explicitly set to match the default (white) to prevent browsers from applying their purple default. See CSS for the rule.
- The component is **vanilla JS only** — there is no DXP edge component for PageBanner

## Versioning

Changes to the component affect all pages using the `#nt-page-banner-content` nester pattern. After editing, run `npm run build` and push to trigger Git File Bridge sync.
