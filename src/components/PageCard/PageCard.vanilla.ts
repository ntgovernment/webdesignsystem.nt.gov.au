/**
 * PageCard Vanilla JS - Client-Side Hydration
 *
 * Displays a list of ContentPage assets using Card layout
 * with Image and Title displayed in a responsive grid.
 * Loaded globally and auto-detects all [data-hydration-component="page-card"] elements.
 */

import "./PageCard.css";

export interface ContentPageAsset {
  assetId: string;
  title?: string;
  description?: string;
  href?: string;
  ariaLabel?: string;
}

export interface PageCardProps {
  pages: ContentPageAsset[];
  columns?: number;
  gap?: string;
  cardVariant?: "full" | "compact";
  clickable?: boolean;
  cssClass?: string;
}

export class PageCardClient {
  private container: HTMLElement;
  private props: PageCardProps;

  constructor(container: HTMLElement) {
    this.container = container;

    console.log("[PageCard] Initializing for container:", container);
    console.log(
      "[PageCard] Raw data-hydration-props:",
      container.getAttribute("data-hydration-props"),
    );

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
      console.log("[PageCard] Parsed props successfully:", this.props);
    } catch (error) {
      console.error("[PageCard] Failed to parse hydration props:", error);
      console.error("[PageCard] Raw value:", container.dataset.hydrationProps);
      this.renderError(
        `Failed to parse props: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.props = { pages: [] };
      return;
    }

    // Validate props
    if (!this.props.pages || this.props.pages.length === 0) {
      console.error("[PageCard] No pages provided in props");
      this.renderError("No content pages provided");
      return;
    }

    console.log(
      "[PageCard] Validation passed, rendering",
      this.props.pages.length,
      "page(s)",
    );

    // Render the HTML
    this.render();

    console.log("[PageCard] Initialization complete");
  }

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  private escapeAttr(str: string): string {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private renderCard(page: ContentPageAsset): string {
    const assetId = this.escapeAttr(page.assetId);
    const title = page.title ? this.escapeHtml(page.title) : "";
    const description = page.description
      ? this.escapeHtml(page.description)
      : "";

    return `<div class="card card--clickable card--full text-bg-full" tabindex="0" role="button" style="max-width: 353px;" data-asset-id="${assetId}">
      <div class="card__media card__media--16:9">
        <img src="%asset_metadata_content-cardImagePhoto:${assetId}^as_asset:asset_url%" alt="Card image" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover; max-height: 200px;">
      </div>
      <div class="card-body">
        <div class="card__body-content">
          <div class="card__body-title-wrapper">
            <h5 class="card-title">${title}</h5>
          </div>
          <div class="card-text">${description}</div>
        </div>
      </div>
      <div class="card-footer">
        <div class="card__footer-actions"></div>
      </div>
    </div>`;
  }

  private render(): void {
    const {
      pages = [],
      gap = "var(--sp-md, 16px)",
      cssClass = "",
    } = this.props;

    const containerClasses = ["nt-page-card", cssClass]
      .filter(Boolean)
      .join(" ");
    this.container.className = containerClasses;
    this.container.setAttribute("role", "list");
    this.container.setAttribute("data-component-type", "page-card-grid");
    this.container.setAttribute("data-page-count", String(pages.length));
    this.container.style.display = "grid";
    this.container.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(280px, 1fr))";
    this.container.style.gap = gap;
    this.container.style.width = "100%";

    let html = "";
    pages.forEach((page, index) => {
      html += `<div role="listitem" data-page-index="${index}">${this.renderCard(page)}</div>`;
    });

    this.container.innerHTML = html;

    // Attach event listeners for keyboard navigation
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const cards = this.container.querySelectorAll(".card.card--clickable");
    cards.forEach((card) => {
      const cardEl = card as HTMLElement;
      cardEl.addEventListener("keydown", (e: Event) => {
        if (
          e instanceof KeyboardEvent &&
          (e.key === "Enter" || e.key === " ")
        ) {
          cardEl.click();
        }
      });
    });
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <div class="page-card-error" role="alert" aria-live="polite" style="padding: 24px; text-align: center; color: var(--clr-status-danger, #d32f2f);">
        <h3 style="margin: 0 0 8px 0;"><strong>PageCard Component Error</strong></h3>
        <p style="margin: 0;">${this.escapeHtml(message)}</p>
      </div>
    `;
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initPageCard = () => {
    const nodes = document.querySelectorAll(
      '[data-hydration-component="page-card"]',
    );
    nodes.forEach((node) => {
      new PageCardClient(node as HTMLElement);
    });
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageCard);
  } else {
    initPageCard();
  }
}

// Expose PageCardClient globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGPageCard: typeof PageCardClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGPageCard = PageCardClient;
}
