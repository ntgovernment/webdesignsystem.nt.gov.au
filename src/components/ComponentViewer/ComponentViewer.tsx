import React, { useState } from "react";
import TwoColumn from "../TwoColumn";
import ThemeSwitcher from "../ThemeSwitcher";
import Header from "../Header";
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
          </ul>
        </nav>

        <main className="viewer-content">{renderComponentDemo()}</main>
      </div>
    </div>
  );
};

export default ComponentViewer;
