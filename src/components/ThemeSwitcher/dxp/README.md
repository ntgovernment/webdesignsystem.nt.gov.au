# Theme Switcher - DXP Component

Multi-URL theme switcher component with tab navigation supporting up to 3 themes with iframe previews.

## Overview

The Theme Switcher component allows users to switch between different theme variations using a tab-based interface. Each theme displays content in an iframe, with all iframes loading upfront for instant switching.

## Features

- **1-3 Theme Support**: Add between 1 and 3 themes with unique URLs
- **Tab Navigation**: Clean tab interface for switching between themes
- **Instant Switching**: All iframes load upfront for zero-delay switching
- **Responsive Design**: Works across all device sizes
- **Hydration Pattern**: Server renders minimal HTML, client adds interactivity
- **No Framework Dependencies**: Pure vanilla JavaScript

## Usage

### DXP Component Service Integration

Use the hydration pattern for server-side rendering:

```html
<div
  data-hydration-component="theme-switcher"
  data-hydration-props='{
    "themes": [
      {"name": "Light", "url": "https://example.com/light"},
      {"name": "Dark", "url": "https://example.com/dark"}
    ],
    "height": "600px",
    "defaultTheme": "Light"
  }'
></div>
```

The client-side JavaScript will automatically detect and hydrate this container.

### Props

| Prop           | Type   | Required | Default     | Description                                                 |
| -------------- | ------ | -------- | ----------- | ----------------------------------------------------------- |
| `themes`       | Array  | Yes      | -           | Array of 1-3 theme objects with `name` and `url` properties |
| `height`       | String | No       | `"600px"`   | Height of the iframe container (e.g., "400px", "50vh")      |
| `defaultTheme` | String | No       | First theme | Name of the theme to display by default                     |
| `cssClass`     | String | No       | `""`        | Additional CSS classes for the container                    |

### Theme Object Structure

```typescript
{
  name: string; // Display name for the tab
  url: string; // URL to load in the iframe
}
```

## Examples

### Single Theme (No Tabs)

```json
{
  "themes": [
    {
      "name": "Default",
      "url": "https://example.com/component"
    }
  ],
  "height": "400px"
}
```

### Two Themes

```json
{
  "themes": [
    {
      "name": "Light Theme",
      "url": "https://example.com/light"
    },
    {
      "name": "Dark Theme",
      "url": "https://example.com/dark"
    }
  ],
  "height": "500px",
  "defaultTheme": "Light Theme"
}
```

### Three Themes (Maximum)

```json
{
  "themes": [
    {
      "name": "Light",
      "url": "https://example.com/light"
    },
    {
      "name": "Dark",
      "url": "https://example.com/dark"
    },
    {
      "name": "High Contrast",
      "url": "https://example.com/contrast"
    }
  ],
  "height": "600px",
  "defaultTheme": "Light"
}
```

## Local Development

### Preview Server

To test the component locally:

**macOS/Linux:**

```bash
./serve-preview.sh
```

**Windows:**

```cmd
serve-preview.bat
```

Then open http://localhost:3000/dxp-components/theme-switcher/preview.html

### File Structure

```
theme-switcher/
├── main.js              # Server-side renderer
├── manifest.json        # Component metadata and schema
├── example.data.json    # Example configurations
├── preview.html         # Local preview page
├── serve-preview.sh     # Unix preview server script
├── serve-preview.bat    # Windows preview server script
└── README.md           # This file
```

## Architecture

### Hydration Pattern

1. **Server-side**: Renders minimal HTML with data attributes
2. **Client-side**: Scans for `[data-hydration-component="theme-switcher"]` elements
3. **Auto-initialization**: Parses props and renders full UI on page load

### Client-Side Behavior

- Scans DOM for hydration containers on DOMContentLoaded
- Parses `data-hydration-props` JSON attribute
- Renders tab navigation (if 2+ themes)
- Creates iframes for all themes
- Loads all iframes immediately
- Shows/hides iframes based on active tab

## Styling

The component uses BEM-style CSS classes:

- `.nt-theme-switcher` - Main container
- `.nt-theme-switcher__tabs` - Tab navigation container
- `.nt-theme-switcher__tab` - Individual tab button
- `.nt-theme-switcher__tab--active` - Active tab state
- `.nt-theme-switcher__content` - Iframe container
- `.nt-theme-switcher__iframe` - Individual iframe

Custom styles can be added via the `cssClass` prop or by targeting these classes.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills for Array methods)

## Version History

- **2.0.0** - Complete rewrite with multi-URL support and tab navigation
- **1.x.x** - Legacy dropdown theme selector (deprecated)
