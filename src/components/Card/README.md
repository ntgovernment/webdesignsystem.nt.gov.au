# Card

Card is the preferred responsive card grid for Squiz DXP. It presents a shared collection of linked cards using image or icon media supplied by asset metadata.

## Input

All fields are optional so editors can save a blank or partially configured component.

```ts
interface CardItem {
  PageAsset?: SquizLink;
}

interface CardProps {
  showImage?: boolean;
  showIcon?: boolean;
  cardsPerRow?: "Automatic" | "2" | "3" | "4";
  Content?: FormattedText;
  Cards?: CardItem[];
}
```

`showImage` defaults to `true` and `showIcon` defaults to `false`. Editors can enable either toggle independently, allowing image-only, icon-only, image and icon, or title-only cards.

`Content` uses DXP `FormattedText`, which opens TinyMCE for inline rich-text editing. Squiz supplies the value as trusted HTML so paragraphs, links, lists, and text formatting are rendered directly rather than escaped.

## Asset metadata

Editors select a destination asset once. The DXP edge renderer retrieves that asset with `resolveMatrixAssetByUrl(url, ["metadata"])` and uses:

- `content-cardTitle` (metadata field asset `#1185557`) for the card title
- `content-cardImagePhoto` (metadata field asset `#1185561`) when Image is enabled
- `content-cardIcon` (metadata field asset `#1185563`) when Icon is enabled

DXP function utilities are late-bound during rendering. Call `resolveMatrixAssetByUrl` and `resolveUri` inside their error boundaries without an early `typeof` check; inspecting the temporary utility placeholder prevents Squiz from replacing it with the callable function.

Image metadata may be an image URL, a SquizImage-like object, or a Matrix asset URI. Icon metadata is a Font Awesome class string such as `fa-light fa-circle-info`.

The Content Management Content API must have session-based authentication enabled for DXP asset resolution. A missing or inaccessible metadata value leaves the selected media area empty without breaking the rest of the grid.

Local vanilla previews cannot call DXP resolver functions. Supply the same values under the link's `metadata` property:

```html
<div
  data-hydration-component="card"
  data-hydration-props='{"showImage":false,"showIcon":true,"Cards":[{"PageAsset":{"url":"/about","metadata":{"content-cardTitle":"About","content-cardIcon":"fa-light fa-circle-info"}}}]}'
></div>
```

## Cards per row

`Automatic` uses the media-specific responsive layout and is the default. Values `2`, `3`, and `4` set the maximum number of cards per row, reducing at narrower component widths. All layouts stack to one card per row on mobile.

## Inline editing

Visual Page Builder can edit Content and each destination through these field mappings:

- `data-sq-field="Content"`
- `data-sq-field="Cards[0].PageAsset"`

The card title and media are owned by the selected asset's metadata and are not additional editable Card fields.

The renderer exposes an empty Content field target in editor mode so TinyMCE can be opened before content exists. An empty Cards collection renders the component's empty state, while the optional schema still permits editors to save it.

## Compatibility

Version `1.0.2` removes Grid Title, Media Type, Card Mode, Card Title, Card Image, and Icon Code from the editor schema, and replaces Grid Description with Content. The renderer still accepts existing `Description`, `mediaType`, `cardMode`, `CardTitle`, `CardImage`, and `IconCode` values as fallbacks. New Card instances should use `Content`, `showImage`, `showIcon`, and asset metadata.

Deprecated `web-design-system/page-card` and `web-design-system/mini-page-card` instances remain available and are not changed by this release.

## Preview and deployment

Run these commands from the repository root:

```bash
dxp-next cmp dev-ui src/components/Card/dxp
dxp-next cmp deploy src/components/Card/dxp
```

The development UI includes Image-only, Icon-only, Image+Icon, title-only, and live asset-resolution previews. The live preview intentionally omits embedded metadata and requires session-based Content API access. The CLI uses fixed internal port `5555`; stop a stale development UI process if that port is already occupied.

## Accessibility

The grid uses list semantics. Cards with destinations are keyboard-focusable links, links opening a new window receive `rel="noopener noreferrer"`, images retain metadata alt text with the card title as fallback, and decorative icons are hidden from assistive technology.
