import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";
import { copyFileSync, existsSync } from "node:fs";

// The cookie database lives in public/ for the builder app's own use (same-origin, relative
// fetch). Whoever self-hosts the runtime needs to copy it alongside consent-banner.js/css too, so
// it's shipped inside dist/runtime/ as well rather than only at the builder app's own root.
function copyCookieDb(): Plugin {
  return {
    name: "copy-cookie-db-into-runtime",
    closeBundle() {
      const src = resolve(process.cwd(), "public/cookie-db.json");
      if (!existsSync(src)) return;
      copyFileSync(src, resolve(process.cwd(), "dist/runtime/cookie-db.json"));
    },
  };
}

// Builds the framework-agnostic runtime (the thing embedded on end-users'
// websites) as a standalone IIFE bundle, separate from the builder app.
export default defineConfig({
  publicDir: false,
  plugins: [copyCookieDb()],
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
