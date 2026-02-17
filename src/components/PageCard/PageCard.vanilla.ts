/**
 * PageCard Vanilla JS - Client-Side Hydration
 *
 * Displays a list of ContentPage assets using Card layout
 * with Image and Title displayed in a responsive grid.
 * Loaded globally and auto-detects all [data-hydration-component="page-card"] elements.
 */

import "./PageCard.css";

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

export interface SquizImageVariation {
  url?: string;
  width?: number;
  height?: number;
  byteSize?: number;
  mimeType?: string;
  aspectRatio?: string;
  sha1Hash?: string;
}

export interface SquizImageValue {
  name?: string;
  alt?: string;
  caption?: string;
  imageVariations?: Record<string, SquizImageVariation>;
}

export interface PageCardItem {
  PageAsset?: SquizLinkValue;
  CardImage?: SquizImageValue | SquizLinkValue;
  CardTitle?: string;
}

export interface PageCardProps {
  PageArray?: PageCardItem[];
  pages?: PageCardItem[];
  gap?: string;
  cssClass?: string;
}

const isLinkObject = (
  link?: SquizLinkValue,
): link is Exclude<SquizLinkValue, string> =>
  !!link && typeof link !== "string";

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
    const pageArray = this.props.PageArray || this.props.pages || [];
    if (!pageArray || pageArray.length === 0) {
      console.error("[PageCard] No pages provided in props");
      this.renderError("No content pages provided");
      return;
    }

    console.log(
      "[PageCard] Validation passed, rendering",
      pageArray.length,
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

  private resolveImageUrl(image?: SquizImageValue | SquizLinkValue): string {
    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    if ("imageVariations" in image && image.imageVariations) {
      const original = image.imageVariations.original;
      if (original?.url) {
        return original.url;
      }

      const variations = Object.values(image.imageVariations);
      const fallback = variations.find((item) => item?.url);
      if (fallback?.url) {
        return fallback.url;
      }
    }

    if (isLinkObject(image)) {
      return image.url || image.href || "";
    }

    return "";
  }

  private resolveImageAlt(
    image?: SquizImageValue | SquizLinkValue,
    fallbackTitle?: string,
  ): string {
    if (!image || typeof image === "string") {
      return fallbackTitle || "";
    }

    if ("alt" in image && image.alt) {
      return image.alt;
    }

    return fallbackTitle || image.name || "";
  }

  private renderCard(page: PageCardItem): string {
    const href = this.resolveLinkUrl(page.PageAsset);
    const imageUrl = this.resolveImageUrl(page.CardImage);
    const title = page.CardTitle || this.resolveLinkTitle(page.PageAsset) || "";
    const escapedTitle = this.escapeHtml(title);
    const escapedTitleAttr = this.escapeAttr(
      this.resolveImageAlt(page.CardImage, title || "Card"),
    );
    const cardTag = href ? "a" : "div";
    const hrefAttr = href ? ` href="${this.escapeAttr(href)}"` : "";
    const clickableClass = href ? " card--clickable" : "";
    const mediaContent = imageUrl
      ? `<img src="${this.escapeAttr(imageUrl)}" alt="${escapedTitleAttr}" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover; max-height: 200px;">`
      : `<div aria-hidden="true" style="width: 100%; height: 100%; background: var(--clr-bg-shade, #f5f5f7);"></div>`;

    return `<${cardTag} class="card${clickableClass} card--full text-bg-full"${hrefAttr} style="max-width: 353px;">
      <div class="card__media card__media--16:9">
        ${mediaContent}
      </div>
      <div class="card-body">
        <div class="card__body-content">
          <div class="card__body-title-wrapper">
            <h5 class="card-title">${escapedTitle}</h5>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="card__footer-actions"></div>
      </div>
    </${cardTag}>`;
  }

  private render(): void {
    const pageArray = this.props.PageArray || this.props.pages || [];
    const { gap = "var(--sp-md, 16px)", cssClass = "" } = this.props;

    const containerClasses = ["nt-page-card", cssClass]
      .filter(Boolean)
      .join(" ");
    this.container.className = containerClasses;
    this.container.setAttribute("role", "list");
    this.container.setAttribute("data-component-type", "page-card-grid");
    this.container.setAttribute("data-page-count", String(pageArray.length));
    this.container.style.display = "grid";
    this.container.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(280px, 1fr))";
    this.container.style.gap = gap;
    this.container.style.width = "100%";

    let html = "";
    pageArray.forEach((page, index) => {
      html += `<div role="listitem" data-page-index="${index}">${this.renderCard(page)}</div>`;
    });

    this.container.innerHTML = html;
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
