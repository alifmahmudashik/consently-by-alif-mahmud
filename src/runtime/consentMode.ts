import type { ConsentState } from "./types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Maps our category ids to Google Consent Mode v2 signal names. security_storage is
 * deliberately not mapped from any category — per Google's guidance (and the original
 * hand-coded template), it's always left "granted" regardless of the visitor's choices. */
const CATEGORY_TO_SIGNALS: Record<string, string[]> = {
  functional: ["functionality_storage"],
  preference: ["personalization_storage"],
  analytics: ["analytics_storage"],
  marketing: ["ad_storage", "ad_user_data", "ad_personalization"],
  unclassified: ["unclassified_storage"],
};

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Google's documented snippet defines gtag as a plain global (`function gtag(){...}`), and other
 * scripts on the page (WooCommerce, other plugins/tags) may call a global `gtag(...)` expecting
 * one to exist. Expose ours the same way — but only if nothing's already defined one, since a
 * real gtag.js load (first or later) does the exact same "push args to dataLayer" thing anyway. */
if (typeof window !== "undefined") {
  window.gtag = window.gtag || gtag;
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
