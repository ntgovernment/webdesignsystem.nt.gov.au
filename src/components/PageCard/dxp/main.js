/**
 * PageCard DXP Component Service - Server-Side Renderer
 *
 * Full server-side rendering: generates complete card grid HTML on server.
 * Each card includes an image (16:9 aspect ratio) and title.
 * No client-side JavaScript required for rendering (CSS-only).
 */

import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";

/**
 * Resolve link URL from various link object formats
 */
const resolveLinkUrl = (link) => {
  if (!link) return "";
  if (typeof link === "string") return link;
  return link.url || link.href || "";
};

/**
 * Resolve link title/text from various link object formats
 */
const resolveLinkTitle = (link) => {
  if (!link || typeof link === "string") return "";
  return link.text || link.title || link.name || "";
};

/**
 * Resolve image URL from SquizImage or SquizLink formats
 */
const resolveImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "string") return image;

  // Handle SquizImage with imageVariations
  if (image.imageVariations) {
    const original = image.imageVariations.original;
    if (original?.url) return original.url;

    const variations = Object.values(image.imageVariations);
    const fallback = variations.find((item) => item?.url);
    if (fallback?.url) return fallback.url;
  }

  // Handle SquizLink
  if (image.url || image.href) {
    return image.url || image.href || "";
  }

  return "";
};

/**
 * Resolve image alt text from SquizImage or fallback to title
 */
const resolveImageAlt = (image, fallbackTitle) => {
  if (!image || typeof image === "string") return fallbackTitle || "";
  if (image.alt) return image.alt;
  return fallbackTitle || image.name || "";
};

/**
 * Render a single card
 */
const renderCard = (page, index) => {
  const { PageAsset = {}, CardImage, CardTitle = "" } = page;
  const href = resolveLinkUrl(PageAsset);
  const imageUrl = resolveImageUrl(CardImage);
  const title = CardTitle || resolveLinkTitle(PageAsset) || "";
  const escapedTitle = escapeHtml(title);
  const escapedTitleAttr = escapeAttr(
    resolveImageAlt(CardImage, title || "Card"),
  );
  const cardTag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
  const clickableClass = href ? " card--clickable" : "";

  // Media section - 16:9 aspect ratio
  const mediaSection = imageUrl
    ? `<div class="card__media card__media--16-9">
        <img src="${escapeAttr(imageUrl)}" alt="${escapedTitleAttr}" />
      </div>`
    : "";

  return `<div role="listitem" data-page-index="${index}">
    <${cardTag} class="card card--full${clickableClass}"${hrefAttr}>
      ${mediaSection}
      <div class="card-body">
        <div class="card__body-content">
          <div class="card__body-title-wrapper">
            <h5 class="card-title">${escapedTitle}</h5>
          </div>
        </div>
      </div>
    </${cardTag}>
  </div>`;
};

/**
 * Main server-side render function
 */
const main = async (input) => {
  const {
    Title = "",
    Description = "",
    Cards = [],
    cssClass = "",
  } = input || {};

  // Validate required props
  if (!Cards || Cards.length === 0) {
    return `<div class="nt-page-card">
      <div class="page-card-error" role="alert" aria-live="polite">
        <h3><strong>PageCard Component Error</strong></h3>
        <p>No cards provided in configuration</p>
      </div>
    </div>`;
  }

  // Generate individual card HTML
  const cardsHtml = Cards.map((card, index) => renderCard(card, index)).join(
    "",
  );

  // Build container classes
  const containerClasses = ["nt-page-card", cssClass].filter(Boolean).join(" ");

  // Assemble complete component HTML
  let html = `<div class="${containerClasses}">`;

  if (Title) {
    html += `<h2 class="nt-page-card__title">${escapeHtml(Title)}</h2>`;
  }
  if (Description) {
    html += `<p class="nt-page-card__description">${escapeHtml(Description)}</p>`;
  }

  html += `<div class="nt-page-card__grid" role="list" data-component-type="page-card-grid" data-page-count="${Cards.length}">
    ${cardsHtml}
  </div>
</div>`;

  return html;
};

export default {
  main,
};
