/**
 * MiniPageCard DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (mini-page-card-client.js) handles full rendering and interactivity.
 */

import { escapeHtml } from "../../../utils/sanitize.js";

const render = async (input) => {
  const hydrationProps = JSON.stringify(input || {});

  // Return minimal hydration container
  return `<div class="nt-mini-page-card" data-hydration-component="mini-page-card" data-hydration-props="${escapeHtml(hydrationProps)}"></div>`;
};

export default {
  render,
  main: render,
};
