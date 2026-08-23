# Card

Card is the preferred responsive card grid for Squiz DXP. It presents a shared collection of linked cards using image or icon media supplied by asset metadata.

Current DXP component version: `1.0.11`.

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

Editors select a destination asset once. The DXP edge renderer now resolves destination data with the Squiz JavaScript API data service (`https://cmsexternal.nt.gov.au/webds/_design/javascript-api/data-service.js`, API key `5805955303`) and uses:

- `content-cardTitle` (metadata field asset `#1185557`) for the card title
- `content-cardImagePhoto` (metadata field asset `#1185561`) when Image is enabled
- `content-cardIcon` (metadata field asset `#1185563`) when Icon is enabled

The renderer resolves by URL with `getLineageFromUrl`, then loads destination values with `getGeneral`, `getMetadata`, and `getAttributes`. Related Asset image IDs are resolved with the same service methods.

Server-side requests send `Origin: https://cmsexternal.nt.gov.au`, which is required for API key validation and nonce use. The JavaScript API asset must also allow the WebDS root as an accessible root node, and its effective user must have read access to destination, metadata, and image assets. Matrix returns `permissionError` and the Card falls back to its selected link fields when those permissions are absent.

DXP function utilities remain as fallback. When the data service is unavailable or cannot resolve a destination, the renderer falls back to `resolveMatrixAssetByUrl` and `resolveUri` inside existing error boundaries.

In Matrix, `content-cardImagePhoto` is a Related Asset field. `#1185561` is the metadata field asset; the field value usually arrives as an array containing a bare image asset ID such as `["1625449"]`, but may also be a full Matrix asset URI. The renderer resolves the image asset through the data service first and keeps `resolveUri` fallback for environments where service resolution is unavailable. It uses the resolved image asset `url` (or first `urls` value), then falls back to the destination asset `thumbnail`, then the legacy `CardImage` value.

Local previews may continue supplying an image URL or SquizImage-like object directly. Icon metadata is a Font Awesome class string such as `fa-light fa-circle-info`. Metadata fields support both Matrix's array values and the flat values used by local previews.

The data service endpoint and API key must be accessible from the rendering environment. Resolver fallback still requires session-based Content API access. A missing or inaccessible metadata value leaves the selected media area empty without breaking the rest of the grid.

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

Version `1.0.11` enables credentialed fetches for the nonce and data-service requests so the DXP runtime can retain its Matrix session. It also reads live image URLs returned as `urls` or `web_path` by `getGeneral`.

Version `1.0.10` forwards the Matrix session cookies returned with the nonce so server-side DXP requests can authenticate the subsequent data-service calls.

Version `1.0.9` routes requests through the DXP runtime fetch function, reuses one origin-bound nonce per service client, rejects Matrix API error envelopes, selects the destination at the end of returned lineage, and retains successful results if an optional asset call fails.

Version `1.0.8` resolves destination metadata and attributes through the Squiz JavaScript API data service first, then falls back to DXP resolver functions when required. It preserves selected `PageAsset` fields as `data-asset-*` attributes when remote resolution is unavailable.

Version `1.0.7` preserves selected `PageAsset` fields as `data-asset-*` attributes when Content API resolution is unavailable. It also reads destination and Related Asset image values from direct and JSON:API-style resolver payloads, including nested `data.attributes` and `attributes` objects.

Version `1.0.6` adds per-card hydration attributes for resolved destination data (`data-asset-*` and `data-metadata-*`) and keeps compatibility with direct and JSON:API-style asset resolver payloads.

Version `1.0.5` updates image resolution for live Matrix metadata. `content-cardImagePhoto` now supports Matrix array values, bare Related Asset IDs, full `matrix-asset://` URIs, and the existing local preview image-object shape. The renderer still supports existing `SquizLink` cards and also accepts a matrix asset URI string as `PageAsset` when supplied programmatically.

Version `1.0.2` removes Grid Title, Media Type, Card Mode, Card Title, Card Image, and Icon Code from the editor schema, and replaces Grid Description with Content. The renderer still accepts existing `Description`, `mediaType`, `cardMode`, `CardTitle`, `CardImage`, and `IconCode` values as fallbacks. New Card instances should use `Content`, `showImage`, `showIcon`, and asset metadata.

Deprecated `web-design-system/page-card` and `web-design-system/mini-page-card` instances remain available and are not changed by this release.

## Preview and deployment

Run these commands from the repository root:

```bash
dxp-next cmp dev-ui src/components/Card/dxp
dxp-next cmp deploy src/components/Card/dxp
npm run test:card-dxp
npm run test:card-ssr-live
```

The development UI includes Image-only, Icon-only, Image+Icon, title-only, and live asset-resolution previews. The live preview intentionally omits embedded metadata and requires data-service access (`Origin`, nonce session cookies, and JavaScript API asset read permissions). Resolver fallback paths still require session-based Content API access. The CLI uses fixed internal port `5555`; stop a stale development UI process if that port is already occupied.

`npm run test:card-dxp` runs a focused regression harness for data-service resolution, resolver fallback attributes, and nested JSON:API image payload handling.

`npm run test:card-ssr-live` checks the raw deployed HTML at `https://cmsexternal.nt.gov.au/webds/_nocache` and independently resolves the live fixture destinations through the Matrix data service. It fails when the deployed Card falls back without destination metadata, even if the underlying assets are accessible. Set `CARD_SSR_PAGE_URL` to inspect another deployed page. Environments using an outbound proxy must expose it through Node's standard proxy settings.

## Accessibility

The grid uses list semantics. Cards with destinations are keyboard-focusable links, links opening a new window receive `rel="noopener noreferrer"`, images retain metadata alt text with the card title as fallback, and decorative icons are hidden from assistive technology.
