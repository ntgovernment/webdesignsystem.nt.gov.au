/**
 * TwoColumn DXP Component Service - Server-Side Renderer
 *
 * Renders a responsive two-column layout with WYSIWYG content areas.
 * Desktop: Columns displayed side-by-side with configurable widths
 * Mobile (â‰¤768px): Columns stack vertically
 *
 * CSS is loaded globally via web-design-system.css
 * No client-side JavaScript required (static layout component)
 */

import { escapeAttr } from "../../../utils/sanitize.js";
import { generateInstanceId } from "../../../utils/instance-id.js";

/**
 * Build inline styles for the container
 * @param {object} config - Configuration object
 * @returns {string} CSS style attribute value
 */
function buildContainerStyles(config) {
  const { leftWidth, rightWidth, gap } = config;
  const styles = [];

  // Grid layout with configurable column widths
  styles.push(`display: grid`);
  styles.push(
    `grid-template-columns: ${escapeAttr(leftWidth)} ${escapeAttr(rightWidth)}`,
  );
  styles.push(`gap: ${escapeAttr(gap)}`);

  return styles.join("; ");
}

/**
 * Build inline styles for a column
 * @param {string} background - Background color (optional)
 * @returns {string} CSS style attribute value
 */
function buildColumnStyles(background) {
  if (!background) return "";
  return `background: ${escapeAttr(background)};`;
}

/**
 * Main render function for DXP Component Service
 * @param {object} input - Component configuration from Squiz Matrix
 * @returns {Promise<string>} HTML string to be rendered
 */
export default {
  async render(input) {
    // Destructure input with defaults
    const {
      leftContent = "",
      rightContent = "",
      leftWidth = "1fr",
      rightWidth = "1fr",
      gap = "2rem",
      leftBackground = "",
      rightBackground = "",
      cssClass = "",
    } = input;

    // Generate unique ID for this instance
    const instanceId = generateInstanceId("tc");

    // Build class list
    const classList = ["nt-two-column"];
    if (cssClass) {
      classList.push(cssClass);
    }
    const className = escapeAttr(classList.join(" "));

    // Build inline styles
    const containerStyles = buildContainerStyles({
      leftWidth,
      rightWidth,
      gap,
    });
    const leftStyles = buildColumnStyles(leftBackground);
    const rightStyles = buildColumnStyles(rightBackground);

    // Return complete HTML structure
    return `<div class="${className}" style="${containerStyles}" data-instance-id="${instanceId}">
  <div class="nt-two-column__left" data-sq-field="leftContent"${leftStyles ? ` style="${leftStyles}"` : ""}>${leftContent}</div>
  <div class="nt-two-column__right" data-sq-field="rightContent"${rightStyles ? ` style="${rightStyles}"` : ""}>${rightContent}</div>
</div>`;
  },
};
