import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isComponentMode = mode === "components";
  const isSquizMode = mode === "squiz";

  return {
    plugins: [react()],
    build: {
      outDir: isSquizMode
        ? "dist/squiz"
        : isComponentMode
          ? "dist/components"
          : "dist",
      rollupOptions: isSquizMode
        ? {
            input: {
              // Vanilla JS components for Squiz Matrix (no React)
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
              // Global stylesheet
              "ntg-design-system": path.resolve(
                __dirname,
                "src/global-styles.ts",
              ),
            },
            output: {
              format: "iife",
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
          }
        : isComponentMode
          ? {
              input: {
                "two-column": path.resolve(
                  __dirname,
                  "src/components/TwoColumn/index.ts",
                ),
                "theme-switcher": path.resolve(
                  __dirname,
                  "src/components/ThemeSwitcher/index.ts",
                ),
                header: path.resolve(
                  __dirname,
                  "src/components/Header/index.ts",
                ),
                "left-nav": path.resolve(
                  __dirname,
                  "src/components/LeftNav/index.ts",
                ),
              },
              output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
              },
            }
          : {
              output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
              },
            },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
