/**
 * Vanilla JS Left Navigation Component
 * Lightweight implementation without React dependency for Squiz Matrix embedding
 */

import "./LeftNav.css";

export interface LeftNavConfig {
  defaultExpanded?: string[]; // Array of section IDs to expand by default
  mobileBreakpoint?: number; // Mobile breakpoint in pixels
}

export class LeftNavComponent {
  private container: HTMLElement;
  private config: LeftNavConfig;
  private expandedSections: Set<string>;
  private isMobileOpen: boolean = false;
  private mobileToggle: HTMLButtonElement | null = null;
  private overlay: HTMLElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private nav: HTMLElement | null = null;

  constructor(container: HTMLElement, config: LeftNavConfig = {}) {
    console.log("[LeftNav] Constructor called, container:", container);
    console.log(
      "[LeftNav] Container innerHTML length:",
      container.innerHTML.length,
    );

    this.container = container;
    this.config = {
      defaultExpanded: config.defaultExpanded || [],
      mobileBreakpoint: config.mobileBreakpoint || 768,
    };
    this.expandedSections = new Set(this.config.defaultExpanded);

    console.log("[LeftNav] About to call convertParentLinksWithChildren...");
    this.convertParentLinksWithChildren();
    console.log("[LeftNav] About to call render...");
    this.render();
    this.attachEventListeners();
    this.expandActiveSection();
    console.log("[LeftNav] Constructor complete");
  }

  private render(): void {
    // Add mobile elements if not already present
    if (!this.container.querySelector(".nt-leftnav__mobile-toggle")) {
      const mobileToggle = document.createElement("button");
      mobileToggle.className = "nt-leftnav__mobile-toggle";
      mobileToggle.setAttribute("aria-label", "Open navigation menu");
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.innerHTML =
        '<i class="fa-light fa-bars" aria-hidden="true"></i>';
      this.container.insertBefore(mobileToggle, this.container.firstChild);
    }

    if (!this.container.querySelector(".nt-leftnav__overlay")) {
      const overlay = document.createElement("div");
      overlay.className = "nt-leftnav__overlay";
      overlay.setAttribute("aria-hidden", "true");
      this.container.insertBefore(overlay, this.container.firstChild);
    }

    // Find or create nav element
    this.nav = this.container.querySelector("nav.nt-leftnav");
    if (this.nav && !this.nav.querySelector(".nt-leftnav__close")) {
      const closeButton = document.createElement("button");
      closeButton.className = "nt-leftnav__close";
      closeButton.setAttribute("aria-label", "Close navigation menu");
      closeButton.innerHTML =
        '<i class="fa-light fa-times" aria-hidden="true"></i>';
      this.nav.insertBefore(closeButton, this.nav.firstChild);
    }

    this.mobileToggle = this.container.querySelector(
      ".nt-leftnav__mobile-toggle",
    );
    this.overlay = this.container.querySelector(".nt-leftnav__overlay");
    this.closeButton = this.container.querySelector(".nt-leftnav__close");

    // Update submenu states based on expandedSections
    this.updateSubmenuStates();
  }

  /**
   * Converts parent links to dual-functionality (link + toggle) for items with children
   * This allows clicking the text to navigate and clicking the chevron to expand/collapse
   */
  private convertParentLinksWithChildren(): void {
    // Find all items that have a submenu
    const items = this.container.querySelectorAll(".nt-leftnav__item");
    console.log(
      "[LeftNav] convertParentLinksWithChildren - found items:",
      items.length,
    );

    let processedCount = 0;
    let skippedCount = 0;

    items.forEach((item, index) => {
      const submenu = item.querySelector(".nt-leftnav__submenu");

      // Only process items that have a submenu
      if (submenu) {
        console.log(
          `[LeftNav] Item ${index} has submenu, looking for direct link...`,
        );

        const link = item.querySelector(
          ":scope > .nt-leftnav__link",
        ) as HTMLAnchorElement;

        if (!link) {
          console.log(
            `[LeftNav] Item ${index} - NO DIRECT LINK FOUND, skipping`,
          );
          skippedCount++;
          return;
        }

        console.log(
          `[LeftNav] Item ${index} - Creating wrapper for:`,
          link.textContent?.trim(),
        );

        // Get submenu ID or create one from asset ID
        const submenuId =
          submenu.id ||
          `submenu-${
            item.getAttribute("data-asset-id") ||
            Math.random().toString(36).substr(2, 9)
          }`;
        submenu.id = submenuId;

        // Create wrapper div
        const wrapper = document.createElement("div");
        wrapper.className = "nt-leftnav__parent-wrapper";

        // Update link classes
        link.classList.add("nt-leftnav__link--parent");

        // Create toggle button (chevron only)
        const toggleButton = document.createElement("button");
        toggleButton.className = "nt-leftnav__toggle";
        toggleButton.setAttribute("aria-expanded", "false");
        toggleButton.setAttribute("aria-controls", submenuId);
        toggleButton.setAttribute(
          "aria-label",
          `Toggle ${link.textContent?.trim()} submenu`,
        );

        // Add chevron icon
        const chevronIcon = document.createElement("i");
        chevronIcon.className = "nt-leftnav__chevron fa-light fa-chevron-down";
        chevronIcon.setAttribute("aria-hidden", "true");
        toggleButton.appendChild(chevronIcon);

        // Replace link with wrapper containing link + toggle
        link.parentNode?.insertBefore(wrapper, link);
        wrapper.appendChild(link);
        wrapper.appendChild(toggleButton);

        processedCount++;
        console.log(`[LeftNav] Item ${index} - Wrapper created successfully`);
      }
    });

    console.log(
      `[LeftNav] convertParentLinksWithChildren complete - processed: ${processedCount}, skipped: ${skippedCount}`,
    );
  }

  private attachEventListeners(): void {
    // Toggle buttons for expandable sections
    const toggleButtons = this.container.querySelectorAll(
      ".nt-leftnav__toggle",
    );
    toggleButtons.forEach((button) => {
      button.addEventListener("click", this.handleToggleClick.bind(this));
      button.addEventListener("keydown", this.handleToggleKeyDown.bind(this));
    });

    // Mobile toggle button
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener(
        "click",
        this.openMobileDrawer.bind(this),
      );
    }

    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener(
        "click",
        this.closeMobileDrawer.bind(this),
      );
    }

    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener("click", this.closeMobileDrawer.bind(this));
    }

    // Escape key to close drawer
    document.addEventListener("keydown", this.handleEscapeKey.bind(this));
  }

  private handleToggleClick(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const submenuId = button.getAttribute("aria-controls");
    if (!submenuId) return;

    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    // Extract section ID from submenu ID (format: submenu-{sectionId})
    const sectionId = submenuId.replace("submenu-", "");
    this.toggleSection(sectionId);
  }

  private handleToggleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault();
      this.handleToggleClick(event);
    }
  }

  private handleEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === "Escape" && this.isMobileOpen) {
      this.closeMobileDrawer();
    }
  }

  public toggleSection(sectionId: string): void {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
    this.updateSubmenuStates();
  }

  private updateSubmenuStates(): void {
    const toggleButtons = this.container.querySelectorAll(
      ".nt-leftnav__toggle",
    );

    toggleButtons.forEach((button) => {
      const submenuId = button.getAttribute("aria-controls");
      if (!submenuId) return;

      const submenu = document.getElementById(submenuId);
      if (!submenu) return;

      const sectionId = submenuId.replace("submenu-", "");
      const isExpanded = this.expandedSections.has(sectionId);

      button.setAttribute("aria-expanded", String(isExpanded));
      submenu.setAttribute("aria-hidden", String(!isExpanded));

      if (isExpanded) {
        submenu.classList.add("nt-leftnav__submenu--expanded");
      } else {
        submenu.classList.remove("nt-leftnav__submenu--expanded");
      }
    });
  }

  private expandActiveSection(): void {
    // Find all active links (check both aria-current and active class from Squiz Matrix)
    const activeLinks = this.container.querySelectorAll(
      '[aria-current="page"], .nt-leftnav__subitem.active .nt-leftnav__link, .nt-leftnav__item.active > .nt-leftnav__link',
    );

    activeLinks.forEach((link) => {
      // Find parent submenu
      const submenu = link.closest(".nt-leftnav__submenu");
      if (submenu) {
        const submenuId = submenu.id;
        const sectionId = submenuId.replace("submenu-", "");
        this.expandedSections.add(sectionId);
      }
    });

    this.updateSubmenuStates();
  }

  private openMobileDrawer(): void {
    this.isMobileOpen = true;

    if (this.nav) {
      this.nav.classList.add("nt-leftnav--open");
    }
    if (this.overlay) {
      this.overlay.classList.add("nt-leftnav__overlay--visible");
    }
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute("aria-expanded", "true");
    }

    // Lock body scroll
    document.body.style.overflow = "hidden";
  }

  private closeMobileDrawer(): void {
    this.isMobileOpen = false;

    if (this.nav) {
      this.nav.classList.remove("nt-leftnav--open");
    }
    if (this.overlay) {
      this.overlay.classList.remove("nt-leftnav__overlay--visible");
    }
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute("aria-expanded", "false");
    }

    // Unlock body scroll
    document.body.style.overflow = "";
  }

  public updateConfig(config: Partial<LeftNavConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.defaultExpanded) {
      this.expandedSections = new Set(config.defaultExpanded);
      this.updateSubmenuStates();
    }
  }

  public destroy(): void {
    // Remove event listeners
    const toggleButtons = this.container.querySelectorAll(
      ".nt-leftnav__toggle",
    );
    toggleButtons.forEach((button) => {
      button.removeEventListener("click", this.handleToggleClick.bind(this));
      button.removeEventListener(
        "keydown",
        this.handleToggleKeyDown.bind(this),
      );
    });

    if (this.mobileToggle) {
      this.mobileToggle.removeEventListener(
        "click",
        this.openMobileDrawer.bind(this),
      );
    }
    if (this.closeButton) {
      this.closeButton.removeEventListener(
        "click",
        this.closeMobileDrawer.bind(this),
      );
    }
    if (this.overlay) {
      this.overlay.removeEventListener(
        "click",
        this.closeMobileDrawer.bind(this),
      );
    }

    document.removeEventListener("keydown", this.handleEscapeKey.bind(this));

    // Restore body scroll
    document.body.style.overflow = "";

    // Clear container
    this.container.innerHTML = "";
  }
}

// Auto-mount functionality for standalone use
if (typeof document !== "undefined") {
  const initLeftNav = () => {
    const container = document.getElementById("nt-leftnav-root");

    if (container) {
      // Read configuration from data attributes
      const defaultExpandedAttr = container.getAttribute(
        "data-default-expanded",
      );
      const config: LeftNavConfig = {
        defaultExpanded: defaultExpandedAttr
          ? defaultExpandedAttr.split(",")
          : [],
        mobileBreakpoint: parseInt(
          container.getAttribute("data-mobile-breakpoint") || "768",
          10,
        ),
      };

      new LeftNavComponent(container, config);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLeftNav);
  } else {
    initLeftNav();
  }
}

// Expose LeftNavComponent globally to prevent variable name conflicts with minification
declare global {
  interface Window {
    NTGLeftNav: typeof LeftNavComponent;
  }
}

if (typeof window !== "undefined") {
  window.NTGLeftNav = LeftNavComponent;
}
