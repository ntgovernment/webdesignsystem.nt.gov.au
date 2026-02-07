/**
 * Header Component - Dual Export Pattern
 *
 * This file exports the Header component for use as a React component,
 * and also provides standalone mounting functionality for embedding
 * in non-React environments (e.g., Squiz Matrix).
 */

import React from "react";
import { createRoot } from "react-dom/client";
import "../../tokens.css";
import "../../index.css";

// Export component and types
export { Header, default } from "./Header";
export type { HeaderProps } from "./Header";

// Standalone mounting logic - only executes when container exists
// This allows the same file to work as both a library export and standalone script
if (typeof document !== "undefined") {
  const container = document.getElementById("nt-header-root");

  if (container) {
    // Dynamically import to avoid bundling React in the component export
    import("./Header")
      .then(({ Header }) => {
        // Read configuration from data attributes
        const title =
          container.getAttribute("data-title") || "Web Design System";
        const logoSrc =
          container.getAttribute("data-logo-src") ||
          "https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg";
        const logoAlt =
          container.getAttribute("data-logo-alt") || "NT Government Logo";
        const icon =
          container.getAttribute("data-icon") || "fa-magnifying-glass";

        // Create root and render using createElement (no JSX in .ts files)
        const root = createRoot(container);
        root.render(
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(Header, { title, logoSrc, logoAlt, icon }),
          ),
        );
      })
      .catch((error) => {
        console.error("NT Design System Header: Failed to mount header", error);
      });
  }
}
