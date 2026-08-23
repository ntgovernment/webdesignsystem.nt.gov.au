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

interface SquizMatrixApi {
  getLineageFromUrl(options: Record<string, unknown>): Promise<unknown> | void;
  getMetadata(options: Record<string, unknown>): Promise<unknown> | void;
  getGeneral(options: Record<string, unknown>): Promise<unknown> | void;
}

interface SquizMatrixApiConstructor {
  new (options: { key: string }): SquizMatrixApi;
}

const MATRIX_DATA_SERVICE_URL =
  "https://cmsexternal.nt.gov.au/webds/_design/javascript-api/data-service.js";
const MATRIX_DATA_SERVICE_KEY = "5805955303";
const CARD_IMAGE_METADATA_KEY = "content-cardImagePhoto";
const CARD_IMAGE_METADATA_FIELD_ID = "1185561";
const CARD_ICON_METADATA_KEY = "content-cardIcon";
const CARD_ICON_METADATA_FIELD_ASSET_ID = "1185563";
const enrichedCards = new WeakSet<HTMLElement>();
const cardMetadataRequests = new Map<
  string,
  Promise<{ image: unknown; icon: unknown }>
>();
const imageAssetRequests = new Map<string, Promise<Record<string, unknown>>>();
const imageResizeObservers = new WeakMap<HTMLElement, ResizeObserver>();
let matrixApiPromise: Promise<SquizMatrixApi> | null = null;

const loadMatrixApi = (): Promise<SquizMatrixApi> => {
  if (matrixApiPromise) return matrixApiPromise;

  matrixApiPromise = new Promise((resolve, reject) => {
    const createApi = () => {
      const Api = window.Squiz_Matrix_API;
      if (!Api) return false;
      resolve(new Api({ key: MATRIX_DATA_SERVICE_KEY }));
      return true;
    };

    if (createApi()) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${MATRIX_DATA_SERVICE_URL}"]`,
    );
    const script = existingScript || document.createElement("script");
    const handleLoad = () => {
      if (!createApi()) {
        reject(new Error("Squiz Matrix JavaScript API did not initialize"));
      }
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load Squiz Matrix JavaScript API")),
      { once: true },
    );

    if (!existingScript) {
      script.src = MATRIX_DATA_SERVICE_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return matrixApiPromise;
};

const callMatrixApi = <T>(
  method: (options: Record<string, unknown>) => Promise<unknown> | void,
  options: Record<string, unknown>,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const result = method({
      ...options,
      dataCallback: resolve,
      errorCallback: reject,
    });
    if (result && typeof result.then === "function") {
      result.then((value) => resolve(value as T), reject);
    }
  });

const resolveLineageAssetId = (lineage: unknown): string => {
  const entries = Array.isArray(lineage)
    ? lineage
    : lineage && typeof lineage === "object"
      ? Object.values(lineage)
      : [];
  const destination = entries.at(-1);
  if (!destination || typeof destination !== "object") return "";

  const record = destination as Record<string, unknown>;
  return String(record.assetid || record.asset_id || record.id || "");
};

const resolveMetadataValue = (
  metadata: unknown,
  key: string,
  fieldId: string,
): unknown => {
  if (!metadata || typeof metadata !== "object") return "";
  const record = metadata as Record<string, unknown>;
  const values =
    record.metadata && typeof record.metadata === "object"
      ? (record.metadata as Record<string, unknown>)
      : record;
  return values[key] ?? values[fieldId] ?? "";
};

const serializeMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

const normalizeTextMetadata = (value: unknown): string => {
  const text = Array.isArray(value) ? value[0] : value;
  return ["string", "number", "boolean"].includes(typeof text)
    ? String(text)
    : "";
};

const normalizeAssetId = (value: unknown): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return String(Math.trunc(candidate));
  }
  if (candidate && typeof candidate === "object") {
    const record = candidate as Record<string, unknown>;
    return normalizeAssetId(record.assetid || record.asset_id || record.id);
  }
  if (typeof candidate !== "string") return "";

  const trimmed = candidate.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  return /^matrix-asset:\/\/[a-zA-Z0-9.-]+\/(\d+)(?::.+)?$/.exec(
    trimmed,
  )?.[1] || "";
};

const fetchImageAsset = (assetId: string): Promise<Record<string, unknown>> => {
  const existingRequest = imageAssetRequests.get(assetId);
  if (existingRequest) return existingRequest;

  const request = loadMatrixApi().then(async (api) => {
    const result = await callMatrixApi<unknown>(api.getGeneral.bind(api), {
      asset_id: assetId,
      get_attributes: 1,
    });
    if (!result || typeof result !== "object") return {};
    const record = result as Record<string, unknown>;
    return record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;
  });

  imageAssetRequests.set(assetId, request);
  return request;
};

export interface ImageCandidate {
  url: string;
  width: number;
  height: number;
}

const toDimension = (value: unknown): number => {
  const dimension = Number(value);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : 0;
};

export const resolveImageCandidates = (
  asset: Record<string, unknown>,
): ImageCandidate[] => {
  const urls = Array.isArray(asset.urls) ? asset.urls : [];
  const originalUrl = String(urls[0] || asset.url || asset.web_path || "");
  if (!originalUrl) return [];

  const candidates: ImageCandidate[] = [];
  const varieties = asset.varieties;
  const varietyData =
    varieties && typeof varieties === "object"
      ? (varieties as Record<string, unknown>).data
      : null;

  if (varietyData && typeof varietyData === "object") {
    Object.values(varietyData).forEach((value) => {
      if (!value || typeof value !== "object") return;
      const variety = value as Record<string, unknown>;
      const varietyUrls = Array.isArray(variety.urls) ? variety.urls : [];
      const varietyUrl = String(
        varietyUrls[0] || variety.url || variety.web_path || "",
      );
      if (!varietyUrl) return;

      try {
        candidates.push({
          url: varietyUrl,
          width: toDimension(variety.variety_width || variety.width),
          height: toDimension(variety.variety_height || variety.height),
        });
      } catch {
        return;
      }
    });
  }

  candidates.push({
    url: originalUrl,
    width: toDimension(asset.width),
    height: toDimension(asset.height),
  });

  return candidates
    .filter((candidate) => candidate.width && candidate.height)
    .sort((left, right) => left.width * left.height - right.width * right.height);
};

export const selectImageCandidate = (
  candidates: ImageCandidate[],
  width: number,
  height: number,
  pixelRatio = Math.max(1, window.devicePixelRatio || 1),
): ImageCandidate | null => {
  if (candidates.length === 0) return null;
  const requiredWidth = width * pixelRatio;
  const requiredHeight = height * pixelRatio;
  return (
    candidates.find(
      (candidate) =>
        candidate.width >= requiredWidth &&
        candidate.height >= requiredHeight,
    ) || candidates.at(-1) || null
  );
};

const cardShowsImage = (card: HTMLElement): boolean =>
  card.closest<HTMLElement>(".nt-card__grid")?.dataset.showImage === "true";

const cardShowsIcon = (card: HTMLElement): boolean =>
  card.closest<HTMLElement>(".nt-card__grid")?.dataset.showIcon === "true";

export const renderClientIcon = (card: HTMLElement, icon: string): void => {
  if (!cardShowsIcon(card) || !icon.trim()) return;

  const content = card.querySelector<HTMLElement>(".card__content");
  if (!content) return;

  let iconElement = card.querySelector<HTMLElement>(".card__icon");
  if (!iconElement) {
    iconElement = document.createElement("span");
  }

  iconElement.className = `card__icon ${icon.trim()}`;
  iconElement.setAttribute("aria-hidden", "true");

  if (cardShowsImage(card)) {
    content.classList.add("card__content--with-icon");
    content.prepend(iconElement);
    return;
  }

  content.classList.remove("card__content--with-icon");
  card.insertBefore(iconElement, content);
};

const renderClientImage = (
  card: HTMLElement,
  asset: Record<string, unknown>,
): void => {
  const candidates = resolveImageCandidates(asset);
  if (candidates.length === 0) return;

  let media = Array.from(card.children).find((child) =>
    child.classList.contains("card__media"),
  ) as HTMLElement | undefined;
  if (!media) {
    media = document.createElement("div");
    media.className = "card__media card__media--16-9";
    card.insertBefore(media, card.firstChild);
  }

  let image = media.querySelector("img");
  if (!image) {
    image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);
  }

  const attributes =
    asset.attributes && typeof asset.attributes === "object"
      ? (asset.attributes as Record<string, unknown>)
      : {};
  image.alt = String(
    asset.alt ||
      attributes.alt ||
      card.querySelector(".card__title")?.textContent ||
      "",
  );

  const updateImage = () => {
    const bounds = media.getBoundingClientRect();
    const width = bounds.width || card.getBoundingClientRect().width;
    const height = bounds.height || width * (9 / 16);
    const candidate = selectImageCandidate(candidates, width, height);
    if (!candidate || image.dataset.matrixSource === candidate.url) return;

    image.src = candidate.url;
    image.width = candidate.width;
    image.height = candidate.height;
    image.dataset.matrixSource = candidate.url;
  };

  updateImage();
  imageResizeObservers.get(media)?.disconnect();
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(updateImage);
    observer.observe(media);
    imageResizeObservers.set(media, observer);
  }
};

const fetchCardMetadata = (
  url: string,
): Promise<{ image: unknown; icon: unknown }> => {
  const existingRequest = cardMetadataRequests.get(url);
  if (existingRequest) return existingRequest;

  const request = loadMatrixApi().then(async (api) => {
    const lineage = await callMatrixApi<unknown>(
      api.getLineageFromUrl.bind(api),
      { asset_url: url },
    );
    const assetId = resolveLineageAssetId(lineage);
    if (!assetId) return { image: "", icon: "" };

    const metadata = await callMatrixApi<unknown>(api.getMetadata.bind(api), {
      asset_id: assetId,
    });
    return {
      image: resolveMetadataValue(
        metadata,
        CARD_IMAGE_METADATA_KEY,
        CARD_IMAGE_METADATA_FIELD_ID,
      ),
      icon: resolveMetadataValue(
        metadata,
        CARD_ICON_METADATA_KEY,
        CARD_ICON_METADATA_FIELD_ASSET_ID,
      ),
    };
  });

  cardMetadataRequests.set(url, request);
  return request;
};

const enrichCardMetadata = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".nt-card .card[href]").forEach((card) => {
    if (enrichedCards.has(card)) return;
    enrichedCards.add(card);
    card.dataset.metadataImage = "";
    card.dataset.metadataIcon = "";

    const url = card.getAttribute("href");
    if (!url) return;

    void fetchCardMetadata(new URL(url, window.location.href).href)
      .then(async (metadata) => {
        card.dataset.metadataImage = serializeMetadataValue(metadata.image);
        card.dataset.metadataIcon = normalizeTextMetadata(metadata.icon);
        renderClientIcon(card, card.dataset.metadataIcon);
        if (!cardShowsImage(card)) return;

        const imageAssetId = normalizeAssetId(metadata.image);
        if (!imageAssetId) return;
        const imageAsset = await fetchImageAsset(imageAssetId);
        renderClientImage(card, imageAsset);
      })
      .catch((error) => {
        debugError("[Card] Unable to resolve metadata:", error);
      });
  });
};

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
      <${tagName} class="card card--full${modeClass}${clickableClass}" data-sq-field="${fieldPath}.PageAsset" data-metadata-image="" data-metadata-icon=""${hrefAttr}${targetAttr}${relAttr}>
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
    enrichCardMetadata();
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
    Squiz_Matrix_API?: SquizMatrixApiConstructor;
  }
}

if (typeof window !== "undefined") {
  window.NTGCard = CardClient;
}