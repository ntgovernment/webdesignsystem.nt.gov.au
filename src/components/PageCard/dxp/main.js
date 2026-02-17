/**
 * PageCard DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (page-card-client.js) handles full rendering and interactivity.
 */

const render = async (input) => {
  const hydrationProps = JSON.stringify(input || {});

  // Escape for HTML attribute
  const escapeHtml = (str) =>
    (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Return minimal hydration container
  return `<div class="nt-page-card" data-hydration-component="page-card" data-hydration-props="${escapeHtml(hydrationProps)}"></div>`;
};

export default {
  render,
  main: render,
};
