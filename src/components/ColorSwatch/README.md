# ColorSwatch Component

A display component that presents color swatches in a grid layout with optional title and description. Each swatch displays a color sample with its label and hex code in a card format. Part of the NT Government Web Design System, designed for showcasing colors from the extended color palette in design documentation and theming interfaces.

## Overview

The ColorSwatch component renders a responsive grid of color cards, each displaying:

- A large color sample area (99px height)
- A color name label (bold, 16px)
- A hex code value (muted, 14px)

The component supports:

- **Optional grid title** (H2 heading)
- **Optional grid description** (paragraph text)
- **Multiple color swatches** displayed in a responsive grid layout

### Icon Rationale

**Icon: `palette`** (Material Design icon)

The palette icon was chosen because it clearly represents color display and selection functionality. It's visually recognizable and semantically appropriate for a component that showcases color information. The icon appears in the DXP Component Services manifest with an orange accent color.

### Design Reference

The component follows the Figma specification:

- **Container**: 136px width (fixed)
- **Color sample**: 136px width × 99px height with 8px border-radius
- **Container padding**: 8px padding with subtle 1px border
- **Content area**: 8px padding with 4px gap between label and hex code
- **Typography**: Lato font family with 700 weight for labels, 400 for hex codes

## Features

- **Grid layout**: Responsive grid displaying multiple color swatches with auto-fill columns (136px fixed width)
- **Optional heading & description**: Add context with title (H2) and description text
- **Server-side & client-side rendering**: Works with both DXP SSR and vanilla JS hydration
- **Design token integration**: Uses CSS custom properties for consistent theming
- **Accessible markup**: Semantic HTML with proper ARIA attributes
- **Responsive design**: Grid adapts to container width with auto-fill columns
- **Auto-initialization**: Automatically mounts on DOM ready via data attributes (client-side)
- **Sanitization**: All user inputs are escaped to prevent XSS vulnerabilities

## Props / Input Properties

### DXP Component Schema (Server-Side)

The DXP component accepts the following properties for rendering a grid of color swatches:

| Property      | Type     | Required | Description                                                | Example                                    |
| ------------- | -------- | -------- | ---------------------------------------------------------- | ------------------------------------------ |
| `Title`       | `string` | No       | Optional heading for the color swatch grid, rendered as H2 | `"Extended Palette"`                       |
| `Description` | `string` | No       | Optional description displayed below the grid title        | `"The extended color palette provides..."` |
| `ColorValues` | `array`  | Yes      | Collection of color swatches to display (minimum 1 item)   | `[{ "Value": "Blue 03 #1F1F5F" }]`         |
| `cssClass`    | `string` | No       | Additional CSS class(es) to apply to the grid container    | `"custom-grid"`                            |

#### ColorValues Array Item Structure

Each item in the `ColorValues` array has the following structure:

| Property | Type     | Required | Description                                                 | Example               |
| -------- | -------- | -------- | ----------------------------------------------------------- | --------------------- |
| `Value`  | `string` | Yes      | Color in format: "Name #HexValue" (e.g., "Blue 03 #1F1F5F") | `"Orange 03 #E35205"` |

The `Value` string is automatically parsed by the server-side renderer:

- **Name** (before `#`): Used as the label
- **HexValue** (after `#`): Used as both the background color and hex code display

### Client-Side TypeScript Interface

For client-side hydration, each individual swatch expects these props:

```typescript
export interface ColorSwatchProps {
  Color?: string; // PascalCase (DXP standard)
  Label?: string;
  HexCode?: string;
  cssClass?: string;

  // Fallback lowercase props for legacy compatibility
  color?: string;
  label?: string;
  hexCode?: string;
  className?: string;
}
```

### Client-Side Property Details

| Property                 | Type     | Required | Description                                                                         | Example                               |
| ------------------------ | -------- | -------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| `Color` / `color`        | `string` | No       | Background color for the swatch sample. Accepts hex codes or CSS custom properties. | `"#1F1F5F"` or `"var(--clr-primary)"` |
| `Label` / `label`        | `string` | No       | Display name for the color                                                          | `"Blue 03"`                           |
| `HexCode` / `hexCode`    | `string` | No       | Hex code text to display below the label                                            | `"#1F1F5F"`                           |
| `cssClass` / `className` | `string` | No       | Additional CSS class(es) to apply to the container                                  | `"custom-variant"`                    |

**Note**: The component supports both PascalCase (DXP convention) and camelCase (legacy) property names with automatic fallback resolution.

## Usage Examples

### Vanilla JavaScript (Client-Side)

#### HTML with Data Attributes (Auto-initialization)

```html
<div
  data-hydration-component="color-swatch"
  data-hydration-props='{"Color":"#1F1F5F","Label":"Blue 03","HexCode":"#1F1F5F"}'
></div>
```

The component automatically initializes on `DOMContentLoaded` by scanning for `data-hydration-component="color-swatch"` attributes.

#### Manual Initialization

```typescript
import { ColorSwatchClient } from "@ntgovernment/web-design-system/components/ColorSwatch";

const container = document.getElementById("my-swatch");
const swatch = new ColorSwatchClient(container, {
  Color: "#E35205",
  Label: "Orange 03",
  HexCode: "#E35205",
});
```

### Server-Side Rendering (DXP)

#### Using the Main Function

```javascript
import colorSwatchComponent from "./src/components/ColorSwatch/dxp/main.js";

const html = await colorSwatchComponent.main({
  Title: "Extended Palette",
  Description:
    "The extended color palette provides a range of shades for each base color.",
  ColorValues: [
    { Value: "Blue 03 #1F1F5F" },
    { Value: "Orange 03 #E35205" },
    { Value: "Ochre 02 #C33826" },
    { Value: "Coral 03 #C25062" },
  ],
  cssClass: "my-custom-grid",
});

console.log(html);
// Outputs: <div class="nt-color-swatch-grid my-custom-grid">
//            <h2 class="nt-color-swatch-grid__title">Extended Palette</h2>
//            <p class="nt-color-swatch-grid__description">The extended color palette...</p>
//            <div class="nt-color-swatch-grid__container">
//              [4 color swatches rendered here]
//            </div>
//          </div>
```

#### Squiz DXP Component Services

1. **Deploy the component** via Git File Bridge (automatic on push to `dev` branch)
2. **Add to Matrix page** via DXP Component Services interface
3. **Configure inputs** in the component editor:
   - **Grid Title** (optional): `Extended Palette`
   - **Grid Description** (optional): `The extended color palette provides a range of shades for each base color.`
   - **Color Swatches** (array): Add multiple items
     - Color Value 1: `Blue 03 #1F1F5F`
     - Color Value 2: `Orange 03 #E35205`
     - Color Value 3: `Ochre 02 #C33826`
     - Color Value 4: `Coral 03 #C25062`

The component automatically parses each Value string (format: "Name #HexValue") and renders the grid with all swatches.

## Styling

### CSS Classes

| Class                                | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `.nt-color-swatch-grid`              | Root container for the entire component                     |
| `.nt-color-swatch-grid__title`       | Grid title (H2 heading, 28px font size)                     |
| `.nt-color-swatch-grid__description` | Grid description (paragraph text, 16px font size)           |
| `.nt-color-swatch-grid__container`   | Grid container with auto-fill layout (136px columns)        |
| `.nt-color-swatch`                   | Individual swatch card with border, padding, and background |
| `.nt-color-swatch__sample`           | Color display area (99px height, 136px width)               |
| `.nt-color-swatch__content`          | Text container with padding and gap                         |
| `.nt-color-swatch__label`            | Color name (bold, 16px)                                     |
| `.nt-color-swatch__hex`              | Hex code text (muted, 14px)                                 |

### Design Tokens Used

The component leverages the following design tokens for consistent theming:

```css
/* Spacing */
--sp-xxs: 4px /* Gap between label and hex code */ --sp-xs: 8px
  /* Container and content padding */ --sp-sm: 16px /* Margin below title */
  --sp-md: 24px /* Grid gap and margin below description */
  /* Border & Background */ --border-width-md: 1px --clr-border-subtle: #d3d3d7
  --clr-bg-default: #ffffff --radii-none: 0px
  /* Border radius (sharp corners) */ /* Typography */
  --clr-text-default: #1f1e27 /* Title, description, and label color */
  --clr-text-muted: #666774 /* Hex code color */ --font-family-primary: Lato
  /* Focus State */ --shadow-focus-ntg: 0px 0px 0px 4px #ec8c58ff;
```

### Customization

#### Grid Container Customization

Add custom styles via the `cssClass` prop in the DXP component:

```javascript
const html = await colorSwatchComponent.main({
  Title: "Extended Palette",
  ColorValues: [{ Value: "Blue 03 #1F1F5F" }, { Value: "Orange 03 #E35205" }],
  cssClass: "compact-grid",
});
```

```css
.compact-grid .nt-color-swatch-grid__container {
  gap: 16px;
  grid-template-columns: repeat(auto-fill, 120px);
}

.compact-grid .nt-color-swatch {
  width: 120px;
}

.compact-grid .nt-color-swatch__sample {
  width: 120px;
  height: 80px;
}
```

#### Individual Swatch Customization

For client-side hydrated swatches:

```html
<div
  data-hydration-component="color-swatch"
  data-hydration-props='{"Color":"#1F1F5F","Label":"Primary","HexCode":"#1F1F5F","cssClass":"featured-color"}'
></div>
```

```css
.featured-color {
  border: 2px solid gold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## Accessibility

- **Semantic HTML**: Uses `div` elements with descriptive class names
- **ARIA attributes**: Color sample has `aria-hidden="true"` since it's decorative
- **Text content**: Label and hex code are readable by screen readers
- **Focus states**: Interactive elements support `--shadow-focus-ntg` token
- **Color contrast**: Text colors meet WCAG AA standards against white background

### Future Enhancements

For interactive variants:

- Add `tabindex="0"` to make focusable
- Include `role="button"` and keyboard handlers for click-to-copy
- Implement ARIA live region for copy feedback

## DXP Deployment

### File Structure in Repository

```
src/components/ColorSwatch/
├── index.ts                    # Component exports
├── ColorSwatch.vanilla.ts      # Client-side implementation
├── ColorSwatch.css             # Component styles
├── README.md                   # This documentation
└── dxp/
    ├── main.js                 # Server-side renderer
    ├── manifest.json           # DXP component schema
    └── preview.html            # DXP dev-ui preview wrapper
```

### Manifest Configuration

The `manifest.json` defines the component for Squiz DXP:

- **Namespace**: `web-design-system`
- **Name**: `color-swatch`
- **Display Name**: "Color Swatch"
- **Icon**: `palette` (orange)
- **Type**: `edge` (edge-rendered component)
- **Main Function**: `main` (entry point: `main.js`)

### Input Schema

```json
{
  "Color": {
    "type": "string",
    "title": "Color Value",
    "description": "Hex color code (e.g., #1F1F5F) or CSS custom property"
  },
  "Label": {
    "type": "string",
    "title": "Color Name",
    "description": "Display label for the color (e.g., 'Blue 03')"
  },
  "HexCode": {
    "type": "string",
    "title": "Hex Code",
    "description": "Hex code to display below the label (e.g., '#1F1F5F')"
  }
}
```

**Note**: `required` array is empty for dev-ui compatibility, allowing preview without all fields.

### Preview Configuration

The component includes an inline preview in the manifest:

```json
{
  "previews": {
    "basic": {
      "functionData": {
        "main": {
          "wrapper": { "path": "preview.html" },
          "inputData": {
            "type": "inline",
            "value": {
              "Color": "#1F1F5F",
              "Label": "Blue 03",
              "HexCode": "#1F1F5F"
            }
          }
        }
      }
    }
  }
}
```

### Deployment Process

1. **Commit changes** to the `dev` branch
2. **Push to GitHub**: `git push origin dev`
3. **Automatic sync**: Git File Bridge syncs files to Squiz Matrix
4. **Component available**: Use via DXP Component Services in Matrix

### Using in Squiz Matrix

1. Navigate to the page where you want to add the component
2. Open DXP Component Services
3. Search for "Color Swatch" or filter by "web-design-system" namespace
4. Drag onto the page or insert via component picker
5. Configure the input properties in the editor:
   - **Color Value**: Enter a hex code (e.g., `#1F1F5F`)
   - **Color Name**: Enter the color label (e.g., `Blue 03`)
   - **Hex Code**: Enter hex code for display (e.g., `#1F1F5F`)
6. Save and publish

## Development

### Local Testing

#### Development Server

```bash
# Start Vite dev server
npm run dev
```

Open `http://localhost:5173/preview/color-swatch.html` to view the component preview with multiple examples.

#### Testing DXP Main Function

```bash
# Test server-side rendering
node -e "import('./src/components/ColorSwatch/dxp/main.js').then(m => console.log(m.default.main({Color:'#1F1F5F',Label:'Test',HexCode:'#1F1F5F'})))"
```

### Build Process

```bash
# Build production bundle
npm run build
```

Output files:

- `deploy/web-design-system.min.js` - Includes ColorSwatch client code
- `deploy/web-design-system.min.css` - Includes ColorSwatch styles

### File Responsibilities

| File                     | Purpose                                      | Used By                           |
| ------------------------ | -------------------------------------------- | --------------------------------- |
| `index.ts`               | Exports component class and types            | Build system, TypeScript projects |
| `ColorSwatch.vanilla.ts` | Client-side rendering, auto-mount, hydration | Browser, bundler                  |
| `ColorSwatch.css`        | Component styles with design tokens          | Browser, bundler                  |
| `dxp/main.js`            | Server-side HTML generation                  | Squiz DXP Component Services      |
| `dxp/manifest.json`      | Component metadata, schema, preview          | Squiz DXP dev-ui                  |
| `dxp/preview.html`       | Preview wrapper (uses raw values per spec)   | Squiz DXP dev-ui                  |

### Adding New Color Variants

To add more color swatches to the preview:

```html
<div
  data-hydration-component="color-swatch"
  data-hydration-props='{"Color":"#XYZ123","Label":"Custom Color","HexCode":"#XYZ123"}'
></div>
```

## Architecture

### Auto-Hydration Pattern

The component uses a data-attribute-driven hydration pattern:

1. **Server renders** (or static HTML includes) elements with `data-hydration-component="color-swatch"`
2. **Client-side script** scans for these elements on `DOMContentLoaded`
3. **Auto-initialization** creates `ColorSwatchClient` instances
4. **Props parsing** from `data-hydration-props` JSON attribute

```typescript
if (typeof document !== "undefined") {
  const initColorSwatches = () => {
    document
      .querySelectorAll('[data-hydration-component="color-swatch"]')
      .forEach((node) => new ColorSwatchClient(node as HTMLElement));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorSwatches);
  } else {
    initColorSwatches();
  }
}
```

### Sanitization

All user inputs are sanitized to prevent XSS attacks:

```typescript
import { escapeHtml, escapeAttr } from "../../utils/sanitize";

// For text content
const safeLabel = escapeHtml(label);

// For HTML attributes
const safeColor = escapeAttr(color);
```

- **`escapeHtml()`**: Escapes `&`, `<`, `>`, `"`, `'` for safe innerHTML
- **`escapeAttr()`**: Same as escapeHtml, safe for attribute values

### Global Export

To prevent issues with JavaScript minification/bundling, the component class is exported globally:

```typescript
declare global {
  interface Window {
    NTGColorSwatch: typeof ColorSwatchClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGColorSwatch = ColorSwatchClient;
}
```

This ensures `window.NTGColorSwatch` is always available, even after minification.

### Props Resolution

The component supports both PascalCase (DXP standard) and camelCase (legacy) props with automatic fallback:

```typescript
private resolveText(primary?: string, fallback?: string): string {
  return primary || fallback || "";
}

const color = this.resolveText(this.props.Color, this.props.color);
const label = this.resolveText(this.props.Label, this.props.label);
```

This ensures compatibility with both naming conventions.

## Extended Color Palette Examples

The ColorSwatch component is designed to showcase colors from the NT Government extended color palette:

### Blue Shades

- **Blue 01**: `#B4B4CA` - Light blue
- **Blue 02**: `#44447A` - Medium blue
- **Blue 03**: `#1F1F5F` - Primary blue (NT Gov brand color)
- **Blue 04**: `#0F0F2F` - Dark blue

### Orange Shades

- **Orange 01**: `#F6C5AC` - Light orange
- **Orange 02**: `#EC8C58` - Medium orange (focus state)
- **Orange 03**: `#E35205` - Bright orange
- **Orange 04**: `#712902` - Dark orange

### Ochre Shades

- **Ochre 01**: `#CDA5A0` - Light ochre
- **Ochre 02**: `#C33826` - Accent ochre (border accent)
- **Ochre 03**: `#A22F20` - Medium ochre
- **Ochre 04**: `#611C13` - Dark ochre

### Coral Shades

- **Coral 01**: `#EBC5CB` - Light coral
- **Coral 02**: `#CC6D7C` - Medium coral
- **Coral 03**: `#C25062` - Bright coral
- **Coral 04**: `#611C13` - Dark coral

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **ES6+ features**: Uses `const`, `let`, arrow functions, template literals
- **CSS Custom Properties**: Requires browsers with CSS variable support
- **Auto-polyfill**: Build process may include polyfills via Vite

## Version History

### v1.0.0 (Initial Release)

- Display-only color swatch component
- Server-side and client-side rendering support
- DXP Component Services integration
- Design token integration
- Auto-hydration pattern implementation
- Extended color palette support

## Related Components

- **Notification**: Similar simple display pattern, card-like structure
- **MiniPageCard**: Icon + text layout, card grid pattern
- **PageCard**: Full card with image and text
- **ThemeSwitcher**: Theme manipulation, uses color tokens

## Future Enhancements

1. **Interactive Mode**: Click to copy hex code to clipboard
2. **Color Formats**: Support RGB, HSL, OKLCH display
3. **Color Contrast**: Show WCAG contrast ratios
4. **Color Variations**: Display tints/shades automatically
5. **Accessibility Score**: Indicate if color meets accessibility standards
6. **Export Options**: Download color palette as CSS/JSON/Figma

## Troubleshooting

### Component not rendering

1. **Check if CSS is loaded**: Verify `web-design-system.min.css` is included
2. **Check if JS is loaded**: Verify `web-design-system.min.js` is included
3. **Check data attributes**: Ensure `data-hydration-component="color-swatch"` is correct
4. **Check JSON syntax**: Validate `data-hydration-props` JSON is properly formatted
5. **Check console**: Look for JavaScript errors in browser DevTools

### Colors not displaying

1. **Invalid hex code**: Ensure color starts with `#` and has 3 or 6 hex digits
2. **CSS variable undefined**: If using CSS custom properties, ensure they're defined
3. **Inline style blocked**: Check Content Security Policy allows inline styles

### Styles not applying

1. **CSS specificity**: Check if other styles are overriding component styles
2. **Design tokens missing**: Ensure external tokens are imported in `tokens.css`
3. **Build not updated**: Run `npm run build` to regenerate bundles

## Contributing

When modifying this component:

1. **Update TypeScript interface** if adding new props
2. **Update CSS** with appropriate design tokens (avoid hardcoded values)
3. **Update manifest.json** input schema for new DXP properties
4. **Update this README** with new features/changes
5. **Test both client and server** rendering
6. **Run build** and verify output
7. **Test in DXP dev-ui** preview mode

## License

Part of the NT Government Web Design System.  
© Northern Territory Government of Australia

## Support

For questions, issues, or contributions:

- **GitHub Issues**: [ntgovernment/web-design-system](https://github.com/ntgovernment/web-design-system)
- **Internal Support**: Contact the Web Design System team

---

**Component Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintainer**: NT Government Web Design System Team
