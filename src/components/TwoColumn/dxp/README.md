# TwoColumn - DXP Component Service

Responsive two-column layout with WYSIWYG content areas for Squiz DXP Component Service.

## Overview

TwoColumn provides a flexible grid-based layout for displaying content side-by-side on desktop and stacked on mobile. Perfect for documentation, sidebars, feature comparisons, and multi-section content.

**Key Features:**

- WYSIWYG editors for left and right content
- Configurable column widths (CSS grid values)
- Optional background colors per column
- Responsive: side-by-side on desktop (>768px), stacked on mobile (â‰¤768px)
- No client-side JavaScript required (server-rendered only)

## Architecture

Unlike ComponentViewer which uses client-side hydration, TwoColumn is a **pure server-side rendered component**:

- **Server-side rendering** (edge): `main.js` generates complete HTML structure
- **No client-side JavaScript**: Static layout with CSS-only responsive behavior
- **Global styles**: Loaded via `web-design-system.css`

## Files

- **manifest.json** - Component metadata and input schema
- **main.js** - Server-side renderer (ES module export)
- **example.data.json** - Sample configurations for local testing
- **preview.html** - Local development preview environment
- **serve-preview.sh/bat** - Helper scripts to start local preview server

## Configuration

### Input Properties

| Property          | Type          | Default | Description                                           |
| ----------------- | ------------- | ------- | ----------------------------------------------------- |
| `leftContent`     | FormattedText | ``      | HTML content for left column (WYSIWYG editor)         |
| `rightContent`    | FormattedText | ``      | HTML content for right column (WYSIWYG editor)        |
| `leftWidth`       | string        | `1fr`   | CSS grid width for left column (e.g., '1fr', '300px') |
| `rightWidth`      | string        | `1fr`   | CSS grid width for right column                       |
| `gap`             | string        | `2rem`  | Space between columns (e.g., '2rem', '32px')          |
| `leftBackground`  | string        | ``      | CSS background color for left column (optional)       |
| `rightBackground` | string        | ``      | CSS background color for right column (optional)      |
| `cssClass`        | string        | ``      | Additional CSS classes for container                  |

### Column Width Examples

- **Equal columns**: `leftWidth: "1fr"`, `rightWidth: "1fr"`
- **Narrow sidebar**: `leftWidth: "1fr"`, `rightWidth: "2fr"` (1:2 ratio)
- **Wide sidebar**: `leftWidth: "2fr"`, `rightWidth: "1fr"` (2:1 ratio)
- **Fixed + flexible**: `leftWidth: "300px"`, `rightWidth: "1fr"` (300px + remaining space)

## Local Preview

### Option 1: Using npx serve (Recommended)

```bash
# From the two-column directory
npx serve -p 3000

# Then open: http://localhost:3000/preview.html
```

### Option 2: Using serve-preview scripts

**Unix/Mac:**

```bash
chmod +x serve-preview.sh
./serve-preview.sh
```

**Windows:**

```cmd
serve-preview.bat
```

### What to Test

1. **Responsive behavior**: Resize browser to <768px to see columns stack
2. **Column widths**: Verify different width ratios (1fr:1fr, 1fr:2fr, etc.)
3. **Backgrounds**: Test with/without background colors
4. **Gap sizes**: Try different gap values (2rem, 4rem, etc.)
5. **WYSIWYG content**: Test various HTML content (headings, paragraphs, lists, images)

## Squiz DXP Integration

### Option A: DXP Component Service (Recommended)

```html
<!-- In Squiz Matrix paint layout -->
%dxp_component:{ "id": "two-column", "props": { "leftContent": "
<h3>Sidebar</h3>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
", "rightContent": "
<h3>Main Content</h3>
<p>Your content here...</p>
", "leftWidth": "1fr", "rightWidth": "2fr" } }%
```

### Option B: WYSIWYG Integration

When using FormattedText inputs, Squiz Matrix will automatically render WYSIWYG editors in the component configuration panel, allowing content editors to:

- Format text (bold, italic, headings)
- Add links and images
- Insert lists and tables
- Use Matrix asset picker

### Option C: HTML Nester (Fallback)

Use server-rendered output from `main.js` in Squiz Matrix nester template with metadata replacement.

## Dependencies

The following must be loaded in the page `<head>`:

- **Global design system CSS**:
  ```html
  <link
    rel="stylesheet"
    href="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.css%"
  />
  ```

**No JavaScript required** - TwoColumn is CSS-only.

## How It Works

1. **Server renders** complete HTML structure via `main.js`
2. **Grid styles applied** inline per instance (columns, gap)
3. **Background colors** applied inline to column divs (if specified)
4. **Global CSS** handles:
   - Base layout structure
   - Mobile responsive breakpoint (768px)
   - Padding when backgrounds are used
5. **Browser displays** final result - no client-side initialization needed

## Architecture Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Server (Edge)                         â”‚
â”‚   main.js renders complete HTML:        â”‚
â”‚                                         â”‚
â”‚   <div class="nt-two-column"            â”‚
â”‚        style="display: grid;            â”‚
â”‚                grid-template-columns:   â”‚
â”‚                  1fr 2fr;               â”‚
â”‚                gap: 2rem;">             â”‚
â”‚     <div class="...__left">             â”‚
â”‚       [WYSIWYG content]                 â”‚
â”‚     </div>                              â”‚
â”‚     <div class="...__right">            â”‚
â”‚       [WYSIWYG content]                 â”‚
â”‚     </div>                              â”‚
â”‚   </div>                                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Browser (Client)                      â”‚
â”‚                                         â”‚
â”‚   1. Loads web-design-system.css        â”‚
â”‚   2. Applies responsive breakpoint:     â”‚
â”‚      @media (max-width: 768px) {        â”‚
â”‚        grid-template-columns: 1fr;      â”‚
â”‚      }                                  â”‚
â”‚   3. Displays final layout              â”‚
â”‚                                         â”‚
â”‚   No JavaScript initialization needed   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Example Use Cases

### 1. Documentation Sidebar

```json
{
  "leftWidth": "1fr",
  "rightWidth": "2fr",
  "leftContent": "<h3>Table of Contents</h3><ul><li><a href='#intro'>Introduction</a></li><li><a href='#guide'>User Guide</a></li></ul>",
  "rightContent": "<h2>Introduction</h2><p>Welcome to our documentation...</p>"
}
```

### 2. Feature Comparison

```json
{
  "leftContent": "<h3>Basic Plan</h3><ul><li>Feature A</li><li>Feature B</li></ul>",
  "rightContent": "<h3>Pro Plan</h3><ul><li>Feature A</li><li>Feature B</li><li>Feature C</li></ul>",
  "leftBackground": "#f5f5f5",
  "rightBackground": "#e8f5e9"
}
```

### 3. Call-to-Action Sections

```json
{
  "leftWidth": "2fr",
  "rightWidth": "1fr",
  "leftContent": "<h2>Learn More</h2><p>Detailed information about our services...</p>",
  "rightContent": "<div style='text-align: center;'><button>Contact Us</button></div>"
}
```

## Development

The source files remain at `src/components/TwoColumn/` if you need to modify styles:

- `TwoColumn.css` - Base styles and responsive breakpoints
- Rebuild with: `npm run build` (updates `deploy/web-design-system.css`)

## Version History

- **1.0.0** - Initial DXP Component Service implementation with WYSIWYG support

