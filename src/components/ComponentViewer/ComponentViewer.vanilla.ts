/**
 * ComponentViewer Vanilla JS - Client-Side Hydration
 *
 * Reads minimal server-rendered container and renders full HTML with interactivity.
 * Loaded globally and auto-detects all [data-hydration-component="component-viewer"] elements.
 */

// Type definitions for external libraries
declare global {
  interface Window {
    Prism: any;
    prettier: any;
    prettierPlugins: any;
  }
}

interface ComponentViewerProps {
  storybookUrl: string;
  codeExample?: string;
  height?: string;
  initialZoom?: number;
  showCodeByDefault?: boolean;
  enableCopy?: boolean;
  enableZoom?: boolean;
}

export class ComponentViewerClient {
  private container: HTMLElement;
  private instanceId: string;
  private props: ComponentViewerProps;
  private iframe: HTMLIFrameElement | null = null;
  private zoomContainer: HTMLElement | null = null;
  private codePanel: HTMLElement | null = null;
  private codeDisplay: HTMLElement | null = null;
  private currentZoom: number;
  private isCodeVisible: boolean;
  private extractedCode: string = "";

  constructor(container: HTMLElement) {
    this.container = container;
    this.instanceId = container.dataset.instanceId || "";

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
    } catch (error) {
      console.error("Failed to parse hydration props:", error);
      this.props = {
        storybookUrl: "",
      };
    }

    // Initialize state
    this.currentZoom = this.props.initialZoom || 1;
    this.isCodeVisible = this.props.showCodeByDefault || false;

    // Render the HTML
    this.render();

    // Get rendered elements
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

  private render(): void {
    const {
      storybookUrl,
      codeExample = "",
      height = "200px",
      showCodeByDefault = false,
      enableCopy = true,
      enableZoom = true,
    } = this.props;

    const zoomControls = enableZoom
      ? `
            <div class="component-viewer__zoom-controls">
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-in"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3.5a.5.5 0 01.5.5v1.5H8a.5.5 0 010 1H6.5V8a.5.5 0 01-1 0V6.5H4a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.544 10.206a5.5 5.5 0 11.662-.662.5.5 0 01.148.102l3 3a.5.5 0 01-.708.708l-3-3a.5.5 0 01-.102-.148zM10.5 6a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Zoom in</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-out"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 5.5a.5.5 0 000 1h4a.5.5 0 000-1H4z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 11.5c1.35 0 2.587-.487 3.544-1.294a.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 106 11.5zm0-1a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Zoom out</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-reset"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2.837V1.5a.5.5 0 00-1 0V4a.5.5 0 00.5.5h2.5a.5.5 0 000-1H2.258a4.5 4.5 0 11-.496 4.016.5.5 0 10-.942.337 5.502 5.502 0 008.724 2.353.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 101.5 2.837z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Reset zoom</span>
              </button>
            </div>`
      : "";

    const copyButton = enableCopy
      ? `
        <button 
          class="component-viewer__button" 
          data-action="copy"
          aria-label="Copy code to clipboard"
        >
          <i class="fa-light fa-copy" aria-hidden="true"></i>
          <span data-copy-text>Copy</span>
        </button>`
      : "";

    this.container.innerHTML = `
      <!-- Preview Section -->
      <div class="component-viewer__preview" style="height: ${this.escapeHtml(height)}">
        <div class="component-viewer__iframe-wrapper">
          
          <!-- Toolbar -->
          <div class="component-viewer__toolbar">
            ${zoomControls}
            <button 
              class="component-viewer__control-btn" 
              data-action="open-new-tab"
              aria-label="Open canvas in new tab"
              title="Open canvas in new tab"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 1.004a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4.5a.5.5 0 00-1 0v4.5H2v-10h4.5a.5.5 0 000-1H2z" fill="currentColor"/>
                <path d="M7.354 7.357L12 2.711v1.793a.5.5 0 001 0v-3a.5.5 0 00-.5-.5h-3a.5.5 0 100 1h1.793L6.646 6.65a.5.5 0 10.708.707z" fill="currentColor"/>
              </svg>
              <span class="component-viewer__control-label">Open canvas in new tab</span>
            </button>
          </div>

          <!-- Iframe Content -->
          <div class="component-viewer__iframe-content" data-zoom-container>
            <iframe
              src="${this.escapeHtml(storybookUrl)}"
              class="component-viewer__iframe"
              title="Component Preview"
              frameborder="0"
              sandbox="allow-scripts allow-same-origin"
              data-iframe
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Code Display Section -->
      <div class="component-viewer__code ${showCodeByDefault ? "component-viewer__code--visible" : ""}" data-code-panel>
        <pre class="component-viewer__code-content">
          <code class="language-html" data-code-display></code>
        </pre>
      </div>

      <!-- Action Buttons -->
      <div class="component-viewer__actions">
        ${copyButton}
        <button 
          class="component-viewer__button" 
          data-action="toggle-code"
          aria-label="${showCodeByDefault ? "Hide code" : "See code"}"
        >
          <i class="fa-light fa-code" aria-hidden="true"></i>
          <span data-code-toggle-text>${showCodeByDefault ? "Hide code" : "See code"}</span>
        </button>
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
        this.extractedCode || this.props.codeExample || "",
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
        this.formatCode(this.props.codeExample || "<!-- Iframe not found -->");
        return;
      }

      const iframeDoc =
        this.iframe.contentDocument || this.iframe.contentWindow?.document;

      if (!iframeDoc) {
        console.warn("Cannot access iframe document");
        this.formatCode(
          this.props.codeExample || "<!-- Unable to access iframe -->",
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
        this.formatCode(this.props.codeExample || "");
      }
    } catch (error) {
      console.error("Error extracting iframe content:", error);
      this.formatCode(
        this.props.codeExample || "<!-- Error extracting content -->",
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
(function() {
  if (typeof document !== "undefined") {
    const initComponentViewers = () => {
      const containers = document.querySelectorAll(
        '[data-hydration-component="component-viewer"]',
      );
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
})();

export default ComponentViewerClient;
