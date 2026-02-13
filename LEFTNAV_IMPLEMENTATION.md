# Left Navigation Component - Implementation Summary

**Recent updates (2026-02-14):**

- Parent items that have children are now _dual-purpose_: the visible link navigates to the parent landing page and a JavaScript-injected chevron button controls expand/collapse. This is implemented by `convertParentLinksWithChildren()` in `LeftNav.vanilla.ts` (no Squiz conditionals required).
- Hover & focus states updated to use `var(--clr-bg-shade)` for background and `var(--clr-link-default)` for text.
- Left navigation now stretches to the full page height so its right border runs from header to footer (`min-height: 100%` + `align-self: stretch`).

## ✅ Implementation Complete

The Left Navigation component has been successfully implemented with both React and Vanilla JS versions.

## 📦 What Was Built

### Components Created

1. **React Component** ([src/components/LeftNav/LeftNav.tsx](src/components/LeftNav/LeftNav.tsx))
   - TypeScript interfaces for `NavItem` and `LeftNavProps`
   - Auto-expansion of sections containing active items
   - Mobile drawer with overlay
   - Keyboard navigation support

2. **Vanilla JS Component** ([src/components/LeftNav/LeftNav.vanilla.ts](src/components/LeftNav/LeftNav.vanilla.ts))
   - Class-based implementation for Squiz Matrix
   - Auto-mount on DOM ready
   - Configuration via data attributes

3. **Styles** ([src/components/LeftNav/LeftNav.css](src/components/LeftNav/LeftNav.css))
   - BEM methodology with `nt-` prefix
   - Responsive mobile drawer (< 768px)
   - Smooth transitions and animations

4. **Squiz Nester** ([public/squiz/left-nav.html](public/squiz/left-nav.html))
   - Complete HTML structure with all menu items
   - Ready for Squiz Matrix deployment

### Design Tokens Added

Extended [src/tokens.css](src/tokens.css) with:

- Navigation colors (background, text, hover, active states)
- Navigation spacing (padding, gaps)
- Navigation sizing (width, icon size, breakpoint)
- Navigation transitions

### Deployment Files

- **JavaScript**: `deploy/js/left-nav.js` (4.99 kB, 1.27 kB gzipped)
- **Nester**: `deploy/nesters/left-nav.html`
- **Styles**: Included in `deploy/ntg-design-system.css`

## 🎯 Menu Structure

The component includes all requested menu items:

- **Home** (with icon, active by default)
- **About**
- **Design**
- **Develop**
- **Foundations** (collapsible with 10 children):
  - Colour
  - Typography
  - Iconography
  - Grids
  - Spacing
  - Border width
  - Radius
  - Elevation
  - Logo
  - Focus state
- **Components**
- **Help and Support**

## 🚀 Usage Examples

### React Usage

```tsx
import { LeftNav, type NavItem } from "./components/LeftNav";

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/home",
    icon: "fa-light fa-home",
    isActive: true,
  },
  {
    id: "foundations",
    label: "Foundations",
    children: [
      { id: "colour", label: "Colour", href: "/colour" },
      { id: "typography", label: "Typography", href: "/typography" },
    ],
  },
];

function App() {
  return <LeftNav items={navItems} defaultExpanded={["foundations"]} />;
}
```

### Vanilla JS Usage (Squiz Matrix)

**Step 1: Include in head nester**

```html
<link
  rel="stylesheet"
  href="%globals_asset_url:1590990%/ntg-design-system.css"
/>
```

**Step 2: Include in footer-js nester**

```html
<script src="%globals_asset_url:1590990%/js/left-nav.js"></script>
```

**Step 3: Add navigation HTML** (use the provided nester or customize)

```html
<div id="nt-leftnav-root" data-default-expanded="">
  <nav class="nt-leftnav" aria-label="Main navigation">
    <ul class="nt-leftnav__list">
      <!-- Home with active state -->
      <li class="nt-leftnav__item">
        <a
          href="%globals_asset_url:XXXXX%"
          class="nt-leftnav__link"
          aria-current="page"
        >
          <div class="nt-leftnav__icon">
            <div
              style="width: 18.75px; height: 16.67px; background: var(--clr-link-default, #1F1F5F);"
            ></div>
          </div>
          <span>Home</span>
        </a>
      </li>

      <!-- Simple links -->
      <li class="nt-leftnav__item">
        <a href="%globals_asset_url:XXXXX%" class="nt-leftnav__link">
          <span>About</span>
        </a>
      </li>

      <!-- Collapsible section -->
      <li class="nt-leftnav__item">
        <button
          class="nt-leftnav__toggle"
          aria-expanded="false"
          aria-controls="submenu-foundations"
        >
          <span>Foundations</span>
          <div class="nt-leftnav__chevron">
            <i class="fa-light fa-chevron-right" aria-hidden="true"></i>
          </div>
        </button>
        <ul
          id="submenu-foundations"
          class="nt-leftnav__submenu"
          aria-hidden="true"
        >
          <li class="nt-leftnav__item">
            <a href="%globals_asset_url:XXXXX%" class="nt-leftnav__link">
              <span>Colour</span>
            </a>
          </li>
          <!-- More submenu items... -->
        </ul>
      </li>
    </ul>
  </nav>
</div>
```

## ✨ Features

### Auto-Expansion

- Sections containing the active page (marked with `aria-current="page"`) automatically expand on load
- Configurable via `defaultExpanded` prop (React) or `data-default-expanded` attribute (Vanilla)

### Mobile Responsive

- Below 768px: Navigation becomes a drawer with:
  - Toggle button (hamburger icon)
  - Overlay backdrop
  - Slide-in animation
  - Body scroll lock when open
  - Close button inside drawer
  - Escape key to close

### Keyboard Navigation

- **Enter/Space**: Toggle expand/collapse on sections
- **Escape**: Close mobile drawer
- **Tab**: Navigate through links and buttons
- All interactive elements have visible focus indicators

### Accessibility

- ARIA attributes for screen readers:
  - `aria-expanded` on toggle buttons
  - `aria-controls` linking buttons to submenus
  - `aria-current="page"` for active links
  - `aria-hidden` on collapsed submenus
  - `aria-label` on mobile controls
- Semantic HTML structure with `<nav>`, `<ul>`, `<li>`
- Keyboard navigable
- Focus management

### Animations

- Smooth expand/collapse transitions (0.2s)
- Chevron rotation (90°) when section expands
- Mobile drawer slide-in/out (0.3s)
- Overlay fade in/out

## 🎨 Customization

### CSS Custom Properties

All colors, spacing, and transitions can be customized via CSS variables in [tokens.css](src/tokens.css):

```css
:root {
  /* Navigation Colors */
  --clr-nav-bg: #ffffff;
  --clr-nav-text: #1f1f5f;
  --clr-nav-bg-hover: #f5f5f7;
  --clr-nav-bg-active: #e8e8eb;

  /* Navigation Spacing */
  --nav-padding-item: 16px;
  --nav-gap: 8px;

  /* Navigation Sizing */
  --nav-width: 280px;
  --nav-mobile-breakpoint: 768px;

  /* Navigation Transitions */
  --nav-transition: 0.2s ease-in-out;
}
```

### Data Attributes (Vanilla JS)

- `data-default-expanded`: Comma-separated section IDs (e.g., `"foundations,components"`)
- `data-mobile-breakpoint`: Pixel value for mobile breakpoint (default: `"768"`)

## 📱 Testing

### Development Server

The component is viewable in the Component Viewer at:

- URL: http://localhost:5173/
- Navigate to "Left Navigation" in the sidebar

### Test Checklist

- [x] Expand/collapse sections work
- [x] Auto-expansion of active sections
- [x] Mobile drawer opens/closes
- [x] Keyboard navigation (Enter, Space, Escape)
- [x] ARIA attributes present
- [x] Responsive behavior at < 768px
- [x] Smooth animations
- [x] Icon rendering (Font Awesome)

## 🚢 Deployment

Files are ready in the `deploy/` directory:

```
deploy/
├── js/
│   └── left-nav.js                    # Vanilla JS component (4.99 kB)
├── nesters/
│   └── left-nav.html                  # Squiz nester template
└── ntg-design-system.css              # Global styles (includes LeftNav)
```

### Next Steps for Squiz Matrix

1. Commit and push to trigger Git File Bridge sync
2. Add left-nav.html nester to your Squiz page design
3. Mark the current page with `aria-current="page"` on the appropriate link
4. Customize menu items and links for your site structure

## 📚 Documentation

Updated documentation in:

- [README.md](README.md) - Usage examples and API reference
- Component Viewer - Live demo with full menu structure

## 🎉 Summary

The Left Navigation component is production-ready with:

- ✅ Dual implementation (React + Vanilla JS)
- ✅ 2-level collapsible menu structure
- ✅ Auto-expansion of active sections
- ✅ Mobile-responsive drawer
- ✅ Full keyboard navigation
- ✅ ARIA compliant for accessibility
- ✅ Squiz Matrix deployment ready
- ✅ Complete documentation

Total bundle size: **4.99 kB** (1.27 kB gzipped) - lightweight and performant!
