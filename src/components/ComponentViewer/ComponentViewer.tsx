import React, { useState } from "react";
import TwoColumn from "../TwoColumn";
import ThemeSwitcher from "../ThemeSwitcher";
import Header from "../Header";
import LeftNav, { type NavItem } from "../LeftNav";
import "./ComponentViewer.css";

export const ComponentViewer: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>("two-column");

  const renderComponentDemo = () => {
    switch (activeComponent) {
      case "two-column":
        return (
          <div className="demo-container">
            <h2>Two Column Component</h2>
            <p>
              A responsive two-column layout component that automatically stacks
              on mobile.
            </p>
            <TwoColumn
              leftContent={
                <div className="demo-content">
                  <h3>Left Column</h3>
                  <p>
                    This is the left column content. It can contain any React
                    components or HTML.
                  </p>
                </div>
              }
              rightContent={
                <div className="demo-content">
                  <h3>Right Column</h3>
                  <p>
                    This is the right column content. The columns will stack on
                    mobile devices.
                  </p>
                </div>
              }
            />

            <h3 className="demo-section-title">Custom Width Example</h3>
            <TwoColumn
              leftWidth="2fr"
              rightWidth="1fr"
              leftContent={
                <div className="demo-content">
                  <h4>Wider Left (2fr)</h4>
                  <p>This column takes up 2/3 of the space.</p>
                </div>
              }
              rightContent={
                <div className="demo-content">
                  <h4>Narrow Right (1fr)</h4>
                  <p>This column takes up 1/3 of the space.</p>
                </div>
              }
            />
          </div>
        );

      case "theme-switcher":
        return (
          <div className="demo-container">
            <h2>Theme Switcher Component</h2>
            <p>
              A component that allows users to switch between light and dark
              themes.
            </p>
            <div className="demo-content">
              <ThemeSwitcher />
            </div>
            <div className="theme-demo">
              <h3>Theme Variables Demo</h3>
              <div
                className="theme-card"
                style={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                <p>
                  This card uses theme variables and will change with the
                  selected theme.
                </p>
                <ul>
                  <li>Background: var(--bg-color)</li>
                  <li>Text: var(--text-color)</li>
                  <li>Border: var(--border-color)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "left-nav":
        const navItems: NavItem[] = [
          {
            id: "home",
            label: "Home",
            href: "#home",
            icon: "fa-light fa-home",
            isActive: true,
          },
          {
            id: "about",
            label: "About",
            href: "#about",
          },
          {
            id: "design",
            label: "Design",
            href: "#design",
          },
          {
            id: "develop",
            label: "Develop",
            href: "#develop",
          },
          {
            id: "foundations",
            label: "Foundations",
            children: [
              { id: "colour", label: "Colour", href: "#colour" },
              { id: "typography", label: "Typography", href: "#typography" },
              { id: "iconography", label: "Iconography", href: "#iconography" },
              { id: "grids", label: "Grids", href: "#grids" },
              { id: "spacing", label: "Spacing", href: "#spacing" },
              {
                id: "border-width",
                label: "Border width",
                href: "#border-width",
              },
              { id: "radius", label: "Radius", href: "#radius" },
              { id: "elevation", label: "Elevation", href: "#elevation" },
              { id: "logo", label: "Logo", href: "#logo" },
              { id: "focus-state", label: "Focus state", href: "#focus-state" },
            ],
          },
          {
            id: "components",
            label: "Components",
            href: "#components",
          },
          {
            id: "help-support",
            label: "Help and Support",
            href: "#help-support",
          },
        ];

        return (
          <div className="demo-container">
            <h2>Left Navigation Component</h2>
            <p>
              A responsive left navigation sidebar with 2-level collapsible
              menu. Features auto-expansion of sections containing the active
              page and mobile drawer functionality.
            </p>
            <div
              className="demo-content"
              style={{
                height: "600px",
                border: "1px solid var(--clr-border-subtle)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ height: "100%", overflow: "auto" }}>
                <LeftNav items={navItems} />
              </div>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <h3>Features</h3>
              <ul>
                <li>2-level collapsible menu structure</li>
                <li>Auto-expands sections with active items</li>
                <li>Mobile-responsive drawer with overlay</li>
                <li>Keyboard navigation support (Enter, Space, Escape)</li>
                <li>ARIA attributes for accessibility</li>
                <li>Smooth transitions and animations</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="nt-component-viewer">
      <Header />

      <div className="viewer-layout">
        <nav className="viewer-sidebar">
          <h2>Components</h2>
          <div style={{ marginBottom: "1rem" }}>
            <ThemeSwitcher />
          </div>
          <ul className="component-list">
            <li>
              <button
                className={activeComponent === "two-column" ? "active" : ""}
                onClick={() => setActiveComponent("two-column")}
              >
                Two Column
              </button>
            </li>
            <li>
              <button
                className={activeComponent === "theme-switcher" ? "active" : ""}
                onClick={() => setActiveComponent("theme-switcher")}
              >
                Theme Switcher
              </button>
            </li>
            <li>
              <button
                className={activeComponent === "left-nav" ? "active" : ""}
                onClick={() => setActiveComponent("left-nav")}
              >
                Left Navigation
              </button>
            </li>
          </ul>
        </nav>

        <main className="viewer-content">{renderComponentDemo()}</main>
      </div>
    </div>
  );
};

export default ComponentViewer;
