import { useState } from "react";
import Header from "./components/Header";
import LeftNav, { type NavItem } from "./components/LeftNav";
import TwoColumn from "./components/TwoColumn";
import ThemeSwitcher from "./components/ThemeSwitcher";
import ComponentViewer from "./components/ComponentViewer";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("home");

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "#home",
      icon: "fa-light fa-home",
      isActive: activeSection === "home",
    },
    {
      id: "about",
      label: "About",
      href: "#about",
      isActive: activeSection === "about",
    },
    {
      id: "design",
      label: "Design",
      href: "#design",
      isActive: activeSection === "design",
    },
    {
      id: "develop",
      label: "Develop",
      href: "#develop",
      isActive: activeSection === "develop",
    },
    {
      id: "foundations",
      label: "Foundations",
      children: [
        {
          id: "colour",
          label: "Colour",
          href: "#colour",
          isActive: activeSection === "colour",
        },
        {
          id: "typography",
          label: "Typography",
          href: "#typography",
          isActive: activeSection === "typography",
        },
        {
          id: "iconography",
          label: "Iconography",
          href: "#iconography",
          isActive: activeSection === "iconography",
        },
        {
          id: "grids",
          label: "Grids",
          href: "#grids",
          isActive: activeSection === "grids",
        },
        {
          id: "spacing",
          label: "Spacing",
          href: "#spacing",
          isActive: activeSection === "spacing",
        },
        {
          id: "border-width",
          label: "Border width",
          href: "#border-width",
          isActive: activeSection === "border-width",
        },
        {
          id: "radius",
          label: "Radius",
          href: "#radius",
          isActive: activeSection === "radius",
        },
        {
          id: "elevation",
          label: "Elevation",
          href: "#elevation",
          isActive: activeSection === "elevation",
        },
        {
          id: "logo",
          label: "Logo",
          href: "#logo",
          isActive: activeSection === "logo",
        },
        {
          id: "focus-state",
          label: "Focus state",
          href: "#focus-state",
          isActive: activeSection === "focus-state",
        },
      ],
    },
    {
      id: "components",
      label: "Components",
      href: "#components",
      isActive: activeSection === "components",
    },
    {
      id: "help-support",
      label: "Help and Support",
      href: "#help-support",
      isActive: activeSection === "help-support",
    },
  ];

  // Handle navigation clicks via event delegation
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a.nt-leftnav__link");
    if (link instanceof HTMLAnchorElement) {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        const section = href.replace("#", "");
        setActiveSection(section);
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div>
            <h1>NT Design System</h1>
            <p>Welcome to the Northern Territory Government Design System.</p>
            <p>
              This design system provides a comprehensive set of components,
              foundations, and guidelines for building consistent and accessible
              web experiences.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <h2>Getting Started</h2>
              <p>Use the navigation on the left to explore:</p>
              <ul>
                <li>
                  <strong>Foundations</strong> - Core design elements like
                  colour, typography, and spacing
                </li>
                <li>
                  <strong>Components</strong> - Reusable UI components
                </li>
                <li>
                  <strong>Design & Develop</strong> - Resources for designers
                  and developers
                </li>
              </ul>
            </div>
            <div style={{ marginTop: "3rem" }}>
              <h2>Component Preview</h2>
              <ComponentViewer
                storybookUrl="/storybook/iframe.html"
                storyId="components-button--primary"
              />
            </div>
          </div>
        );

      case "about":
        return (
          <div>
            <h1>About</h1>
            <p>
              The NT Design System is a comprehensive resource for building
              consistent, accessible, and user-friendly digital services for the
              Northern Territory Government.
            </p>
            <p>
              It provides detailed guidance, reusable components, and design
              patterns to help teams create better digital experiences.
            </p>
          </div>
        );

      case "design":
        return (
          <div>
            <h1>Design</h1>
            <p>
              Design resources and guidelines for creating NT Government digital
              services.
            </p>
            <h2>Design Principles</h2>
            <ul>
              <li>User-centered design</li>
              <li>Accessibility first</li>
              <li>Consistency across services</li>
              <li>Clear and simple communication</li>
            </ul>
          </div>
        );

      case "develop":
        return (
          <div>
            <h1>Develop</h1>
            <p>Development resources and technical documentation.</p>
            <h2>For Developers</h2>
            <p>
              This design system provides both React and Vanilla JS components
              for easy integration.
            </p>
            <pre
              style={{
                background: "#f5f5f7",
                padding: "1rem",
                borderRadius: "4px",
              }}
            >
              {`npm install nt-design-system`}
            </pre>
          </div>
        );

      case "colour":
        return (
          <div>
            <h1>Colour</h1>
            <p>
              Colour palette and usage guidelines for NT Government digital
              services.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: "1 1 200px",
                  padding: "2rem",
                  background: "#1f1f5f",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                <strong>Primary</strong>
                <div>#1f1f5f</div>
              </div>
              <div
                style={{
                  flex: "1 1 200px",
                  padding: "2rem",
                  background: "#d3d3d7",
                  borderRadius: "4px",
                }}
              >
                <strong>Border</strong>
                <div>#d3d3d7</div>
              </div>
            </div>
          </div>
        );

      case "typography":
        return (
          <div>
            <h1>Typography</h1>
            <p>Typography guidelines and font usage.</p>
            <h2 style={{ fontFamily: "Lato", fontWeight: 700 }}>Lato Bold</h2>
            <p style={{ fontFamily: "Lato", fontWeight: 400 }}>
              Lato Regular - The primary font family for the NT Design System.
            </p>
          </div>
        );

      case "iconography":
        return (
          <div>
            <h1>Iconography</h1>
            <p>Icon usage guidelines using Font Awesome Light icons.</p>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "1rem",
                fontSize: "2rem",
              }}
            >
              <i className="fa-light fa-home"></i>
              <i className="fa-light fa-magnifying-glass"></i>
              <i className="fa-light fa-bars"></i>
              <i className="fa-light fa-chevron-right"></i>
            </div>
          </div>
        );

      case "components":
        return (
          <div>
            <h1>Components</h1>
            <p>Explore the available UI components.</p>
            <div style={{ marginTop: "2rem" }}>
              <h2>Available Components</h2>
              <ul>
                <li>Header</li>
                <li>Left Navigation</li>
                <li>Theme Switcher</li>
                <li>Two Column Layout</li>
              </ul>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <h3>Example: Two Column Component</h3>
              <TwoColumn
                leftContent={
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f5f5f7",
                      borderRadius: "4px",
                    }}
                  >
                    <h4>Left Column</h4>
                    <p>
                      This is an example of the two-column layout component.
                    </p>
                  </div>
                }
                rightContent={
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f5f5f7",
                      borderRadius: "4px",
                    }}
                  >
                    <h4>Right Column</h4>
                    <p>The columns stack on mobile devices.</p>
                  </div>
                }
              />
            </div>
            <div style={{ marginTop: "2rem" }}>
              <h3>Theme Switcher</h3>
              <ThemeSwitcher />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h1>
              {activeSection.charAt(0).toUpperCase() +
                activeSection.slice(1).replace("-", " ")}
            </h1>
            <p>Content for {activeSection} section.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-layout" onClick={handleClick}>
        <LeftNav items={navItems} />
        <main className="app-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
