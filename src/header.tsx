/**
 * Standalone Header Entry Point
 * This file is used to create a standalone embeddable header component
 * for use in Squiz Matrix and other platforms
 */

import React from "react";
import { createRoot } from "react-dom/client";
import Header from "./components/Header";
import "./tokens.css";
import "./index.css";

// Find the container element
const container = document.getElementById("nt-header-root");

if (container) {
  // Read configuration from data attributes
  const title = container.getAttribute("data-title") || "Web Design System";
  const logoSrc =
    container.getAttribute("data-logo-src") ||
    "https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg";
  const logoAlt =
    container.getAttribute("data-logo-alt") || "NT Government Logo";
  const icon = container.getAttribute("data-icon") || "fa-magnifying-glass";

  // Create root and render
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Header title={title} logoSrc={logoSrc} logoAlt={logoAlt} icon={icon} />
    </React.StrictMode>,
  );
} else {
  console.error(
    "NT Design System Header: Container element #nt-header-root not found",
  );
}
