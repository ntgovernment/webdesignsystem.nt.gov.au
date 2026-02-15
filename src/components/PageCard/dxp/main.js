/**
 * PageCard DXP Component Service - Server-Side Renderer
 *
 * Uses hydration pattern: server renders minimal container with data attributes,
 * client-side JavaScript (page-card-client.js) handles full rendering and interactivity.
 */

export default {
  async render(input) {
    const {
      pages = [],
      columns = 3,
      gap = "var(--sp-md, 16px)",
      cardVariant = "full",
      clickable = true,
      cssClass = "",
    } = input;

    // Validate required input
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return `<div style="padding: 24px; text-align: center; color: #d32f2f; background: #ffe8e8; border: 1px solid #ffbdbd; border-radius: 4px;">
        <p><strong>PageCard Component Error:</strong></p>
        <p>No content pages provided. Please provide at least one page with an id and title.</p>
      </div>`;
    }

    // Generate unique ID for this instance
    const instanceId = `pc-${Math.random().toString(36).substring(2, 11)}`;

    // Validate and sanitize pages. The component now accepts an array of asset references
    // selected from the Squiz Matrix asset picker. Each item may be either a string
    // (assetId) or an object with an `assetId` property. For preview/demo purposes
    // callers may include optional metadata (title/imageUrl) which will be passed
    // through to the client if present.
    const sanitizedPages = pages
      .map((page) => {
        let assetId;
        let title;
        let imageUrl;
        let description;
        let href;
        let ariaLabel;

        if (typeof page === "string") {
          assetId = page;
        } else if (page && typeof page === "object") {
          assetId = page.assetId || page.id || undefined;
          // Optional preview metadata allowed in dev-ui/preview only
          if (page.title) title = String(page.title);
          if (page.imageUrl) imageUrl = String(page.imageUrl);
          if (page.description) description = String(page.description);
          if (page.href) href = String(page.href);
          if (page.ariaLabel) ariaLabel = String(page.ariaLabel);
        }

        if (!assetId) {
          console.error("PageCard: Invalid page entry - missing assetId", page);
          return null;
        }

        return {
          assetId: String(assetId),
          title: title,
          imageUrl: imageUrl,
          description: description,
          href: href,
          ariaLabel: ariaLabel,
        };
      })
      .filter((p) => p !== null);

    if (sanitizedPages.length === 0) {
      return `<div style="padding: 24px; text-align: center; color: #d32f2f; background: #ffe8e8; border: 1px solid #ffbdbd; border-radius: 4px;">
        <p><strong>PageCard Component Error:</strong></p>
        <p>All provided pages were invalid. Each item must include an assetId (selected with the asset picker).</p>
      </div>`;
    }

    // Encode props as JSON for hydration
    const hydrationProps = JSON.stringify({
      pages: sanitizedPages,
      columns: Math.max(1, Math.min(6, columns || 3)),
      gap: gap || "var(--sp-md, 16px)",
      cardVariant: cardVariant || "full",
      clickable: clickable !== false,
      cssClass: cssClass || "",
    });

    // Escape for HTML attribute
    const escapeHtml = (str) =>
      (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Return minimal hydration container
    return `<div class="nt-page-card ${escapeHtml(cssClass)}" data-hydration-component="page-card" data-hydration-props="${escapeHtml(hydrationProps)}" data-instance-id="${instanceId}"></div>`;
  },
};
