# Notification Component

The Notification component displays contextual, status-specific callouts used within page content. It provides a prominent left accent bar, an icon, a heading and a message. Implemented as a lightweight vanilla JS component with optional DXP server-side rendering.

## Purpose

- Communicate short, contextual messages related to user actions or system status (info, success, warning, danger).
- Use inside content areas where the message is relevant to the current page or workflow.

## When to use

- Confirmation of a completed action (success)
- Low-risk informational messages (info)
- Cautionary guidance where users should pay attention (warning)
- Errors that do not need a modal (danger)

## When NOT to use

- Site-wide or critical emergency messages (use `GlobalAlert`)
- Inline form validation (use inline validation messages)
- Marketing/promotional banners

## Features

- Variants: `info` (default), `success`, `warning`, `danger`
- Left accent bar and status icon
- Inline rich-text editing for the DXP message field
- Accessible semantics: `role="status"` for non-interruptive announcements
- Auto-hydrates from `data-hydration-component="notification"` for standalone client-side usage
- Supports theme tokens and responds to active theme

## Usage (Vanilla JS)

Client-side auto-mount (hydration container):

```html
<div
  data-hydration-component="notification"
  data-hydration-props='{"variant":"info","title":"Information","message":"Important info here."}'
></div>
```

Manual JS instantiation:

```ts
import { NotificationClient } from "./components/Notification/Notification.vanilla";
const el = document.getElementById("my-notification");
new NotificationClient(el, {
  variant: "success",
  title: "Saved",
  message: "Your changes have been saved.",
});
```

## Usage (DXP)

The DXP manifest exposes the `main` function and the server renderer returns the complete notification markup. The manifest provides defaults so the component can render in dev-ui even when input is omitted. The `message` field uses DXP `FormattedText` and can be edited directly in Visual Page Builder.

Example manifest usage in DXP:

```js
// manifest.json -> function main
{
  "variant": "info",
  "title": "Information alert",
  "message": "<p>Your action completed.</p>"
}
```

The server renderer marks the message as the inline-editable field:

```html
<div class="notification__message" data-sq-field="message">
  <p>Your action completed.</p>
</div>
```

## Props (Vanilla / DXP)

- `variant` — `"info" | "success" | "warning" | "danger"` (default: `info`)
- `title` — `string` (heading)
- `message` — escaped plain text in the vanilla API; trusted `FormattedText` HTML in DXP
- `className` / `cssClass` — `string` (optional additional CSS classes)

All props are accepted as either camelCase or PascalCase keys in hydration JSON (`title` / `Title`, `message` / `Message`).

## Accessibility

- Root element uses `role="status"` to provide polite, non-interruptive announcements.
- Decorative icon and accent bar are `aria-hidden="true"`.
- The vanilla client escapes message text. DXP `FormattedText` is rendered as trusted HTML supplied by the Squiz editor.

## Theming & Design Tokens

Uses design tokens (see `src/tokens.css`) for:

- Colors: `--clr-status-info`, `--clr-status-success`, `--clr-status-warning`, `--clr-status-danger`
- Spacing: `--sp-xs`, `--sp-md`, `--sp-xl`, `--sp-xxl`
- Typography: `--type-body-default-size`, `--type-desktop-h3-size`

## Implementation details

### Architecture

- Vanilla client: `src/components/Notification/Notification.vanilla.ts`
- Styling: `src/components/Notification/Notification.css`
- DXP manifest & renderer: `src/components/Notification/dxp/manifest.json` and `src/components/Notification/dxp/main.js`
- Auto-mount selector: `[data-hydration-component="notification"]`

### Design Token Strategy

This component imports all design tokens (colors, spacing, typography) from `@ntgovernment/web-design-system` via `src/external-tokens/`, ensuring a single source of truth and automatic upstream alignment. The component CSS is local because the vanilla hydration implementation has a different DOM structure than the upstream React component. This mirrors the upstream repo's pattern where component layout CSS remains local while design tokens are shared system-wide.

## Examples

Info notification (HTML):

```html
<div class="notification notification--info" role="status">
  <div class="notification__accent-bar" aria-hidden="true"></div>
  <div class="notification__content">
    <div class="notification__header">
      <div class="notification__icon" aria-hidden="true">
        <i class="fa-light fa-circle-info" aria-hidden="true"></i>
      </div>
      <div class="notification__text">
        <div class="notification__title">Information</div>
        <div class="notification__message">Your request has been received.</div>
      </div>
    </div>
  </div>
</div>
```

## Developer notes

- The DXP manifest accepts `null` input and provides default `title`/`message` values — this prevents dev-ui validation failures when no input is supplied.
- The component intentionally **does not** include a dismiss button. Add dismiss behavior later as an enhancement if required.
- Icon mapping (Font Awesome / `fa-light`):
  - `info` → `fa-circle-info`
  - `success` → `fa-circle-check`
  - `warning` → `fa-triangle-exclamation`
  - `danger` → `fa-circle-exclamation`

- **Link styling update**: Notification links now explicitly set `:visited` to the default colour to avoid purple visited links.

## Tests & Visual QA

- Verify all variants render correctly and match the design tokens
- Test responsive layout and accessibility (screen reader announcements)
- Check DXP preview and inline editing (server renders full markup)

## Versioning

Any changes to `dxp/manifest.json` (schema, properties, defaults) or `dxp/main.js` (render logic) **must** be accompanied by a version increment in the `"version"` field of `manifest.json`. Follow semantic versioning: patch (`x.x.1`) for fixes, minor (`x.1.0`) for new features, major (`1.0.0`) for breaking changes.
