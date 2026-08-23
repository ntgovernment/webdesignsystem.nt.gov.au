import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";

const DISPLAY_MODE = "Display Cards";
const MINI_MODE = "Mini Cards";

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

const renderDisplayMedia = (card, title, fieldPath, editor) => {
  const imageUrl = resolveImageUrl(card.CardImage);
  if (!imageUrl && !editor) return "";

  const image = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(resolveImageAlt(card.CardImage, title))}" />`
    : "";

  return `<div class="card__media card__media--16-9" data-sq-field="${fieldPath}.CardImage">${image}</div>`;
};

const renderCard = (card, index, mode, editor) => {
  const item = card || {};
  const fieldPath = `Cards[${index}]`;
  const href = resolveLinkUrl(item.PageAsset);
  const target = resolveLinkTarget(item.PageAsset);
  const title = item.CardTitle || resolveLinkTitle(item.PageAsset) || "";
  const isMini = mode === MINI_MODE;
  const tagName = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
  const targetAttr = target ? ` target="${escapeAttr(target)}"` : "";
  const relAttr = target === "_blank" ? ' rel="noopener noreferrer"' : "";
  const clickableClass = href ? " card--clickable" : "";
  const modeClass = isMini ? " card--mini" : " card--display";

  const leadingContent = isMini
    ? item.IconCode
      ? `<span class="card__icon ${escapeAttr(item.IconCode)}" aria-hidden="true"></span>`
      : ""
    : renderDisplayMedia(item, title, fieldPath, editor);

  const bodyClass = isMini ? "card__content card__content--mini" : "card__content";

  return `<div class="nt-card__item" role="listitem" data-card-index="${index}">
    <${tagName} class="card card--full${modeClass}${clickableClass}" data-sq-field="${fieldPath}.PageAsset"${hrefAttr}${targetAttr}${relAttr}>
      ${leadingContent}
      <div class="${bodyClass}">
        <h3 class="card__title" data-sq-field="${fieldPath}.CardTitle">${escapeHtml(title)}</h3>
      </div>
    </${tagName}>
  </div>`;
};

const main = async (input, info) => {
  const {
    cardMode = DISPLAY_MODE,
    cardsPerRow = "Automatic",
    Title = "",
    Description = "",
    Cards = [],
  } = input || {};
  const editor = Boolean(info?.ctx?.editor);
  const mode = cardMode === MINI_MODE ? MINI_MODE : DISPLAY_MODE;
  const cards = Array.isArray(Cards) ? Cards : [];

  if (cards.length === 0) {
    return `<div class="nt-card nt-card--empty" role="status">No cards provided in configuration</div>`;
  }

  const titleHtml =
    Title || editor
      ? `<h2 class="nt-card__title" data-sq-field="Title">${escapeHtml(Title)}</h2>`
      : "";
  const descriptionHtml =
    Description || editor
      ? `<p class="nt-card__description" data-sq-field="Description">${escapeHtml(Description)}</p>`
      : "";
  const cardsHtml = cards
    .map((card, index) => renderCard(card, index, mode, editor))
    .join("");
  const modeModifier = mode === MINI_MODE ? "mini" : "display";
  const columnClass = resolveColumnClass(cardsPerRow);
  const classes = ["nt-card", `nt-card--${modeModifier}`, columnClass]
    .filter(Boolean)
    .join(" ");

  return `<section class="${classes}">
    ${titleHtml}
    ${descriptionHtml}
    <div class="nt-card__grid" role="list" data-card-mode="${escapeAttr(mode)}" data-card-count="${cards.length}">
      ${cardsHtml}
    </div>
  </section>`;
};

export default {
  main,
};