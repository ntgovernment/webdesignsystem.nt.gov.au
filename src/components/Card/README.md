# Card

Card is the preferred responsive card grid for Squiz DXP. It presents a shared collection of linked cards using image or icon media supplied by asset metadata.

Current DXP component version: `1.0.6`.

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

In Matrix, `content-cardImagePhoto` is a Related Asset field. `#1185561` is the metadata field asset; the field value is the selected image asset reference. That value usually arrives as an array containing a bare image asset ID, such as `["1625449"]`, but may also be a full Matrix asset URI. The DXP renderer converts a bare ID to `matrix-asset://ntg/<id>`, resolves the image with `resolveUri`, unwraps the resolver's `{ data }` response, and uses the resolved asset's `url` or first `urls` value. It falls back to the destination asset's `thumbnail`, then the legacy `CardImage` value.

Local previews may continue supplying an image URL or SquizImage-like object directly. Icon metadata is a Font Awesome class string such as `fa-light fa-circle-info`. Metadata fields support both Matrix's array values and the flat values used by local previews.

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

## Card hydration attributes

Each rendered card element (`a.card` or `div.card`) now includes data attributes for resolved destination asset values:

- `data-asset-*` attributes are hydrated from resolved asset attributes (or direct asset fields for local previews).
- `data-metadata-*` attributes are hydrated from resolved metadata fields.
- Primitive values are emitted directly; arrays and objects are JSON-serialized and HTML-escaped.
- `metadata` is excluded from `data-asset-*` to avoid duplicating the `data-metadata-*` namespace.

This hydration supports both direct preview metadata values and JSON:API-style resolver responses (`data.attributes`).

## Compatibility

Version `1.0.6` adds per-card hydration attributes for resolved destination data (`data-asset-*` and `data-metadata-*`) and keeps compatibility with direct and JSON:API-style asset resolver payloads.

Version `1.0.5` updates image resolution for live Matrix metadata. `content-cardImagePhoto` now supports Matrix array values, bare Related Asset IDs, full `matrix-asset://` URIs, and the existing local preview image-object shape. The renderer still supports existing `SquizLink` cards and also accepts a matrix asset URI string as `PageAsset` when supplied programmatically.

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
