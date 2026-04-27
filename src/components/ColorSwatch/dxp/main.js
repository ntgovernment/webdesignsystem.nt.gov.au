/**
 * ColorSwatch DXP Component Service - Server-Side Renderer
 *
 * Renders a grid of color swatch cards with an optional introduction.
 * Each swatch displays a color sample, label, and hex code.
 * Supports multiple color values in an array format.
 */

import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";

/**
 * Render a single color swatch card
 */
const renderSwatch = (colorValue, index) => {
  const { Value = "" } = colorValue;

  let Label = "";
  let Color = "";
  let HexCode = "";

  // Parse the Value string to extract Label and HexCode
  if (Value.includes("#")) {
    const parts = Value.split("#");
    Label = parts[0].trim();
    HexCode = "#" + parts[1].trim();
    Color = HexCode;
  } else {
    // Fallback if no # found
    Label = Value;
    Color = "#cccccc";
    HexCode = "#cccccc";
  }

  return `<div data-swatch-index="${index}">
    <div class="nt-color-swatch">
      <div 
        class="nt-color-swatch__sample" 
        style="background-color: ${escapeAttr(Color)}"
        aria-hidden="true"
      ></div>
      <div class="nt-color-swatch__content">
        <div class="nt-color-swatch__label">${escapeHtml(Label)}</div>
        <div class="nt-color-swatch__hex">${escapeHtml(HexCode)}</div>
      </div>
    </div>
  </div>`;
};

/**
 * Main server-side render function
 */
const main = async (input) => {
  const { Introduction = "", ColorValues = [], cssClass = "" } = input || {};

  // Validate required props
  if (!ColorValues || ColorValues.length === 0) {
    return `<div class="nt-color-swatch-grid">
      <div class="color-swatch-error" role="alert" aria-live="polite">
        <h3><strong>ColorSwatch Component Error</strong></h3>
        <p>No color values provided in configuration</p>
      </div>
    </div>`;
  }

  // Generate individual swatch HTML
  const swatchesHtml = ColorValues.map((colorValue, index) =>
    renderSwatch(colorValue, index),
  ).join("");

  // Build container classes
  const introductionHtml = typeof Introduction === "string" ? Introduction : "";
  const hasIntroduction = introductionHtml.trim().length > 0;
  const containerClasses = [
    "nt-color-swatch-grid",
    hasIntroduction ? "" : "nt-color-swatch-grid--no-intro",
    cssClass,
  ]
    .filter(Boolean)
    .join(" ");

  // Assemble complete component HTML
  let html = `<div class="${containerClasses}">`;

  if (hasIntroduction) {
    html += `<div class="nt-color-swatch-grid__description">${introductionHtml}</div>`;
  }

  html += `<div class="nt-color-swatch-grid__container" role="list" data-component-type="color-swatch-grid" data-swatch-count="${ColorValues.length}">
    ${swatchesHtml}
  </div>
</div>`;

  return html;
};

export default {
  main,
};
