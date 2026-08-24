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
- `Tab.transformer.ts` — Squiz marker transformer and accessible navigation
- `Tab.css` — Sticky navigation styles with design tokens
- `index.ts` — Export file
- `dxp/manifest.json` — DXP edge component schema
- `dxp/main.js` — Server-side HTML renderer
- `dxp/preview.html` — DXP development preview

## File Structure

```
src/components/Tab/
├── Tab.vanilla.ts     # Client-side component class
├── Tab.transformer.ts # Squiz marker transformer
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

For Squiz Matrix, the Tab component renders an editable marker wrapper using
`.sq-inline-viper-content.nt-tab-marker` with `<hr><p>Title</p><hr>` marker
content. When the page is delivered to the browser, client-side JavaScript
collects all supported marker formats and builds interactive sticky navigation.

This simplified pattern allows authors to sprinkle `web-design-system/tab` components
around a page and then add the corresponding content immediately after each marker.

### Input Schema

```json
{
  "title": "Overview", // required string
  "anchor": "overview" // optional string; defaults to a kebab‑case version of the title
}
```

Any additional properties are ignored. The component outputs a single wrapper
`<div>` marker with authoring-friendly child markup.

The `title` property is inline editable in Squiz. The rendered title paragraph
uses `data-sq-field="title"`, so authors can edit the label directly on the
page canvas.

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

The `anchor` property lets you explicitly control the generated marker id used
for panel ids and ARIA linkage. If omitted, the id is derived from the title by
lowercasing, replacing spaces with hyphens, and stripping invalid characters.

> **Note:** the DXP renderer only outputs markers. Tab panels and navigation are
> created in the browser by `window.transformTabMarkers`.

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
| `data-tab-id`            | **(On markers)** Stable panel id fragment  | Derived from title             |
| `data-sq-field="title"` | Inline-edit hook on the DXP title paragraph | `title`                        |

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
| `.nt-tab-transformer__nav` | Transformer sticky navigation and tab list       |
| `.nt-tab-transformer__inner` | Transformer scrollable tab row                 |
| `.nt-tab-transformer__button` | Transformer focusable tab button              |
| `.nt-tab-transformer__panel` | Transformer-generated tab panel                |

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

Both Tab implementations use semantic tabs and ARIA-linked panels. Their focus
models differ intentionally: `TabClient` follows the standard roving-tabindex
pattern, while the DXP transformer keeps every rendered tab in sequential focus
order so repeated Tab presses reach each control.

### ARIA Attributes

- **Tab List:** `role="tablist"` on navigation container
- **Tab Buttons:** `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`
- **Tab Panels:** `role="tabpanel"`, `aria-labelledby`, `hidden`
- **TabClient Focus:** Only the active tab is in sequential focus order
  (`tabindex="0"` vs `"-1"`)
- **Transformer Focus:** Every generated tab has `tabindex="0"`

### Keyboard Navigation

| Key                                 | Action                      |
| ----------------------------------- | --------------------------- |
| <kbd>Tab</kbd>                      | TabClient: enter/leave the tab list; transformer: move through every tab |
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

**Current Version:** 1.1.2

### Changelog

#### 1.1.2

- Keeps every transformed tab in sequential keyboard focus order
- Removes one unnecessary empty paragraph from the DXP marker output

#### 1.1.1

- Makes the DXP Tab Title inline editable with `data-sq-field="title"`
- Adds inline-edit metadata to the `title` manifest property

#### 1.1.0

- DXP marker now renders full `.sq-inline-viper-content` wrapper markup
- Transformer supports wrapper markers, legacy `.nt-tab-marker`, and legacy
  `<hr><p>Title</p><hr>` patterns
- Transformer renders semantic `<nav>/<button>` tabs with keyboard navigation

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

The Tab Marker Transformer is an alternative tab implementation for Squiz
content. It supports three marker formats:

- DXP wrapper: `.sq-inline-viper-content.nt-tab-marker`
- Legacy wrapper-less marker: `.nt-tab-marker`
- Legacy WYSIWYG markers: `<hr><p>Title</p><hr>`

**Key Difference:** the standard `TabClient` path initializes from containers
with `data-tab-container`; the transformer path initializes from page content
markers and inserts a sticky navigation before `#content`.

### When to Use

- **Squiz Matrix Pages:** Content edited in Paint Layouts or Standard Pages
- **Legacy Content Migration:** Converting existing HR-based section dividers to tabs
- **Simple Content Pages:** Pages without complex nested structures
- **WYSIWYG Editing:** When content authors use visual editors

### HTML Pattern

```html
<div id="content" class="ntg-body">
  <h1>Page Title</h1>

  <!-- Preferred DXP marker format -->
  <div
    class="sq-inline-viper-content nt-tab-marker"
    data-tab-title="Overview"
    data-tab-id="overview"
    style="min-height: 18.5px; border: 1px solid transparent"
  >
    <hr />
    <p data-sq-field="title">Overview</p>
    <hr />
    <p></p>
    <p></p>
  </div>

  <h2>Overview Section</h2>
  <p>Content for the overview tab...</p>

  <!-- Additional tab markers and content -->
</div>
```

### Auto-Initialization

The transformer is included in the unified `web-design-system.min.js` bundle and exposed globally as `window.transformTabMarkers`. It accepts the DXP wrapper, legacy standalone `.nt-tab-marker` elements, and direct `<hr><p>Title</p><hr>` markers. The footer-js nester calls it automatically:

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

1. Scans the container for supported DXP and legacy marker formats
2. Extracts tab titles and marker ids
3. Hides marker elements with the `hidden` attribute
4. Creates token-styled semantic tab navigation with DXP data attributes
5. Inserts navigation before the content container
6. Attaches click and keyboard handlers for tab switching
7. Shows first tab content, hides all others

**Content Management:**

- Tracks marker indices and consumed marker ranges
- Calculates content boundaries between tabs
- Moves content into generated `role="tabpanel"` wrappers
- Toggles panel visibility using the `hidden` attribute

### DXP Tab Navigation Structure

Generated navigation retains DXP data attributes while using focusable buttons
and ARIA-linked panels. Every button has `tabindex="0"`, so repeated Tab presses
move through each rendered tab. Left Arrow, Right Arrow, Home, and End also move
focus and select a tab.

```html
<nav
  class="nt-tab-transformer__nav"
  role="tablist"
  aria-label="Page sections"
  data-breakpoint="xl +lg + md"
  data-scroll-left="false"
  data-scroll-right="false"
>
  <div class="nt-tab-transformer__inner">
    <button
      type="button"
      class="nt-tab-transformer__button"
      role="tab"
      aria-selected="true"
      aria-controls="nt-tab-group-1-0-overview-panel"
      tabindex="0"
      data-active="True"
      data-horizontal="True"
      data-left-icon="false"
      data-show-badge="false"
      data-state="Default"
      data-tab-index="0"
    >
      <span class="nt-tab-transformer__label">Overview</span>
    </button>
  </div>
</nav>
```

### Tab Button Styling

**Data Attributes:**

- `data-active` — "True" for active tab, "False" for inactive
- `data-horizontal` — Always "true" for horizontal layout
- `data-left-icon` — "false" (no icons in basic implementation)
- `data-show-badge` — "false" (no badges in basic implementation)
- `data-state` — "Default" (interactive state)
- `data-tab-index` — Zero-based tab index

**State and Focus Behavior:**

- **All tabs:**
  - `cursor: pointer`
  - `min-width: 64px`
  - `padding: 16px`
  - Font: Lato, 16px, line-height 24px
  - Color: `var(--clr-link-default, #1F1F5F)`
- **All tabs:** `tabindex="0"`, allowing sequential focus with Tab
- **Active tab:** `data-active="True"`, `aria-selected="true"`
- **Inactive tabs:** `data-active="False"`, `aria-selected="false"`
- **Keyboard:** Left/Right/Home/End update selected tab and move focus
- **Focus ring:** visible via `.nt-tab-transformer__button:focus-visible`

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
| **Activation Pattern** | `<div class="nt-tab-marker">`    | `.sq-inline-viper-content.nt-tab-marker` (legacy formats also supported) |
| **Styling**            | External CSS classes             | External CSS classes + DXP data attributes |
| **Best For**           | JavaScript applications          | Squiz Matrix WYSIWYG               |
| **ARIA Support**       | Full (role="tab", aria-controls) | Full (role="tab", aria-controls) |
| **Keyboard Nav**       | Yes (Arrow keys, Home, End)      | Yes (Arrow keys, Home, End)        |
| **URL Hash**           | Yes                              | No                                 |
| **Sticky Positioning** | Yes (configurable offset)        | Yes (top: 0, z-index: 100)         |
| **Content Authors**    | Requires HTML knowledge          | Easy (WYSIWYG-friendly)            |
| **SEO**                | Better (semantic markup)         | Good (content visible to crawlers) |
| **Mobile Support**     | Full responsive                  | Full responsive                    |

### Technical Implementation

The transformer is implemented in `src/components/Tab/Tab.transformer.ts`,
imported by `src/web-design-system.ts`, and bundled into the unified JavaScript
file:

```typescript
import { transformTabMarkers } from "./components/Tab/Tab.transformer";

window.transformTabMarkers = transformTabMarkers;
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
5. Check marker format: preferred DXP wrapper or legacy supported formats

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

1. Replace simple marker blocks with DXP wrapper markers:

   ```html
   <div
     class="sq-inline-viper-content nt-tab-marker"
     data-tab-title="Title"
     data-tab-id="title"
     style="min-height: 18.5px; border: 1px solid transparent"
   >
     <hr />
     <p data-sq-field="title">Title</p>
     <hr />
     <p></p>
     <p></p>
   </div>
   ```

2. Remove `data-tab-container` attribute from parent

3. Ensure content container has `id="content"`

4. Call transformer with correct selector

### Future Enhancements

Potential improvements (not yet implemented):

- Smooth scroll to tab content
- Persist active tab in URL hash
- Animation transitions between tabs
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
