# PageCard Component - DXP Service

Dynamic component for displaying lists of ContentPage assets as a responsive grid using Card-style layout with Image and Title.

## Overview

The PageCard component transforms an array of content page assets into an attractive, responsive card grid. Each card displays:

- **Image** (16:9 aspect ratio, optional)
- **Title** (required)
- **Description** (optional, max 2 lines)
- **Link** (optional, makes entire card clickable)

## Architecture

**Server-Side Rendering (main.js):**

- Validates input data
- Sanitizes HTML to prevent XSS
- Generate hydration payload with JSON-encoded props
- Returns minimal HTML container with `data-hydration-props`

**Client-Side Hydration (page-card-client.js):**

- Parses JSON props from data attributes
- Renders full card grid HTML
- Attaches event listeners for keyboard navigation
- Handles error states gracefully

## Input Schema

### Pages (Required)

Array of asset references selected via the Squiz Matrix asset picker. Each item must include an `assetId` (the Matrix asset ID). For local preview and dev‑UI you may also include optional metadata (title, imageUrl, etc.) to render examples.

Example item shape:

```json
{
  "assetId": "12345",
  "title": "Page Title (optional for preview)",
  "imageUrl": "https://example.com/image.jpg",
  "description": "Short description",
  "href": "/path/to/page",
  "ariaLabel": "Accessible link label"
}
```

| Property    | Type   | Required | Description                                               |
| ----------- | ------ | -------- | --------------------------------------------------------- |
| assetId     | string | ✓        | Squiz Matrix Asset ID (pick via asset picker)             |
| title       | string |          | Display title (optional; can be auto-resolved by runtime) |
| imageUrl    | string |          | Image URL (16:9 aspect ratio recommended)                 |
| description | string |          | Optional description (max 2 lines)                        |
| href        | string |          | Link URL (enables clickable card)                         |
| ariaLabel   | string |          | Accessibility label for link                              |

### Grid Options

| Option      | Type    | Default              | Description                               |
| ----------- | ------- | -------------------- | ----------------------------------------- |
| columns     | number  | 3                    | Max columns (1-6, responsive)             |
| gap         | string  | `var(--sp-md, 16px)` | CSS spacing between cards                 |
| cardVariant | string  | `full`               | Layout variant (full, compact)            |
| clickable   | boolean | true                 | Enable clickable cards when href provided |
| cssClass    | string  | ""                   | Additional CSS classes                    |

## Output

Returns a `<div>` element with hydration attributes:

```html
<div
  class="nt-page-card"
  data-hydration-component="page-card"
  data-hydration-props="{...}"
  data-instance-id="pc-xxxxx"
></div>
```

The class `nt-page-card` indicates the hydration target. Client-side hydration replaces inner HTML with rendered grid.

## Design System Integration

### CSS Classes

- `.page-card` - Main container with grid
- `.page-card__item` - Individual card (link or div)
- `.page-card__card` - Card wrapper (flex container)
- `.page-card__image` - Image container (16:9 aspect ratio)
- `.page-card__image-img` - Image element
- `.page-card__image-placeholder` - Placeholder when image missing
- `.page-card__content` - Content area (title + description)
- `.page-card__title` - Card title (h3)
- `.page-card__description` - Card description (clamped to 2 lines)

### Style Tokens (CSS Custom Properties)

Uses NT Design System tokens:

```css
--font-family-primary: Lato --clr-bg-default: #ffffff
  --clr-text-default: #1f1f27 --clr-link-default: #1f1f5f
  --clr-link-hover: #0066cc --clr-border-subtle: #d3d3d7 --border-width-md: 1px
  --border-radius: 4px --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1)
  --shadow-focus-ntg: 0 0 0 4px rgba(255, 114, 0, 0.25) /* Spacing */
  --sp-sm: 12px --sp-md: 16px --sp-lg: 24px /* Typography */
  --type-heading-h5-size: 1.125rem --type-heading-h5-weight: 700
  --type-heading-h5-lh: 1.25rem --type-body-default-size: 1rem
  --type-body-default-weight: 400 --type-body-default-lh: 1.5rem;
```

### Responsive Breakpoints

- **Desktop (>768px)**: Full grid with all columns
- **Tablet (768px)**: Reduced padding, adjusted typography
- **Mobile (<576px)**: Single column or 2 columns

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between cards
- **Enter/Space**: Activate card link (when clickable)
- **Focus Indicators**: Theme-specific 4px colored shadow (orange for NT.GOV.AU)

### ARIA Labels

- Links include `aria-label` when provided (screen reader context)
- Images have descriptive alt text
- Semantic heading hierarchy (h3 for titles)

### Color Contrast

- Title: 7:1 ratio (WCAG AAA)
- Description: 7:1 ratio (WCAG AAA)
- Placeholder icon: 4:1 minimum

### High Contrast Mode

- Border width increases to 2px
- Focus indicators become more prominent

## Example Usage

### Basic Grid (3 columns)

```json
{
  "pages": [
    {
      "id": "licensing",
      "title": "Business Licensing",
      "imageUrl": "https://nt.gov.au/images/licensing.jpg",
      "href": "/business/licensing"
    },
    {
      "id": "registration",
      "title": "Business Registration",
      "imageUrl": "https://nt.gov.au/images/registration.jpg",
      "href": "/business/registration"
    }
  ]
}
```

### With Descriptions (2 columns)

```json
{
  "pages": [
    {
      "id": "news-1",
      "title": "Government Announces Initiative",
      "description": "Breaking news about new regulatory framework",
      "imageUrl": "https://nt.gov.au/news/img-1.jpg",
      "href": "/news/123",
      "ariaLabel": "Read news article"
    }
  ],
  "columns": 2,
  "gap": "var(--sp-lg, 24px)"
}
```

### Minimal (No Images)

```json
{
  "pages": [
    {
      "id": "guide",
      "title": "Quick Reference Guide",
      "href": "/resources/guide"
    },
    {
      "id": "faq",
      "title": "FAQs and Support",
      "href": "/resources/faq"
    }
  ]
}
```

## Deployment Checklist

- [x] Component markup uses semantic HTML (div, h3, a)
- [x] All text content properly escaped
- [x] Images have alt text
- [x] Links include href and optional aria-label
- [x] Keyboard navigation supported
- [x] Focus indicators visible
- [x] Error handling for invalid input
- [x] Accessible to screen readers
- [x] Responsive design tested
- [x] Design tokens integrated
- [x] Dark theme compatible
- [x] Print-friendly styling

## Performance Considerations

- **Lightweight HTML**: Minimal server payload
- **Client-side Rendering**: Reduces server load
- **CSS Grid**: Native browser layout (no JavaScript layout calculations)
- **Intersection Observer**: Can be added for lazy-loading images
- **No framework dependencies**: Pure vanilla JavaScript

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## Server-Side Validation

The DXP service performs validation to ensure data quality:

1. **Type Checking**: Converts all values to strings
2. **Required Fields**: Validates id and title present
3. **XSS Prevention**: Escapes HTML in payload
4. **Range Validation**: Constrains columns (1-6)
5. **Array Validation**: Ensures pages is an array with items

## Error Handling

**Invalid Input:**

```
All provided pages were invalid. Each page must have an id and title.
```

**Empty Array:**

```
No content pages provided. Please provide at least one page with an id and title.
```

**Parse Error (Client-side):**

```
Failed to parse props: [error message]
```

All errors render with accessible styling and clear messaging.

## Future Enhancements

Potential features for future versions:

- Lazy-loading for image-heavy grids
- Sorting/filtering by category
- Search functionality
- Card animations on load
- Custom card templates
- Meta data display (date, author)
- Pagination for large result sets
