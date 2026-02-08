/**
 * TwoColumn DXP Component Service - Server-Side Renderer
 *
 * Renders a responsive two-column layout with WYSIWYG content areas.
 * Desktop: Columns displayed side-by-side with configurable widths
 * Mobile (≤768px): Columns stack vertically
 *
 * CSS is loaded globally via ntg-design-system.css
 * No client-side JavaScript required (static layout component)
 */

/**
 * Helper function to escape HTML attributes
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML attributes
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate unique instance ID
 * @returns {string} Unique identifier for this component instance
 */
function generateInstanceId() {
  return `tc-${Math.random().toString(36).substring(2, 11)}`;
}

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
  styles.push(`grid-template-columns: ${leftWidth} ${rightWidth}`);
  styles.push(`gap: ${gap}`);

  return styles.join("; ");
}

/**
 * Build inline styles for a column
 * @param {string} background - Background color (optional)
 * @returns {string} CSS style attribute value
 */
function buildColumnStyles(background) {
  if (!background) return "";
  return `background: ${escapeHtml(background)};`;
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
    const instanceId = generateInstanceId();

    // Build class list
    const classList = ["nt-two-column"];
    if (cssClass) {
      classList.push(cssClass);
    }
    const className = classList.join(" ");

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
  <div class="nt-two-column__left"${leftStyles ? ` style="${leftStyles}"` : ""}>${leftContent}</div>
  <div class="nt-two-column__right"${rightStyles ? ` style="${rightStyles}"` : ""}>${rightContent}</div>
</div>`;
  },
};
