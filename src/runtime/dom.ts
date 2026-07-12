import type { ConsentBannerConfig, ConsentState, LanguageText, ResolvedCookie } from "./types";

export interface RenderState {
  config: ConsentBannerConfig;
  language: LanguageText;
  cookiesByCategory: Record<string, ResolvedCookie[]>;
  draft: ConsentState;
  activeTab: "consent" | "details" | "about";
  openCategory: string | null;
  bannerVisible: boolean;
  /** Whether a consent choice has ever been recorded. The close (×) button only ever appears
   * after that — the first-ever view always forces an explicit accept/reject/customize. */
  hasStoredChoice: boolean;
}

const closeIcon = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M584,1117 C576.268,1117 570,1110.73 570,1103 C570,1095.27 576.268,1089 584,1089 C591.732,1089 598,1095.27 598,1103 C598,1110.73 591.732,1117 584,1117 L584,1117 Z M584,1087 C575.163,1087 568,1094.16 568,1103 C568,1111.84 575.163,1119 584,1119 C592.837,1119 600,1111.84 600,1103 C600,1094.16 592.837,1087 584,1087 L584,1087 Z M589.717,1097.28 C589.323,1096.89 588.686,1096.89 588.292,1097.28 L583.994,1101.58 L579.758,1097.34 C579.367,1096.95 578.733,1096.95 578.344,1097.34 C577.953,1097.73 577.953,1098.37 578.344,1098.76 L582.58,1102.99 L578.314,1107.26 C577.921,1107.65 577.921,1108.29 578.314,1108.69 C578.708,1109.08 579.346,1109.08 579.74,1108.69 L584.006,1104.42 L588.242,1108.66 C588.633,1109.05 589.267,1109.05 589.657,1108.66 C590.048,1108.27 590.048,1107.63 589.657,1107.24 L585.42,1103.01 L589.717,1098.71 C590.11,1098.31 590.11,1097.68 589.717,1097.28 L589.717,1097.28 Z" transform="translate(-568,-1087)"/></svg>`;
const arrowIcon = `<svg class="ocb-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"/></svg>`;
const miniIconSvg = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3.003-2.938.005-.034.016-.134.017-.168a.998.998 0 0 0-1.254-1.006A3.002 3.002 0 0 1 15 7c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.716a1 1 0 0 0-1.067-1.236A9.956 9.956 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10c0-.049-.003-.097-.007-.16a1.004 1.004 0 0 0-.395-.776zM8.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-2 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2.5-6.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm3.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function languageSwitcher(state: RenderState): string {
  if (state.config.languages.length < 2) return "";
  // When the site itself controls the language (URL/cookie/local storage), a manual override
  // would conflict with that signal on the next page load, so only show it in "browser" mode.
  if (state.config.behavior.languageDetection.method !== "browser") return "";
  const options = state.config.languages
    .map(
      (lang) =>
        `<option value="${lang.code}" ${lang.code === state.language.code ? "selected" : ""}>${escapeHtml(lang.label)}</option>`,
    )
    .join("");
  return `<select class="ocb-lang-select" data-role="lang-select" aria-label="Language">${options}</select>`;
}

type ButtonVariant = "primary" | "plain";
interface ButtonSpec {
  action: string;
  label: string;
  variant: ButtonVariant;
}

/** Inserts the reject button (if enabled) at the configured slot around [accept, customize]. */
function withRejectOrder(config: ConsentBannerConfig, accept: ButtonSpec, customize: ButtonSpec, rejectLabel: string): ButtonSpec[] {
  const buttons = [accept, customize];
  if (!config.layout.showRejectButton) return buttons;
  const reject: ButtonSpec = { action: "reject", label: rejectLabel, variant: "plain" };
  if (config.layout.rejectButtonPosition === "left") buttons.unshift(reject);
  else if (config.layout.rejectButtonPosition === "right") buttons.push(reject);
  else buttons.splice(1, 0, reject);
  return buttons;
}

function renderButtonRow(buttons: ButtonSpec[], extraClass = ""): string {
  return `
    <div class="ocb-buttons ${extraClass}">
      ${buttons.map((b) => `<button class="ocb-btn ${b.variant === "primary" ? "ocb-btn-primary" : ""}" data-action="${b.action}">${escapeHtml(b.label)}</button>`).join("")}
    </div>
  `;
}

function renderCookieList(cookies: ResolvedCookie[], language: LanguageText): string {
  if (cookies.length === 0) {
    return `<div class="ocb-no-cookies">${escapeHtml(language.noCookies)}</div>`;
  }

  const byController = new Map<string, ResolvedCookie[]>();
  for (const cookie of cookies) {
    const label = cookie.controller || "Unknown provider";
    if (!byController.has(label)) byController.set(label, []);
    byController.get(label)!.push(cookie);
  }

  let html = "";
  for (const [controller, list] of byController) {
    const firstPortal = list.find((c) => c.portal)?.portal;
    html += `
      <div class="ocb-provider">
        <div class="ocb-provider-header" data-role="provider-toggle">
          <span class="ocb-provider-name">${escapeHtml(controller)} <span class="ocb-badge">${list.length}</span></span>
          ${arrowIcon}
        </div>
        ${firstPortal ? `<div class="ocb-learn-more"><a href="${escapeHtml(firstPortal)}" target="_blank" rel="noopener">${escapeHtml(language.learnMore)}</a></div>` : ""}
        <div class="ocb-provider-cookies" hidden>
          ${list
            .map(
              (cookie) => `
            <div class="ocb-cookie">
              <div class="ocb-cookie-key">${escapeHtml(cookie.key)}</div>
              ${cookie.description ? `<div class="ocb-cookie-desc">${escapeHtml(cookie.description)}</div>` : ""}
              <div class="ocb-cookie-border"></div>
              <div class="ocb-cookie-meta">
                ${cookie.retention ? `<span>Retention: ${escapeHtml(cookie.retention)}</span>` : ""}
                <span>Domain: ${escapeHtml(cookie.domain || "")}</span>
                <span>Controller: ${escapeHtml(cookie.controller)}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }
  return html;
}

function renderCategories(state: RenderState): string {
  const { config, language, cookiesByCategory, draft, openCategory } = state;

  return config.categories
    .map((category) => {
      const text = language.categories[category.id] ?? { name: category.id, description: "" };
      const cookies = cookiesByCategory[category.id] ?? [];
      const checked = category.required || draft[category.id];
      const isOpen = openCategory === category.id;

      return `
        <div class="ocb-category">
          <div class="ocb-category-header">
            <button class="ocb-category-name" data-role="category-toggle" data-category="${category.id}">
              ${arrowIcon}
              <span>${escapeHtml(text.name)}</span>
              <span class="ocb-badge">${cookies.length}</span>
            </button>
            <label class="ocb-switch ${category.required ? "ocb-switch-disabled" : ""}">
              <input type="checkbox" data-role="category-checkbox" data-category="${category.id}" ${checked ? "checked" : ""} ${category.required ? "disabled" : ""} />
              <span class="ocb-switch-slider"></span>
            </label>
          </div>
          <div class="ocb-category-desc">${escapeHtml(text.description)}</div>
          <div class="ocb-category-cookies" ${isOpen ? "" : "hidden"}>
            ${renderCookieList(cookies, language)}
          </div>
        </div>
      `;
    })
    .join("");
}

/* ============================================================
 * A single banner card with in-place Consent/Details/About tabs — a
 * faithful port of the hand-coded reference template. The same markup
 * renders for every layout position; only sizing/placement CSS differs.
 * ============================================================ */

function renderHeader(state: RenderState): string {
  const { config } = state;
  const logo =
    config.theme.showLogo && config.theme.logoUrl
      ? `<div class="ocb-logo"><img src="${escapeHtml(config.theme.logoUrl)}" alt="logo" /></div>`
      : "<div></div>";
  const closeBtn = config.layout.showCloseButton && state.hasStoredChoice
    ? `<button class="ocb-icon-btn" data-action="dismiss" aria-label="Close">${closeIcon}</button>`
    : "";

  return `
    <div class="ocb-header">
      ${logo}
      <div class="ocb-header-actions">
        ${languageSwitcher(state)}
        ${closeBtn}
      </div>
    </div>
  `;
}

function renderNav(state: RenderState, showConsentTab: boolean): string {
  const { language, activeTab } = state;
  const tabs: Array<{ id: RenderState["activeTab"]; label: string }> = [
    ...(showConsentTab ? [{ id: "consent" as const, label: language.consentTitle }] : []),
    { id: "details", label: language.detailsTitle },
    { id: "about", label: language.aboutTitle },
  ];

  return `
    <div class="ocb-nav">
      ${tabs
        .map(
          (tab) => `
        <button class="ocb-nav-tab ${activeTab === tab.id ? "ocb-nav-tab-active" : ""}" data-role="tab" data-tab="${tab.id}">
          ${escapeHtml(tab.label)}
        </button>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderPanels(state: RenderState): string {
  const { language, activeTab } = state;

  return `
    <div class="ocb-content">
      <div class="ocb-panel ${activeTab === "consent" ? "ocb-panel-active" : ""}" data-tab="consent">
        ${language.description}
      </div>
      <div class="ocb-panel ocb-panel-scroll ${activeTab === "details" ? "ocb-panel-active" : ""}" data-tab="details">
        ${renderCategories(state)}
      </div>
      <div class="ocb-panel ocb-panel-scroll ${activeTab === "about" ? "ocb-panel-active" : ""}" data-tab="about">
        ${language.aboutText}
      </div>
    </div>
  `;
}

function renderCardButtons(state: RenderState): string {
  const { language, activeTab, config } = state;
  const customizeLabel = activeTab === "details" ? language.buttons.save : language.buttons.customize;
  const customizeAction = activeTab === "details" ? "save" : "customize";

  const buttons = withRejectOrder(
    config,
    { action: "accept", label: language.buttons.acceptAll, variant: "primary" },
    { action: customizeAction, label: customizeLabel, variant: "plain" },
    language.buttons.rejectAll,
  );

  return renderButtonRow(buttons, activeTab === "details" ? "ocb-buttons-shadow" : "");
}

/** Once you leave the initial Consent tab on a non-center layout, the compact bar/corner banner
 * "promotes" itself to the same centered presentation used by the center position — there's no
 * separate dialog, it's the same card, just re-positioned, with the Consent tab hidden while it's
 * up there (going back to it would mean un-centering, which is a confusing thing to animate). */
function isPromoted(state: RenderState): boolean {
  return state.config.layout.position !== "center" && state.activeTab !== "consent";
}

function renderCard(state: RenderState, effectivePosition: string): string {
  return `
    <div class="ocb-card ocb-pos-${effectivePosition}" role="dialog" aria-modal="false" aria-label="${escapeHtml(state.language.title)}">
      ${renderHeader(state)}
      ${renderNav(state, !isPromoted(state))}
      ${renderPanels(state)}
      ${renderCardButtons(state)}
    </div>
  `;
}

export function renderMarkup(state: RenderState): string {
  const { config } = state;
  const effectivePosition = isPromoted(state) ? "center" : config.layout.position;
  const overlayClass = config.layout.overlay && effectivePosition === "center" ? "ocb-has-overlay" : "";
  const posClass = `ocb-wrap-pos-${effectivePosition}`;
  const miniIconSideClass = config.layout.miniIconPosition === "bottom-right" ? "ocb-mini-icon-right" : "ocb-mini-icon-left";

  return `
    <div class="ocb-banner-wrap ${overlayClass} ${posClass}" data-role="banner-wrap" ${state.bannerVisible ? "" : "hidden"}>
      ${renderCard(state, effectivePosition)}
    </div>
    <button class="ocb-mini-icon ${miniIconSideClass}" data-action="reopen" aria-label="Cookie settings" ${state.bannerVisible ? "hidden" : ""} ${config.layout.showMiniIcon ? "" : "hidden"}>
      ${miniIconSvg}
    </button>
  `;
}
