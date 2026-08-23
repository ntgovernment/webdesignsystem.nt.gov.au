import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";

const resolveColumnClass = (cardsPerRow) => {
  switch (cardsPerRow) {
    case "2":
    case "3":
    case "4":
      return `nt-card--columns-${cardsPerRow}`;
    default:
      return "";
  }
};

const resolveLinkUrl = (link) => {
  if (!link) return "";
  if (typeof link === "string") return link;
  return link.url || link.href || "";
};

const resolveLinkTitle = (link) => {
  if (!link || typeof link === "string") return "";
  return link.text || link.title || link.name || "";
};

const resolveLinkTarget = (link) => {
  if (!link || typeof link === "string") return "";
  return link.target || "";
};

const resolveMediaVisibility = (
  showImage,
  showIcon,
  legacyMediaType,
  legacyMode,
) => {
  if (typeof showImage === "boolean" || typeof showIcon === "boolean") {
    return {
      showImage: typeof showImage === "boolean" ? showImage : true,
      showIcon: typeof showIcon === "boolean" ? showIcon : false,
    };
  }

  const legacyIcon =
    legacyMediaType === "Icon" || legacyMode === "Mini Cards";
  return { showImage: !legacyIcon, showIcon: legacyIcon };
};

const resolveAssetMetadata = async (link, info) => {
  if (!link || typeof link === "string") return {};
  if (link.metadata && typeof link.metadata === "object") {
    return link.metadata;
  }

  const url = resolveLinkUrl(link);
  if (!url) return {};

  try {
    const asset = await info.fns.resolveMatrixAssetByUrl(url, ["metadata"]);
    return asset?.metadata && typeof asset.metadata === "object"
      ? asset.metadata
      : {};
  } catch {
    return {};
  }
};

const resolveImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;

  if (image.imageVariations) {
    if (image.imageVariations.original?.url) {
      return image.imageVariations.original.url;
    }

    const variation = Object.values(image.imageVariations).find(
      (item) => item?.url,
    );
    if (variation?.url) return variation.url;
  }

  return image.url || image.href || "";
};

const resolveImageAlt = (image, fallbackTitle) => {
  if (!image || typeof image === "string") return fallbackTitle || "";
  return image.alt || fallbackTitle || image.name || "";
};

const resolveMetadataImage = async (value, info) => {
  if (!value || typeof value !== "string") return value;
  if (!value.startsWith("matrix-asset://")) return value;

  try {
    return await info.fns.resolveUri(value);
  } catch {
    return "";
  }
};

const populateCardMedia = async (card, visibility, info) => {
  const item = card || {};
  const metadata = await resolveAssetMetadata(item.PageAsset, info);
  const resolvedTitle =
    metadata["content-cardTitle"] ||
    item.CardTitle ||
    resolveLinkTitle(item.PageAsset) ||
    "";

  return {
    ...item,
    resolvedTitle,
    resolvedIcon: visibility.showIcon
      ? metadata["content-cardIcon"] || item.IconCode || ""
      : "",
    resolvedImage: visibility.showImage
      ? (await resolveMetadataImage(
          metadata["content-cardImagePhoto"],
          info,
        )) ||
        item.CardImage ||
        ""
      : "",
  };
};

const renderDisplayMedia = (card, title, editor) => {
  const imageUrl = resolveImageUrl(card.resolvedImage);
  if (!imageUrl && !editor) return "";

  const image = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(resolveImageAlt(card.resolvedImage, title))}" />`
    : "";

  return `<div class="card__media card__media--16-9">${image}</div>`;
};

const renderCard = (card, index, visibility, editor) => {
  const item = card || {};
  const fieldPath = `Cards[${index}]`;
  const href = resolveLinkUrl(item.PageAsset);
  const target = resolveLinkTarget(item.PageAsset);
  const title = item.resolvedTitle || "";
  const isCompact = visibility.showIcon && !visibility.showImage;
  const tagName = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
  const targetAttr = target ? ` target="${escapeAttr(target)}"` : "";
  const relAttr = target === "_blank" ? ' rel="noopener noreferrer"' : "";
  const clickableClass = href ? " card--clickable" : "";
  const modeClass = isCompact ? " card--mini" : " card--display";
  const imageHtml = visibility.showImage
    ? renderDisplayMedia(item, title, editor)
    : "";
  const iconHtml =
    visibility.showIcon && item.resolvedIcon
      ? `<span class="card__icon ${escapeAttr(item.resolvedIcon)}" aria-hidden="true"></span>`
      : "";
  const leadingIcon = isCompact ? iconHtml : "";
  const bodyIcon = visibility.showImage ? iconHtml : "";
  const bodyClass = [
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
      <div class="${bodyClass}">
        ${bodyIcon}
        <h3 class="card__title">${escapeHtml(title)}</h3>
      </div>
    </${tagName}>
  </div>`;
};

const main = async (input, info) => {
  const {
    showImage,
    showIcon,
    mediaType,
    cardMode,
    cardsPerRow = "Automatic",
    Content = "",
    Description = "",
    Cards = [],
  } = input || {};
  const editor = Boolean(info?.ctx?.editor);
  const visibility = resolveMediaVisibility(
    showImage,
    showIcon,
    mediaType,
    cardMode,
  );
  const cards = Array.isArray(Cards) ? Cards : [];

  if (cards.length === 0) {
    return `<div class="nt-card nt-card--empty" role="status">No cards provided in configuration</div>`;
  }

  const content = Content || Description;
  const contentHtml =
    content || editor
      ? `<div class="nt-card__description" data-sq-field="Content">${typeof content === "string" ? content : ""}</div>`
      : "";
  const resolvedCards = await Promise.all(
    cards.map((card) => populateCardMedia(card, visibility, info)),
  );
  const cardsHtml = resolvedCards
    .map((card, index) => renderCard(card, index, visibility, editor))
    .join("");
  const modeModifier =
    visibility.showIcon && !visibility.showImage ? "mini" : "display";
  const columnClass = resolveColumnClass(cardsPerRow);
  const classes = ["nt-card", `nt-card--${modeModifier}`, columnClass]
    .filter(Boolean)
    .join(" ");

  return `<section class="${classes}">
    ${contentHtml}
    <div class="nt-card__grid" role="list" data-show-image="${visibility.showImage}" data-show-icon="${visibility.showIcon}" data-card-count="${cards.length}">
      ${cardsHtml}
    </div>
  </section>`;
};

export default {
  main,
};