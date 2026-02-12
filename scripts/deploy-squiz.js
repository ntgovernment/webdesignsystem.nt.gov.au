#!/usr/bin/env node

/**
 * Deployment script for Squiz DXP Component Services
 *
 * This script prepares the built components for deployment to Squiz DXP.
 * It copies the compiled JS and CSS files to a deployment directory
 * that can be synced via Git File Bridge.
 *
 * Usage:
 *   npm run build       - Build Squiz components and deploy
 *   npm run deploy      - Deploy without rebuilding
 *
 * Environment Variables:
 *   SQUIZ_DEPLOY_PATH - Path where files should be deployed (default: ./deploy)
 *   VITE_SQUIZ_GIT_BRIDGE_ASSET_ID - Squiz Matrix Git File Bridge asset ID
 *   VITE_FONT_AWESOME_KIT_ID - Font Awesome kit ID
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const distSquizDir = path.join(rootDir, "dist", "squiz");
const publicSquizDir = path.join(rootDir, "public", "squiz");
const deployPath =
  process.env.SQUIZ_DEPLOY_PATH || path.join(rootDir, "deploy");

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    console.warn(
      "⚠️  No .env file found. Asset ID placeholders will not be replaced.",
    );
    return {};
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return env;
}

const envVars = loadEnvFile();
const assetId = envVars.VITE_SQUIZ_GIT_BRIDGE_ASSET_ID || "ASSET_ID";
const fontAwesomeKitId = envVars.VITE_FONT_AWESOME_KIT_ID || "YOUR_KIT_ID";

console.log("🚀 Starting Squiz DXP deployment preparation...\n");
console.log(`📦 Asset ID: ${assetId}`);
console.log(`✨ Font Awesome Kit: ${fontAwesomeKitId}\n`);

// Create deployment directory structure
const deployDirs = {
  assets: path.join(deployPath, "assets"),
  nesters: path.join(deployPath, "nesters"),
  js: path.join(deployPath, "js"),
};

Object.values(deployDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Copy Squiz nesters from public/squiz to deploy/nesters
if (fs.existsSync(publicSquizDir)) {
  const nesterFiles = fs.readdirSync(publicSquizDir);
  nesterFiles.forEach((file) => {
    const srcPath = path.join(publicSquizDir, file);
    const destPath = path.join(deployDirs.nesters, file);

    if (fs.statSync(srcPath).isFile() && file.endsWith(".html")) {
      // Read HTML file and replace placeholders
      let content = fs.readFileSync(srcPath, "utf-8");

      // Replace ASSET_ID placeholder
      content = content.replace(/ASSET_ID/g, assetId);

      // Replace YOUR_KIT_ID placeholder
      content = content.replace(/YOUR_KIT_ID/g, fontAwesomeKitId);

      // Write processed content
      fs.writeFileSync(destPath, content, "utf-8");
      console.log(`✓ Copied nester: ${file} (placeholders replaced)`);
    }
  });
} else {
  console.warn("⚠️  No public/squiz directory found.");
}

// Copy Squiz build outputs (vanilla JS components and global CSS)
if (fs.existsSync(distSquizDir)) {
  const squizFiles = fs.readdirSync(distSquizDir);

  squizFiles.forEach((file) => {
    const srcPath = path.join(distSquizDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isFile()) {
      // Copy CSS files to root of deploy
      if (file.endsWith(".css")) {
        const destPath = path.join(deployPath, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied stylesheet: ${file}`);
      }
      // Skip the ntg-design-system.js file (it's just for CSS extraction)
      else if (file !== "ntg-design-system.js" && file.endsWith(".js")) {
        const destPath = path.join(deployPath, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied file: ${file}`);
      }
    } else if (stat.isDirectory()) {
      // Copy js/ directory
      if (file === "js") {
        const destJsDir = path.join(deployPath, "js");
        copyDirRecursive(srcPath, destJsDir);
        console.log(`✓ Copied js/ directory`);
      }
      // Copy other directories (like assets, chunks, etc.)
      else {
        const destPath = path.join(deployPath, file);
        copyDirRecursive(srcPath, destPath);
        console.log(`✓ Copied directory: ${file}`);
      }
    }
  });
} else {
  console.warn("⚠️  No dist/squiz directory found. Run `npm run build` first.");
}

// Copy DXP Component Service structure from src/components/*/dxp/
const deployDxpDir = path.join(deployPath, "dxp-components");
const dxpComponents = ["ComponentViewer", "ThemeSwitcher", "TwoColumn"];
let dxpCopied = 0;

dxpComponents.forEach((component) => {
  const srcDxpDir = path.join(rootDir, "src", "components", component, "dxp");
  if (fs.existsSync(srcDxpDir)) {
    // Convert ComponentViewer -> component-viewer, ThemeSwitcher -> theme-switcher, etc.
    const componentKebab = component
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .substring(1);
    const destComponentDir = path.join(deployDxpDir, componentKebab);
    copyDirRecursive(srcDxpDir, destComponentDir);
    dxpCopied++;
  }
});

// Copy shared DXP schemas
const srcSchemasDir = path.join(rootDir, "src", "components", "dxp-schemas");
if (fs.existsSync(srcSchemasDir)) {
  const destSchemasDir = path.join(deployDxpDir, "schemas");
  copyDirRecursive(srcSchemasDir, destSchemasDir);
}

if (dxpCopied > 0) {
  console.log(`✓ Copied ${dxpCopied} DXP Component Services`);
}

// Create deployment manifest
const manifest = {
  deployedAt: new Date().toISOString(),
  nesters: {},
  components: {},
  stylesheets: [],
};

// Add Squiz nesters to manifest
if (fs.existsSync(deployDirs.nesters)) {
  const nesterFiles = fs.readdirSync(deployDirs.nesters);
  manifest.nesters = {
    count: nesterFiles.length,
    files: nesterFiles,
  };
}

// Add vanilla JS components to manifest
if (fs.existsSync(deployDirs.js)) {
  const jsFiles = fs.readdirSync(deployDirs.js);
  manifest.components = {
    count: jsFiles.length,
    files: jsFiles,
  };
}

// Add stylesheets to manifest
const cssFiles = fs.existsSync(deployPath)
  ? fs.readdirSync(deployPath).filter((f) => f.endsWith(".css"))
  : [];
manifest.stylesheets = cssFiles;

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
console.log(
  "   - deploy/nesters/ contains HTML nesters for MySource_AREA tags",
);
console.log("   - deploy/js/ contains vanilla JS components");
console.log("   - deploy/ntg-design-system.css contains global stylesheet");
console.log("2. Commit and push to trigger Git File Bridge sync");
console.log(
  "3. Reference in your Squiz Matrix paint layouts using %globals_asset_url:ASSET_ID%",
);
console.log("4. See DEPLOYMENT_GUIDE.md for detailed integration instructions");

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
