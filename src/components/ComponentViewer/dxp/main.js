/**
 * ComponentViewer DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (component-viewer-client.js) handles full rendering and interactivity.
 */
import { escapeHtml } from "../../../utils/sanitize.js";
import { generateInstanceId } from "../../../utils/instance-id.js";
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
    const instanceId = generateInstanceId("cv");

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

    // Return minimal hydration container
    return `<div class="nt-component-viewer ${cssClass}" data-hydration-component="component-viewer" data-hydration-props="${escapeHtml(hydrationProps)}" data-instance-id="${instanceId}"></div>`;
  },
};
