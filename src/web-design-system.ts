/**
 * NT Design System - Unified Bundle
 *
 * Consolidates all vanilla JavaScript components and global styles
 * for deployment to Squiz Matrix as a single minified package.
 */

// Import all components - these register auto-initialization on DOMContentLoaded
import "./components/Header/Header.vanilla";
import "./components/LeftNav/LeftNav.vanilla";
import "./components/Tab/Tab.vanilla";
import "./components/ThemeSwitcher/ThemeSwitcher.vanilla";
import "./components/ComponentViewer/ComponentViewer.vanilla";
import "./components/PageBanner/PageBanner.vanilla";
import "./components/Notification/Notification.vanilla";
import "./components/PageCard/PageCard.vanilla";
import "./components/MiniPageCard/MiniPageCard.vanilla";
import "./components/PageTile/PageTile.vanilla";
import "./components/ColorSwatch/ColorSwatch.vanilla";

/**
 * Tab Marker Transformer
 * Converts <hr><p>Title</p><hr> patterns into DXP-formatted tab navigation
 */
function transformTabMarkers(containerSelector = "#colour-content") {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(
      `[TabMarkerTransformer] Container not found: ${containerSelector}`,
    );
    return 0;
  }

  const children = Array.from(container.children);
  const tabs: Array<{
    title: string;
    markerIndex: number;
    titleIndex: number;
    closingHrIndex: number;
  }> = [];
  let i = 0;

  // Step 1: Extract tab information from HR/P/HR patterns
  while (i < children.length) {
    const child = children[i];

    if (child.tagName === "HR") {
      const nextSibling = children[i + 1];
      if (nextSibling && nextSibling.tagName === "P") {
        const titleText = nextSibling.textContent?.trim();

        if (titleText) {
          tabs.push({
            title: titleText,
            markerIndex: i,
            titleIndex: i + 1,
            closingHrIndex: i + 2,
          });

          // Hide markers immediately
          (child as HTMLElement).style.display = "none";
          (nextSibling as HTMLElement).style.display = "none";
          if (children[i + 2]?.tagName === "HR") {
            (children[i + 2] as HTMLElement).style.display = "none";
          }

          i += 3;
          continue;
        }
      }
    }

    i++;
  }

  if (tabs.length < 2) {
    console.log(
      `[TabMarkerTransformer] Found ${tabs.length} tab(s). Skipping navigation render.`,
    );
    return tabs.length;
  }

  // Step 2: Create DXP-formatted tab navigation
  const tabNav = createDxpTabNavigation(tabs);

  // Step 3: Insert navigation BEFORE the content container (not inside it) to avoid padding gaps
  if (tabs.length > 0) {
    const contentContainer = document.querySelector(containerSelector);
    contentContainer?.parentNode?.insertBefore(tabNav, contentContainer);
  }

  // Step 4: Wire tab click handlers
  attachTabHandlers(tabNav, tabs, children);

  console.log(
    `[TabMarkerTransformer] Created DXP tab navigation with ${tabs.length} tabs.`,
  );
  return tabs.length;
}

/**
 * Create DXP-formatted tab navigation structure
 */
function createDxpTabNavigation(
  tabs: Array<{ title: string; markerIndex: number; titleIndex: number }>,
) {
  const navContainer = document.createElement("div");
  navContainer.setAttribute("data-breakpoint", "xl +lg + md");
  navContainer.setAttribute("data-scroll-left", "false");
  navContainer.setAttribute("data-scroll-right", "false");
  navContainer.style.cssText = `
    width: 100vw;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    margin: 0;
    margin-left: calc(-50vw + 50%);
    padding-left: 16px;
    padding-right: 16px;
    background: var(--clr-bg-default, white);
    border-top: 1px var(--clr-border-subtle, #D3D3D7) solid;
    border-bottom: 1px var(--clr-border-subtle, #D3D3D7) solid;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  `;

  const innerContainer = document.createElement("div");
  innerContainer.style.cssText = `
    flex: 1 1 0;
    max-width: 1168px;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    display: flex;
  `;

  // Create tab button for each tab
  tabs.forEach((tab, index) => {
    const tabButton = createTabButton(tab.title, index === 0);
    (tabButton as any).dataset.tabIndex = index;
    innerContainer.appendChild(tabButton);
  });

  navContainer.appendChild(innerContainer);
  return navContainer;
}

/**
 * Create individual DXP-formatted tab button
 */
function createTabButton(title: string, isActive: boolean) {
  const button = document.createElement("div");
  button.setAttribute("data-active", isActive ? "True" : "False");
  button.setAttribute("data-horizontal", "True");
  button.setAttribute("data-left-icon", "false");
  button.setAttribute("data-show-badge", "false");
  button.setAttribute("data-state", "Default");
  button.style.cssText = `
    min-width: 64px;
    padding: 16px;
    ${isActive ? "border-bottom: 4px var(--clr-border-accent, #C33826) solid;" : ""}
    justify-content: center;
    align-items: center;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "justify-content: flex-start; align-items: center; gap: 8px; display: flex;";

  const innerWrapper = document.createElement("div");
  innerWrapper.style.cssText =
    "justify-content: center; align-items: center; gap: 8px; display: flex;";

  const titleDiv = document.createElement("div");
  titleDiv.style.cssText = `
    color: var(--clr-link-default, #1F1F5F);
    font-size: 16px;
    font-family: Lato;
    font-weight: ${isActive ? "700" : "400"};
    line-height: 24px;
    word-wrap: break-word;
  `;
  titleDiv.textContent = title;

  innerWrapper.appendChild(titleDiv);
  wrapper.appendChild(innerWrapper);
  button.appendChild(wrapper);

  // Add hover/click styling
  button.addEventListener("mouseenter", () => {
    if (!isActive) {
      button.style.backgroundColor = "var(--clr-bg-shade, #f5f5f7)";
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!isActive) {
      button.style.backgroundColor = "transparent";
    }
  });

  return button;
}

/**
 * Attach click handlers to tab buttons to show/hide content
 */
function attachTabHandlers(
  navElement: HTMLElement,
  tabs: Array<{ markerIndex: number }>,
  allChildren: ArrayLike<Element>,
) {
  const buttons = navElement.querySelectorAll("[data-tab-index]");

  buttons.forEach((button, activeIndex) => {
    button.addEventListener("click", () => {
      // Update active states
      buttons.forEach((btn, idx) => {
        const isActive = idx === activeIndex;
        btn.setAttribute("data-active", isActive ? "True" : "False");
        const titleDiv = btn.querySelector("div:last-child div:last-child div");
        if (titleDiv) {
          (titleDiv as HTMLElement).style.fontWeight = isActive ? "700" : "400";
        }
        if (isActive) {
          (btn as HTMLElement).style.borderBottom =
            "4px var(--clr-border-accent, #C33826) solid";
        } else {
          (btn as HTMLElement).style.borderBottom = "none";
        }
      });

      // Show/hide content panels
      tabs.forEach((tab, idx) => {
        const isTabActive = idx === activeIndex;
        const startIdx = tab.markerIndex + 3; // Skip markers
        const endIdx =
          idx < tabs.length - 1
            ? tabs[idx + 1].markerIndex
            : allChildren.length;

        for (let i = startIdx; i < endIdx; i++) {
          if (allChildren[i]) {
            (allChildren[i] as HTMLElement).style.display = isTabActive
              ? ""
              : "none";
          }
        }
      });
    });
  });

  // Initialize: hide all content except first tab
  tabs.forEach((tab, idx) => {
    if (idx !== 0) {
      const startIdx = tab.markerIndex + 3;
      const endIdx =
        idx < tabs.length - 1 ? tabs[idx + 1].markerIndex : allChildren.length;

      for (let i = startIdx; i < endIdx; i++) {
        if (allChildren[i]) {
          (allChildren[i] as HTMLElement).style.display = "none";
        }
      }
    }
  });
}

// Export transformer to global scope for use in HTML pages
(window as any).transformTabMarkers = transformTabMarkers;

// Import global stylesheet (consolidated with all component styles via @import)
import "./global-styles";
