import "./PageBanner.css";
import { escapeHtml, escapeAttr } from "../../utils/sanitize";

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
    const {
      title = "",
      description = "",
      type = "Primary",
      image = "",
      figmaUrl = "",
      storybookUrl = "",
    } = this.props;

    const variantClass = `nt-page-banner--${(type || "Primary").toLowerCase()}`;

    this.container.classList.add("nt-page-banner", variantClass);

    this.container.innerHTML = `
      ${image ? `<div class="nt-page-banner__graphics"><img class="nt-page-banner__image" src="${escapeAttr(image)}" alt=""/></div>` : ""}
      <div class="nt-page-banner__inner">
        <div class="nt-page-banner__content">
          ${title ? `<h1 class="nt-page-banner__title">${escapeHtml(title)}</h1>` : ""}
          ${description ? `<p class="nt-page-banner__description">${escapeHtml(description)}</p>` : ""}
          <div class="nt-page-banner__actions">
            ${figmaUrl ? `<a class="nt-page-banner__cta" href="${escapeAttr(figmaUrl)}" target="_blank" rel="noopener noreferrer"><svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.33344 9.082C5.79528 9.45243 6.36728 9.6586 6.95925 9.66799C7.55122 9.67737 8.12947 9.48945 8.60282 9.13384C9.07617 8.77824 9.41769 8.27518 9.57352 7.70402C9.72934 7.13285 9.69061 6.52606 9.46344 5.97933C9.27345 5.5202 8.95896 5.12328 8.55544 4.83333C8.89952 4.58643 9.17985 4.26113 9.37322 3.88436C9.56659 3.50758 9.66745 3.09017 9.66744 2.66667C9.66744 1.95942 9.38649 1.28115 8.88639 0.781049C8.38629 0.280952 7.70801 1.11326e-07 7.00077 1.11326e-07H2.66744C2.10287 -0.000162973 1.55282 0.178858 1.0965 0.511282C0.640178 0.843706 0.301134 1.31238 0.128194 1.8498C-0.0447463 2.38723 -0.0426579 2.96568 0.134158 3.50184C0.310974 4.038 0.653394 4.50421 1.1121 4.83333C0.768002 5.08022 0.487653 5.40552 0.294262 5.7823C0.100871 6.15907 7.0165e-08 6.57649 7.0165e-08 7C7.0165e-08 7.42351 0.100871 7.84093 0.294262 8.21771C0.487653 8.59448 0.768002 8.91978 1.1121 9.16667C0.740862 9.43306 0.444297 9.79037 0.250857 10.2043C0.0574174 10.6183 -0.0264078 11.075 0.00742252 11.5307C0.0412528 11.9864 0.191603 12.4257 0.444052 12.8066C0.696501 13.1874 1.04258 13.497 1.44909 13.7057C1.8556 13.9143 2.3089 14.015 2.76552 13.9981C3.22213 13.9812 3.66674 13.8472 4.0567 13.609C4.44665 13.3709 4.76886 13.0365 4.99243 12.638C5.216 12.2395 5.33342 11.7903 5.33344 11.3333V9.082ZM2.66677 1C2.22474 1 1.80082 1.17559 1.48826 1.48816C1.1757 1.80072 1.0001 2.22464 1.0001 2.66667C1.0001 3.10869 1.1757 3.53262 1.48826 3.84518C1.80082 4.15774 2.22474 4.33333 2.66677 4.33333H4.33344V1H2.66677ZM4.33344 9.66667H2.66677C2.33713 9.66667 2.0149 9.76442 1.74082 9.94755C1.46674 10.1307 1.25312 10.391 1.12697 10.6955C1.00082 11.0001 0.967819 11.3352 1.03213 11.6585C1.09644 11.9818 1.25517 12.2788 1.48826 12.5118C1.72135 12.7449 2.01832 12.9037 2.34162 12.968C2.66492 13.0323 3.00003 12.9993 3.30458 12.8731C3.60912 12.747 3.86942 12.5334 4.05255 12.2593C4.23569 11.9852 4.33344 11.663 4.33344 11.3333V9.66667ZM2.66677 5.33333C2.22474 5.33333 1.80082 5.50893 1.48826 5.82149C1.1757 6.13405 1.0001 6.55797 1.0001 7C1.0001 7.44203 1.1757 7.86595 1.48826 8.17851C1.80082 8.49107 2.22474 8.66667 2.66677 8.66667H4.33344V5.33333H2.66677ZM5.33344 7C5.33344 7.44212 5.50907 7.86612 5.82169 8.17875C6.13431 8.49137 6.55832 8.667 7.00044 8.667C7.44255 8.667 7.86656 8.49137 8.17918 8.17875C8.49181 7.86612 8.66744 7.44212 8.66744 7C8.66744 6.55788 8.49181 6.13388 8.17918 5.82125C7.86656 5.50863 7.44255 5.333 7.00044 5.333C6.55832 5.333 6.13431 5.50863 5.82169 5.82125C5.50907 6.13388 5.33344 6.55788 5.33344 7ZM7.0001 4.33333C7.44213 4.33333 7.86605 4.15774 8.17862 3.84518C8.49118 3.53262 8.66677 3.10869 8.66677 2.66667C8.66677 2.22464 8.49118 1.80072 8.17862 1.48816C7.86605 1.17559 7.44213 1 7.0001 1H5.33344V4.33333H7.0001Z" fill="currentColor"/></svg>Figma</a>` : ""}
            ${storybookUrl ? `<a class="nt-page-banner__cta" href="${escapeAttr(storybookUrl)}" target="_blank" rel="noopener noreferrer"><svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M3.16667 8.5C3.56667 9.5 4.25933 9.83333 5.35533 9.83333H5.16667C6.36667 9.83333 7.16667 9.184 7.16667 8.21C7.16667 7.414 6.61267 7.01067 5.73533 6.65467L4.41867 6.12C3.652 5.80867 3.16667 5.172 3.16667 4.47533C3.16667 3.82867 3.766 3.28467 4.558 3.21333L4.96667 3.17667C5.98533 3.08467 6.96667 3.68467 7.16667 4.5M7.83333 0.833333V1.5M0.5 1.16667L0.833333 12.1667L9.83333 12.5V0.5L0.5 1.16667Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>Storybook</a>` : ""}
          </div>
        </div>
      </div>
    `;
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
        description:
          container.getAttribute("data-page-banner-description") || undefined,
        type: container.getAttribute("data-page-banner-type") || undefined,
        image: container.getAttribute("data-page-banner-image") || undefined,
        figmaUrl:
          container.getAttribute("data-page-banner-figma-url") || undefined,
        storybookUrl:
          container.getAttribute("data-page-banner-storybook-url") || undefined,
      };

      new PageBanner(container, props);
    }

    // Support generic hydration attributes too
    const nodes = document.querySelectorAll(
      '[data-hydration-component="page-banner"]',
    );
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
