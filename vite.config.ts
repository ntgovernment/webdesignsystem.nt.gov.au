import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist/squiz",
    rollupOptions: {
      input: {
        // Vanilla JS components for Squiz Matrix
        header: path.resolve(
          __dirname,
          "src/components/Header/Header.vanilla.ts",
        ),
        "theme-switcher": path.resolve(
          __dirname,
          "src/components/ThemeSwitcher/ThemeSwitcher.vanilla.ts",
        ),
        "left-nav": path.resolve(
          __dirname,
          "src/components/LeftNav/LeftNav.vanilla.ts",
        ),
        "two-column": path.resolve(
          __dirname,
          "src/components/TwoColumn/TwoColumn.vanilla.ts",
        ),
        "component-viewer-client": path.resolve(
          __dirname,
          "src/components/ComponentViewer/ComponentViewer.vanilla.ts",
        ),
        // Global stylesheet
        "ntg-design-system": path.resolve(__dirname, "src/global-styles.ts"),
      },
      output: {
        format: "es",
        entryFileNames: (chunkInfo) => {
          // Put JS files in js/ subdirectory
          return chunkInfo.name === "ntg-design-system"
            ? "[name].js"
            : "js/[name].js";
        },
        chunkFileNames: "js/chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Keep CSS at root level
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "[name].[ext]";
          }
          return "assets/[name].[ext]";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: "/preview/",
    proxy: {
      "/storybook": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storybook/, ""),
      },
    },
  },
});
