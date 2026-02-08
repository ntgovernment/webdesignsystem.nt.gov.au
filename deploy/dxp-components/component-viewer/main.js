/**
 * ComponentViewer DXP Component Service - Server-Side Renderer
 *
 * Renders the HTML structure on the edge. Client-side JavaScript
 * (component-viewer-client.js) handles interactivity.
 */

export function render(props) {
  const {
    storybookUrl = "https://ntgovernment.github.io/ntg-design-system/iframe.html?globals=&args=&id=components-button--primary&viewMode=story",
    codeExample = "",
    height = "200px",
    initialZoom = 1.0,
    showCodeByDefault = false,
    enableCopy = true,
    enableZoom = true,
    cssClass = "",
  } = props;

  // Generate unique ID for this instance
  const instanceId = `cv-${Math.random().toString(36).substr(2, 9)}`;
  const iframeSrc = storybookUrl;

  // Escape HTML for data attributes
  const escapeHtml = (str) =>
    (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return `
<div 
  class="nt-component-viewer ${cssClass}" 
  data-component-viewer
  data-instance-id="${instanceId}"
  data-storybook-url="${escapeHtml(storybookUrl)}"
  data-code-example="${escapeHtml(codeExample)}"
  data-initial-zoom="${initialZoom}"
  data-show-code="${showCodeByDefault}"
  data-enable-copy="${enableCopy}"
  data-enable-zoom="${enableZoom}"
>
  <!-- Preview Section -->
  <div class="component-viewer__preview" style="height: ${escapeHtml(height)}">
    <div class="component-viewer__iframe-wrapper">
      
      <!-- Toolbar -->
      <div class="component-viewer__toolbar">
        ${
          enableZoom
            ? `
        <div class="component-viewer__zoom-controls">
          <button 
            class="component-viewer__control-btn" 
            data-action="zoom-in"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3.5a.5.5 0 01.5.5v1.5H8a.5.5 0 010 1H6.5V8a.5.5 0 01-1 0V6.5H4a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M9.544 10.206a5.5 5.5 0 11.662-.662.5.5 0 01.148.102l3 3a.5.5 0 01-.708.708l-3-3a.5.5 0 01-.102-.148zM10.5 6a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" fill="currentColor"/>
            </svg>
            <span class="component-viewer__control-label">Zoom in</span>
          </button>
          <button 
            class="component-viewer__control-btn" 
            data-action="zoom-out"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5.5a.5.5 0 000 1h4a.5.5 0 000-1H4z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M6 11.5c1.35 0 2.587-.487 3.544-1.294a.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 106 11.5zm0-1a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" fill="currentColor"/>
            </svg>
            <span class="component-viewer__control-label">Zoom out</span>
          </button>
          <button 
            class="component-viewer__control-btn" 
            data-action="zoom-reset"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 2.837V1.5a.5.5 0 00-1 0V4a.5.5 0 00.5.5h2.5a.5.5 0 000-1H2.258a4.5 4.5 0 11-.496 4.016.5.5 0 10-.942.337 5.502 5.502 0 008.724 2.353.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 101.5 2.837z" fill="currentColor"/>
            </svg>
            <span class="component-viewer__control-label">Reset zoom</span>
          </button>
        </div>
        `
            : ""
        }
        <button 
          class="component-viewer__control-btn" 
          data-action="open-new-tab"
          aria-label="Open canvas in new tab"
          title="Open canvas in new tab"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 1.004a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4.5a.5.5 0 00-1 0v4.5H2v-10h4.5a.5.5 0 000-1H2z" fill="currentColor"/>
            <path d="M7.354 7.357L12 2.711v1.793a.5.5 0 001 0v-3a.5.5 0 00-.5-.5h-3a.5.5 0 100 1h1.793L6.646 6.65a.5.5 0 10.708.707z" fill="currentColor"/>
          </svg>
          <span class="component-viewer__control-label">Open canvas in new tab</span>
        </button>
      </div>

      <!-- Iframe Content -->
      <div class="component-viewer__iframe-content" data-zoom-container>
        <iframe
          src="${escapeHtml(iframeSrc)}"
          class="component-viewer__iframe"
          title="Component Preview"
          frameborder="0"
          sandbox="allow-scripts allow-same-origin"
          data-iframe
        ></iframe>
      </div>
    </div>
  </div>

  <!-- Code Display Section (initially hidden unless showCodeByDefault=true) -->
  <div class="component-viewer__code ${showCodeByDefault ? "component-viewer__code--visible" : ""}" data-code-panel>
    <pre class="component-viewer__code-content">
      <code class="language-html" data-code-display></code>
    </pre>
  </div>

  <!-- Action Buttons -->
  <div class="component-viewer__actions">
    ${
      enableCopy
        ? `
    <button 
      class="component-viewer__button" 
      data-action="copy"
      aria-label="Copy code to clipboard"
    >
      <i class="fa-light fa-copy" aria-hidden="true"></i>
      <span data-copy-text>Copy</span>
    </button>
    `
        : ""
    }
    <button 
      class="component-viewer__button" 
      data-action="toggle-code"
      aria-label="${showCodeByDefault ? "Hide code" : "See code"}"
    >
      <i class="fa-light fa-code" aria-hidden="true"></i>
      <span data-code-toggle-text>${showCodeByDefault ? "Hide code" : "See code"}</span>
    </button>
  </div>
</div>
  `.trim();
}

// Export as default for DXP edge runtime compatibility
export default render;
