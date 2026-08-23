/**
 * TwoColumn DXP Component Service - Server-Side Renderer
 *
 * Renders a responsive two-column layout with WYSIWYG content areas.
 * Desktop: Equal-width columns displayed side-by-side
 * Mobile (â‰¤768px): Columns stack vertically
 *
 * CSS is loaded globally via web-design-system.css
 * No client-side JavaScript required (static layout component)
 */

import { generateInstanceId } from "../../../utils/instance-id.js";

/**
 * Main render function for DXP Component Service
 * @param {object} input - Component configuration from Squiz Matrix
 * @returns {Promise<string>} HTML string to be rendered
 */
export default {
  async render(input = {}) {
    const { leftContent = "", rightContent = "" } = input;

    // Generate unique ID for this instance
    const instanceId = generateInstanceId("tc");

    // Return complete HTML structure
    return `<div class="nt-two-column" data-instance-id="${instanceId}">
  <div class="nt-two-column__left" data-sq-field="leftContent">${leftContent}</div>
  <div class="nt-two-column__right" data-sq-field="rightContent">${rightContent}</div>
</div>`;
  },
};
