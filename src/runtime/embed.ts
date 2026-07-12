import { init, getInstance, type MountOptions } from "./index";
import { createDefaultConfig } from "./defaultConfig";
import type { ConsentBannerConfig } from "./types";
import "./styles.css";

// Captured synchronously at load time, before any async work — this is the one reliable moment
// `document.currentScript` points at *this* script tag, wherever it was loaded from.
const SCRIPT_URL = typeof document !== "undefined" ? (document.currentScript as HTMLScriptElement | null)?.src : undefined;

/**
 * If cookieDbUrl is left as the builder's own same-origin default ("/cookie-db.json"), resolve it
 * against this script's own location instead — that's where cookie-db.json actually gets copied
 * to (dist/runtime/), right next to consent-banner.js. This way the snippet keeps working no
 * matter what domain it's hosted on, including moving to a new one later, with zero reconfiguring.
 * An explicitly-set absolute cookieDbUrl (self-hosting the database elsewhere) is left alone.
 */
function withResolvedCookieDbUrl(config: ConsentBannerConfig): ConsentBannerConfig {
  if (!SCRIPT_URL || !config.cookieDbUrl?.startsWith("/")) return config;
  const runtimeBase = SCRIPT_URL.replace(/consent-banner\.js(?:[?#].*)?$/, "");
  return { ...config, cookieDbUrl: `${runtimeBase}cookie-db.json` };
}

declare global {
  interface Window {
    ConsentBanner: {
      init: (config: ConsentBannerConfig, options?: MountOptions) => ReturnType<typeof init>;
      getInstance: typeof getInstance;
      createDefaultConfig: typeof createDefaultConfig;
    };
  }
}

window.ConsentBanner = {
  init: (config, options) => init(withResolvedCookieDbUrl(config), options),
  getInstance,
  createDefaultConfig,
};
