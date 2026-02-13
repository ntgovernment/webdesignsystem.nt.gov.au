import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(() => ({
  build: {
    outDir: ".build",
    cssCodeSplit: false, // Extract all CSS into single file
    rollupOptions: {
      input: {
        // Unified vanilla JS components bundle
        "web-design-system": path.resolve(
          __dirname,
          "src/web-design-system.ts",
        ),
      },
      output: {
        format: "iife",
        name: "NTGDesignSystem",
        entryFileNames: () => "web-design-system.min.js",
        assetFileNames: (assetInfo) => {
          // CSS files at root with .min.css extension
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "web-design-system.min.css";
          }
          return "assets/[name].[ext]";
        },
        inlineDynamicImports: true, // Ensure everything is bundled together
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
}));
