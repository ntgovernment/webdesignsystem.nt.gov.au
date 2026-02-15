<!-- markdownlint-disable MD001 MD024 -->

# PageCard Component - Complete Developer Guide

## Table of Contents

- [Overview](#overview)
- [Stories & Examples](#stories--examples)
- [Component API](#component-api)
- [Design Token Reference](#design-token-reference)
- [Integration Guides](#integration-guides)
- [Accessibility & Best Practices](#accessibility--best-practices)
- [Architecture & Implementation](#architecture--implementation)
- [Troubleshooting](#troubleshooting)

---

## Overview

The **PageCard** component is a production-ready, responsive grid layout system for displaying ContentPage assets as visually appealing cards. Each card displays an image (16:9 aspect ratio), title (required), and optional description with clickable link support.

### Key Features

✅ **Responsive Grid Layout** - Auto-fits 1-6 columns on all viewport sizes  
✅ **Design Token Integration** - Uses theme-specific CSS custom properties  
✅ **Figma-Aligned Design** - Exact typography, spacing, and padding from design specs  
✅ **Vanilla JavaScript** - Zero framework dependencies, ~5KB minified  
✅ **Accessible** - WCAG AAA compliant with keyboard navigation and focus indicators  
✅ **Server/Client Hydration** - Minimal HTML from server, async client rendering  
✅ **No External Dependencies** - Pure vanilla JS, no npm packages required

### Browser Support

| Browser | Support | Notes                      |
| ------- | ------- | -------------------------- |
| Chrome  | ✅ 90+  | Full support               |
| Firefox | ✅ 88+  | Full support               |
| Safari  | ✅ 14+  | Full support               |
| Edge    | ✅ 90+  | Full support               |
| Mobile  | ✅ All  | iOS Safari, Chrome Android |

---

## Stories & Examples

### Story 1: Basic Service Grid (3 Columns)

**Use Case:** Display government services in a standard 3-column grid with descriptions.

```json
{
  "pages": [
    {
      "id": "business-licensing",
      "title": "Business Licensing",
      "description": "Apply for licenses and permits online with fast processing",
      "imageUrl": "https://nt.gov.au/images/licensing.jpg",
      "href": "/business/licensing"
    },
    {
      "id": "business-registration",
      "title": "Business Registration",
      "description": "Register your business entity quickly and securely",
      "imageUrl": "https://nt.gov.au/images/registration.jpg",
      "href": "/business/registration"
    },
    {
      "id": "payment-services",
      "title": "Payment Services",
      "description": "Make and manage payments online 24/7",
      "imageUrl": "https://nt.gov.au/images/payments.jpg",
      "href": "/payments"
    }
  ],
  "columns": 3,
  "gap": "var(--sp-md, 16px)"
}
```

**Rendered Output:** Three equal-width cards with images, titles, descriptions, and clickable links.

### Story 2: News Articles (2 Columns)

**Use Case:** Feature news articles with larger spacing and accessibility labels.

```json
{
  "pages": [
    {
      "id": "article-2025-01",
      "title": "Government Announces Economic Growth Initiative",
      "description": "New $50M funding program to support small business development across NT",
      "imageUrl": "https://nt.gov.au/news/economy-2025.jpg",
      "href": "/news/2025/01/economy-initiative",
      "ariaLabel": "Read full article about economic growth initiative"
    },
    {
      "id": "article-2025-02",
      "title": "Community Consultation Opens for Infrastructure Plans",
      "description": "Have your say on proposed infrastructure projects in your region",
      "imageUrl": "https://nt.gov.au/news/infrastructure-2025.jpg",
      "href": "/news/2025/02/infrastructure",
      "ariaLabel": "Read full article about community consultation"
    }
  ],
  "columns": 2,
  "gap": "var(--sp-lg, 20px)",
  "clickable": true
}
```

**Features:** Larger spacing (`--sp-lg`), ARIA labels for accessibility, clickable cards.

### Story 3: Minimal Quick Links (4 Columns, No Images)

**Use Case:** Quick navigation links without images for footer or sidebar areas.

```json
{
  "pages": [
    {
      "id": "quick-ref",
      "title": "Quick Reference Guide",
      "href": "/resources/guide"
    },
    {
      "id": "faqs",
      "title": "FAQs and Support",
      "href": "/help/faq"
    },
    {
      "id": "contact",
      "title": "Contact Us",
      "href": "/contact"
    },
    {
      "id": "regulations",
      "title": "Regulations",
      "href": "/resources/regulations"
    }
  ],
  "columns": 4,
  "gap": "var(--sp-md, 16px)"
}
```

**Features:**

- No images (uses placeholder icon)
- Compact card layout
- 4-column grid (responsive down to 1 column on mobile)

### Story 4: Featured Content with Descriptions (Responsive)

**Use Case:** Mixed content with some items having images and descriptions, others minimal.

```json
{
  "pages": [
    {
      "id": "featured-1",
      "title": "Featured Service",
      "description": "Comprehensive service with full details available",
      "imageUrl": "https://via.placeholder.com/640x360/FF7200/FFFFFF?text=Service+1",
      "href": "/services/featured"
    },
    {
      "id": "minimal-1",
      "title": "Quick Link",
      "href": "/services/quick"
    },
    {
      "id": "featured-2",
      "title": "Another Service",
      "description": "Important service information and support",
      "imageUrl": "https://via.placeholder.com/640x360/44447A/FFFFFF?text=Service+2",
      "href": "/services/featured-2"
    }
  ],
  "columns": 3
}
```

**Features:** Mixed layouts in same grid, responsive handling of presence/absence of descriptions.

### Story 5: Event Listings

**Use Case:** Showcase upcoming events with images and descriptions.

```json
{
  "pages": [
    {
      "id": "event-spring-2025",
      "title": "Spring Community Gathering",
      "description": "Join us for outdoor activities and local business showcases",
      "imageUrl": "https://nt.gov.au/events/spring-2025.jpg",
      "href": "/events/spring-2025",
      "ariaLabel": "Learn more about Spring Community Gathering"
    },
    {
      "id": "event-business-forum",
      "title": "NT Business Forum 2025",
      "description": "Network with fellow entrepreneurs and government representatives",
      "imageUrl": "https://nt.gov.au/events/business-forum.jpg",
      "href": "/events/business-forum",
      "ariaLabel": "View details for NT Business Forum"
    }
  ],
  "columns": 2,
  "gap": "var(--sp-lg, 20px)",
  "clickable": true
}
```

---

## Component API

### ContentPageAsset (Page Object)

```typescript
interface ContentPageAsset {
  // REQUIRED
  id: string; // Unique identifier (page ID, slug, etc.)
  title: string; // Display title (max 2-3 words for best fit)

  // OPTIONAL
  imageUrl?: string; // Image URL (16:9 aspect ratio recommended)
  description?: string; // Short description (shows as body text, no limits)
  href?: string; // URL for clickable card (enables navigation)
  ariaLabel?: string; // Accessibility label (displayed to screen readers)
}
```

### PageCardProps (Configuration)

```typescript
interface PageCardProps {
  // REQUIRED
  pages: ContentPageAsset[]; // Array of content pages to display

  // OPTIONAL
  columns?: number; // Grid columns (1-6, default: 3)
  gap?: string; // CSS spacing (default: "var(--sp-md, 16px)")
  cardVariant?: "full" | "compact"; // Layout variant (default: "full")
  clickable?: boolean; // Enable card clicks (default: true)
  cssClass?: string; // Additional CSS classes
}
```

### Client-Side Usage (JavaScript)

```javascript
import { PageCardClient } from "@ntgovernment/web-design-system";

// Manual initialization
const container = document.getElementById("my-page-cards");
const component = new PageCardClient(container);

// With custom props
const instance = new PageCardClient(container, {
  pages: [...],
  columns: 2,
  gap: "var(--sp-lg)"
});
```

### Server-Side Usage (DXP)

```javascript
// In DXP service (main.js)
render(input) {
  return {
    pages: [...],
    columns: input.columns || 3,
    gap: input.gap || "var(--sp-md, 16px)"
  };
}
```

### Squiz Matrix Integration

```html
<!-- Embed in paint layout MySource_AREA -->
<div
  data-hydration-component="page-card"
  data-hydration-props='{"pages":[...],"columns":3}'
></div>
```

---

## Design Token Reference

### Spacing Tokens (Used Throughout)

| Token      | Value | Usage                               |
| ---------- | ----- | ----------------------------------- |
| `--sp-xs`  | 8px   | Small gaps, icon spacing            |
| `--sp-sm`  | 12px  | Gap between grid items              |
| `--sp-md`  | 16px  | Default grid gap, padding           |
| `--sp-lg`  | 20px  | Padding top of body                 |
| `--sp-xl`  | 24px  | Padding left/right of body          |
| `--sp-xxl` | 32px  | Padding bottom of body (Figma spec) |

**Applied in PageCard:**

```css
.page-card__body {
  padding: var(--sp-lg) var(--sp-xl) var(--sp-xxl) var(--sp-xl);
  /* Results in: 20px 24px 32px 24px (matches Figma) */
  gap: var(--sp-sm);
}
```

### Color Tokens (Imported from theme)

| Token                    | Color   | Usage                      |
| ------------------------ | ------- | -------------------------- |
| `--clr-bg-default`       | #ffffff | Card background            |
| `--clr-bg-shade`         | #f5f5f7 | Placeholder gradient light |
| `--clr-bg-shade-alt`     | #e7e7ea | Placeholder gradient dark  |
| `--clr-border-subtle`    | #d3d3d7 | Card border (default)      |
| `--clr-border-strong-01` | #1f1f5f | Card border (hover)        |
| `--clr-link-default`     | #1f1f5f | Title color (default)      |
| `--clr-link-hover`       | #0066cc | Title color (hover)        |
| `--clr-text-default`     | #1f1f27 | Description text           |
| `--clr-text-muted`       | #666774 | Placeholder icon           |

### Shadow Tokens (Theme-Specific)

| Token                    | Value                        | Usage                           |
| ------------------------ | ---------------------------- | ------------------------------- |
| `--shadow-md`            | `0px 4px 16px 0px #0f0f2f26` | Card hover shadow               |
| `--shadow-focus-ntg`     | `0px 0px 0px 4px #ec8c5800`  | Keyboard focus (NTG orange)     |
| `--shadow-focus-central` | `0px 0px 0px 4px #6ab06aff`  | Focus for Central theme (green) |

### Border Tokens

| Token               | Value | Usage                         |
| ------------------- | ----- | ----------------------------- |
| `--border-width-md` | 1px   | Card border thickness         |
| `--border-width-lg` | 2px   | High contrast mode border     |
| `--radii-none`      | 0px   | No border radius (Figma spec) |
| `--radii-sm`        | 4px   | Focus indicator radius        |

### Typography Tokens

| Token                              | Value    | Usage                 |
| ---------------------------------- | -------- | --------------------- |
| `--type-font-default`              | Lato     | All text in PageCard  |
| `--type-desktop-body-default-size` | 1rem     | Description text      |
| `--type-mobile-body-sm-size`       | 0.875rem | Description on mobile |

---

## Integration Guides

### Integration with Squiz Matrix

#### Step 1: Reference in Paint Layout

```html
<!-- Paint Layout Template -->
<head>
  <MySource_AREA id_name="head" design_area="nest_content">
    <!-- Head nester with stylesheets -->
  </MySource_AREA>
</head>

<body>
  <!-- Main content -->
  <MySource_AREA id_name="body" design_area="body" />

  <!-- Page Card Grid -->
  <MySource_AREA id_name="page_card_section" design_area="nest_content">
    <div
      data-hydration-component="page-card"
      data-hydration-props='{"pages":[],"columns":3}'
    ></div>
  </MySource_AREA>

  <!-- Footer with scripts -->
  <MySource_AREA id_name="footer_js" design_area="nest_content">
    <script src="%globals_asset_url_with_hash:ASSET_ID:deploy/js/page-card.js%"></script>
  </MySource_AREA>
</body>
```

#### Step 2: Populate with ContentPage Assets

```php
<?php
// Fetch child pages from Squiz
$parent_id = $GLOBALS["SQ_SYSTEM"]->rootNode->id;
$children = $GLOBALS["SQ_SYSTEM"]->am->getChildren(
    $parent_id,
    "page",
    false,
    array("name", "url")
);

$pages = array();
foreach ($children as $asset_id => $asset) {
    $pages[] = array(
        "id" => (string)$asset_id,
        "title" => $asset->name,
        "href" => $asset->getUrl(),
        "imageUrl" => $asset->getThumbnailUrl() ?? "",
        "description" => $asset->getMetaDescription() ?? ""
    );
}

$hydration_props = json_encode(array(
    "pages" => $pages,
    "columns" => 3
));
?>

<div data-hydration-component="page-card"
     data-hydration-props='<?php echo htmlspecialchars($hydration_props); ?>'>
</div>
```

### Integration with Custom CMS

```javascript
// Fetch data from custom API
async function initializePageCard(containerId) {
  const response = await fetch("/api/pages");
  const data = await response.json();

  const container = document.getElementById(containerId);
  const props = {
    pages: data.map((page) => ({
      id: page.id,
      title: page.title,
      description: page.summary,
      imageUrl: page.featured_image,
      href: page.url,
      ariaLabel: `View ${page.title}`,
    })),
    columns: 3,
    gap: "var(--sp-md)",
  };

  // Create hydration element
  container.innerHTML = `<div data-hydration-component="page-card"
         data-hydration-props='${JSON.stringify(props)}'>
    </div>`;

  // Trigger hydration
  const PageCardClient = window.NTGPageCard;
  new PageCardClient(
    container.querySelector('[data-hydration-component="page-card"]'),
  );
}
```

---

## Accessibility & Best Practices

### WCAG AAA Compliance

✅ **Semantic HTML**

```html
<a class="page-card__item">          <!-- Proper link element -->
  <h3 class="page-card__title">      <!-- Proper heading hierarchy -->
  <p class="page-card__description"> <!-- Proper paragraph -->
  <img alt="Title" />                <!-- Descriptive alt text -->
</a>
```

✅ **Color Contrast**

- Title: 7:1 ratio (WCAG AAA)
- Description: 7:1 ratio (WCAG AAA)
- Works in high contrast mode

✅ **Keyboard Navigation**

```
Tab → Navigate to card
Enter/Space → Activate card link
Focus Visible → 4px colored shadow (theme-specific)
```

✅ **Focus Indicators**

```css
/* NTG Theme (Orange Focus) */
--shadow-focus-ntg: 0px 0px 0px 4px #ec8c58 /* Central Theme (Green Focus) */
  --shadow-focus-central: 0px 0px 0px 4px #6ab06a;
```

### Best Practices

#### 1. Image Guidelines

- **Optimal Size:** 640x360px (16:9 ratio)
- **Format:** WebP or JPEG
- **File Size:** <50KB for performance
- **Alt Text:** Always provided (uses card title)

```javascript
// Good: Optimized image
"imageUrl": "https://nt.gov.au/images/service-640x360.webp"

// Avoid: Over-sized images
"imageUrl": "https://nt.gov.au/images/full-res-3000x2000.jpg"
```

#### 2. Title Writing

- **Length:** 2-4 words optimal
- **Clarity:** Action-oriented, specific
- **Avoid:** Generic titles like "Click Here"

```javascript
// Good titles
"title": "Business Licensing"
"title": "Grant Applications"
"title": "Training Programs"

// Avoid
"title": "Important Information"
"title": "Link"
"title": "More Details"
```

#### 3. Description Writing

- **Length:** 1-2 sentences
- **Content:** Benefit-focused, scannable
- **Avoid:** Lengthy paragraphs

```javascript
// Good descriptions
"description": "Apply for licenses and permits online with fast processing"

// Avoid
"description": "This service allows users to apply for various licenses and permits that may be required by the government. The process is streamlined and users can expect quick turnaround times."
```

#### 4. Link Structure

- **Always provide href:** Enables clickable cards
- **Use meaningful URLs:** Describe destination
- **Include ariaLabel:** For screen reader context

```javascript
// Good
{
  "title": "Business Services",
  "href": "/business/licensing",
  "ariaLabel": "View business licensing requirements and apply"
}

// Avoid
{
  "title": "Click Here",
  "href": "#",
  "ariaLabel": "Click here"
}
```

#### 5. Mobile Optimization

The component is fully responsive:

- **Desktop:** 3 columns (data-driven by `columns` prop)
- **Tablet (768px):** Auto-sized responsive grid
- **Mobile (480px):** Single column or 2 columns (grid responsive)

```json
// Desktop-first, responsive to mobile
{
  "columns": 3,
  "gap": "var(--sp-md)"
  // Grid auto-fits on mobile
}
```

---

## Architecture & Implementation

### Component Structure

```
src/components/PageCard/
├── PageCard.vanilla.ts        # Client component (vanilla JS, ~250 lines)
├── PageCard.css               # Styles with design tokens (~280 lines)
├── index.ts                   # Exports for module usage
├── README.md                  # Component documentation
└── dxp/
    ├── main.js               # DXP server renderer
    ├── manifest.json         # DXP schema definition
    ├── preview.html          # Interactive preview
    └── README.md             # DXP integration docs
```

### Rendering Pipeline

#### Server-Side (DXP Service)

```javascript
// 1. Input validation
{
  pages: [
    { id, title, imageUrl?, description?, href?, ariaLabel? }
  ],
  columns?: number,
  gap?: string
}

// 2. Sanitization (XSS prevention)
- HTML escape all text content
- URL validate image and link URLs
- JSON encode props

// 3. Output (minimal HTML)
<div data-hydration-component="page-card"
     data-hydration-props='{"pages":[...]}'
     data-instance-id="pc-xxxxx">
</div>
```

#### Client-Side (Browser)

```javascript
// 1. Auto-detection
document.querySelectorAll('[data-hydration-component="page-card"]')

// 2. JSON parsing
const props = JSON.parse(element.dataset.hydrationProps)

// 3. HTML rendering
renderCard(page) → <a class="page-card__item">...</a>
renderCardImage(page) → <div class="page-card__image">...</div>
renderCardBody(page) → <div class="page-card__body">...</div>

// 4. Event attachment
attachEventListeners() → keyboard navigation, link activation

// 5. Final output (replaces container)
<div class="page-card">
  <a class="page-card__item">...</a>
  <a class="page-card__item">...</a>
  ...
</div>
```

### Class Hierarchy

```typescript
PageCardClient
├── constructor(container: HTMLElement)
├── private render()
├── private renderCard(page: ContentPageAsset): string
├── private renderCardImage(page: ContentPageAsset): string
├── private escapeHtml(str: string): string
├── private escapeAttr(str: string): string
├── private attachEventListeners()
└── private renderError(message: string)

// Global registration
window.NTGPageCard = PageCardClient
```

### CSS Class Hierarchy

```
.page-card                          # Grid container
├── .page-card__item                # Card wrapper (a or div)
│   └── .page-card__card            # Card body
│       ├── .page-card__image       # Image container (16:9)
│       │   ├── .page-card__image-img
│       │   └── .page-card__image-placeholder
│       │       └── .page-card__placeholder-icon
│       └── .page-card__body        # Content container
│           ├── .page-card__title-wrapper
│           │   └── .page-card__title
│           └── .page-card__description
└── .page-card-error                # Error state
```

---

## Troubleshooting

### Cards Not Rendering

**Symptom:** Empty space where cards should appear

**Solutions:**

1. Check browser console for JavaScript errors
2. Verify `data-hydration-props` JSON is valid
   ```javascript
   try {
     JSON.parse(element.dataset.hydrationProps);
   } catch (e) {
     console.error("Invalid JSON:", e);
   }
   ```
3. Ensure script loads before hydration: `<script src="page-card.js" defer></script>`

### Images Not Loading

**Symptom:** Placeholder icon shows instead of image

**Solutions:**

1. Verify image URL is correct and accessible
2. Check CORS headers allow image loading
3. Inspect Network tab for 404 or CORS errors
4. Use WebP or JPEG, optimize file size <50KB

### Keyboard Navigation Not Working

**Symptom:** Tab doesn't focus cards, Enter doesn't activate

**Solutions:**

1. Verify cards have `href` attribute (enables `<a>` tag)
2. Check focus styles are visible: press Tab and look for 4px shadow
3. Ensure no CSS is hiding focus indicators
4. Test with plain HTML first to isolate issue

### Focus Indicators Not Visible

**Symptom:** Can't see focus outline when pressing Tab

**Solutions:**

1. Check theme tokens are imported in CSS
2. Verify `--shadow-focus-ntg` is defined
3. Ensure no CSS rules override focus styles
4. Check high contrast mode support in browser

### Responsive Issues

**Symptom:** Grid doesn't reflow on mobile

**Solutions:**

1. Check viewport meta tag: `<meta name="viewport" content="width=device-width">`
2. Verify CSS media queries are not overridden
3. Test with dev tools device emulation
4. Clear browser cache (CSS changes may be cached)

### Performance Issues

**Symptom:** Slow rendering with many cards

**Solutions:**

1. Check image file sizes (<50KB each)
2. Use CDN for image hosting
3. Lazy-load images if 100+ cards
4. Monitor Network tab performance

---

## Advanced Usage

### Custom Styling

```css
/* Override default styles with higher specificity */
.my-custom-cards .page-card__title {
  font-size: 24px;
  color: var(--clr-status-success); /* Use different color */
}

.my-custom-cards .page-card__card {
  border-radius: var(--radii-sm); /* Add border radius if desired */
  box-shadow: var(--shadow-lg); /* Use larger shadow */
}
```

### Extending Functionality

```javascript
// Create custom subclass
class CustomPageCard extends window.NTGPageCard {
  attachEventListeners() {
    super.attachEventListeners();

    // Add custom tracking
    const cards = this.container.querySelectorAll(".page-card__item");
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        console.log("Card clicked:", card.textContent);
        // Send analytics event
      });
    });
  }
}

// Use custom class
new CustomPageCard(container);
```

### Dynamic Updates

```javascript
// Update cards after initial render
function updatePageCards(newData) {
  const container = document.getElementById("my-cards");

  // Create props
  const props = {
    pages: newData,
    columns: 3,
  };

  // Recreate hydration element
  container.innerHTML = `<div data-hydration-component="page-card"
     data-hydration-props='${JSON.stringify(props)}'>
  </div>`;

  // Reinitialize component
  const PageCardClient = window.NTGPageCard;
  new PageCardClient(
    container.querySelector('[data-hydration-component="page-card"]'),
  );
}
```

---

## File Size Reference

| File         | Size (Minified) | Size (Gzipped) |
| ------------ | --------------- | -------------- |
| page-card.js | ~5 KB           | ~1.5 KB        |
| PageCard.css | ~8 KB           | ~2 KB          |
| **Total**    | **~13 KB**      | **~3.5 KB**    |

---

## Support & Links

### Component Files

- [Component Source](./PageCard.vanilla.ts)
- [Component Styles](./PageCard.css)
- [Type Definitions](./index.ts)
- [DXP Service](./dxp/main.js)
- [DXP Schema](./dxp/manifest.json)

### Related Components

- [Header Component](../Header/)
- [ThemeSwitcher](../ThemeSwitcher/)
- [ComponentViewer](../ComponentViewer/)

### Design System

- [NT Design System](https://github.com/ntgovernment/web-design-system)
- [Design Tokens](../../external-tokens/)
- [Deployment Guide](../../DEPLOYMENT_GUIDE.md)

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
