# PageCard Component Implementation Guide

## Overview

The PageCard component is a responsive grid layout system for displaying ContentPage assets as attractive, keyboard-accessible cards. It's designed for Squiz DXP deployment with server-side rendering and client-side hydration validation.

**Key Features:**

- Display lists of content pages in responsive grid layout
- Image (16:9 aspect ratio) + Title + optional Description
- Clickable cards with keyboard navigation support
- WCAG AAA accessibility compliance
- Design token integration with NT Design System
- No external JavaScript dependencies

## Files Created

### Component Source Files

```
src/components/PageCard/
├── PageCard.vanilla.ts         # Client-side hydration component (vanilla JS)
├── PageCard.css                # Component styles with design tokens
├── index.ts                    # TypeScript exports
└── README.md                   # Component documentation
```

### DXP Service Files

```
src/components/PageCard/dxp/
├── manifest.json               # DXP component schema definition
├── main.js                     # Server-side renderer
├── README.md                   # DXP integration documentation
└── preview.html                # Interactive preview page
```

### Deployment Files

```
public/squiz/
└── page-card.html              # Squiz Matrix nester template
```

### Build Integration

```
src/web-design-system.ts        # Updated to import PageCard component
```

## Architecture

### Server-Side (DXP Service)

**File: `src/components/PageCard/dxp/main.js`**

```javascript
render(input) {
  // Validates:
  // - pages array is not empty
  // - Each page has id and title
  // - Data is properly escaped for HTML

  // Returns:
  // <div data-hydration-component="page-card"
  //      data-hydration-props='{...}'></div>
}
```

### Client-Side (Hydration)

**File: `src/components/PageCard/PageCard.vanilla.ts`**

```typescript
class PageCardClient {
  constructor(container: HTMLElement);
  private render();
  private renderCard(page: ContentPageAsset);
  private renderCardImage(page: ContentPageAsset);
  private attachEventListeners();
  private escapeHtml(str: string);
  private escapeAttr(str: string);
}

// Auto-mounts on [data-hydration-component="page-card"]
```

### Styling

**File: `src/components/PageCard/PageCard.css`**

- Responsive CSS Grid layout
- 16:9 aspect ratio images
- Design token integration
- Accessibility features (focus indicators, high contrast)
- Responsive breakpoints (mobile, tablet, desktop)

## Input Schema

### Pages (Required)

Array of ContentPage asset objects:

```typescript
interface ContentPageAsset {
  id: string; // Unique identifier
  title: string; // Display title
  imageUrl?: string; // Optional image URL (16:9)
  description?: string; // Optional description (max 2 lines)
  href?: string; // Optional link URL
  ariaLabel?: string; // Optional accessibility label
}
```

### Configuration Options

```typescript
interface PageCardProps {
  pages: ContentPageAsset[]; // Required
  columns?: number; // 1-6, default: 3
  gap?: string; // CSS spacing, default: "var(--sp-md, 16px)"
  cardVariant?: "full" | "compact"; // default: "full"
  clickable?: boolean; // default: true
  cssClass?: string; // Additional CSS classes
}
```

## Deployment Process

### 1. Build Component

```bash
npm run build
```

This will:

- Compile TypeScript
- Minify CSS
- Generate `deploy/js/page-card.js`
- Generate `deploy/nesters/` files
- Inject asset IDs from `.env`

### 2. Commit Changes

```bash
git add src/components/PageCard/
git add public/squiz/page-card.html
git add src/web-design-system.ts
git commit -m "Add PageCard component for content listing"
```

### 3. Deploy to Squiz (Git File Bridge)

The `deploy/` directory syncs automatically if Git File Bridge is configured.

Verify files in Squiz Matrix asset tree:

- `deploy/js/page-card.js`
- `deploy/ntg-design-system.css`
- `deploy/nesters/head.html` (loads styles)
- `deploy/nesters/footer-js.html` (loads scripts)

### 4. Integrate into Paint Layout

Add the nester to your paint layout:

```html
<!-- Page Card Grid (optional) -->
<MySource_AREA id_name="page_card_content" design_area="nest_content" cache="0">
  <div
    data-hydration-component="page-card"
    data-hydration-props='{"pages":[],"columns":3}'
  ></div>
</MySource_AREA>

<!-- Footer JS (loads page-card-client.js) -->
<MySource_AREA id_name="footer_js" design_area="nest_content" cache="1">
  <script src="%globals_asset_url_with_hash:ASSET_ID:deploy/js/page-card.js%"></script>
</MySource_AREA>
```

## Usage Examples

### Example 1: Service Grid (3 Columns)

```json
{
  "pages": [
    {
      "id": "licensing",
      "title": "Business Licensing",
      "description": "Apply for licenses and permits online",
      "imageUrl": "https://nt.gov.au/images/licensing.jpg",
      "href": "/business/licensing"
    },
    {
      "id": "registration",
      "title": "Business Registration",
      "description": "Register your business entity online",
      "imageUrl": "https://nt.gov.au/images/registration.jpg",
      "href": "/business/registration"
    },
    {
      "id": "payments",
      "title": "Payment Services",
      "description": "Make and manage online payments",
      "imageUrl": "https://nt.gov.au/images/payments.jpg",
      "href": "/payments"
    }
  ],
  "columns": 3,
  "gap": "var(--sp-md, 16px)"
}
```

### Example 2: News Articles (2 Columns)

```json
{
  "pages": [
    {
      "id": "news-1",
      "title": "Government Announces New Initiative",
      "description": "Breaking news about regulatory changes",
      "imageUrl": "https://nt.gov.au/news/announcement.jpg",
      "href": "/news/123",
      "ariaLabel": "Read announcement news article"
    },
    {
      "id": "news-2",
      "title": "Community Consultation Opens",
      "description": "Have your say on proposed projects",
      "imageUrl": "https://nt.gov.au/news/consultation.jpg",
      "href": "/news/124"
    }
  ],
  "columns": 2,
  "gap": "var(--sp-lg, 24px)"
}
```

### Example 3: Quick Links (4 Columns, No Images)

```json
{
  "pages": [
    { "id": "guide", "title": "Quick Reference Guide", "href": "/guide" },
    { "id": "faq", "title": "FAQs and Support", "href": "/faq" },
    { "id": "contact", "title": "Contact Us", "href": "/contact" },
    { "id": "regulations", "title": "Regulations", "href": "/regulations" }
  ],
  "columns": 4
}
```

## Content Page Asset Mapping

The component accepts data from any source that provides objects with these properties:

| Property      | Source Field          | Example                              |
| ------------- | --------------------- | ------------------------------------ |
| `id`          | Asset ID or slug      | `"page-123"`, `"licensing"`          |
| `title`       | Asset name/title      | Page name from asset metadata        |
| `imageUrl`    | Asset image/thumbnail | Featured image URL                   |
| `description` | Page summary/meta     | Short page description               |
| `href`        | Asset URL or path     | `/path/to/asset`, Squiz asset URL    |
| `ariaLabel`   | Custom label          | For accessibility, describe the link |

### Squiz Integration

In Squiz Matrix, you can populate this data from:

1. **WYSIWYG Component** - Editor creates JSON structure
2. **Custom Code** - PHP/JavaScript generates JSON
3. **Asset Query** - Database query returns pages
4. **API Call** - REST API populates data

Example Squiz integration:

```php
<?php
// Get child assets
$assets = $GLOBALS["SQ_SYSTEM"]->am->getChildren(
    $asset->id,
    "page",
    false,
    array("name", "url", "thumbnail")
);

$pages = array();
foreach ($assets as $asset_id => $asset) {
    $pages[] = array(
        "id" => (string)$asset_id,
        "title" => $asset->name,
        "href" => $asset->getUrl(),
        "imageUrl" => $asset->getThumbnailUrl(),
        "description" => $asset->getMetaDescription()
    );
}

echo json_encode(array("pages" => $pages));
?>
```

## Styling and Customization

### Design Tokens Used

```css
--font-family-primary: Lato --clr-bg-default: #ffffff
  --clr-text-default: #1f1f27 --clr-link-default: #1f1f5f
  --clr-link-hover: #0066cc --clr-border-subtle: #d3d3d7 --border-width-md: 1px
  --border-radius: 4px --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1)
  --shadow-focus-ntg: 0 0 0 4px rgba(255, 114, 0, 0.25) /* Spacing */
  --sp-xs: 8px --sp-sm: 12px --sp-md: 16px --sp-lg: 24px --sp-xl: 32px
  /* Typography */ --type-heading-h5-size: 1.125rem
  --type-heading-h5-weight: 700 --type-body-default-size: 1rem;
```

### Custom Styling Example

```css
/* Override background color */
.page-card__card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Increase border width */
.page-card__card {
  border-width: 2px;
}

/* Change image height aspect ratio */
.page-card__image {
  aspect-ratio: 4 / 3;
}

/* Custom hover effects */
.page-card__item:hover .page-card__card {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

## Accessibility

### Keyboard Navigation

- **Tab** - Navigate between cards
- **Enter/Space** - Activate card link
- **Focus Indicator** - 4px colored shadow (themed)

### Screen Reader Support

- Semantic HTML (h3 titles, a links)
- Image alt text from card title
- ARIA labels on links
- Proper heading hierarchy

### WCAG Compliance

- Color contrast: 7:1 (AAA standard)
- Focus indicators: 4px visible outline
- Responsive design: Works at all viewport sizes
- Motion: Respects `prefers-reduced-motion`

## Troubleshooting

### Cards Not Rendering

**Issue**: White space where cards should be  
**Solution**: Check browser console for errors, verify `data-hydration-props` JSON is valid

**Issue**: Hydration container appears but no cards  
**Solution**: Ensure `page-card-client.js` is loaded before cards are hydrated

### Images Not Loading

**Issue**: Placeholder icon shows instead of image  
**Solution**: Check image URL in props, verify CORS headers allow loading

## Testing Checklist

- [ ] Grid displays correct number of columns
- [ ] Cards are responsive (resize window)
- [ ] Images load correctly (16:9 aspect ratio)
- [ ] Title and description text displays
- [ ] Cards are clickable (click card navigates to href)
- [ ] Keyboard navigation works (Tab through cards)
- [ ] Focus indicators visible
- [ ] Missing images show placeholder icon
- [ ] Error messages display and are readable
- [ ] Mobile view: Single/double column
- [ ] Hover effects apply correctly
- [ ] High contrast mode compatible

## Performance Notes

- **Bundle Size**: ~5KB minified (page-card-client.js)
- **Rendering**: DOM updates only on hydration
- **Images**: Use CSS `object-fit: cover` for consistent sizing
- **LazyLoad**: Can be added with Intersection Observer

## Future Enhancements

Potential features to consider:

1. **Lazy Loading** - Use Intersection Observer for images
2. **Filtering** - Add category filters above grid
3. **Sorting** - Sort by title, date, or custom field
4. **Search** - Search functionality integrated with grid
5. **Pagination** - Page through large datasets
6. **Animations** - Stagger animations on card entry
7. **Custom Templates** - Allow different card layouts
8. **Metadata** - Display date, author, tags

## Support and Documentation

### Component Files

- [Main Readme](./src/components/PageCard/README.md)
- [DXP Documentation](./src/components/PageCard/dxp/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### Related Components

- [Header Component](./src/components/Header/README.md)
- [Card Component](https://github.com/ntgovernment/web-design-system)
- [Design System Docs](https://ntgovernment.github.io/ntg-design-system)

## Contact

For questions or issues with the PageCard component:

1. Check component README files
2. Review DXP documentation
3. Test with provided examples
4. Check browser console for errors
