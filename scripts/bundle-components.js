#!/usr/bin/env node

/**
 * Component Bundler
 *
 * Temporary bundler script that concatenates component files and CSS for deployment.
 * This serves as a workaround until the Vite build process is fully debugged.
 *
 * Generates:
 * - .build/web-design-system.min.css (all component styles)
 * - .build/web-design-system.min.js (all component code)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, ".build");

console.log("📦 Building unified component bundles...\n");

// Ensure .build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log("✓ Created .build directory");
}

// Paths to component files and styles
const components = [
  { name: "Header", path: "src/components/Header/Header.vanilla.ts" },
  { name: "LeftNav", path: "src/components/LeftNav/LeftNav.vanilla.ts" },
  {
    name: "ThemeSwitcher",
    path: "src/components/ThemeSwitcher/ThemeSwitcher.vanilla.ts",
  },
  {
    name: "ComponentViewer",
    path: "src/components/ComponentViewer/ComponentViewer.vanilla.ts",
  },
];

const styles = [
  "src/ntg-design-system.css",
  "src/index.css",
  "src/tokens.css",
  "src/components/Header/Header.css",
  "src/components/LeftNav/LeftNav.css",
  "src/components/ThemeSwitcher/ThemeSwitcher.css",
  "src/components/ComponentViewer/ComponentViewer.css",
];

// Build bundle JS by reading and concatenating component files
let bundleJs = `/**
 * NT Design System - Unified Bundle
 * 
 * Consolidated vanilla JavaScript components for Squiz Matrix deployment.
 * Components auto-initialize on DOMContentLoaded.
 * 
 * Generated: ${new Date().toISOString()}
 */\n\n`;

// Read and include component JavaScript files
for (const component of components) {
  const filePath = path.join(rootDir, component.path);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    bundleJs += `// ============================================\n`;
    bundleJs += `// ${component.name} Component\n`;
    bundleJs += `// ============================================\n`;
    bundleJs += content + "\n\n";
  }
}

// Write JS bundle
const jsBundlePath = path.join(buildDir, "web-design-system.min.js");
fs.writeFileSync(jsBundlePath, bundleJs, "utf-8");
console.log(`✓ Generated: ${path.relative(rootDir, jsBundlePath)}`);

// Build bundle CSS by reading and concatenaing CSS files
let bundleCss = `/**
 * NT Design System - Unified Stylesheet
 * 
 * Consolidated styles for all components.
 * 
 * Generated: ${new Date().toISOString()}
 */\n\n`;

for (const stylePath of styles) {
  const fullPath = path.join(rootDir, stylePath);
  if (fs.existsSync(fullPath)) {
    const fileName = path.basename(fullPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    bundleCss += `/* ============================================ */\n`;
    bundleCss += `/* ${fileName} */\n`;
    bundleCss += `/* ============================================ */\n`;
    bundleCss += content + "\n\n";
  }
}

// Write CSS bundle
const cssBundlePath = path.join(buildDir, "web-design-system.min.css");
fs.writeFileSync(cssBundlePath, bundleCss, "utf-8");
console.log(`✓ Generated: ${path.relative(rootDir, cssBundlePath)}`);

console.log("\n✅ Bundle generation complete!");
