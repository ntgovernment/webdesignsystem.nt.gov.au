# ThemeSwitcher Component

Multi-URL theme switcher component with tab navigation supporting up to 3 themes with iframe previews.

## Overview

The ThemeSwitcher component allows users to switch between different theme variations using a tab-based interface. Each theme displays content in an iframe, with all iframes loading upfront for instant switching.

## Features

- 1–3 theme support with `name` and `url`
- Tab navigation for switching themes
- Instant switching (iframes preloaded)
- Responsive design
- Hydration pattern: minimal server HTML + client-side JS for interactivity
- No framework dependencies (vanilla JS)

## Props

| Prop           | Type   | Required | Default     | Description                                  |
| -------------- | ------ | -------- | ----------- | -------------------------------------------- |
| `themes`       | Array  | Yes      | -           | Array of theme objects with `name` and `url` |
| `height`       | String | No       | `600px`     | Height of iframe container                   |
| `defaultTheme` | String | No       | First theme | Theme displayed by default                   |
| `cssClass`     | String | No       | `""`        | Additional CSS classes for the container     |

## Theme Object

```ts
{
  name: string;
  url: string;
}
```

## Local Preview

- Use `serve-preview` script or open `dxp/preview.html` for local testing.

## DXP Integration

- Server renders minimal HTML; client scans `[data-hydration-component="theme-switcher"]` and hydrates the UI.

## Examples

```json
{
  "themes": [
    { "name": "Light", "url": "https://example.com/light" },
    { "name": "Dark", "url": "https://example.com/dark" }
  ],
  "height": "500px"
}
```
