import { defineConfig } from "vite";
import { resolve } from "node:path";

// Builds the framework-agnostic runtime (the thing embedded on end-users'
// websites) as a standalone IIFE bundle, separate from the builder app.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist/runtime",
    emptyOutDir: false,
    cssCodeSplit: false,
    // Inline the self-hosted font files (and anything else CSS references) as data URIs so the
    // runtime stays a self-contained js+css pair with no sibling asset files to remember to deploy.
    assetsInlineLimit: Infinity,
    lib: {
      entry: resolve(process.cwd(), "src/runtime/embed.ts"),
      name: "ConsentBannerLib",
      formats: ["iife"],
      fileName: () => "consent-banner.js",
      cssFileName: "consent-banner",
    },
  },
});
