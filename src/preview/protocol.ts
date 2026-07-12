import type { ConsentBannerConfig } from "../runtime/types";

export const PREVIEW_MESSAGE_SOURCE = "ocb-builder-preview";

export type PreviewMessage =
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "config"; config: ConsentBannerConfig }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "reset" }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "show" }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: "ready" };

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === PREVIEW_MESSAGE_SOURCE;
}
