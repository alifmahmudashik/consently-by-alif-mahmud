export type BannerPosition = "center" | "bottom" | "bottom-left" | "bottom-right" | "top";
export type RejectButtonPosition = "left" | "middle" | "right";

export interface CategoryConfig {
  /** Stable id, also used as the key into each language's `categories` map. */
  id: string;
  /** Necessary/functional cookies that can't be turned off. */
  required: boolean;
}

export interface ManualCookieEntry {
  key: string;
  category: string;
  controller?: string;
  description?: string;
  retention?: string;
  domain?: string;
}

export interface CategoryText {
  name: string;
  description: string;
}

export interface LanguageText {
  code: string;
  label: string;
  title: string;
  description: string;
  consentTitle: string;
  aboutTitle: string;
  aboutText: string;
  detailsTitle: string;
  buttons: {
    acceptAll: string;
    rejectAll: string;
    customize: string;
    save: string;
  };
  categories: Record<string, CategoryText>;
  learnMore: string;
  noCookies: string;
}

export interface ThemeConfig {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  cardRadius: number;
  buttonRadius: number;
  fontFamily: string;
  logoUrl: string;
  logoWidth: number;
  showLogo: boolean;
}

export type MiniIconPosition = "bottom-left" | "bottom-right";

export interface LayoutConfig {
  position: BannerPosition;
  showCloseButton: boolean;
  showMiniIcon: boolean;
  miniIconPosition: MiniIconPosition;
  miniIconOffset: number;
  overlay: boolean;
  showRejectButton: boolean;
  rejectButtonPosition: RejectButtonPosition;
}

export type LanguageDetectionMethod = "browser" | "path" | "query" | "cookie" | "localStorage";

export interface LanguageDetectionConfig {
  method: LanguageDetectionMethod;
  /** Query parameter name, cookie name, or localStorage key. Unused for "browser" and "path". */
  paramName: string;
  /** Optional dot-path into a JSON value (e.g. "user.locale"). Unused for "browser", "path", and "query". */
  jsonPath: string;
}

export type GeoConsentMode = "off" | "eu-only";

export interface BehaviorConfig {
  consentExpiryDays: number;
  defaultConsent: boolean;
  respectDoNotTrack: boolean;
  googleConsentMode: boolean;
  reopenTriggerSelector: string;
  languageDetection: LanguageDetectionConfig;
  /** "eu-only": visitors outside Europe (by timezone, no API) are auto-granted and never see the
   * banner at all; visitors in/undetermined get the normal banner with the usual default. */
  geoConsent: GeoConsentMode;
}

export interface ConsentBannerConfig {
  id: string;
  defaultLanguage: string;
  languages: LanguageText[];
  theme: ThemeConfig;
  layout: LayoutConfig;
  behavior: BehaviorConfig;
  categories: CategoryConfig[];
  manualCookies: ManualCookieEntry[];
  /** Static JSON asset used to auto-classify cookies found via document.cookie. */
  cookieDbUrl: string;
}

export interface CookieDbEntry {
  key: string;
  category: string;
  controller: string;
  platform: string;
  domain: string;
  description: string;
  retention: string;
  portal: string;
  wildcard: boolean;
}

export interface ResolvedCookie {
  key: string;
  category: string;
  controller: string;
  description: string;
  retention: string;
  domain: string;
  portal: string;
  source: "manual" | "database" | "unknown";
}

export type ConsentState = Record<string, boolean>;

export interface StoredConsent {
  version: 1;
  savedAt: number;
  expiresAt: number;
  categories: ConsentState;
}
