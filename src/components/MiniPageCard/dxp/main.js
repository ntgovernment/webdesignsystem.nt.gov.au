/**
 * MiniPageCard DXP Component Service - Server-Side Renderer
 *
 * Full server-side rendering: generates complete card grid HTML on server.
 * Each card includes an icon and title. No client-side JavaScript required for rendering.
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
 * Render a single card with icon and title
 */
const renderCard = (page, index) => {
  const { PageAsset = {}, CardTitle = "", IconCode = "" } = page;
  const href = resolveLinkUrl(PageAsset);
  const title = CardTitle || resolveLinkTitle(PageAsset) || "";
  const escapedTitle = escapeHtml(title);
  const iconClass = IconCode ? escapeAttr(IconCode) : "";
  const cardTag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
  const clickableClass = href ? " card--clickable" : "";

  // Icon markup
  const iconMarkup = iconClass
    ? `<span class="mini-page-card__icon ${iconClass}" aria-hidden="true"></span>`
    : "";

  return `<div role="listitem" data-page-index="${index}">
    <${cardTag} class="card card--full card--mini${clickableClass}"${hrefAttr}>
      <div class="card-body">
        <div class="mini-page-card__content">
          ${iconMarkup}
          <div class="mini-page-card__text">
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
    return `<div class="nt-mini-page-card">
      <div class="page-card-error" role="alert" aria-live="polite">
        <h3><strong>MiniPageCard Component Error</strong></h3>
        <p>No cards provided in configuration</p>
      </div>
    </div>`;
  }

  // Generate individual card HTML
  const cardsHtml = Cards.map((card, index) => renderCard(card, index)).join(
    "",
  );

  // Build container classes
  const containerClasses = ["nt-mini-page-card", cssClass]
    .filter(Boolean)
    .join(" ");

  // Assemble complete component HTML
  let html = `<div class="${containerClasses}">`;

  if (Title) {
    html += `<h2 class="nt-mini-page-card__title">${escapeHtml(Title)}</h2>`;
  }
  if (Description) {
    html += `<p class="nt-mini-page-card__description">${escapeHtml(Description)}</p>`;
  }

  html += `<div class="nt-mini-page-card__grid" role="list" data-component-type="mini-page-card-grid" data-page-count="${Cards.length}">
    ${cardsHtml}
  </div>
</div>`;

  return html;
};

export default {
  main,
};
