import { init, getInstance } from "./index";
import { createDefaultConfig } from "./defaultConfig";
import "./styles.css";

declare global {
  interface Window {
    ConsentBanner: {
      init: typeof init;
      getInstance: typeof getInstance;
      createDefaultConfig: typeof createDefaultConfig;
    };
  }
}

window.ConsentBanner = { init, getInstance, createDefaultConfig };
