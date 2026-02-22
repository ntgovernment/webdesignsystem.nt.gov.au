/**
 * Tab DXP Component Service - Server-Side Renderer
 *
 * Renders an invisible tab marker element.
 * Insert multiple Tab components in your content - JavaScript will scan all markers
 * and generate a sticky tab navigation. Content between markers becomes tab content.
 *
 * Usage in Squiz:
 * 1. Wrap your content in a container with class="content" and data-tab-container=".content"
 * 2. Insert Tab components where you want each tab to start
 * 3. Add content after each Tab component - it becomes that tab's content
 * 4. JavaScript automatically generates the tab navigation
 */

import { escapeAttr } from "../../../utils/sanitize.js";

/**
 * Generate anchor ID from title (lowercase with hyphens)
 */
const generateAnchorId = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

/**
 * Main rendering function - outputs a single tab marker
 */
const main = async (input) => {
  const { title = "Tab", anchor = "" } = input || {};

  // Use provided anchor or generate from title
  const tabId = anchor.trim() || generateAnchorId(title);

  // Render invisible tab marker
  // JavaScript will find these markers and generate the tab navigation
  return `<div class="nt-tab-marker" data-tab-title="${escapeAttr(title)}" data-tab-id="${escapeAttr(tabId)}"></div>`;
};

export default {
  main,
};
