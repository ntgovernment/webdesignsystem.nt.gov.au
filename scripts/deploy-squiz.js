#!/usr/bin/env node

/**
 * Deployment script for Squiz DXP Component Services
 *
 * This script prepares the built components for deployment to Squiz DXP.
 * It copies the compiled JS and CSS files to a deployment directory
 * that can be synced via Git File Bridge.
 *
 * Usage:
 *   npm run deploy:squiz
 *
 * Environment Variables:
 *   SQUIZ_DEPLOY_PATH - Path where files should be deployed (default: ./deploy)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const deployPath =
  process.env.SQUIZ_DEPLOY_PATH || path.join(rootDir, "deploy");

console.log("🚀 Starting Squiz DXP deployment preparation...\n");

// Create deployment directory structure
const deployDirs = {
  assets: path.join(deployPath, "assets"),
  components: path.join(deployPath, "components"),
  viewer: path.join(deployPath, "viewer"),
};

Object.values(deployDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Copy compiled assets
if (fs.existsSync(distDir)) {
  // Copy main viewer app
  const viewerFiles = fs.readdirSync(distDir);
  viewerFiles.forEach((file) => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(deployDirs.viewer, file);

    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied viewer file: ${file}`);
    } else if (fs.statSync(srcPath).isDirectory() && file === "assets") {
      // Copy assets directory recursively
      copyDirRecursive(srcPath, deployDirs.assets);
      console.log(`✓ Copied assets directory`);
    }
  });
} else {
  console.warn("⚠️  No dist directory found. Run `npm run build` first.");
}

// Component mapping: file prefix -> folder name
const componentMap = {
  header: "header",
  "two-column": "two-column",
  "theme-switcher": "theme-switcher",
};

// Copy component builds into individual folders
const componentsDistDir = path.join(rootDir, "dist", "components");
if (fs.existsSync(componentsDistDir)) {
  const componentFiles = fs.readdirSync(componentsDistDir);

  // Group files by component
  const componentGroups = {};

  componentFiles.forEach((file) => {
    if (fs.statSync(path.join(componentsDistDir, file)).isFile()) {
      // Determine which component this file belongs to
      for (const [prefix, folderName] of Object.entries(componentMap)) {
        if (file.startsWith(prefix)) {
          if (!componentGroups[folderName]) {
            componentGroups[folderName] = [];
          }
          componentGroups[folderName].push(file);
          break;
        }
      }
    }
  });

  // Copy files into their component folders
  Object.entries(componentGroups).forEach(([folderName, files]) => {
    const componentDir = path.join(deployDirs.components, folderName);
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    files.forEach((file) => {
      const srcPath = path.join(componentsDistDir, file);
      const destPath = path.join(componentDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${folderName}/${file}`);
    });
  });
}

// Copy header HTML template if it exists
const headerHtmlSrc = path.join(rootDir, "public", "header.html");
const headerDir = path.join(deployDirs.components, "header");
if (fs.existsSync(headerHtmlSrc)) {
  if (!fs.existsSync(headerDir)) {
    fs.mkdirSync(headerDir, { recursive: true });
  }
  fs.copyFileSync(headerHtmlSrc, path.join(headerDir, "header.html"));
  console.log("✓ Copied header/header.html");
}

// Create deployment manifest
const manifest = {
  deployedAt: new Date().toISOString(),
  components: {},
  viewer: fs.existsSync(deployDirs.viewer)
    ? fs
        .readdirSync(deployDirs.viewer)
        .filter((f) => f.endsWith(".html") || f.endsWith(".js"))
    : [],
};

// Add component files to manifest
if (fs.existsSync(deployDirs.components)) {
  const componentFolders = fs.readdirSync(deployDirs.components);
  componentFolders.forEach((folder) => {
    const folderPath = path.join(deployDirs.components, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      manifest.components[folder] = fs.readdirSync(folderPath);
    }
  });
}

fs.writeFileSync(
  path.join(deployPath, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);

console.log("\n✅ Deployment preparation complete!");
console.log(`📁 Files ready in: ${deployPath}`);
console.log("\n📋 Deployment Manifest:");
console.log(JSON.stringify(manifest, null, 2));

console.log("\n📝 Next steps:");
console.log("1. Review the files in the deploy directory");
console.log("2. Commit and push to trigger Git File Bridge sync");
console.log(
  "3. Reference the compiled JS/CSS in your Squiz Matrix paint layouts",
);

// Helper function to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
