/**
 * Vanilla JS Header Component
 * Lightweight implementation without React dependency for Squiz Matrix embedding
 */

export interface HeaderConfig {
  title?: string;
  logoSrc?: string;
  logoAlt?: string;
  icon?: string;
  onMenuClick?: () => void;
}

export class HeaderComponent {
  private container: HTMLElement;
  private config: HeaderConfig;

  constructor(container: HTMLElement, config: HeaderConfig = {}) {
    this.container = container;
    this.config = {
      title: config.title || "Web Design System",
      logoSrc:
        config.logoSrc ||
        "https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg",
      logoAlt: config.logoAlt || "NT Government Logo",
      icon: config.icon || "fa-magnifying-glass",
      onMenuClick: config.onMenuClick,
    };

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="nt-header">
        <div class="nt-header__inner">
          <div class="nt-header__left">
            <div class="nt-header__logo-section">
              <img src="${this.config.logoSrc}" alt="${this.config.logoAlt}" class="nt-header__logo" />
              <div class="nt-header__title">${this.config.title}</div>
            </div>
          </div>
          <div class="nt-header__right">
            <div class="nt-header__actions">
              <button class="nt-header__menu-button" aria-label="Menu">
                <div class="nt-header__icon-container">
                  <i class="fa-light ${this.config.icon}"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach event listener if callback provided
    if (this.config.onMenuClick) {
      const menuButton = this.container.querySelector(
        ".nt-header__menu-button",
      );
      if (menuButton) {
        menuButton.addEventListener("click", this.config.onMenuClick);
      }
    }
  }

  public updateConfig(config: Partial<HeaderConfig>): void {
    this.config = { ...this.config, ...config };
    this.render();
  }

  public destroy(): void {
    this.container.innerHTML = "";
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initHeader = () => {
    const container = document.getElementById("nt-header-root");

    if (container) {
      // Read configuration from data attributes
      const config: HeaderConfig = {
        title: container.getAttribute("data-title") || undefined,
        logoSrc: container.getAttribute("data-logo-src") || undefined,
        logoAlt: container.getAttribute("data-logo-alt") || undefined,
        icon: container.getAttribute("data-icon") || undefined,
      };

      new HeaderComponent(container, config);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }
}

// Expose HeaderComponent globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGHeader: typeof HeaderComponent;
  }
}

if (typeof window !== "undefined") {
  window.NTGHeader = HeaderComponent;
}
