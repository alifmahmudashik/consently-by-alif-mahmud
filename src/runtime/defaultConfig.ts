import type { ConsentBannerConfig, LanguageText } from "./types";

export const DEFAULT_CATEGORY_IDS = ["functional", "preference", "analytics", "marketing", "unclassified"] as const;

export const englishLanguage: LanguageText = {
  code: "en",
  label: "English",
  title: "We value your privacy",
  description:
    "We use cookies to improve your experience, as well as for analytics and measurement purposes. By continuing to use our site, you agree to our use of cookies as described in our Cookie Policy and Privacy Policy.",
  consentTitle: "Consent",
  aboutTitle: "About",
  aboutText:
    "Cookies are small text files used by websites to improve the user experience. We may store cookies that are strictly necessary for this site to function. For all other types of cookies we need your permission. This site uses different types of cookies; some are placed by third-party services that appear on our pages.",
  detailsTitle: "Details",
  buttons: {
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    save: "Save preferences",
  },
  categories: {
    functional: {
      name: "Functional",
      description:
        "Necessary cookies make the website usable by enabling basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.",
    },
    preference: {
      name: "Preference",
      description:
        "Preference cookies allow the website to remember information that changes how it behaves or looks, like your preferred language or region.",
    },
    analytics: {
      name: "Analytics",
      description:
        "Analytics cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.",
    },
    marketing: {
      name: "Marketing",
      description:
        "Marketing cookies are used to track visitors across websites. The intent is to display ads that are relevant and engaging for the individual user.",
    },
    unclassified: {
      name: "Unclassified",
      description: "Unclassified cookies are cookies we are still in the process of classifying.",
    },
  },
  learnMore: "Learn more about this provider",
  noCookies: "No cookies to display",
};

export function createDefaultConfig(): ConsentBannerConfig {
  return {
    id: "my-site",
    defaultLanguage: "en",
    languages: [englishLanguage],
    theme: {
      accentColor: "#6366f1",
      backgroundColor: "#ffffff",
      textColor: "#18181b",
      mutedTextColor: "#71717a",
      borderColor: "#e4e4e7",
      cardRadius: 16,
      buttonRadius: 12,
      fontFamily: "Inter, system-ui, sans-serif",
      logoUrl: "",
      logoWidth: 80,
      showLogo: false,
    },
    layout: {
      position: "center",
      showCloseButton: false,
      showMiniIcon: true,
      miniIconPosition: "bottom-left",
      miniIconOffset: 20,
      overlay: true,
      showRejectButton: true,
      rejectButtonPosition: "middle",
    },
    behavior: {
      consentExpiryDays: 180,
      defaultConsent: true,
      respectDoNotTrack: false,
      googleConsentMode: true,
      reopenTriggerSelector: "",
      languageDetection: {
        method: "browser",
        paramName: "",
        jsonPath: "",
      },
      geoConsent: "off",
    },
    categories: DEFAULT_CATEGORY_IDS.map((id) => ({ id, required: id === "functional" })),
    manualCookies: [],
    cookieDbUrl: "/cookie-db.json",
  };
}
