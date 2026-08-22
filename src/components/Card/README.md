# Card

Card is the preferred responsive card grid for Squiz DXP. It consolidates PageCard and MiniPageCard behind one shared `Cards` collection and a presentation switch.

## Modes

- `Display Cards`: 16:9 image, title, and destination.
- `Mini Cards`: Font Awesome icon, title, and destination.

Switching `cardMode` does not replace or reshape `Cards`. `CardImage` is used by Display Cards and `IconCode` is used by Mini Cards.

## Input

```ts
interface CardItem {
  PageAsset: SquizLink;
  CardTitle: string;
  CardImage?: SquizImage;
  IconCode?: string;
}

interface CardProps {
  cardMode: "Display Cards" | "Mini Cards";
  Title?: string;
  Description?: string;
  Cards: CardItem[];
}
```

## Inline editing

Visual Page Builder can edit the grid title, description, each card title, image, and destination directly in the preview. The manifest marks those fields with `ui:metadata.inlineEditable`, and SSR maps them with:

- `data-sq-field="Title"`
- `data-sq-field="Description"`
- `data-sq-field="Cards[0].CardTitle"`
- `data-sq-field="Cards[0].CardImage"`
- `data-sq-field="Cards[0].PageAsset"`

Card indices are generated at render time. Add, remove, and reorder cards through the Page Outline. `IconCode` remains a sidebar field because its Font Awesome class string has no meaningful inline text target.

The installed Squiz CLI schema does not support `previewPlaceholder`. Optional section text and empty image targets are therefore rendered as empty field targets only when `info.ctx.editor` is true, keeping them selectable in Page Builder without leaking placeholder content to the live site.

### Preview and deployment

Run these commands from the repository root:

```bash
dxp-next cmp dev-ui src/components/Card/dxp
dxp-next cmp deploy src/components/Card/dxp
```

The development UI includes `display-cards` and `mini-cards` previews. This CLI uses fixed internal port `5555`; stop a stale `dxp-next cmp dev-ui` process if that port is already occupied.

## Local use

```html
<div
  data-hydration-component="card"
  data-hydration-props='{"cardMode":"Mini Cards","Cards":[{"PageAsset":{"url":"/about"},"CardTitle":"About","IconCode":"fa-light fa-circle-info"}]}'
></div>
```

The vanilla renderer supports `Cards` and the legacy aliases `PageArray` and `pages`. Actual inline editing is provided by Squiz Visual Page Builder, not native `contenteditable` behavior.

## Migration

- PageCard maps to `cardMode: "Display Cards"` without changing card fields.
- MiniPageCard maps to `cardMode: "Mini Cards"` without changing card fields.
- Existing `web-design-system/page-card` and `web-design-system/mini-page-card` instances remain available during migration.

For a PageCard migration, change the component to `web-design-system/card` and set `cardMode` to `Display Cards`. For a MiniPageCard migration, use `Mini Cards` and keep each entry's `PageAsset`, `CardTitle`, and `IconCode` values. Existing component instances should remain in place until each page has been migrated.

## Accessibility

The grid uses list semantics. Cards with destinations are keyboard-focusable links; cards without destinations render as non-interactive elements. Links opening a new window receive `rel="noopener noreferrer"`, images retain authored alternative text, and styles support increased contrast and reduced motion.