import "./Card.css";
import { escapeHtml, escapeAttr } from "../../utils/sanitize";
import { debugError, debugLog } from "../../utils/debug";

export type CardMode = "Display Cards" | "Mini Cards";
export type CardColumns = "Automatic" | "2" | "3" | "4";

export type SquizLinkValue =
  | string
  | {
      url?: string;
      href?: string;
      text?: string;
      title?: string;
      name?: string;
      target?: string;
    };

export interface SquizImageVariation {
  url?: string;
  width?: number;
  height?: number;
}

export interface SquizImageValue {
  name?: string;
  alt?: string;
  url?: string;
  href?: string;
  imageVariations?: Record<string, SquizImageVariation>;
}

export interface CardItem {
  PageAsset?: SquizLinkValue;
  CardTitle?: string;
  CardImage?: SquizImageValue | string;
  IconCode?: string;
}

export interface CardProps {
  cardMode?: CardMode;
  cardsPerRow?: CardColumns;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Cards?: CardItem[];
  PageArray?: CardItem[];
  pages?: CardItem[];
  cssClass?: string;
}

const resolveColumnClass = (cardsPerRow?: CardColumns): string => {
  switch (cardsPerRow) {
    case "2":
    case "3":
    case "4":
      return `nt-card--columns-${cardsPerRow}`;
    default:
      return "";
  }
};

const resolveLinkUrl = (link?: SquizLinkValue): string => {
  if (!link) return "";
  if (typeof link === "string") return link;
  return link.url || link.href || "";
};

const resolveLinkTitle = (link?: SquizLinkValue): string => {
  if (!link || typeof link === "string") return "";
  return link.text || link.title || link.name || "";
};

const resolveLinkTarget = (link?: SquizLinkValue): string => {
  if (!link || typeof link === "string") return "";
  return link.target || "";
};

const resolveImageUrl = (image?: SquizImageValue | string): string => {
  if (!image) return "";
  if (typeof image === "string") return image;

  if (image.imageVariations?.original?.url) {
    return image.imageVariations.original.url;
  }

  const variation = Object.values(image.imageVariations || {}).find(
    (item) => item?.url,
  );
  return variation?.url || image.url || image.href || "";
};

export class CardClient {
  private container: HTMLElement;
  private props: CardProps;

  constructor(container: HTMLElement) {
    this.container = container;

    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
    } catch (error) {
      this.props = {};
      debugError("[Card] Failed to parse hydration props:", error);
      this.renderError("Unable to read card configuration");
      return;
    }

    const cards = this.getCards();
    if (cards.length === 0) {
      this.renderError("No cards provided in configuration");
      return;
    }

    this.render(cards);
    debugLog("[Card] Rendered", cards.length, "card(s)");
  }

  private getCards(): CardItem[] {
    return this.props.Cards || this.props.PageArray || this.props.pages || [];
  }

  private renderCard(card: CardItem, index: number, mode: CardMode): string {
    const fieldPath = `Cards[${index}]`;
    const href = resolveLinkUrl(card.PageAsset);
    const target = resolveLinkTarget(card.PageAsset);
    const title = card.CardTitle || resolveLinkTitle(card.PageAsset);
    const imageUrl = resolveImageUrl(card.CardImage);
    const isMini = mode === "Mini Cards";
    const tagName = href ? "a" : "div";
    const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
    const targetAttr = target ? ` target="${escapeAttr(target)}"` : "";
    const relAttr = target === "_blank" ? ' rel="noopener noreferrer"' : "";
    const clickableClass = href ? " card--clickable" : "";
    const modeClass = isMini ? " card--mini" : " card--display";

    const leadingContent = isMini
      ? card.IconCode
        ? `<span class="card__icon ${escapeAttr(card.IconCode)}" aria-hidden="true"></span>`
        : ""
      : imageUrl
        ? `<div class="card__media card__media--16-9" data-sq-field="${fieldPath}.CardImage"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(card.CardImage && typeof card.CardImage !== "string" ? card.CardImage.alt || title : title)}" /></div>`
        : "";

    return `<div class="nt-card__item" role="listitem" data-card-index="${index}">
      <${tagName} class="card card--full${modeClass}${clickableClass}" data-sq-field="${fieldPath}.PageAsset"${hrefAttr}${targetAttr}${relAttr}>
        ${leadingContent}
        <div class="card__content${isMini ? " card__content--mini" : ""}">
          <h3 class="card__title" data-sq-field="${fieldPath}.CardTitle">${escapeHtml(title)}</h3>
        </div>
      </${tagName}>
    </div>`;
  }

  private render(cards: CardItem[]): void {
    const mode: CardMode =
      this.props.cardMode === "Mini Cards" ? "Mini Cards" : "Display Cards";
    const modeModifier = mode === "Mini Cards" ? "mini" : "display";
    const title = this.props.Title || this.props.title || "";
    const description =
      this.props.Description || this.props.description || "";
    const classes = [
      "nt-card",
      `nt-card--${modeModifier}`,
      resolveColumnClass(this.props.cardsPerRow),
      this.props.cssClass,
    ]
      .filter(Boolean)
      .join(" ");

    this.container.className = classes;
    this.container.innerHTML = `${title ? `<h2 class="nt-card__title" data-sq-field="Title">${escapeHtml(title)}</h2>` : ""}
      ${description ? `<p class="nt-card__description" data-sq-field="Description">${escapeHtml(description)}</p>` : ""}
      <div class="nt-card__grid" role="list" data-card-mode="${mode}" data-card-count="${cards.length}">
        ${cards.map((card, index) => this.renderCard(card, index, mode)).join("")}
      </div>`;
  }

  private renderError(message: string): void {
    this.container.innerHTML = `<div class="nt-card__error" role="alert">${escapeHtml(message)}</div>`;
  }
}

if (typeof document !== "undefined") {
  const initCards = () => {
    document
      .querySelectorAll<HTMLElement>('[data-hydration-component="card"]')
      .forEach((node) => new CardClient(node));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCards);
  } else {
    initCards();
  }
}

declare global {
  interface Window {
    NTGCard: typeof CardClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGCard = CardClient;
}