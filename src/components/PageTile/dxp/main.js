/**
 * PageTile DXP Component Service - Server-Side Renderer
 *
 * Full server-side rendering: generates complete tile grid HTML on server.
 * No client-side JavaScript required for rendering (CSS-only).
 */

import { escapeHtml } from "../../../utils/sanitize.js";

const main = async (input) => {
  const {
    Title = "",
    Description = "",
    Cards = [],
    cssClass = "",
  } = input || {};

  // Generate tile HTML
  const tilesHtml = Cards.map((card, index) => {
    const { PageAsset = {}, CardTitle = "" } = card;
    const href = PageAsset.url || PageAsset.href || "";
    const tileTag = href ? "a" : "div";
    const hrefAttr = href ? ` href="${escapeHtml(href)}"` : "";
    const clickableClass = href ? " tile--clickable" : "";

    return `<div role="listitem" data-page-index="${index}">
      <${tileTag} class="tile tile--text${clickableClass}"${hrefAttr}>
        <div class="tile-body">
          <div class="page-tile__content">
            <div class="page-tile__text">
              <h5 class="tile-title">${escapeHtml(CardTitle)}</h5>
            </div>
          </div>
        </div>
      </${tileTag}>
    </div>`;
  }).join("");

  let html = `<div class="nt-page-tile ${cssClass}">`;

  if (Title) {
    html += `<h2 class="nt-page-tile__title">${escapeHtml(Title)}</h2>`;
  }
  if (Description) {
    html += `<p class="nt-page-tile__description">${escapeHtml(Description)}</p>`;
  }

  html += `<div class="nt-page-tile__grid" role="list" data-component-type="page-tile-grid" data-page-count="${Cards.length}">
    ${tilesHtml}
  </div>
  </div>`;

  return html;
};

export default {
  main,
};
