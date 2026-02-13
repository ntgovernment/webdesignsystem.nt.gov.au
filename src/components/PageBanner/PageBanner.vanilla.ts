import "./PageBanner.css";

export interface PageBannerProps {
  title?: string;
  description?: string;
  type?: string; // Primary, Secondary, etc.
  image?: string;
  figmaUrl?: string;
  storybookUrl?: string;
}

export class PageBanner {
  private container: HTMLElement;
  private props: PageBannerProps;

  constructor(container: HTMLElement, props: PageBannerProps = {}) {
    this.container = container;
    this.props = props;

    this.render();
  }

  private render(): void {
    const { title = "", description = "", type = "Primary", image = "", figmaUrl = "", storybookUrl = "" } = this.props;

    const variantClass = `nt-page-banner--${(type || "Primary").toLowerCase()}`;

    this.container.classList.add("nt-page-banner", variantClass);

    this.container.innerHTML = `
      <div class="nt-page-banner__inner">
        <div class="nt-page-banner__content">
          ${title ? `<h1 class="nt-page-banner__title">${this.escapeHtml(title)}</h1>` : ""}
          ${description ? `<p class="nt-page-banner__description">${this.escapeHtml(description)}</p>` : ""}
          <div class="nt-page-banner__actions">
            ${figmaUrl ? `<a class="nt-page-banner__cta" href="${this.escapeAttr(figmaUrl)}" target="_blank" rel="noopener noreferrer">Figma</a>` : ""}
            ${storybookUrl ? `<a class="nt-page-banner__cta" href="${this.escapeAttr(storybookUrl)}" target="_blank" rel="noopener noreferrer">Storybook</a>` : ""}
          </div>
        </div>
        ${image ? `<div class="nt-page-banner__graphics"><img class="nt-page-banner__image" src="${this.escapeAttr(image)}" alt=""/></div>` : ""}
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private escapeAttr(str: string): string {
    return this.escapeHtml(str);
  }

  public destroy(): void {
    this.container.innerHTML = "";
    this.container.classList.remove("nt-page-banner");
  }
}

// Auto-mount for standalone pages that use the standard ID
if (typeof document !== "undefined") {
  const init = () => {
    const container = document.getElementById("nt-page-banner-content");

    if (container) {
      const props: PageBannerProps = {
        title: container.getAttribute("data-page-banner-title") || undefined,
        description: container.getAttribute("data-page-banner-description") || undefined,
        type: container.getAttribute("data-page-banner-type") || undefined,
        image: container.getAttribute("data-page-banner-image") || undefined,
        figmaUrl: container.getAttribute("data-page-banner-figma-url") || undefined,
        storybookUrl: container.getAttribute("data-page-banner-storybook-url") || undefined,
      };

      new PageBanner(container, props);
    }

    // Support generic hydration attributes too
    const nodes = document.querySelectorAll('[data-hydration-component="page-banner"]');
    nodes.forEach((node) => {
      const el = node as HTMLElement;
      const props: PageBannerProps = {
        title: el.getAttribute("data-title") || undefined,
        description: el.getAttribute("data-description") || undefined,
        type: el.getAttribute("data-type") || undefined,
        image: el.getAttribute("data-image") || undefined,
        figmaUrl: el.getAttribute("data-figma-url") || undefined,
        storybookUrl: el.getAttribute("data-storybook-url") || undefined,
      };
      new PageBanner(el, props);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

// Expose globally for testing / manual instantiation
declare global {
  interface Window {
    NTGPageBanner: typeof PageBanner;
  }
}

if (typeof window !== "undefined") {
  // @ts-ignore
  window.NTGPageBanner = PageBanner;
}
