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
 *   ASSET_ID - Squiz Matrix Git File Bridge asset ID
 *   VITE_SQUIZ_GIT_BRIDGE_ASSET_ID - Squiz Matrix Git File Bridge asset ID
 *   VITE_FONT_AWESOME_KIT_ID - Font Awesome kit ID
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, ".build");
const publicSquizDir = path.join(rootDir, "public", "squiz");
const deployPath =
  process.env.SQUIZ_DEPLOY_PATH || path.join(rootDir, "deploy");

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    console.warn(
      "⚠️  No .env file found. Using environment variables and built-in defaults.",
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
const defaultAssetId = "1590990";
const assetId =
  process.env.ASSET_ID ||
  process.env.VITE_SQUIZ_GIT_BRIDGE_ASSET_ID ||
  envVars.ASSET_ID ||
  envVars.VITE_SQUIZ_GIT_BRIDGE_ASSET_ID ||
  defaultAssetId;
const fontAwesomeKitId = envVars.VITE_FONT_AWESOME_KIT_ID || "41b791824a";

console.log("🚀 Starting Squiz DXP deployment preparation...\n");
console.log(`📦 Asset ID: ${assetId}`);
console.log(`✨ Font Awesome Kit: ${fontAwesomeKitId}\n`);

// Create deployment directory structure
const deployDirs = {
  assets: path.join(deployPath, "assets"),
  nesters: path.join(deployPath, "nesters"),
  externalTokens: path.join(deployPath, "external-tokens"),
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

// Copy bundled assets from .build to deploy
if (fs.existsSync(buildDir)) {
  const buildFiles = fs.readdirSync(buildDir);

  buildFiles.forEach((file) => {
    const srcPath = path.join(buildDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isFile()) {
      // Copy CSS and JS bundles to root of deploy
      if (
        file === "web-design-system.min.css" ||
        file === "web-design-system.min.js"
      ) {
        const destPath = path.join(deployPath, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied bundle: ${file}`);
      }
    } else if (stat.isDirectory() && file === "assets") {
      // Copy assets directory if it exists
      const destPath = path.join(deployPath, "assets");
      copyDirRecursive(srcPath, destPath);
      console.log(`✓ Copied assets directory`);
    }
  });
} else {
  console.warn("⚠️  No .build directory found. Run `npm run build` first.");
}

// Copy external design tokens to deploy
const externalTokensDir = path.join(rootDir, "src", "external-tokens");
if (fs.existsSync(externalTokensDir)) {
  const tokenFiles = fs.readdirSync(externalTokensDir);
  let copiedCount = 0;

  tokenFiles.forEach((file) => {
    const srcPath = path.join(externalTokensDir, file);
    const destPath = path.join(deployDirs.externalTokens, file);

    if (fs.statSync(srcPath).isFile() && file.endsWith(".css")) {
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  });

  if (copiedCount > 0) {
    console.log(`✓ Copied ${copiedCount} external token file(s)`);
  }
} else {
  console.warn("⚠️  No external-tokens directory found in src/.");
}

// DXP components kept source-only in src/components (not deployed)

// Create deployment manifest
const manifest = {
  deployedAt: new Date().toISOString(),
  bundles: {
    css: "web-design-system.min.css",
    js: "web-design-system.min.js",
  },
  nesters: {},
};

// Add Squiz nesters to manifest
if (fs.existsSync(deployDirs.nesters)) {
  const nesterFiles = fs.readdirSync(deployDirs.nesters);
  manifest.nesters = {
    count: nesterFiles.length,
    files: nesterFiles,
  };
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
console.log(
  "   - deploy/web-design-system.min.css contains all component styles",
);
console.log("   - deploy/web-design-system.min.js contains all component code");
console.log("2. Commit and push to trigger Git File Bridge sync");
console.log(
  "3. Reference in your Squiz Matrix paint layouts using %globals_asset_url_with_hash:ASSET_ID%",
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
