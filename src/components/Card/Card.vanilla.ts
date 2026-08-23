import "./Card.css";
import { escapeHtml, escapeAttr } from "../../utils/sanitize";
import { debugError, debugLog } from "../../utils/debug";

export type CardMode = "Display Cards" | "Mini Cards";
export type CardMediaType = "Image" | "Icon";
export type CardColumns = "Automatic" | "2" | "3" | "4";

interface CardMediaVisibility {
  showImage: boolean;
  showIcon: boolean;
}

export type SquizLinkValue =
  | string
  | {
      url?: string;
      href?: string;
      text?: string;
      title?: string;
      name?: string;
      target?: string;
      metadata?: Record<string, unknown>;
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
  showImage?: boolean;
  showIcon?: boolean;
  mediaType?: CardMediaType;
  cardMode?: CardMode;
  cardsPerRow?: CardColumns;
  Content?: string;
  content?: string;
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

const resolveMediaVisibility = (props: CardProps): CardMediaVisibility => {
  if (
    typeof props.showImage === "boolean" ||
    typeof props.showIcon === "boolean"
  ) {
    return {
      showImage:
        typeof props.showImage === "boolean" ? props.showImage : true,
      showIcon: typeof props.showIcon === "boolean" ? props.showIcon : false,
    };
  }

  const legacyIcon =
    props.mediaType === "Icon" || props.cardMode === "Mini Cards";
  return { showImage: !legacyIcon, showIcon: legacyIcon };
};

const resolveLinkMetadata = (
  link?: SquizLinkValue,
): Record<string, unknown> => {
  if (!link || typeof link === "string") return {};
  return link.metadata || {};
};

const resolveCardImage = (
  card: CardItem,
): SquizImageValue | string | undefined => {
  const value = resolveLinkMetadata(card.PageAsset)["content-cardImagePhoto"];
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value as SquizImageValue;
  return card.CardImage;
};

const resolveCardIcon = (card: CardItem): string => {
  const value = resolveLinkMetadata(card.PageAsset)["content-cardIcon"];
  return typeof value === "string" ? value : card.IconCode || "";
};

const resolveCardTitle = (card: CardItem): string => {
  const value = resolveLinkMetadata(card.PageAsset)["content-cardTitle"];
  return typeof value === "string"
    ? value
    : card.CardTitle || resolveLinkTitle(card.PageAsset);
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

  private renderCard(
    card: CardItem,
    index: number,
    visibility: CardMediaVisibility,
  ): string {
    const fieldPath = `Cards[${index}]`;
    const href = resolveLinkUrl(card.PageAsset);
    const target = resolveLinkTarget(card.PageAsset);
    const title = resolveCardTitle(card);
    const image = resolveCardImage(card);
    const imageUrl = resolveImageUrl(image);
    const icon = resolveCardIcon(card);
    const isCompact = visibility.showIcon && !visibility.showImage;
    const tagName = href ? "a" : "div";
    const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
    const targetAttr = target ? ` target="${escapeAttr(target)}"` : "";
    const relAttr = target === "_blank" ? ' rel="noopener noreferrer"' : "";
    const clickableClass = href ? " card--clickable" : "";
    const modeClass = isCompact ? " card--mini" : " card--display";
    const imageHtml = visibility.showImage
      ? imageUrl
        ? `<div class="card__media card__media--16-9"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(image && typeof image !== "string" ? image.alt || title : title)}" /></div>`
        : ""
      : "";
    const iconHtml =
      visibility.showIcon && icon
        ? `<span class="card__icon ${escapeAttr(icon)}" aria-hidden="true"></span>`
        : "";
    const leadingIcon = isCompact ? iconHtml : "";
    const bodyIcon = visibility.showImage ? iconHtml : "";
    const bodyClasses = [
      "card__content",
      isCompact ? "card__content--mini" : "",
      bodyIcon ? "card__content--with-icon" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `<div class="nt-card__item" role="listitem" data-card-index="${index}">
      <${tagName} class="card card--full${modeClass}${clickableClass}" data-sq-field="${fieldPath}.PageAsset"${hrefAttr}${targetAttr}${relAttr}>
        ${imageHtml}
        ${leadingIcon}
        <div class="${bodyClasses}">
          ${bodyIcon}
          <h3 class="card__title">${escapeHtml(title)}</h3>
        </div>
      </${tagName}>
    </div>`;
  }

  private render(cards: CardItem[]): void {
    const visibility = resolveMediaVisibility(this.props);
    const modeModifier =
      visibility.showIcon && !visibility.showImage ? "mini" : "display";
    const content =
      this.props.Content ||
      this.props.content ||
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
    this.container.innerHTML = `${content ? `<div class="nt-card__description" data-sq-field="Content">${content}</div>` : ""}
      <div class="nt-card__grid" role="list" data-show-image="${visibility.showImage}" data-show-icon="${visibility.showIcon}" data-card-count="${cards.length}">
        ${cards.map((card, index) => this.renderCard(card, index, visibility)).join("")}
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