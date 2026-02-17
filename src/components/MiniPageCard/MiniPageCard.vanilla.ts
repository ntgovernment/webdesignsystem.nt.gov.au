/**
 * MiniPageCard Vanilla JS - Client-Side Hydration
 *
 * Displays a compact list of ContentPage assets using Card layout
 * with FontAwesome icon, title, and optional description in a responsive grid.
 * Loaded globally and auto-detects all [data-hydration-component="mini-page-card"] elements.
 */

import "./MiniPageCard.css";
import { escapeHtml, escapeAttr } from "../../utils/sanitize";
import { debugLog, debugError } from "../../utils/debug";

export type SquizLinkValue =
  | string
  | {
      assetId?: string;
      url?: string;
      href?: string;
      text?: string;
      title?: string;
      name?: string;
      target?: string;
    };

export interface MiniPageCardItem {
  PageAsset?: SquizLinkValue;
  CardTitle?: string;
  IconCode?: string;
}

export interface MiniPageCardProps {
  Cards?: MiniPageCardItem[]; // Primary prop - content editor friendly
  PageArray?: MiniPageCardItem[]; // DXP Component Service compatibility
  pages?: MiniPageCardItem[]; // Squiz Matrix nester compatibility
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  gap?: string;
  cssClass?: string;
}

const isLinkObject = (
  link?: SquizLinkValue,
): link is Exclude<SquizLinkValue, string> =>
  !!link && typeof link !== "string";

export class MiniPageCardClient {
  private container: HTMLElement;
  private props: MiniPageCardProps;

  constructor(container: HTMLElement) {
    this.container = container;

    debugLog("[MiniPageCard] Initializing for container:", container);
    debugLog(
      "[MiniPageCard] Raw data-hydration-props:",
      container.getAttribute("data-hydration-props"),
    );

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
      debugLog("[MiniPageCard] Parsed props successfully:", this.props);
    } catch (error) {
      debugError("[MiniPageCard] Failed to parse hydration props:", error);
      debugError("[MiniPageCard] Raw value:", container.dataset.hydrationProps);
      this.renderError(
        `Failed to parse props: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.props = { pages: [] };
      return;
    }

    // Validate props
    const pageArray =
      this.props.Cards || this.props.PageArray || this.props.pages || [];
    if (!pageArray || pageArray.length === 0) {
      debugError("[MiniPageCard] No pages provided in props");
      this.renderError("No content pages provided");
      return;
    }

    debugLog(
      "[MiniPageCard] Validation passed, rendering",
      pageArray.length,
      "page(s)",
    );

    // Render the HTML
    this.render();

    debugLog("[MiniPageCard] Initialization complete");
  }

  private resolveLinkUrl(link?: SquizLinkValue): string {
    if (!link) {
      return "";
    }

    if (typeof link === "string") {
      return link;
    }

    return link.url || link.href || "";
  }

  private resolveLinkTitle(link?: SquizLinkValue): string {
    if (!link || typeof link === "string") {
      return "";
    }

    return link.text || link.title || link.name || "";
  }

  private renderCard(page: MiniPageCardItem): string {
    const href = this.resolveLinkUrl(page.PageAsset);
    const title = page.CardTitle || this.resolveLinkTitle(page.PageAsset) || "";
    const iconClass = page.IconCode ? escapeAttr(page.IconCode) : "";
    const escapedTitle = escapeHtml(title);
    const cardTag = href ? "a" : "div";
    const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
    const clickableClass = href ? " card--clickable" : "";

    const iconMarkup = iconClass
      ? `<span class="mini-page-card__icon ${iconClass}" aria-hidden="true"></span>`
      : "";

    return `<${cardTag} class="card card--full card--mini${clickableClass}"${hrefAttr}>
      <div class="card-body">
        <div class="mini-page-card__content">
          ${iconMarkup}
          <div class="mini-page-card__text">
            <h5 class="card-title">${escapedTitle}</h5>
          </div>
        </div>
      </div>
    </${cardTag}>`;
  }

  private render(): void {
    const pageArray =
      this.props.Cards || this.props.PageArray || this.props.pages || [];
    const title = this.props.Title || this.props.title || "";
    const description = this.props.Description || this.props.description || "";
    const { gap = "var(--sp-md, 16px)", cssClass = "" } = this.props;

    const containerClasses = ["nt-mini-page-card", cssClass]
      .filter(Boolean)
      .join(" ");
    this.container.className = containerClasses;
    this.container.style.width = "100%";

    let html = "";

    if (title) {
      html += `<h2 class="nt-mini-page-card__title">${escapeHtml(title)}</h2>`;
    }
    if (description) {
      html += `<p class="nt-mini-page-card__description">${escapeHtml(description)}</p>`;
    }

    html += `<div class="nt-mini-page-card__grid" role="list" data-component-type="mini-page-card-grid" data-page-count="${pageArray.length}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: ${escapeAttr(gap)}; width: 100%;">`;
    pageArray.forEach((page, index) => {
      html += `<div role="listitem" data-page-index="${index}" style="width: 100%; height: 100%;">${this.renderCard(page)}</div>`;
    });
    html += "</div>";

    this.container.innerHTML = html;
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <div class="page-card-error" role="alert" aria-live="polite" style="padding: 24px; text-align: center; color: var(--clr-status-danger, #d32f2f);">
        <h3 style="margin: 0 0 8px 0;"><strong>MiniPageCard Component Error</strong></h3>
        <p style="margin: 0;">${escapeHtml(message)}</p>
      </div>
    `;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initMiniPageCard = () => {
    const nodes = document.querySelectorAll(
      '[data-hydration-component="mini-page-card"]',
    );
    nodes.forEach((node) => {
      new MiniPageCardClient(node as HTMLElement);
    });
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMiniPageCard);
  } else {
    initMiniPageCard();
  }
}

// Expose MiniPageCardClient globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGMiniPageCard: typeof MiniPageCardClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGMiniPageCard = MiniPageCardClient;
}
