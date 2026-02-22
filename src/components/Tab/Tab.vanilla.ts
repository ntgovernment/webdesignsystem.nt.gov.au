/**
 * Tab Component - Client-Side Implementation
 *
 * Scans DOM for tab markers, extracts content sections, and generates
 * a sticky tab navigation. Shows/hides content based on active tab.
 * Only renders navigation if more than 1 tab is found.
 */

import "./Tab.css";
import { escapeHtml } from "../../utils/sanitize";
import { generateInstanceId } from "../../utils/instance-id";
import { debugLog, debugError, debugWarn } from "../../utils/debug";

export interface TabData {
  title: string;
  markerElement: HTMLElement;
  contentElements: HTMLElement[];
  panelElement: HTMLElement | null;
  id: string;
}

export interface TabProps {
  containerSelector?: string;
  markerClass?: string;
  stickyOffset?: string;
}

export class TabClient {
  private container: HTMLElement;
  private props: TabProps;
  private tabs: TabData[] = [];
  private activeTabIndex: number = 0;
  private navElement: HTMLElement | null = null;
  private instanceId: string;

  constructor(container: HTMLElement, config: Partial<TabProps> = {}) {
    this.container = container;
    this.instanceId = generateInstanceId("tab");
    this.props = {
      containerSelector: ".content",
      markerClass: "nt-tab-marker",
      stickyOffset: "var(--header-height, 76px)",
      ...config,
    };

    debugLog("[Tab] Initializing for container:", container);
    debugLog("[Tab] Props:", this.props);

    this.scanTabs();

    if (this.tabs.length === 0) {
      debugWarn("[Tab] No tab markers found in container");
      return;
    }

    if (this.tabs.length === 1) {
      debugLog("[Tab] Only 1 tab found, skipping navigation rendering");
      // Still wrap content in panel for consistency
      this.wrapSingleTab();
      return;
    }

    debugLog(`[Tab] Found ${this.tabs.length} tabs, rendering navigation`);

    this.activeTabIndex = this.getInitialTabIndex();
    this.renderNavigation();
    this.wrapContentInPanels();
    this.updateTabStates();
    this.attachEventListeners();

    debugLog("[Tab] Initialization complete");
  }

  /**
   * Scan the container for tab markers and group content
   */
  private scanTabs(): void {
    let contentContainer: Element | null = this.container;

    // If containerSelector is provided, check if container itself matches, otherwise find child
    if (this.props.containerSelector) {
      if (this.container.matches(this.props.containerSelector)) {
        contentContainer = this.container;
      } else {
        contentContainer = this.container.querySelector(
          this.props.containerSelector,
        );
      }
    }

    if (!contentContainer) {
      debugError(
        `[Tab] Content container not found: ${this.props.containerSelector}`,
      );
      return;
    }

    const children = Array.from(contentContainer.children) as HTMLElement[];
    const markerClass = this.props.markerClass!;

    debugLog(
      `[Tab] Scanning ${children.length} children for .${markerClass} markers`,
    );

    let currentTab: TabData | null = null;

    for (const child of children) {
      if (child.classList.contains(markerClass)) {
        // Found a tab marker - save previous tab and start new one
        if (currentTab) {
          this.tabs.push(currentTab);
        }

        const title =
          child.getAttribute("data-tab-title") || `Tab ${this.tabs.length + 1}`;
        const id = this.generateTabId(title);

        currentTab = {
          title,
          markerElement: child,
          contentElements: [],
          panelElement: null,
          id,
        };

        debugLog(`[Tab] Found marker: "${title}" (id: ${id})`);

        // Hide the marker element
        child.style.display = "none";
      } else if (currentTab) {
        // Content element belonging to current tab
        currentTab.contentElements.push(child);
      }
    }

    // Don't forget the last tab
    if (currentTab) {
      this.tabs.push(currentTab);
    }

    debugLog(
      `[Tab] Scan complete: ${this.tabs.length} tabs found`,
      this.tabs.map((t) => ({
        title: t.title,
        contentCount: t.contentElements.length,
      })),
    );
  }

  /**
   * Determine initial active tab (first or URL hash match)
   */
  private getInitialTabIndex(): number {
    // Check URL hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove #
      const index = this.tabs.findIndex(
        (tab) =>
          this.normalizeForHash(tab.title) === this.normalizeForHash(hash),
      );

      if (index !== -1) {
        debugLog(`[Tab] Activating tab ${index} from URL hash: #${hash}`);
        return index;
      }
    }

    // Default to first tab
    debugLog("[Tab] Activating first tab by default");
    return 0;
  }

  /**
   * Normalize string for hash comparison (kebab-case, lowercase)
   */
  private normalizeForHash(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  /**
   * Generate unique ID for tab and panel
   */
  private generateTabId(title: string): string {
    const normalized = this.normalizeForHash(title);
    return `${this.instanceId}-${normalized}`;
  }

  /**
   * Wrap single tab content for consistency
   */
  private wrapSingleTab(): void {
    if (this.tabs.length !== 1) return;

    const tab = this.tabs[0];
    const panel = document.createElement("div");
    panel.className = "nt-tab__panel";
    panel.id = `${tab.id}-panel`;
    panel.setAttribute("role", "tabpanel");

    // Move all content elements into the panel
    tab.contentElements.forEach((el) => {
      panel.appendChild(el);
    });

    // Insert panel where first content element was
    if (tab.contentElements.length > 0) {
      tab.markerElement.parentNode?.insertBefore(
        panel,
        tab.markerElement.nextSibling,
      );
    }

    tab.panelElement = panel;
  }

  /**
   * Render the sticky tab navigation
   */
  private renderNavigation(): void {
    const nav = document.createElement("nav");
    nav.className = "nt-tab__nav";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Tab navigation");
    nav.style.setProperty("--tab-sticky-offset", this.props.stickyOffset!);

    const tabButtons = this.tabs
      .map((tab, index) => {
        const isActive = index === this.activeTabIndex;
        return `
        <button
          class="nt-tab__button ${isActive ? "nt-tab__button--active" : ""}"
          role="tab"
          aria-selected="${isActive}"
          aria-controls="${tab.id}-panel"
          id="${tab.id}-tab"
          data-tab-index="${index}"
          tabindex="${isActive ? "0" : "-1"}"
        >
          ${escapeHtml(tab.title)}
        </button>
      `.trim();
      })
      .join("");

    nav.innerHTML = tabButtons;

    // Insert navigation after the first tab marker (or at the beginning)
    const firstMarker = this.tabs[0].markerElement;
    firstMarker.parentNode?.insertBefore(nav, firstMarker);

    this.navElement = nav;

    debugLog("[Tab] Navigation rendered with", this.tabs.length, "buttons");
  }

  /**
   * Wrap content sections in tab panels
   */
  private wrapContentInPanels(): void {
    this.tabs.forEach((tab) => {
      const panel = document.createElement("div");
      panel.className = "nt-tab__panel";
      panel.id = `${tab.id}-panel`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${tab.id}-tab`);

      // Move all content elements into the panel
      tab.contentElements.forEach((el) => {
        panel.appendChild(el);
      });

      // Insert panel where first content element was
      if (tab.contentElements.length > 0) {
        tab.markerElement.parentNode?.insertBefore(
          panel,
          tab.markerElement.nextSibling,
        );
      }

      tab.panelElement = panel;
    });

    debugLog("[Tab] Content wrapped in panels");
  }

  /**
   * Update tab button and panel states based on activeTabIndex
   */
  private updateTabStates(): void {
    this.tabs.forEach((tab, index) => {
      const isActive = index === this.activeTabIndex;

      // Update button
      const button = document.getElementById(`${tab.id}-tab`);
      if (button) {
        button.classList.toggle("nt-tab__button--active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      }

      // Update panel
      if (tab.panelElement) {
        tab.panelElement.hidden = !isActive;
      }
    });

    debugLog(`[Tab] Updated states, active tab: ${this.activeTabIndex}`);
  }

  /**
   * Attach event listeners for tab switching
   */
  private attachEventListeners(): void {
    if (!this.navElement) return;

    const buttons = this.navElement.querySelectorAll(".nt-tab__button");

    buttons.forEach((button) => {
      // Click handler
      button.addEventListener("click", () => {
        const index = parseInt(
          (button as HTMLElement).getAttribute("data-tab-index") || "0",
          10,
        );
        this.switchTab(index);
      });

      // Keyboard navigation
      button.addEventListener("keydown", (e) => {
        this.handleKeydown(e as KeyboardEvent);
      });
    });

    debugLog("[Tab] Event listeners attached");
  }

  /**
   * Switch to a specific tab
   */
  private switchTab(newIndex: number): void {
    if (
      newIndex === this.activeTabIndex ||
      newIndex < 0 ||
      newIndex >= this.tabs.length
    ) {
      return;
    }

    debugLog(`[Tab] Switching from tab ${this.activeTabIndex} to ${newIndex}`);

    this.activeTabIndex = newIndex;
    this.updateTabStates();

    // Focus the newly active tab button
    const newButton = document.getElementById(`${this.tabs[newIndex].id}-tab`);
    if (newButton) {
      newButton.focus();
    }
  }

  /**
   * Handle keyboard navigation (Arrow keys, Home, End)
   */
  private handleKeydown(e: KeyboardEvent): void {
    let newIndex = this.activeTabIndex;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        newIndex = Math.max(0, this.activeTabIndex - 1);
        break;

      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        newIndex = Math.min(this.tabs.length - 1, this.activeTabIndex + 1);
        break;

      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;

      case "End":
        e.preventDefault();
        newIndex = this.tabs.length - 1;
        break;

      default:
        return;
    }

    this.switchTab(newIndex);
  }

  /**
   * Public API: Get current active tab index
   */
  public getActiveTabIndex(): number {
    return this.activeTabIndex;
  }

  /**
   * Public API: Get tab data
   */
  public getTabs(): TabData[] {
    return this.tabs;
  }

  /**
   * Public API: Programmatically switch to a tab
   */
  public setActiveTab(index: number): void {
    this.switchTab(index);
  }

  /**
   * Cleanup and destroy component
   */
  public destroy(): void {
    if (this.navElement) {
      this.navElement.remove();
    }

    // Restore original DOM structure if needed
    this.tabs.forEach((tab) => {
      tab.markerElement.style.display = "";
      if (tab.panelElement) {
        // Move content back out of panel
        while (tab.panelElement.firstChild) {
          tab.panelElement.parentNode?.insertBefore(
            tab.panelElement.firstChild,
            tab.panelElement,
          );
        }
        tab.panelElement.remove();
      }
    });

    debugLog("[Tab] Component destroyed");
  }
}

// Auto-initialize Tabs on page load
(function () {
  if (typeof document !== "undefined") {
    const initTabs = () => {
      debugLog("[Tab] Auto-initialization starting");

      // Look for containers with data-tab-container attribute
      const containers = document.querySelectorAll("[data-tab-container]");

      if (containers.length === 0) {
        debugLog("[Tab] No [data-tab-container] elements found");
        return;
      }

      debugLog(`[Tab] Found ${containers.length} container(s) to initialize`);

      containers.forEach((container, index) => {
        try {
          // Parse config from data attributes
          const config: Partial<TabProps> = {};

          const containerSelector = (container as HTMLElement).getAttribute(
            "data-tab-container",
          );
          if (containerSelector) {
            config.containerSelector = containerSelector;
          }

          const markerClass = (container as HTMLElement).getAttribute(
            "data-tab-marker-class",
          );
          if (markerClass) {
            config.markerClass = markerClass;
          }

          const stickyOffset = (container as HTMLElement).getAttribute(
            "data-tab-sticky-offset",
          );
          if (stickyOffset) {
            config.stickyOffset = stickyOffset;
          }

          new TabClient(container as HTMLElement, config);
        } catch (error) {
          debugError(
            `[Tab] Failed to initialize container ${index + 1}:`,
            error,
          );
        }
      });

      debugLog("[Tab] Auto-initialization complete");
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initTabs);
    } else {
      initTabs();
    }
  }
})();

// Global exposure
declare global {
  interface Window {
    NTGTab: typeof TabClient;
  }
}

if (typeof window !== "undefined") {
  window.NTGTab = TabClient;
}

export default TabClient;
