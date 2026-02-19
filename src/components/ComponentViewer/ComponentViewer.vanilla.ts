/**
 * ComponentViewer Vanilla JS - Client-Side Hydration
 *
 * Enhances server-rendered HTML with interactivity (zoom, code toggle, copy).
 * No longer re-renders - server provides complete HTML structure.
 */

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

    // Get already-rendered elements (server-rendered HTML)
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

  /**
   * For any <p> or <li> whose text content exceeds 72 characters:
   * strips all inner tags, then truncates at the next space or full stop
   * after position 72, appending an ellipsis.
   */
  private shortenLongElements(html: string): string {
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      let modified = false;

      doc.querySelectorAll("p, li").forEach((el) => {
        const text = (el.textContent || "").trim();
        if (text.length <= 72) return;

        // Find the next space or '.' at or after position 72
        let cutAt = -1;
        for (let i = 72; i < text.length; i++) {
          if (text[i] === " " || text[i] === ".") {
            cutAt = i;
            break;
          }
        }
        if (cutAt === -1) cutAt = 72;

        el.innerHTML = text.slice(0, cutAt).trimEnd() + "\u2026";
        modified = true;
      });

      return modified ? doc.body.innerHTML : html;
    } catch {
      return html;
    }
  }

  private async formatCode(code: string): Promise<void> {
    const dedentedCode = this.dedentCode(code);
    const shortenedCode = this.shortenLongElements(dedentedCode);
    this.extractedCode = shortenedCode;

    try {
      // Check if Prettier is available globally
      if (window.prettier && window.prettierPlugins) {
        const formatted = await window.prettier.format(shortenedCode, {
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
        this.extractedCode = shortenedCode;
      }
    } catch (error) {
      debugError("Failed to format code:", error);
      this.extractedCode = shortenedCode;
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

    const len = code.length;

    // If code is empty, clear and return
    if (len === 0) {
      this.codeDisplay.textContent = "";
      this.codeDisplay.classList.remove("typing-cursor");
      return;
    }

    // If code is longer than 200 characters, skip animation and display immediately
    if (len > 200) {
      // Use textContent to set code, then let Prism handle the highlighting
      this.codeDisplay.textContent = code;
      this.codeDisplay.classList.remove("typing-cursor");
      if (window.Prism) {
        window.Prism.highlightElement(this.codeDisplay);
      }
      return;
    }

    // Clear existing content and add typing cursor class
    this.codeDisplay.textContent = "";
    this.codeDisplay.classList.add("typing-cursor");

    let i = 0;

    const tick = () => {
      // Append next character using textContent (safer for typing animation)
      this.codeDisplay!.textContent += code.charAt(i);
      i += 1;

      if (i < len) {
        // Randomize delay slightly to feel human/agent-like
        const jitter = Math.floor(Math.random() * 20) - 10;
        setTimeout(tick, Math.max(4, avgDelay + jitter));
      } else {
        // Finished typing: remove cursor and apply Prism highlighting
        // Prism will read textContent and generate proper HTML with syntax highlighting
        setTimeout(() => {
          this.codeDisplay!.classList.remove("typing-cursor");
          if (window.Prism) {
            window.Prism.highlightElement(this.codeDisplay!);
          }
        }, 120);
      }
    };

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
