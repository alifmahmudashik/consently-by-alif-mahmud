import type { ConsentBannerConfig, ConsentState } from "./types";
import { renderMarkup, type RenderState } from "./dom";
import { resolveCookies, type ResolveOptions } from "./scanner";
import { resolveLanguage } from "./i18n";
import { loadConsent, saveConsent, clearConsent, saveLanguagePreference } from "./consentStorage";
import { pushConsentDefault, pushConsentUpdate } from "./consentMode";
import { isLikelyEuropeVisitor } from "./geo";

export type { ConsentBannerConfig } from "./types";
export { createDefaultConfig } from "./defaultConfig";

export interface MountOptions {
  /** Defaults to document.body. Pass a custom element for embedded/preview use. */
  container?: HTMLElement;
  /** Used by the builder preview to simulate detected cookies instead of reading document.cookie. */
  cookieNamesOverride?: string[];
  /** Skip localStorage read/write — used by the live preview so it always starts fresh. */
  isPreview?: boolean;
}

function themeStyleText(scopeSelector: string, config: ConsentBannerConfig): string {
  const t = config.theme;
  return `
    ${scopeSelector} {
      --ocb-accent: ${t.accentColor};
      --ocb-bg: ${t.backgroundColor};
      --ocb-text: ${t.textColor};
      --ocb-muted: ${t.mutedTextColor};
      --ocb-border: ${t.borderColor};
      --ocb-card-radius: ${t.cardRadius}px;
      --ocb-btn-radius: ${t.buttonRadius}px;
      --ocb-font: ${t.fontFamily};
      --ocb-logo-width: ${t.logoWidth}px;
      --ocb-mini-icon-offset: ${config.layout.miniIconOffset}px;
    }
  `;
}

export class ConsentBannerInstance {
  private container: HTMLElement;
  private root: HTMLElement;
  private styleEl: HTMLStyleElement;
  private options: MountOptions;
  private state: RenderState;
  private ready: Promise<void>;

  constructor(config: ConsentBannerConfig, options: MountOptions = {}) {
    this.options = options;
    this.container = options.container ?? document.body;

    this.root = document.createElement("div");
    this.root.className = "ocb-scope";
    this.container.appendChild(this.root);

    this.styleEl = document.createElement("style");
    document.head.appendChild(this.styleEl);

    const language = resolveLanguage(config);
    const stored = options.isPreview ? null : loadConsent(config.id);

    // Geo targeting only ever applies to a real, fresh visitor — never in the builder's own
    // preview (which would otherwise hide the banner just because the person configuring it
    // happens to be outside Europe), and never overriding a choice that's already on record.
    let geoAutoGranted: ConsentState | null = null;
    if (!stored && !options.isPreview && config.behavior.geoConsent === "eu-only") {
      if (isLikelyEuropeVisitor() === false) {
        geoAutoGranted = Object.fromEntries(config.categories.map((c) => [c.id, true]));
        saveConsent(config.id, geoAutoGranted, config.behavior.consentExpiryDays);
      }
    }

    this.state = {
      config,
      language,
      cookiesByCategory: {},
      draft: geoAutoGranted ?? stored?.categories ?? Object.fromEntries(config.categories.map((c) => [c.id, config.behavior.defaultConsent])),
      activeTab: "consent",
      openCategory: null,
      bannerVisible: !stored && !geoAutoGranted,
      hasStoredChoice: stored !== null,
    };

    this.applyTheme();
    this.attachDelegatedEvents();
    this.render();

    this.ready = this.loadCookies().then(() => {
      this.render();
      if (!options.isPreview) {
        if (stored) pushConsentDefault(stored.categories);
        else pushConsentDefault(this.state.draft);
      }
    });
  }

  private async loadCookies() {
    const options: ResolveOptions = { cookieNamesOverride: this.options.cookieNamesOverride };
    this.state.cookiesByCategory = await resolveCookies(this.state.config, options);
  }

  private applyTheme() {
    this.styleEl.textContent = themeStyleText(".ocb-scope", this.state.config);
  }

  private render() {
    this.root.innerHTML = renderMarkup(this.state);
  }

  private setDraftFromCheckboxes() {
    const boxes = this.root.querySelectorAll<HTMLInputElement>('[data-role="category-checkbox"]');
    boxes.forEach((box) => {
      const id = box.dataset.category!;
      this.state.draft[id] = box.checked;
    });
  }

  private allGranted(): ConsentState {
    return Object.fromEntries(this.state.config.categories.map((c) => [c.id, true]));
  }

  private allDeniedExceptRequired(): ConsentState {
    return Object.fromEntries(this.state.config.categories.map((c) => [c.id, c.required]));
  }

  private commit(categories: ConsentState) {
    this.state.draft = { ...categories };
    if (!this.options.isPreview) {
      saveConsent(this.state.config.id, categories, this.state.config.behavior.consentExpiryDays);
      pushConsentUpdate(categories);
    }
    this.state.hasStoredChoice = true;
    this.state.bannerVisible = false;
    this.render();
  }

  private attachDelegatedEvents() {
    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      const actionEl = target.closest<HTMLElement>("[data-action]");
      if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === "accept") this.commit(this.allGranted());
        else if (action === "reject") this.commit(this.allDeniedExceptRequired());
        else if (action === "customize") {
          this.state.activeTab = "details";
          this.render();
        } else if (action === "dismiss") {
          this.state.bannerVisible = false;
          this.render();
        } else if (action === "reopen") {
          this.state.activeTab = "consent";
          this.state.bannerVisible = true;
          this.render();
        } else if (action === "save") {
          this.setDraftFromCheckboxes();
          this.commit(this.state.draft);
        }
        return;
      }

      const tabEl = target.closest<HTMLElement>('[data-role="tab"]');
      if (tabEl) {
        this.state.activeTab = tabEl.dataset.tab as "consent" | "details" | "about";
        this.render();
        return;
      }

      const categoryToggle = target.closest<HTMLElement>('[data-role="category-toggle"]');
      if (categoryToggle) {
        // Toggle the disclosure directly instead of a full re-render: a full innerHTML replace
        // would recreate every category row (recreating the whole card, in fact), which loses
        // scroll position and, since entrance animations restart on newly-created elements,
        // made the entire banner visibly flash on every click.
        const id = categoryToggle.dataset.category!;
        const willOpen = this.state.openCategory !== id;
        this.state.openCategory = willOpen ? id : null;

        this.root.querySelectorAll<HTMLElement>('[data-role="category-toggle"]').forEach((toggle) => {
          const isThisOne = toggle === categoryToggle;
          const cookiesEl = toggle.closest(".ocb-category")?.querySelector<HTMLElement>(".ocb-category-cookies");
          const arrow = toggle.querySelector(".ocb-arrow");
          const open = isThisOne && willOpen;
          if (cookiesEl) cookiesEl.toggleAttribute("hidden", !open);
          arrow?.classList.toggle("ocb-arrow-open", open);
        });
        return;
      }

      const providerToggle = target.closest<HTMLElement>('[data-role="provider-toggle"]');
      if (providerToggle) {
        const cookiesEl = providerToggle.parentElement?.querySelector<HTMLElement>(".ocb-provider-cookies");
        const arrow = providerToggle.querySelector(".ocb-arrow");
        if (cookiesEl) {
          const isHidden = cookiesEl.hasAttribute("hidden");
          if (isHidden) cookiesEl.removeAttribute("hidden");
          else cookiesEl.setAttribute("hidden", "");
          arrow?.classList.toggle("ocb-arrow-open", isHidden);
        }
        return;
      }
    });

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('[data-role="category-checkbox"]')) {
        this.setDraftFromCheckboxes();
      } else if (target.matches('[data-role="lang-select"]')) {
        const code = (target as HTMLSelectElement).value;
        const lang = this.state.config.languages.find((l) => l.code === code);
        if (lang) {
          this.state.language = lang;
          if (!this.options.isPreview) saveLanguagePreference(this.state.config.id, code);
          this.render();
        }
      }
    });
  }

  updateConfig(config: ConsentBannerConfig) {
    this.state.config = config;
    this.state.language = resolveLanguage(config);
    if (!this.state.draft || Object.keys(this.state.draft).length === 0) {
      this.state.draft = Object.fromEntries(config.categories.map((c) => [c.id, config.behavior.defaultConsent]));
    }
    this.applyTheme();
    this.render();
    void this.loadCookies().then(() => this.render());
  }

  show() {
    this.state.activeTab = "consent";
    this.state.bannerVisible = true;
    this.render();
  }

  reset() {
    if (!this.options.isPreview) clearConsent(this.state.config.id);
    this.state.draft = Object.fromEntries(this.state.config.categories.map((c) => [c.id, this.state.config.behavior.defaultConsent]));
    this.state.activeTab = "consent";
    this.state.openCategory = null;
    this.state.hasStoredChoice = false;
    this.state.bannerVisible = true;
    this.render();
  }

  getConsent(): ConsentState {
    return { ...this.state.draft };
  }

  whenReady(): Promise<void> {
    return this.ready;
  }

  destroy() {
    this.root.remove();
    this.styleEl.remove();
  }
}

let activeInstance: ConsentBannerInstance | null = null;

export function init(config: ConsentBannerConfig, options: MountOptions = {}): ConsentBannerInstance {
  activeInstance?.destroy();
  activeInstance = new ConsentBannerInstance(config, options);

  if (config.behavior.reopenTriggerSelector) {
    document.querySelectorAll(config.behavior.reopenTriggerSelector).forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        activeInstance?.show();
      });
    });
  }

  return activeInstance;
}

export function getInstance(): ConsentBannerInstance | null {
  return activeInstance;
}
