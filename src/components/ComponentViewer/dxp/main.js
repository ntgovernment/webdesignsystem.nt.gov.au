/**
 * ComponentViewer DXP Component Service - Server-Side Renderer
 *
 * Renders complete HTML structure server-side with hydration attributes.
 * Client-side JavaScript detects and enhances with interactivity (zoom, code toggle, copy).
 */

import { escapeAttr } from "../../../utils/sanitize.js";
import { generateInstanceId } from "../../../utils/instance-id.js";

/**
 * Main server-side render function
 */
const main = async (input, info) => {
  const {
    storybookUrl = "https://ntgovernment.github.io/ntg-design-system/iframe.html?globals=&args=&id=components-button--primary&viewMode=story",
    Introduction = "",
    codeExample = "",
    height = "200px",
    initialZoom = 1.0,
    showCodeByDefault = false,
    enableCopy = true,
    enableZoom = true,
  } = input || {};
  const editor = Boolean(info?.ctx?.editor);

  /**
   * Convert Storybook documentation/story URL to iframe URL
   * Transforms:
   *   - ?path=/docs/components-accordion--docs
   *     → iframe.html?id=components-accordion--default&viewMode=story
   *   - ?path=/story/components-accordion--default
   *     → iframe.html?id=components-accordion--default&viewMode=story
   */
  const convertStorybookUrl = (url) => {
    try {
      // Check if URL contains the path parameter pattern
      if (url.includes("?path=/")) {
        const urlObj = new URL(url);
        const pathParam = urlObj.searchParams.get("path");

        if (pathParam) {
          let storyId = null;

          // Handle /docs/ pattern
          if (pathParam.startsWith("/docs/")) {
            storyId = pathParam.replace("/docs/", "");
            // Replace --docs with --default (common convention)
            if (storyId.endsWith("--docs")) {
              storyId = storyId.replace("--docs", "--default");
            }
          }
          // Handle /story/ pattern
          else if (pathParam.startsWith("/story/")) {
            storyId = pathParam.replace("/story/", "");
          }

          // Build the iframe URL if we extracted a story ID
          if (storyId) {
            const baseUrl = urlObj.origin + urlObj.pathname.replace(/\/$/, "");
            return `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`;
          }
        }
      }

      // Return original URL if no conversion needed
      return url;
    } catch {
      // If URL parsing fails, return original URL
      return url;
    }
  };

  // Convert the Storybook URL if needed
  const processedStorybookUrl = convertStorybookUrl(storybookUrl);

  // Generate unique ID for this instance
  const instanceId = generateInstanceId("cv");

  // Process introduction (FormattedText — rendered as HTML)
  const introductionHtml = typeof Introduction === "string" ? Introduction : "";
  const hasIntroduction = introductionHtml.trim().length > 0;

  // Encode props as JSON for hydration
  const hydrationProps = JSON.stringify({
    storybookUrl: processedStorybookUrl,
    codeExample,
    height,
    initialZoom,
    showCodeByDefault,
    enableCopy,
    enableZoom,
  });

  // Build zoom controls HTML
  const zoomControls = enableZoom
    ? `<div class="component-viewer__zoom-controls">
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

  // Build copy button HTML
  const copyButton = enableCopy
    ? `<button
      class="component-viewer__button"
        data-action="copy"
        aria-label="Copy code to clipboard"
      >
        <i class="fa-light fa-copy" aria-hidden="true"></i>
        <span data-copy-text>Copy</span>
      </button>`
    : "";

  // Build code panel visibility class
  const codeVisibleClass = showCodeByDefault
    ? " component-viewer__code--visible"
    : "";

  // Assemble complete component HTML
  let html = `<div
    class="nt-component-viewer"
    data-hydration-component="component-viewer"
    data-hydration-props="${escapeAttr(hydrationProps)}"
    data-instance-id="${instanceId}"
  >`;

  // Add introduction if provided
  if (hasIntroduction || editor) {
    html += `
    <!-- Introduction Section -->
    <div class="component-viewer__introduction" data-sq-field="Introduction">${introductionHtml}</div>`;
  }

  html += `
    <!-- Preview Section -->
    <div class="component-viewer__preview" style="height: ${escapeAttr(height)}">
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
            src="${escapeAttr(processedStorybookUrl)}"
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
    <div class="component-viewer__code${codeVisibleClass}" data-code-panel>
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
  </div>`;

  return html;
};

export default {
  main,
};
