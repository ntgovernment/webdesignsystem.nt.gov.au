/**
 * ComponentViewer DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (component-viewer-client.js) handles full rendering and interactivity.
 */

export default {
  async render(input) {
    const {
      storybookUrl = "https://ntgovernment.github.io/ntg-design-system/iframe.html?globals=&args=&id=components-button--primary&viewMode=story",
      codeExample = "",
      height = "200px",
      initialZoom = 1.0,
      showCodeByDefault = false,
      enableCopy = true,
      enableZoom = true,
      cssClass = "",
    } = input;

    // Generate unique ID for this instance
    const instanceId = `cv-${Math.random().toString(36).substring(2, 11)}`;

    // Encode props as JSON for hydration
    const hydrationProps = JSON.stringify({
      storybookUrl,
      codeExample,
      height,
      initialZoom,
      showCodeByDefault,
      enableCopy,
      enableZoom,
    });

    // Escape for HTML attribute
    const escapeHtml = (str) =>
      (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Return minimal hydration container
    return `<div class="nt-component-viewer ${cssClass}" data-hydration-component="component-viewer" data-hydration-props="${escapeHtml(hydrationProps)}" data-instance-id="${instanceId}"></div>`;
  },
};
