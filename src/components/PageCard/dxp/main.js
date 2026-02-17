/**
 * PageCard DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (page-card-client.js) handles full rendering and interactivity.
 */

import { escapeHtml } from "../../../utils/sanitize.js";

const render = async (input) => {
  const hydrationProps = JSON.stringify(input || {});

  // Return minimal hydration container
  return `<div class="nt-page-card" data-hydration-component="page-card" data-hydration-props="${escapeHtml(hydrationProps)}"></div>`;
};

export default {
  render,
  main: render,
};
