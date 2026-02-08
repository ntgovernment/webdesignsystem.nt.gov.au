#!/usr/bin/env node

/**
 * Deployment script for Squiz DXP Component Services
 *
 * This script prepares the built components for deployment to Squiz DXP.
 * It copies the compiled JS and CSS files to a deployment directory
 * that can be synced via Git File Bridge.
 *
 * Usage:
 *   npm run build:squiz       - Build Squiz components and deploy
 *   npm run deploy:squiz      - Deploy without rebuilding
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
  components: path.join(deployPath, "components"),
  viewer: path.join(deployPath, "viewer"),
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
  console.warn(
    "⚠️  No dist/squiz directory found. Run `npm run build:squiz` first.",
  );
}

// Copy DXP Component Service structure (if exists)
const dxpComponentsSourceDir = path.join(rootDir, "deploy", "dxp-components");
if (fs.existsSync(dxpComponentsSourceDir)) {
  const deployDxpDir = path.join(deployPath, "dxp-components");
  copyDirRecursive(dxpComponentsSourceDir, deployDxpDir);
  console.log(`✓ Copied DXP Component Services`);
}

// Copy compiled viewer assets (if building full viewer)
if (fs.existsSync(distDir)) {
  const viewerFiles = fs.readdirSync(distDir);
  viewerFiles.forEach((file) => {
    const srcPath = path.join(distDir, file);

    // Skip the squiz and components subdirectories
    if (file === "squiz" || file === "components") {
      return;
    }

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
}

// Component mapping: file prefix -> folder name (for legacy React components build)
const componentMap = {
  header: "header",
  "two-column": "two-column",
  "theme-switcher": "theme-switcher",
};

// Copy component builds into individual folders (legacy React components)
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
  nesters: {},
  squizComponents: {},
  components: {},
  viewer: fs.existsSync(deployDirs.viewer)
    ? fs
        .readdirSync(deployDirs.viewer)
        .filter((f) => f.endsWith(".html") || f.endsWith(".js"))
    : [],
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
  manifest.squizComponents = {
    count: jsFiles.length,
    files: jsFiles,
  };
}

// Add stylesheets to manifest
const cssFiles = fs.existsSync(deployPath)
  ? fs.readdirSync(deployPath).filter((f) => f.endsWith(".css"))
  : [];
manifest.stylesheets = cssFiles;

// Add component files to manifest (legacy React components)
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
