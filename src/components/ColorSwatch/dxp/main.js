/**
 * ColorSwatch DXP Component Service - Server-Side Renderer
 *
 * Renders a grid of color swatch cards with optional formatted content.
 * Each swatch displays a color sample, name, and hex code.
 * Supports multiple color values in an array format.
 */

import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";

/**
 * Render a single color swatch card
 */
const parseLegacyValue = (value) => {
  if (typeof value !== "string") return { name: "", hex: "" };

  const hashIndex = value.indexOf("#");
  if (hashIndex === -1) return { name: value.trim(), hex: "#cccccc" };

  return {
    name: value.slice(0, hashIndex).trim(),
    hex: value.slice(hashIndex).trim(),
  };
};

const renderSwatch = (colorValue, index) => {
  const { name: legacyName, hex: legacyHex } = parseLegacyValue(
    colorValue?.Value,
  );
  const name = colorValue?.Name ?? legacyName;
  const hex = colorValue?.Hex ?? legacyHex;
  const nameText = typeof name === "string" ? name : "";
  const hexText = typeof hex === "string" ? hex : "";
  const swatchColor = hexText || "#cccccc";
  const fieldPath = `ColorValues[${index}]`;

  return `<div data-swatch-index="${index}">
    <div class="nt-color-swatch">
      <div
        class="nt-color-swatch__sample"
        style="background-color: ${escapeAttr(swatchColor)}"
        aria-hidden="true"
      ></div>
      <div class="nt-color-swatch__content">
        <div class="nt-color-swatch__label" data-sq-field="${fieldPath}.Name">${escapeHtml(nameText)}</div>
        <div class="nt-color-swatch__hex" data-sq-field="${fieldPath}.Hex">${escapeHtml(hexText)}</div>
      </div>
    </div>
  </div>`;
};

/**
 * Main server-side render function
 */
const main = async (input, info) => {
  const {
    Introduction,
    Content = "",
    ColorValues = [],
    cssClass = "",
  } = input || {};
  const editor = Boolean(info?.ctx?.editor);

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
  const content = Introduction ?? Content;
  const contentHtml = typeof content === "string" ? content : "";
  const hasContent = contentHtml.trim().length > 0;
  const containerClasses = [
    "nt-color-swatch-grid",
    hasContent ? "" : "nt-color-swatch-grid--no-intro",
    cssClass,
  ]
    .filter(Boolean)
    .join(" ");

  // Assemble complete component HTML
  let html = `<div class="${containerClasses}">`;

  if (hasContent || editor) {
    html += `<div class="nt-color-swatch-grid__description" data-sq-field="Introduction">${contentHtml}</div>`;
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
