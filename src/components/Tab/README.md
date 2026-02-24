# Tab Component

Organize long pages into sections with sticky tab navigation. Automatically detects tab markers in the DOM and generates interactive navigation when 2+ tabs are present.

## Overview

The Tab component scans the DOM for tab marker elements, groups subsequent content into tab panels, and generates a sticky navigation bar. The navigation only renders when multiple tabs are detected, maintaining clean layouts for single-section pages.

## Key Features

- **Automatic DOM scanning** — Detects `.nt-tab-marker` elements and groups following content
- **Smart rendering** — Only displays navigation when 2+ tabs exist
- **Sticky positioning** — Navigation sticks below header (configurable offset)
- **Keyboard accessible** — Arrow keys, Home, End for navigation
- **URL hash support** — Activates tabs matching URL hash on load
- **ARIA compliant** — Follows W3C ARIA tabs pattern
- **Zero dependencies** — Pure vanilla JavaScript and CSS

## What's Included

- `Tab.vanilla.ts` — Main component class with auto-initialization
- `Tab.css` — Sticky navigation styles with design tokens
- `index.ts` — Export file
- `dxp/manifest.json` — DXP edge component schema
- `dxp/main.js` — Server-side HTML renderer
- `dxp/preview.html` — DXP development preview

## File Structure

```
src/components/Tab/
├── Tab.vanilla.ts     # Client-side component class
├── Tab.css            # Component styles
├── index.ts           # Export file
├── README.md          # This file
└── dxp/
    ├── manifest.json  # DXP component schema
    ├── main.js        # Server-side renderer
    └── preview.html   # DXP preview wrapper
```

## Usage — Vanilla JavaScript

### Basic HTML Structure

Add a container with `data-tab-container` attribute and insert tab markers wherever you want tabs:

```html
<div class="content" data-tab-container=".content">
  <!-- Tab 1 -->
  <div class="nt-tab-marker" data-tab-title="Overview"></div>
  <h2>Overview Section</h2>
  <p>Content for the overview tab...</p>

  <!-- Tab 2 -->
  <div class="nt-tab-marker" data-tab-title="Details"></div>
  <h2>Details Section</h2>
  <p>Content for the details tab...</p>

  <!-- Tab 3 -->
  <div class="nt-tab-marker" data-tab-title="Resources"></div>
  <h2>Resources Section</h2>
  <p>Content for the resources tab...</p>
</div>
```

### How It Works

1. Component scans the container for `.nt-tab-marker` elements
2. Extracts `data-tab-title` from each marker
3. Groups all following sibling elements until the next marker
4. Wraps grouped content in `role="tabpanel"` containers
5. Generates sticky `role="tablist"` navigation
6. Hides inactive panels and shows only the active tab content

### Configuration via Data Attributes

```html
<div
  class="content"
  data-tab-container=".content"
  data-tab-marker-class="nt-tab-marker"
  data-tab-sticky-offset="var(--header-height, 76px)"
>
  <!-- Tab markers and content -->
</div>
```

### Programmatic Usage

```javascript
import { TabClient } from "@ntgovernment/web-design-system/components/Tab";

// Initialize with custom config
const container = document.querySelector(".my-container");
const tabs = new TabClient(container, {
  containerSelector: ".content",
  markerClass: "nt-tab-marker",
  stickyOffset: "80px",
});

// Get active tab
const activeIndex = tabs.getActiveTabIndex();

// Switch to a specific tab
tabs.setActiveTab(2);

// Get all tabs data
const allTabs = tabs.getTabs();

// Clean up
tabs.destroy();
```

## Usage — DXP Edge Component

For Squiz Matrix, the Tab component renders as an invisible marker element. When the
page is delivered to the browser, the client-side JavaScript will collect all markers
and build the interactive tab navigation based on their `data-tab-title`/`data-tab-id`
attributes.

This simplified pattern allows authors to sprinkle `web-design-system/tab` components
around a page and then add the corresponding content immediately after each marker.

### Input Schema

```json
{
  "title": "Overview", // required string
  "anchor": "overview" // optional string; defaults to a kebab‑case version of the title
}
```

Any additional properties are ignored. The component only outputs a single `<div>`
marker.

### Authoring Example (Squiz Matrix)

```html
<div class="content" data-tab-container=".content">
  <!-- Tab instance #1 -->
  <div
    data-dxp-component="web-design-system/tab"
    data-dxp-props='{"title":"Overview"}'
  ></div>
  <h2>Overview Section</h2>
  <p>Page introduction…</p>

  <!-- Tab instance #2 -->
  <div
    data-dxp-component="web-design-system/tab"
    data-dxp-props='{"title":"Fees and Charges","anchor":"fees"}'
  ></div>
  <h2>Fees and Charges</h2>
  <p>Details about fees…</p>

  <!-- repeat for each tab -->
</div>
```

The `anchor` property lets you explicitly control the hash used for deep–linking; if
omitted it is derived from the title by lower‑casing, replacing spaces with hyphens,
and stripping invalid characters. The JavaScript component uses `data-tab-id`
internally to identify tabs and will activate the tab if its id matches
`window.location.hash` (without the leading `#`).

> **Note:** the DXP renderer does not wrap or duplicate your content – it simply
> outputs a marker. All tab panels are created by the browser when the script runs.

### Preview

Use `dxp-next cmp dev-ui src/components/Tab/dxp` to see a live preview of the
marker inside a Squiz page layout; the preview file includes multiple markers plus
sample content.

## Data Attributes

| Attribute                | Description                                | Default                        |
| ------------------------ | ------------------------------------------ | ------------------------------ |
| `data-tab-container`     | CSS selector for content container to scan | `".content"`                   |
| `data-tab-marker-class`  | CSS class name for tab marker elements     | `"nt-tab-marker"`              |
| `data-tab-sticky-offset` | CSS value for sticky top position          | `"var(--header-height, 76px)"` |
| `data-tab-title`         | **(On markers)** Display title for the tab | Required                       |

## JavaScript API

### Constructor

```typescript
new TabClient(container: HTMLElement, config?: Partial<TabProps>)
```

### Props Interface

```typescript
interface TabProps {
  containerSelector?: string; // Selector for content container
  markerClass?: string; // Class name for tab markers
  stickyOffset?: string; // CSS value for sticky positioning
}

interface TabData {
  title: string; // Tab display title
  markerElement: HTMLElement; // Original marker element
  contentElements: HTMLElement[]; // Content elements for this tab
  panelElement: HTMLElement | null; // Wrapped panel element
  id: string; // Generated unique ID
}
```

### Methods

#### `getActiveTabIndex(): number`

Returns the zero-based index of the currently active tab.

```javascript
const activeIndex = tabs.getActiveTabIndex();
console.log(`Active tab: ${activeIndex}`);
```

#### `getTabs(): TabData[]`

Returns array of all tab data objects.

```javascript
const allTabs = tabs.getTabs();
console.log(`Total tabs: ${allTabs.length}`);
allTabs.forEach((tab) => console.log(tab.title));
```

#### `setActiveTab(index: number): void`

Programmatically switch to a specific tab by index.

```javascript
tabs.setActiveTab(1); // Switch to second tab
```

#### `destroy(): void`

Clean up the component, remove event listeners, and restore original DOM structure.

```javascript
tabs.destroy();
```

### Global Exposure

Component is exposed globally for programmatic access:

```javascript
const tabs = new window.NTGTab(container, config);
```

## CSS Classes

| Class                     | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `.nt-tab__nav`            | Sticky navigation container with `role="tablist"` |
| `.nt-tab__button`         | Individual tab button with `role="tab"`           |
| `.nt-tab__button--active` | Active tab button modifier                        |
| `.nt-tab__panel`          | Content panel wrapper with `role="tabpanel"`      |
| `.nt-tab-marker`          | Tab marker element (hidden after initialization)  |

## Design Tokens

The component uses the following design tokens from `tokens.css`:

### Layout & Spacing

- `--tab-sticky-offset` — Custom property for sticky position (default: `var(--header-height, 76px)`)
- `--sp-md` (16px) — Tab button padding
- `--sp-xl` (24px) — Tab button horizontal padding
- `--sp-lg` (20px) — Mobile padding

### Colors

- `--clr-bg-shade` (#f5f5f7) — Navigation background
- `--clr-bg-default` (white) — Active tab background
- `--clr-link-default` (#1f1f5f) — Active tab text color
- `--clr-link-hover` (#c33826) — Hover color
- `--clr-text-muted` (#666774) — Inactive tab text
- `--clr-border-subtle` (#d3d3d7) — Border color

### Typography

- `--font-family-primary` (Lato) — Font family
- `--type-body-default-size` (1rem) — Tab button font size
- `--type-body-sm-size` (0.875rem) — Mobile font size

### Borders

- `--border-width-lg` (2px) — Navigation border, focus outline
- `--border-width-xl` (4px) — Active tab indicator

## Rendered HTML Structure

After initialization, the component generates the following structure:

```html
<div class="content" data-tab-container=".content">
  <!-- Generated navigation -->
  <nav class="nt-tab__nav" role="tablist" aria-label="Tab navigation">
    <button
      class="nt-tab__button nt-tab__button--active"
      role="tab"
      aria-selected="true"
      aria-controls="tab-xyz-overview-panel"
      id="tab-xyz-overview-tab"
      data-tab-index="0"
      tabindex="0"
    >
      Overview
    </button>
    <button
      class="nt-tab__button"
      role="tab"
      aria-selected="false"
      aria-controls="tab-xyz-details-panel"
      id="tab-xyz-details-tab"
      data-tab-index="1"
      tabindex="-1"
    >
      Details
    </button>
  </nav>

  <!-- Hidden marker -->
  <div
    class="nt-tab-marker"
    data-tab-title="Overview"
    style="display: none;"
  ></div>

  <!-- Wrapped content panel -->
  <div
    class="nt-tab__panel"
    role="tabpanel"
    id="tab-xyz-overview-panel"
    aria-labelledby="tab-xyz-overview-tab"
  >
    <h2>Overview Section</h2>
    <p>Content...</p>
  </div>

  <!-- Hidden marker -->
  <div
    class="nt-tab-marker"
    data-tab-title="Details"
    style="display: none;"
  ></div>

  <!-- Hidden content panel -->
  <div
    class="nt-tab__panel"
    role="tabpanel"
    id="tab-xyz-details-panel"
    aria-labelledby="tab-xyz-details-tab"
    hidden
  >
    <h2>Details Section</h2>
    <p>More content...</p>
  </div>
</div>
```

## Accessibility

The Tab component follows the [W3C ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

### ARIA Attributes

- **Tab List:** `role="tablist"` on navigation container
- **Tab Buttons:** `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`
- **Tab Panels:** `role="tabpanel"`, `aria-labelledby`, `hidden`
- **Focus Management:** Only active tab is focusable (`tabindex="0"` vs `"-1"`)

### Keyboard Navigation

| Key                                 | Action                      |
| ----------------------------------- | --------------------------- |
| <kbd>Tab</kbd>                      | Move focus to/from tab list |
| <kbd>→</kbd> / <kbd>↓</kbd>         | Next tab                    |
| <kbd>←</kbd> / <kbd>↑</kbd>         | Previous tab                |
| <kbd>Home</kbd>                     | First tab                   |
| <kbd>End</kbd>                      | Last tab                    |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate focused tab        |

### Screen Reader Support

- Tab buttons announce as "Tab, {title}, {number} of {total}"
- Active/inactive state announced via `aria-selected`
- Tab panel content associated with tab button via `aria-controls`
- Hidden panels removed from tab order with `hidden` attribute

### Focus Indicators

- Clear focus outline on tab buttons using `--clr-link-default`
- Focus remains visible in high contrast mode
- Active tab receives focus when switching

## Notes

### Single Tab Behavior

When only 1 tab is detected, the navigation is **not rendered**. This maintains a clean layout for pages that conditionally show tabs.

```html
<!-- Only 1 tab marker = no navigation -->
<div class="content" data-tab-container=".content">
  <div class="nt-tab-marker" data-tab-title="Content"></div>
  <h2>Page Content</h2>
  <!-- No tab navigation will appear -->
</div>
```

### URL Hash Activation

The component checks `window.location.hash` on load and activates a matching tab (case-insensitive, kebab-case):

```
https://example.com/page#details
→ Activates tab with title "Details"
```

**Note:** The component does **not** update the URL hash when tabs are switched. If you need this behavior, extend the component or add a custom event listener.

### Multiple Tab Groups

You can have multiple independent tab groups on one page. Each needs its own container:

```html
<!-- Group 1 -->
<div class="content" data-tab-container=".content">
  <div class="nt-tab-marker" data-tab-title="Tab 1"></div>
  <!-- content -->
</div>

<!-- Group 2 -->
<div class="other-content" data-tab-container=".other-content">
  <div class="nt-tab-marker" data-tab-title="Tab A"></div>
  <!-- content -->
</div>
```

### Mobile Behavior

On screens < 768px:

- Tab navigation becomes horizontally scrollable
- Sticky position changes to `top: 0` (viewport top)
- Tab buttons shrink with smaller padding
- Custom scrollbar styling for smooth UX

### Print Styles

When printing:

- Tab navigation is hidden
- All tab panels are shown (override `hidden` attribute)
- All content is visible regardless of active tab

### Performance Considerations

- DOM scanning is performed once on initialization
- Only active panel content is displayed (hidden panels use `display: none`)
- Event delegation could be added for better performance with many tabs
- Consider lazy-loading content for tabs with heavy media

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported (uses modern JS features)
- Graceful degradation: content remains accessible if JS fails

## Versioning

**Current Version:** 1.0.0

### Changelog

#### 1.0.0 (Initial Release)

- Automatic DOM scanning for tab markers
- Sticky navigation with configurable offset
- Keyboard navigation (Arrow keys, Home, End)
- URL hash support for default tab
- Single tab smart rendering
- Full ARIA implementation
- DXP edge component integration

## Related Components

- **LeftNav** — Side navigation with collapsible sections
- **ThemeSwitcher** — Tab-based theme preview component
- **PageBanner** — Hero banner that tabs position below

## Tab Marker Transformer (DXP Format)

### Overview

The Tab Marker Transformer is an alternative tab implementation that converts simple `<hr><p>Title</p><hr>` patterns into DXP-formatted interactive tabs. This approach is specifically designed for Squiz Matrix content authors and supports inline styles with data-attributes.

**Key Difference:** While the standard Tab component uses `data-tab-marker` elements with `data-tab-title` attributes, the Transformer uses a simpler HTML pattern that's easier for content editors to create in WYSIWYG editors.

### When to Use

- **Squiz Matrix Pages:** Content edited in Paint Layouts or Standard Pages
- **Legacy Content Migration:** Converting existing HR-based section dividers to tabs
- **Simple Content Pages:** Pages without complex nested structures
- **WYSIWYG Editing:** When content authors use visual editors

### HTML Pattern

```html
<div id="content" class="ntg-body">
  <!-- Page content before tabs -->
  <h1>Page Title</h1>
  <p>Introduction paragraph...</p>

  <!-- Tab 1 Marker -->
  <hr />
  <p>Overview</p>
  <hr />
  <p></p>

  <!-- Tab 1 Content -->
  <h2>Overview Section</h2>
  <p>Content for the overview tab...</p>
  <div>More content...</div>

  <!-- Tab 2 Marker -->
  <hr />
  <p>Usage</p>
  <hr />
  <p></p>

  <!-- Tab 2 Content -->
  <h2>Usage Guidelines</h2>
  <p>Content for the usage tab...</p>

  <!-- Additional tabs follow the same pattern -->
</div>
```

### Auto-Initialization

The transformer is included in the unified `web-design-system.min.js` bundle and exposed globally as `window.transformTabMarkers`. It's automatically called by the footer-js nester:

```javascript
// Included in deploy/nesters/footer-js.html
document.addEventListener("DOMContentLoaded", function () {
  if (window.transformTabMarkers && document.getElementById("content")) {
    window.transformTabMarkers("#content");
  }
});
```

### How It Works

**Algorithm:**

1. Scans container for `<hr><p>Title</p><hr>` patterns
2. Extracts tab titles from paragraph text
3. Hides marker elements using `display: none`
4. Creates DXP-formatted navigation with inline styles
5. Inserts navigation before the content container
6. Attaches click handlers for tab switching
7. Shows first tab content, hides all others

**Content Management:**

- Tracks marker position indices
- Calculates content boundaries between tabs
- Shows/hides content by setting `display` property
- Next tab's first marker marks the end of current tab content

### DXP Tab Navigation Structure

Generated navigation uses nested divs with DXP data-attributes and inline styles:

```html
<div
  data-breakpoint="xl +lg + md"
  data-scroll-left="false"
  data-scroll-right="false"
  style="width: 100%; position: sticky; top: 0; z-index: 100; background: var(--clr-bg-default, white); border-top: 1px var(--clr-border-subtle, #D3D3D7) solid; border-bottom: 1px var(--clr-border-subtle, #D3D3D7) solid; display: flex; justify-content: center;"
>
  <div
    style="width: 100%; max-width: 1200px; padding: 0 var(--sp-xl, 24px); display: flex; justify-content: flex-start; align-items: center;"
  >
    <!-- Tab Button 1 (Active) -->
    <div
      data-active="True"
      data-horizontal="true"
      data-left-icon="false"
      data-show-badge="false"
      data-state="idle"
      data-tab-index="0"
      style="cursor: pointer; min-width: 64px; padding: 16px; border-bottom: 4px var(--clr-border-accent, #C33826) solid;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
      >
        <div style="display: flex; align-items: center; gap: 8px;">
          <div
            style="color: var(--clr-link-default, #1F1F5F); font-size: 16px; font-family: Lato; font-weight: 700; line-height: 24px;"
          >
            Overview
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Button 2 (Inactive) -->
    <div
      data-active="False"
      data-horizontal="true"
      data-left-icon="false"
      data-show-badge="false"
      data-state="idle"
      data-tab-index="1"
      style="cursor: pointer; min-width: 64px; padding: 16px;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 4px;"
      >
        <div style="display: flex; align-items: center; gap: 8px;">
          <div
            style="color: var(--clr-link-default, #1F1F5F); font-size: 16px; font-family: Lato; font-weight: 400; line-height: 24px;"
          >
            Usage
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Tab Button Styling

**Data Attributes:**

- `data-active` — "True" for active tab, "False" for inactive
- `data-horizontal` — Always "true" for horizontal layout
- `data-left-icon` — "false" (no icons in basic implementation)
- `data-show-badge` — "false" (no badges in basic implementation)
- `data-state` — "idle" (interactive state)
- `data-tab-index` — Zero-based tab index

**Inline Styles:**

- **All tabs:**
  - `cursor: pointer`
  - `min-width: 64px`
  - `padding: 16px`
  - Font: Lato, 16px, line-height 24px
  - Color: `var(--clr-link-default, #1F1F5F)`
- **Active tab:**
  - `border-bottom: 4px var(--clr-border-accent, #C33826) solid`
  - `font-weight: 700`
- **Inactive tabs:**
  - No bottom border
  - `font-weight: 400`
  - Hover: background color change

### Programmatic Usage

If you need to call the transformer manually or use a different container selector:

```javascript
// Default selector is '#colour-content'
window.transformTabMarkers("#content");

// Custom container
window.transformTabMarkers(".my-container");

// Check if function exists before calling
if (typeof window.transformTabMarkers === "function") {
  const tabCount = window.transformTabMarkers("#content");
  console.log(`Transformed ${tabCount} tabs`);
}
```

### Integration with Squiz Matrix

**1. Content Structure**

In Squiz Matrix Paint Layouts or Standard Pages, use the WYSIWYG editor to create tab markers:

```html
<MySource_AREA id_name="body" design_area="body">
  <!-- Content authors insert: -->
  <!-- Horizontal Rule (Insert > Horizontal Rule) -->
  <!-- Paragraph with tab title text -->
  <!-- Horizontal Rule (Insert > Horizontal Rule) -->
  <!-- Empty paragraph -->
  <!-- Then add tab content below -->
</MySource_AREA>
```

**2. Footer JS Nester**

The footer-js nester automatically initializes the transformer:

```html
<!-- deploy/nesters/footer-js.html -->
<script
  src="%globals_asset_url_with_hash:1590990:deploy/web-design-system.min.js%"
  defer
></script>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    if (window.transformTabMarkers && document.getElementById("content")) {
      window.transformTabMarkers("#content");
    }
  });
</script>
```

**3. Content Container**

Ensure your Paint Layout has a main content container with `id="content"`:

```html
<main class="nt-main-content" style="padding:0">
  <div id="nt-page-banner-content" ...></div>
  <div id="content" class="ntg-body">
    <MySource_AREA id_name="body" design_area="body" />
  </div>
</main>
```

### Smart Rendering Rules

- **Minimum 2 tabs required:** Navigation only renders if 2+ tab markers are found
- **Single tab behavior:** If only 1 tab marker exists, no navigation is generated
- **No tabs:** If no markers are found, content displays normally without modification

```javascript
// Example console output:
if (tabs.length < 2) {
  console.log(
    `[TabMarkerTransformer] Found ${tabs.length} tab(s). Skipping navigation render.`,
  );
  return tabs.length;
}

console.log(
  `[TabMarkerTransformer] Created DXP tab navigation with ${tabs.length} tabs.`,
);
```

### Comparison: Standard vs. Transformer

| Feature                | Standard Tab Component           | Tab Marker Transformer             |
| ---------------------- | -------------------------------- | ---------------------------------- |
| **Activation Pattern** | `<div class="nt-tab-marker">`    | `<hr><p>Title</p><hr>`             |
| **Styling**            | External CSS classes             | Inline styles + data-attributes    |
| **Best For**           | JavaScript applications          | Squiz Matrix WYSIWYG               |
| **ARIA Support**       | Full (role="tab", aria-controls) | Basic (click handlers)             |
| **Keyboard Nav**       | Yes (Arrow keys, Home, End)      | Basic (Tab key only)               |
| **URL Hash**           | Yes                              | No                                 |
| **Sticky Positioning** | Yes (configurable offset)        | Yes (top: 0, z-index: 100)         |
| **Content Authors**    | Requires HTML knowledge          | Easy (WYSIWYG-friendly)            |
| **SEO**                | Better (semantic markup)         | Good (content visible to crawlers) |
| **Mobile Support**     | Full responsive                  | Full responsive                    |

### Technical Implementation

The transformer is implemented in `src/web-design-system.ts` and bundled into the unified JavaScript file:

```typescript
// Exposed globally for use in HTML pages
(window as any).transformTabMarkers = transformTabMarkers;

function transformTabMarkers(containerSelector = "#colour-content") {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(
      `[TabMarkerTransformer] Container not found: ${containerSelector}`,
    );
    return 0;
  }

  // 1. Extract tab info from HR/P/HR patterns
  // 2. Hide marker elements
  // 3. Create DXP-formatted navigation
  // 4. Insert before content container
  // 5. Attach click handlers
  // 6. Initialize: show first tab content only

  return tabs.length;
}
```

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses CSS custom properties for theming
- Data attributes for DXP component structure
- ES6 JavaScript features

### Troubleshooting

**Tabs not appearing:**

1. Check browser console for warnings
2. Verify `window.transformTabMarkers` function exists
3. Confirm `#content` container exists in DOM
4. Ensure minimum 2 tab markers are present
5. Check marker pattern: must be exact `<hr><p>Text</p><hr><p></p>` sequence

**Styling issues:**

1. Verify CSS custom properties are defined (tokens.css)
2. Check z-index conflicts with other sticky elements
3. Ensure Lato font is loaded

**Content not switching:**

1. Check browser console for JavaScript errors
2. Verify tab button click handlers are attached
3. Confirm content elements are properly detected between markers

### Migration from Standard Tabs

To convert from standard Tab component to Transformer:

1. Replace `<div class="nt-tab-marker" data-tab-title="Title"></div>` with:

   ```html
   <hr />
   <p>Title</p>
   <hr />
   <p></p>
   ```

2. Remove `data-tab-container` attribute from parent

3. Ensure content container has `id="content"`

4. Call transformer with correct selector

### Future Enhancements

Potential improvements (not yet implemented):

- Keyboard navigation (Arrow keys)
- Smooth scroll to tab content
- Persist active tab in URL hash
- Animation transitions between tabs
- Accessibility improvements (ARIA attributes)
- Theme switcher integration
- Right-to-left (RTL) support

## Examples

See `preview/tab.html` for live examples including:

- Basic 3-tab layout
- Multiple tabs with horizontal scroll
- Long content testing sticky behavior
- Single tab (no navigation rendered)

## Support

For issues, questions, or contributions, contact the NT Government Web Design System team.
