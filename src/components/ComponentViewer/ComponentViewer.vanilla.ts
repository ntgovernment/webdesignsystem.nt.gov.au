/**
 * ComponentViewer Vanilla JS - Client-Side Hydration
 *
 * Reads minimal server-rendered container and renders full HTML with interactivity.
 * Loaded globally and auto-detects all [data-hydration-component="component-viewer"] elements.
 */

import { escapeHtml } from "../../utils/sanitize";
import { debugError, debugWarn } from "../../utils/debug";

// Type definitions for external libraries
declare global {
  interface Window {
    Prism: any;
    prettier: any;
    prettierPlugins: any;
  }
}

export interface ComponentViewerProps {
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

    // Parse props from data-hydration-props
    try {
      this.props = JSON.parse(container.dataset.hydrationProps || "{}");
    } catch (error) {
      debugError("Failed to parse hydration props:", error);
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
                <i class="fa-light fa-magnifying-glass-plus" aria-hidden="true"></i>
                <span class="component-viewer__control-label">Zoom in</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-out"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <i class="fa-light fa-magnifying-glass-minus" aria-hidden="true"></i>
                <span class="component-viewer__control-label">Zoom out</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-reset"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <i class="fa-light fa-arrows-rotate" aria-hidden="true"></i>
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
      <div class="component-viewer__preview" style="height: ${escapeHtml(height)}">
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
              <i class="fa-light fa-arrow-up-right-from-square" aria-hidden="true"></i>
              <span class="component-viewer__control-label">Open canvas in new tab</span>
            </button>
          </div>

          <!-- Iframe Content -->
          <div class="component-viewer__iframe-content" data-zoom-container>
            <iframe
              src="${escapeHtml(storybookUrl)}"
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
        <pre class="component-viewer__code-content"><code class="language-html" data-code-display></code></pre>
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
      debugError("Copy failed:", err);
    }
  }

  private handleToggleCode(): void {
    this.isCodeVisible = !this.isCodeVisible;

    if (this.codePanel) {
      if (this.isCodeVisible) {
        this.codePanel.classList.add("component-viewer__code--visible");
        if (!this.extractedCode) {
          // No extracted code yet — extract (formatCode will animate when done)
          this.extractIframeContent();
        } else if (this.codeDisplay) {
          // We already have formatted code — animate typing now
          this.animateTyping(this.extractedCode);
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
        debugWarn("Cannot access iframe document");
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
      debugError("Error extracting iframe content:", error);
      this.formatCode(
        this.props.codeExample || "<!-- Error extracting content -->",
      );
    }
  }

  /**
   * Remove common leading indentation from code
   * Fixes issue where first line has invisible indent from extracted HTML
   */
  private dedentCode(code: string): string {
    if (!code || !code.trim()) return code;

    const lines = code.split("\n");

    // Find minimum indentation (ignoring empty lines)
    let minIndent = Infinity;
    for (const line of lines) {
      if (line.trim().length === 0) continue; // Skip empty lines

      const leadingSpaces = line.match(/^[ \t]*/)?.[0].length || 0;
      if (leadingSpaces < minIndent) {
        minIndent = leadingSpaces;
      }
    }

    // If no indentation found or all lines are empty, return original
    if (minIndent === 0 || minIndent === Infinity) {
      return code.trim();
    }

    // Remove the minimum indentation from all lines
    const dedented = lines
      .map((line) => {
        if (line.trim().length === 0) return ""; // Empty lines become truly empty
        return line.slice(minIndent);
      })
      .join("\n");

    return dedented.trim();
  }

  private async formatCode(code: string): Promise<void> {
    // Remove common leading indentation from all lines
    const dedentedCode = this.dedentCode(code);
    this.extractedCode = dedentedCode;

    try {
      // Check if Prettier is available globally
      if (window.prettier && window.prettierPlugins) {
        const formatted = await window.prettier.format(dedentedCode, {
          parser: "html",
          plugins: window.prettierPlugins.html
            ? [window.prettierPlugins.html]
            : [],
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: "css",
        });

        this.extractedCode = formatted;
      } else {
        // Fallback without Prettier
        this.extractedCode = dedentedCode;
      }
    } catch (error) {
      debugError("Failed to format code:", error);
      this.extractedCode = dedentedCode;
    }

    // Only display (with typing effect) when the code panel is visible
    if (this.isCodeVisible) {
      this.animateTyping(this.extractedCode || "");
    } else if (this.codeDisplay) {
      // keep code panel empty until user opens it
      this.codeDisplay.textContent = "";
    }
  }

  private animateTyping(code: string, avgDelay = 12): void {
    if (!this.codeDisplay) return;

    // Clear existing content and add typing cursor class
    this.codeDisplay.textContent = "";
    this.codeDisplay.classList.add("typing-cursor");

    let i = 0;
    const len = code.length;

    const tick = () => {
      // Append next character
      this.codeDisplay!.textContent += code.charAt(i);
      i += 1;

      if (i < len) {
        // Randomize delay slightly to feel human/agent-like
        const jitter = Math.floor(Math.random() * 20) - 10;
        setTimeout(tick, Math.max(4, avgDelay + jitter));
      } else {
        // Finished typing: remove cursor and apply Prism highlighting
        setTimeout(() => {
          this.codeDisplay!.classList.remove("typing-cursor");
          if (window.Prism) {
            window.Prism.highlightElement(this.codeDisplay!);
          }
        }, 120);
      }
    };

    // Start
    if (len === 0) {
      // Nothing to type — immediately remove cursor and clear
      this.codeDisplay.classList.remove("typing-cursor");
      this.codeDisplay.textContent = "";
      return;
    }

    // Kick off the first tick
    setTimeout(tick, avgDelay);
  }
}

// Auto-initialize all ComponentViewer instances on page load
(function () {
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
