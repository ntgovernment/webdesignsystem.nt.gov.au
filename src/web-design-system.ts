/**
 * NT Design System - Unified Bundle
 *
 * Consolidates all vanilla JavaScript components and global styles
 * for deployment to Squiz Matrix as a single minified package.
 */

// Import all components - these register auto-initialization on DOMContentLoaded
import "./components/Header/Header.vanilla";
import "./components/LeftNav/LeftNav.vanilla";
import "./components/Tab/Tab.vanilla";
import "./components/Tab/Tab.transformer";
import "./components/ThemeSwitcher/ThemeSwitcher.vanilla";
import "./components/ComponentViewer/ComponentViewer.vanilla";
import "./components/PageBanner/PageBanner.vanilla";
import "./components/Notification/Notification.vanilla";
import "./components/Card/Card.vanilla";
import "./components/PageCard/PageCard.vanilla";
import "./components/MiniPageCard/MiniPageCard.vanilla";
import "./components/PageTile/PageTile.vanilla";
import "./components/ColorSwatch/ColorSwatch.vanilla";

// Import global stylesheet (consolidated with all component styles via @import)
import "./global-styles";
