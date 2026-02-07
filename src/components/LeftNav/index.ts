/**
 * Left Navigation Component
 * Exports both React and Vanilla JS implementations
 */

// React component exports
export { LeftNav, default } from "./LeftNav";
export type { LeftNavProps, NavItem } from "./LeftNav";

// Vanilla JS exports
export { LeftNavComponent } from "./LeftNav.vanilla";
export type { LeftNavConfig } from "./LeftNav.vanilla";

// CSS import for bundling
import "./LeftNav.css";
