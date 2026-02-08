/**
 * ComponentViewer Vanilla JS - Client-Side Hydration
 *
 * Handles interactivity for server-rendered ComponentViewer instances.
 * Loaded globally and auto-detects all [data-component-viewer] elements.
 */

// Type definitions for external libraries
declare global {
  interface Window {
    Prism: any;
    prettier: any;
    prettierPlugins: any;
  }
}

export class ComponentViewerClient {
  private container: HTMLElement;
  private instanceId: string;
  private iframe: HTMLIFrameElement | null;
  private zoomContainer: HTMLElement | null;
  private codePanel: HTMLElement | null;
  private codeDisplay: HTMLElement | null;
  private currentZoom: number;
  private isCodeVisible: boolean;
  private extractedCode: string = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.instanceId = container.dataset.instanceId || "";

    // Get elements
    this.iframe = container.querySelector("[data-iframe]") as HTMLIFrameElement;
    this.zoomContainer = container.querySelector(
      "[data-zoom-container]",
    ) as HTMLElement;
    this.codePanel = container.querySelector(
      "[data-code-panel]",
    ) as HTMLElement;
    this.codeDisplay = container.querySelector(
      "[data-code-display]",
    ) as HTMLElement;

    // Initialize state
    this.currentZoom = parseFloat(container.dataset.initialZoom || "1");
    this.isCodeVisible = container.dataset.showCode === "true";

    // Setup event listeners
    this.setupEventListeners();

    // Wait for iframe to load, then extract code
    if (this.iframe) {
      this.iframe.addEventListener("load", () => {
        setTimeout(() => this.extractIframeContent(), 1000);
      });
    }

    // Apply initial zoom
    if (this.currentZoom !== 1) {
      this.applyZoom();
    }
  }

  private setupEventListeners(): void {
    // Get all action buttons
    const buttons = this.container.querySelectorAll("[data-action]");

    buttons.forEach((button) => {
      const action = (button as HTMLElement).dataset.action;

      switch (action) {
        case "zoom-in":
          button.addEventListener("click", () => this.handleZoomIn());
          break;
        case "zoom-out":
          button.addEventListener("click", () => this.handleZoomOut());
          break;
        case "zoom-reset":
          button.addEventListener("click", () => this.handleZoomReset());
          break;
        case "open-new-tab":
          button.addEventListener("click", () => this.handleOpenNewTab());
          break;
        case "copy":
          button.addEventListener("click", () => this.handleCopy());
          break;
        case "toggle-code":
          button.addEventListener("click", () => this.handleToggleCode());
          break;
      }
    });
  }

  private handleZoomIn(): void {
    this.currentZoom = Math.min(this.currentZoom + 0.1, 2);
    this.applyZoom();
  }

  private handleZoomOut(): void {
    this.currentZoom = Math.max(this.currentZoom - 0.1, 0.5);
    this.applyZoom();
  }

  private handleZoomReset(): void {
    this.currentZoom = 1;
    this.applyZoom();
  }

  private applyZoom(): void {
    if (this.zoomContainer) {
      this.zoomContainer.style.transform = `scale(${this.currentZoom})`;
    }
  }

  private handleOpenNewTab(): void {
    if (this.iframe) {
      const src = this.iframe.getAttribute("src");
      if (src) {
        window.open(src, "_blank");
      }
    }
  }

  private async handleCopy(): Promise<void> {
    const copyTextEl = this.container.querySelector("[data-copy-text]");

    try {
      await navigator.clipboard.writeText(
        this.extractedCode || this.container.dataset.codeExample || "",
      );

      if (copyTextEl) {
        const originalText = copyTextEl.textContent;
        copyTextEl.textContent = "Copied!";
        setTimeout(() => {
          copyTextEl.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  private handleToggleCode(): void {
    this.isCodeVisible = !this.isCodeVisible;

    if (this.codePanel) {
      if (this.isCodeVisible) {
        this.codePanel.classList.add("component-viewer__code--visible");
        if (!this.extractedCode) {
          this.extractIframeContent();
        }
      } else {
        this.codePanel.classList.remove("component-viewer__code--visible");
      }
    }

    // Update button text
    const toggleText = this.container.querySelector("[data-code-toggle-text]");
    if (toggleText) {
      toggleText.textContent = this.isCodeVisible ? "Hide code" : "See code";
    }

    // Update aria-label
    const toggleButton = this.container.querySelector(
      '[data-action="toggle-code"]',
    );
    if (toggleButton) {
      toggleButton.setAttribute(
        "aria-label",
        this.isCodeVisible ? "Hide code" : "See code",
      );
    }
  }

  private extractIframeContent(): void {
    try {
      if (!this.iframe) {
        this.formatCode(
          this.container.dataset.codeExample || "<!-- Iframe not found -->",
        );
        return;
      }

      const iframeDoc =
        this.iframe.contentDocument || this.iframe.contentWindow?.document;

      if (!iframeDoc) {
        console.warn("Cannot access iframe document");
        this.formatCode(
          this.container.dataset.codeExample ||
            "<!-- Unable to access iframe -->",
        );
        return;
      }

      // Try multiple selectors
      const selectors = [
        "#storybook-root",
        "[data-story-block]",
        ".sb-story",
        "#storybook-docs",
        '[id*="story"]',
        "#root",
        "body",
      ];

      let root = null;
      for (const selector of selectors) {
        const element = iframeDoc.querySelector(selector);
        if (element && element.innerHTML.trim()) {
          root = element;
          break;
        }
      }

      if (root && root.innerHTML.trim()) {
        let extractedHTML = root.innerHTML.trim();

        // Strip outer container if it's a single div
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = extractedHTML;

        if (
          tempDiv.children.length === 1 &&
          tempDiv.children[0].tagName.toLowerCase() === "div"
        ) {
          extractedHTML = tempDiv.children[0].innerHTML.trim();
        }

        this.formatCode(extractedHTML);
      } else {
        this.formatCode(this.container.dataset.codeExample || "");
      }
    } catch (error) {
      console.error("Error extracting iframe content:", error);
      this.formatCode(
        this.container.dataset.codeExample ||
          "<!-- Error extracting content -->",
      );
    }
  }

  private async formatCode(code: string): Promise<void> {
    this.extractedCode = code;

    try {
      // Check if Prettier is available globally
      if (window.prettier && window.prettierPlugins) {
        const formatted = await window.prettier.format(code, {
          parser: "html",
          plugins: window.prettierPlugins.html
            ? [window.prettierPlugins.html]
            : [],
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: "css",
        });

        this.displayCode(formatted);
      } else {
        // Fallback without Prettier
        this.displayCode(code);
      }
    } catch (error) {
      console.error("Failed to format code:", error);
      this.displayCode(code);
    }
  }

  private displayCode(code: string): void {
    if (this.codeDisplay) {
      this.codeDisplay.textContent = code;

      // Apply Prism syntax highlighting if available
      if (window.Prism) {
        window.Prism.highlightElement(this.codeDisplay);
      }
    }
  }
}

// Auto-initialize all ComponentViewer instances on page load
if (typeof document !== "undefined") {
  const initComponentViewers = () => {
    const containers = document.querySelectorAll("[data-component-viewer]");
    containers.forEach((container) => {
      new ComponentViewerClient(container as HTMLElement);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComponentViewers);
  } else {
    initComponentViewers();
  }
}

export default ComponentViewerClient;
