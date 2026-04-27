/**
 * PageTile Vanilla JS - Client-Side Hydration
 *
 * Text-only tile variant perfect for resource links and navigation without imagery or icons.
 * Loaded globally and auto-detects all [data-hydration-component="page-tile"] elements.
 */

import "./PageTile.css";
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

export interface PageTileItem {
  PageAsset?: SquizLinkValue;
  CardTitle?: string;
}

export interface PageTileProps {
  Cards?: PageTileItem[]; // Primary prop - content editor friendly
  PageArray?: PageTileItem[]; // DXP Component Service compatibility
  pages?: PageTileItem[]; // Squiz Matrix nester compatibility
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  gap?: string;
  cssClass?: string;
}

export class PageTileClient {
  private container: HTMLElement;
  private props: PageTileProps;

  constructor(container: HTMLElement) {
    this.container = container;

    debugLog("[PageTile] Initializing for container:", container);
    debugLog(
      "[PageTile] Raw data-hydration-props:",
      container.getAttribute("data-hydration-props"),
    );

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
      debugLog("[PageTile] Parsed props successfully:", this.props);
    } catch (error) {
      debugError("[PageTile] Failed to parse hydration props:", error);
      debugError("[PageTile] Raw value:", container.dataset.hydrationProps);
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
      debugError("[PageTile] No pages provided in props");
      this.renderError("No tiles provided");
      return;
    }

    debugLog(
      "[PageTile] Validation passed, rendering",
      pageArray.length,
      "tile(s)",
    );

    // Render the HTML
    this.render();

    debugLog("[PageTile] Initialization complete");
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

  private renderTile(page: PageTileItem): string {
    const href = this.resolveLinkUrl(page.PageAsset);
    const title = page.CardTitle || this.resolveLinkTitle(page.PageAsset) || "";
    const escapedTitle = escapeHtml(title);
    const tileTag = href ? "a" : "div";
    const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
    const clickableClass = href ? " tile--clickable" : "";

    return `<${tileTag} class="tile tile--text${clickableClass}"${hrefAttr}>
      <div class="tile-body">
        <div class="page-tile__content">
          <div class="page-tile__text">
            <h5 class="tile-title">${escapedTitle}</h5>
          </div>
        </div>
      </div>
    </${tileTag}>`;
  }

  private render(): void {
    const pageArray =
      this.props.Cards || this.props.PageArray || this.props.pages || [];
    const title = this.props.Title || this.props.title || "";
    const description = this.props.Description || this.props.description || "";
    const { gap = "var(--sp-md, 16px)", cssClass = "" } = this.props;

    const containerClasses = ["nt-page-tile", cssClass]
      .filter(Boolean)
      .join(" ");
    this.container.className = containerClasses;
    this.container.style.width = "100%";

    let html = "";

    if (title) {
      html += `<h2 class="nt-page-tile__title">${escapeHtml(title)}</h2>`;
    }
    if (description) {
      html += `<p class="nt-page-tile__description">${escapeHtml(description)}</p>`;
    }

    html += `<div class="nt-page-tile__grid" role="list" data-component-type="page-tile-grid" data-page-count="${pageArray.length}" style="gap: ${escapeAttr(gap)};">`;
    pageArray.forEach((page, index) => {
      html += `<div role="listitem" data-page-index="${index}" style="width: 100%; height: 100%;">${this.renderTile(page)}</div>`;
    });
    html += "</div>";

    this.container.innerHTML = html;
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <div class="page-tile-error" role="alert" aria-live="polite" style="padding: 24px; text-align: center; color: var(--clr-status-danger, #d32f2f);">
        <h3 style="margin: 0 0 8px 0;"><strong>PageTile Component Error</strong></h3>
        <p style="margin: 0;">${escapeHtml(message)}</p>
      </div>
    `;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initPageTile = () => {
    const nodes = document.querySelectorAll(
      '[data-hydration-component="page-tile"]',
    );
    nodes.forEach((node) => {
      new PageTileClient(node as HTMLElement);
    });
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageTile);
  } else {
    initPageTile();
  }
}

// Expose PageTileClient globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGPageTile: typeof PageTileClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGPageTile = PageTileClient;
}
