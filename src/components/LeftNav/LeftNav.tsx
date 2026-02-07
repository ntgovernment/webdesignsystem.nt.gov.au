import { useState, useEffect, useRef } from "react";
import "./LeftNav.css";

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string; // Font Awesome class name
  isActive?: boolean;
  children?: NavItem[];
}

export interface LeftNavProps {
  items: NavItem[];
  className?: string;
  defaultExpanded?: string[]; // Array of section IDs to expand by default
}

export const LeftNav = ({
  items,
  className = "",
  defaultExpanded = [],
}: LeftNavProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(defaultExpanded),
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Auto-expand sections containing active items
  useEffect(() => {
    const findActiveParents = (
      items: NavItem[],
      parents: string[] = [],
    ): string[] => {
      const activeParents: string[] = [];

      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const hasActiveChild = item.children.some((child) => child.isActive);
          if (hasActiveChild) {
            activeParents.push(item.id, ...parents);
          }
          activeParents.push(
            ...findActiveParents(item.children, [...parents, item.id]),
          );
        }
      });

      return activeParents;
    };

    const activeParents = findActiveParents(items);
    if (activeParents.length > 0) {
      setExpandedSections(new Set([...expandedSections, ...activeParents]));
    }
  }, [items]);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleToggleKeyDown = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSection(sectionId);
    }
  };

  const closeMobileDrawer = () => {
    setIsMobileOpen(false);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const submenuId = `submenu-${item.id}`;

    if (hasChildren) {
      return (
        <li key={item.id} className="nt-leftnav__item">
          <button
            className="nt-leftnav__toggle"
            aria-expanded={isExpanded}
            aria-controls={submenuId}
            onClick={() => toggleSection(item.id)}
            onKeyDown={(e) => handleToggleKeyDown(e, item.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {item.icon && (
                <div className="nt-leftnav__icon" data-colour="Black">
                  <i className={item.icon} aria-hidden="true"></i>
                </div>
              )}
              <span>{item.label}</span>
            </div>
            <div className="nt-leftnav__chevron">
              <i className="fa-light fa-chevron-right" aria-hidden="true"></i>
            </div>
          </button>
          <ul
            id={submenuId}
            className={`nt-leftnav__submenu ${isExpanded ? "nt-leftnav__submenu--expanded" : ""}`}
            aria-hidden={!isExpanded}
          >
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </ul>
        </li>
      );
    }

    return (
      <li
        key={item.id}
        className={`nt-leftnav__item ${item.isActive ? "nt-leftnav__item--active" : ""}`}
      >
        <a
          href={item.href || "#"}
          className="nt-leftnav__link"
          aria-current={item.isActive ? "page" : undefined}
        >
          {item.icon && (
            <div className="nt-leftnav__icon" data-colour="Black">
              <i className={item.icon} aria-hidden="true"></i>
            </div>
          )}
          <span>{item.label}</span>
        </a>
      </li>
    );
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="nt-leftnav__mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isMobileOpen}
      >
        <i className="fa-light fa-bars" aria-hidden="true"></i>
      </button>

      {/* Overlay backdrop */}
      <div
        className={`nt-leftnav__overlay ${isMobileOpen ? "nt-leftnav__overlay--visible" : ""}`}
        onClick={closeMobileDrawer}
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav
        ref={navRef}
        className={`nt-leftnav ${isMobileOpen ? "nt-leftnav--open" : ""} ${className}`}
        aria-label="Main navigation"
      >
        {/* Close button (mobile only) */}
        <button
          className="nt-leftnav__close"
          onClick={closeMobileDrawer}
          aria-label="Close navigation menu"
        >
          <i className="fa-light fa-times" aria-hidden="true"></i>
        </button>

        <ul className="nt-leftnav__list">
          {items.map((item) => renderNavItem(item))}
        </ul>
      </nav>
    </>
  );
};

export default LeftNav;
