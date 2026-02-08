/**
 * ThemeSwitcher Vanilla JS - Client-Side Hydration
 *
 * Multi-URL theme switcher with tab navigation supporting up to 3 themes.
 * Reads minimal server-rendered container and renders full HTML with interactivity.
 * Loaded globally and auto-detects all [data-hydration-component="theme-switcher"] elements.
 */

import "./ThemeSwitcher.css";

export interface ThemeItem {
  name: string;
  url: string;
}

export interface ThemeSwitcherProps {
  themes: ThemeItem[];
  height?: string;
  defaultTheme?: string;
}

export class ThemeSwitcherClient {
  private container: HTMLElement;
  private props: ThemeSwitcherProps;
  private activeThemeIndex: number = 0;
  private iframes: Map<number, HTMLIFrameElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
    } catch (error) {
      console.error("Failed to parse hydration props:", error);
      this.props = {
        themes: [],
      };
    }

    // Validate props
    if (!this.props.themes || this.props.themes.length === 0) {
      this.renderError("No themes provided");
      return;
    }

    if (this.props.themes.length > 3) {
      this.renderError("Maximum 3 themes allowed");
      return;
    }

    // Validate each theme
    for (const theme of this.props.themes) {
      if (!theme.name || !theme.url) {
        this.renderError("Each theme must have a name and url");
        return;
      }
    }

    // Determine active theme
    this.activeThemeIndex = this.getInitialThemeIndex();

    // Render the HTML
    this.render();

    // Setup event listeners
    this.setupEventListeners();
  }

  private getInitialThemeIndex(): number {
    const { themes, defaultTheme } = this.props;

    // If defaultTheme is specified, find its index
    if (defaultTheme) {
      const index = themes.findIndex((t) => t.name === defaultTheme);
      if (index !== -1) {
        return index;
      }
    }

    // Default to first theme
    return 0;
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <div class="nt-theme-switcher-error" style="padding: 2rem; background: #fee; border: 2px solid #c33; color: #c33; border-radius: 4px;">
        <strong>Theme Switcher Error:</strong> ${this.escapeHtml(message)}
      </div>
    `;
  }

  private render(): void {
    const { themes, height = "600px" } = this.props;

    // If only one theme, don't show tabs - just the iframe
    if (themes.length === 1) {
      this.container.innerHTML = `
        <div class="nt-theme-switcher__content">
          <iframe
            src="${this.escapeHtml(themes[0].url)}"
            class="nt-theme-switcher__iframe"
            style="height: ${this.escapeHtml(height)};"
            title="${this.escapeHtml(themes[0].name)}"
            frameborder="0"
            data-theme-index="0"
          ></iframe>
        </div>
      `;
      return;
    }

    // Multiple themes - show tabs
    const tabsHtml = themes
      .map((theme, index) => {
        const isActive = index === this.activeThemeIndex;
        return `
        <button
          class="nt-theme-switcher__tab ${isActive ? "nt-theme-switcher__tab--active" : ""}"
          data-theme-index="${index}"
          aria-selected="${isActive}"
          role="tab"
        >
          ${this.escapeHtml(theme.name)}
        </button>
      `;
      })
      .join("");

    const iframesHtml = themes
      .map((theme, index) => {
        const isActive = index === this.activeThemeIndex;
        return `
        <iframe
          src="${this.escapeHtml(theme.url)}"
          class="nt-theme-switcher__iframe"
          style="height: ${this.escapeHtml(height)}; display: ${isActive ? "block" : "none"};"
          title="${this.escapeHtml(theme.name)}"
          frameborder="0"
          data-theme-index="${index}"
        ></iframe>
      `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="nt-theme-switcher__tabs" role="tablist">
        ${tabsHtml}
      </div>
      <div class="nt-theme-switcher__content">
        ${iframesHtml}
      </div>
    `;

    // Store iframe references
    this.container
      .querySelectorAll(".nt-theme-switcher__iframe")
      .forEach((iframe) => {
        const index = parseInt(
          (iframe as HTMLElement).dataset.themeIndex || "0",
          10,
        );
        this.iframes.set(index, iframe as HTMLIFrameElement);
      });
  }

  private escapeHtml(str: string): string {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private setupEventListeners(): void {
    // Get all tab buttons
    const tabs = this.container.querySelectorAll(".nt-theme-switcher__tab");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const index = parseInt(
          (tab as HTMLElement).dataset.themeIndex || "0",
          10,
        );
        this.switchTheme(index);
      });
    });
  }

  private switchTheme(newIndex: number): void {
    if (newIndex === this.activeThemeIndex) return;

    const oldIndex = this.activeThemeIndex;
    this.activeThemeIndex = newIndex;

    // Update tab states
    const tabs = this.container.querySelectorAll(".nt-theme-switcher__tab");
    tabs.forEach((tab, index) => {
      if (index === newIndex) {
        tab.classList.add("nt-theme-switcher__tab--active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("nt-theme-switcher__tab--active");
        tab.setAttribute("aria-selected", "false");
      }
    });

    // Show/hide iframes
    const oldIframe = this.iframes.get(oldIndex);
    const newIframe = this.iframes.get(newIndex);

    if (oldIframe) {
      oldIframe.style.display = "none";
    }

    if (newIframe) {
      newIframe.style.display = "block";
    }
  }
}

// Auto-initialize all ThemeSwitcher instances on page load
(function () {
  if (typeof document !== "undefined") {
    const initThemeSwitchers = () => {
      const containers = document.querySelectorAll(
        '[data-hydration-component="theme-switcher"]',
      );
      containers.forEach((container) => {
        new ThemeSwitcherClient(container as HTMLElement);
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initThemeSwitchers);
    } else {
      initThemeSwitchers();
    }
  }
})();

export default ThemeSwitcherClient;
