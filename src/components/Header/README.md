# Header

NT Government site header with logo, site title, and an action button.

## Usage

Add a container element with the ID `nt-header-root`. The component auto-initializes on `DOMContentLoaded` by reading configuration from data attributes.

```html
<div
  id="nt-header-root"
  data-title="NT Design System"
  data-logo-src="%globals_asset_url:ASSET_ID:deploy/assets/ntg-primary-reverse.svg%"
  data-logo-alt="NT Government Logo"
  data-icon="fa-magnifying-glass"
></div>
```

The bundle initializes it automatically — no additional script call required beyond loading `web-design-system.min.js`.

## Data attributes

| Attribute | Default | Description |
| --------- | ------- | ----------- |
| `data-title` | `"Web Design System"` | Site title displayed next to the logo. |
| `data-logo-src` | NT Government logo URL | Logo `<img>` `src`. |
| `data-logo-alt` | `"NT Government Logo"` | Logo `<img>` `alt` text. |
| `data-icon` | `"fa-magnifying-glass"` | Font Awesome icon class for the action button. |

## JavaScript API

The component is also available as a class for programmatic use:

```ts
import { HeaderComponent } from './Header';

const header = new HeaderComponent(containerEl, {
  title: 'My Site',
  logoSrc: '/logo.svg',
  logoAlt: 'My Logo',
  icon: 'fa-bell',
  onMenuClick: () => console.log('menu clicked'),
});

// Update config at runtime
header.updateConfig({ title: 'Updated Title' });

// Remove component
header.destroy();
```

`window.NTGHeader` is also exposed as a global for use in non-module contexts.

## Notes

- The action button (`nt-header__menu-button`) fires `onMenuClick` if provided, otherwise has no default behaviour.
- Icon requires Font Awesome Light (`fa-light`) — ensure the Font Awesome kit is loaded in the page head.
- The component is vanilla JS only (no DXP edge component). It is deployed as part of the main bundle.
