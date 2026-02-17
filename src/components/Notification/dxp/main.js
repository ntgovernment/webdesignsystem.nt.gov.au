/**
 * Notification DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript handles full rendering and interactivity.
 */

import { escapeHtml } from "../../../utils/sanitize.js";

const render = async (input) => {
  const {
    title = "",
    message = "",
    variant = "info",
    cssClass = "",
  } = input || {};

  const hydrationProps = JSON.stringify({
    title,
    message,
    variant,
    className: cssClass,
  });

  return `<div class="notification" data-hydration-component="notification" data-hydration-props="${escapeHtml(hydrationProps)}"></div>`;
};

export default {
  render,
  main: render,
};
