import type { ConsentState } from "./types";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Maps our category ids to Google Consent Mode v2 signal names. */
const CATEGORY_TO_SIGNALS: Record<string, string[]> = {
  functional: ["functionality_storage", "security_storage"],
  preference: ["personalization_storage"],
  analytics: ["analytics_storage"],
  marketing: ["ad_storage", "ad_user_data", "ad_personalization"],
  unclassified: ["unclassified_storage"],
};

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function buildSignals(categories: ConsentState): Record<string, "granted" | "denied"> {
  const signals: Record<string, "granted" | "denied"> = { security_storage: "granted" };
  for (const [categoryId, granted] of Object.entries(categories)) {
    const signalNames = CATEGORY_TO_SIGNALS[categoryId];
    if (!signalNames) continue;
    for (const signal of signalNames) {
      signals[signal] = granted ? "granted" : "denied";
    }
  }
  return signals;
}

export function pushConsentDefault(categories: ConsentState): void {
  gtag("consent", "default", buildSignals(categories));
  window.dataLayer!.push({ event: "consent_page_view" });
}

export function pushConsentUpdate(categories: ConsentState): void {
  gtag("consent", "update", buildSignals(categories));
  window.dataLayer!.push({ event: "consent_update" });
}
