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
import "./components/ThemeSwitcher/ThemeSwitcher.vanilla";
import "./components/ComponentViewer/ComponentViewer.vanilla";
import "./components/PageBanner/PageBanner.vanilla";
import "./components/Notification/Notification.vanilla";
import "./components/PageCard/PageCard.vanilla";
import "./components/MiniPageCard/MiniPageCard.vanilla";
import "./components/PageTile/PageTile.vanilla";
import "./components/ColorSwatch/ColorSwatch.vanilla";

// Import Tab Marker Transformer utility
import { transformTabMarkers } from "../scripts/tab-marker-transformer";

// Export transformer to global scope for use in HTML pages
(window as any).transformTabMarkers = transformTabMarkers;

// Import global stylesheet (consolidated with all component styles via @import)
import "./global-styles";
