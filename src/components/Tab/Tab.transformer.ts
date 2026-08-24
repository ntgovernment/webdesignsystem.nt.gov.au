import "./Tab.css";

interface TabMarker {
  title: string;
  anchor: string;
  firstElement: HTMLElement;
  lastElement: HTMLElement;
  firstIndex: number;
  lastIndex: number;
  contentElements: HTMLElement[];
  panelElement: HTMLElement | null;
}

let tabGroupCount = 0;
const transformedContainers = new WeakMap<HTMLElement, number>();

function normalizeId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function isEmptyParagraph(element: Element | undefined): boolean {
  return element?.tagName === "P" && !element.textContent?.trim();
}

function getWrapperTitle(element: HTMLElement): string {
  const configuredTitle = element.dataset.tabTitle?.trim();
  if (configuredTitle) return configuredTitle;

  const paragraphs = Array.from(element.children);
  const titleElement = paragraphs.find(
    (child, index) =>
      child.tagName === "P" &&
      child.textContent?.trim() &&
      paragraphs[index - 1]?.tagName === "HR",
  );
  return titleElement?.textContent?.trim() || "";
}

function scanMarkers(container: HTMLElement): TabMarker[] {
  const children = Array.from(container.children) as HTMLElement[];
  const markers: TabMarker[] = [];

  for (let index = 0; index < children.length; index += 1) {
    const element = children[index];
    let title = "";
    let lastIndex = index;

    if (
      element.classList.contains("sq-inline-viper-content") &&
      element.classList.contains("nt-tab-marker")
    ) {
      title = getWrapperTitle(element);
    } else if (element.classList.contains("nt-tab-marker")) {
      title = element.dataset.tabTitle?.trim() || "";
    } else if (
      element.tagName === "HR" &&
      children[index + 1]?.tagName === "P" &&
      children[index + 1]?.textContent?.trim() &&
      children[index + 2]?.tagName === "HR"
    ) {
      title = children[index + 1].textContent?.trim() || "";
      lastIndex = index + 2;
      while (
        lastIndex < index + 5 &&
        isEmptyParagraph(children[lastIndex + 1])
      ) {
        lastIndex += 1;
      }
    }

    if (!title) continue;

    const lastElement = children[lastIndex];
    markers.push({
      title,
      anchor: normalizeId(element.dataset.tabId || title),
      firstElement: element,
      lastElement,
      firstIndex: index,
      lastIndex,
      contentElements: [],
      panelElement: null,
    });
    index = lastIndex;
  }

  markers.forEach((marker, index) => {
    const nextMarkerIndex = markers[index + 1]?.firstIndex ?? children.length;
    marker.contentElements = children.slice(
      marker.lastIndex + 1,
      nextMarkerIndex,
    );
  });

  return markers;
}

function hideMarker(marker: TabMarker): void {
  let element: Element | null = marker.firstElement;
  while (element) {
    (element as HTMLElement).hidden = true;
    if (element === marker.lastElement) break;
    element = element.nextElementSibling;
  }
}

function createPanel(marker: TabMarker, groupId: string, index: number): void {
  const panel = document.createElement("div");
  panel.className = "nt-tab-transformer__panel";
  panel.id = `${groupId}-${index}-${marker.anchor || "section"}-panel`;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `${groupId}-${index}-tab`);
  panel.hidden = index !== 0;

  marker.lastElement.parentNode?.insertBefore(
    panel,
    marker.contentElements[0] || marker.lastElement.nextSibling,
  );
  marker.contentElements.forEach((element) => panel.appendChild(element));
  marker.panelElement = panel;
}

function createTabButton(
  marker: TabMarker,
  groupId: string,
  index: number,
): HTMLButtonElement {
  const isActive = index === 0;
  const button = document.createElement("button");
  button.className = "nt-tab-transformer__button";
  button.type = "button";
  button.id = `${groupId}-${index}-tab`;
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", String(isActive));
  button.setAttribute("aria-controls", marker.panelElement?.id || "");
  button.setAttribute("tabindex", isActive ? "0" : "-1");
  button.setAttribute("data-active", isActive ? "True" : "False");
  button.setAttribute("data-horizontal", "True");
  button.setAttribute("data-left-icon", "false");
  button.setAttribute("data-show-badge", "false");
  button.setAttribute("data-state", "Default");
  button.setAttribute("data-tab-index", String(index));

  const label = document.createElement("span");
  label.className = "nt-tab-transformer__label";
  label.textContent = marker.title;
  button.appendChild(label);
  return button;
}

function selectTab(
  buttons: HTMLButtonElement[],
  markers: TabMarker[],
  selectedIndex: number,
  moveFocus: boolean,
): void {
  buttons.forEach((button, index) => {
    const isActive = index === selectedIndex;
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
    button.setAttribute("data-active", isActive ? "True" : "False");
    markers[index].panelElement!.hidden = !isActive;
  });

  if (moveFocus) buttons[selectedIndex].focus();
}

function createNavigation(markers: TabMarker[], groupId: string): HTMLElement {
  const navigation = document.createElement("nav");
  navigation.className = "nt-tab-transformer__nav";
  navigation.setAttribute("role", "tablist");
  navigation.setAttribute("aria-label", "Page sections");
  navigation.setAttribute("data-breakpoint", "xl +lg + md");
  navigation.setAttribute("data-scroll-left", "false");
  navigation.setAttribute("data-scroll-right", "false");
  navigation.dataset.tabTransformerNavigation = groupId;

  const inner = document.createElement("div");
  inner.className = "nt-tab-transformer__inner";
  const buttons = markers.map((marker, index) => {
    const button = createTabButton(marker, groupId, index);
    button.addEventListener("click", () =>
      selectTab(buttons, markers, index, false),
    );
    button.addEventListener("keydown", (event) => {
      let nextIndex: number | null = null;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        selectTab(buttons, markers, nextIndex, true);
      }
    });
    inner.appendChild(button);
    return button;
  });

  navigation.appendChild(inner);
  return navigation;
}

export function transformTabMarkers(
  containerSelector = "#colour-content",
): number {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) {
    console.warn(
      `[TabMarkerTransformer] Container not found: ${containerSelector}`,
    );
    return 0;
  }

  const previousCount = transformedContainers.get(container);
  if (previousCount !== undefined) return previousCount;

  const markers = scanMarkers(container);
  markers.forEach(hideMarker);
  transformedContainers.set(container, markers.length);

  if (markers.length < 2) return markers.length;

  tabGroupCount += 1;
  const groupId = `nt-tab-group-${tabGroupCount}`;
  markers.forEach((marker, index) => createPanel(marker, groupId, index));
  const navigation = createNavigation(markers, groupId);
  container.parentNode?.insertBefore(navigation, container);
  return markers.length;
}

declare global {
  interface Window {
    transformTabMarkers: typeof transformTabMarkers;
  }
}

if (typeof window !== "undefined") {
  window.transformTabMarkers = transformTabMarkers;
}
