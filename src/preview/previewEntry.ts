import { ConsentBannerInstance } from "../runtime";
import { isPreviewMessage, PREVIEW_MESSAGE_SOURCE } from "./protocol";

const root = document.getElementById("ocb-preview-root")!;
let instance: ConsentBannerInstance | null = null;

window.addEventListener("message", (event) => {
  if (!isPreviewMessage(event.data)) return;
  const message = event.data;

  if (message.type === "config") {
    if (!instance) {
      instance = new ConsentBannerInstance(message.config, {
        container: root,
        isPreview: true,
      });
    } else {
      instance.updateConfig(message.config);
    }
  } else if (message.type === "reset") {
    instance?.reset();
  } else if (message.type === "show") {
    instance?.show();
  }
});

window.parent.postMessage({ source: PREVIEW_MESSAGE_SOURCE, type: "ready" }, "*");
