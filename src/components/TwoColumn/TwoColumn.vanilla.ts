/**
 * Vanilla JS TwoColumn Component
 * Lightweight implementation without React dependency for Squiz Matrix embedding
 */

import "./TwoColumn.css";

export interface TwoColumnConfig {
  leftContent?: string;
  rightContent?: string;
  leftWidth?: string;
  rightWidth?: string;
  gap?: string;
  className?: string;
}

export class TwoColumnComponent {
  private container: HTMLElement;
  private config: Required<TwoColumnConfig>;

  constructor(container: HTMLElement, config: TwoColumnConfig = {}) {
    this.container = container;
    this.config = {
      leftContent: config.leftContent || "",
      rightContent: config.rightContent || "",
      leftWidth: config.leftWidth || "1fr",
      rightWidth: config.rightWidth || "1fr",
      gap: config.gap || "2rem",
      className: config.className || "",
    };

    this.render();
  }

  private render(): void {
    const className = this.config.className
      ? `nt-two-column ${this.config.className}`
      : "nt-two-column";

    const gridStyles = `display: grid; grid-template-columns: ${this.config.leftWidth} ${this.config.rightWidth}; gap: ${this.config.gap};`;

    this.container.innerHTML = `
      <div class="${className}" style="${gridStyles}">
        <div class="nt-two-column__left">${this.config.leftContent}</div>
        <div class="nt-two-column__right">${this.config.rightContent}</div>
      </div>
    `;
  }

  public updateContent(leftContent?: string, rightContent?: string): void {
    if (leftContent !== undefined) {
      this.config.leftContent = leftContent;
    }
    if (rightContent !== undefined) {
      this.config.rightContent = rightContent;
    }
    this.render();
  }

  public destroy(): void {
    this.container.innerHTML = "";
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initTwoColumn = () => {
    const container = document.getElementById("nt-twocolumn-root");

    if (container) {
      // Read configuration from data attributes
      const config: TwoColumnConfig = {
        leftContent: container.getAttribute("data-left-content") || undefined,
        rightContent: container.getAttribute("data-right-content") || undefined,
        leftWidth: container.getAttribute("data-left-width") || undefined,
        rightWidth: container.getAttribute("data-right-width") || undefined,
        gap: container.getAttribute("data-gap") || undefined,
        className: container.getAttribute("data-class") || undefined,
      };

      new TwoColumnComponent(container, config);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTwoColumn);
  } else {
    initTwoColumn();
  }
}

// Expose TwoColumnComponent globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGTwoColumn: typeof TwoColumnComponent;
  }
}

if (typeof window !== "undefined") {
  window.NTGTwoColumn = TwoColumnComponent;
}
