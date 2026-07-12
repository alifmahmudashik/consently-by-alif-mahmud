import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type {
  BehaviorConfig,
  ConsentBannerConfig,
  LanguageText,
  LayoutConfig,
  ManualCookieEntry,
  ThemeConfig,
} from "../runtime/types";
import { createDefaultConfig, englishLanguage } from "../runtime/defaultConfig";

/**
 * Backfills any fields missing from a config saved before they existed (new theme/layout/behavior
 * options, new per-language text fields, etc.) so older localStorage/import data never crashes
 * the app on a `.foo` of undefined — it just silently gets the current default for that field.
 */
function mergeLanguage(base: LanguageText, saved: Partial<LanguageText> | undefined): LanguageText {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    buttons: { ...base.buttons, ...saved.buttons },
    categories: { ...base.categories, ...saved.categories },
  };
}

function mergeConfig(saved: Partial<ConsentBannerConfig> | undefined): ConsentBannerConfig {
  const base = createDefaultConfig();
  if (!saved) return base;

  return {
    ...base,
    ...saved,
    theme: { ...base.theme, ...saved.theme },
    layout: { ...base.layout, ...saved.layout },
    behavior: {
      ...base.behavior,
      ...saved.behavior,
      languageDetection: { ...base.behavior.languageDetection, ...saved.behavior?.languageDetection },
    },
    languages: saved.languages?.length ? saved.languages.map((lang) => mergeLanguage(englishLanguage, lang)) : base.languages,
    categories: saved.categories ?? base.categories,
    manualCookies: saved.manualCookies ?? base.manualCookies,
  };
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "category"
  );
}

interface ConfigStore {
  config: ConsentBannerConfig;

  setId: (id: string) => void;
  setDefaultLanguage: (code: string) => void;

  updateTheme: (partial: Partial<ThemeConfig>) => void;
  updateLayout: (partial: Partial<LayoutConfig>) => void;
  updateBehavior: (partial: Partial<BehaviorConfig>) => void;

  updateLanguageMeta: (code: string, field: "label" | "code", value: string) => void;
  updateLanguageText: (
    code: string,
    field:
      | "title"
      | "description"
      | "consentTitle"
      | "aboutTitle"
      | "aboutText"
      | "detailsTitle"
      | "learnMore"
      | "noCookies",
    value: string,
  ) => void;
  updateLanguageButton: (code: string, field: "acceptAll" | "rejectAll" | "customize" | "save", value: string) => void;
  updateCategoryText: (code: string, categoryId: string, field: "name" | "description", value: string) => void;
  addLanguage: () => void;
  removeLanguage: (code: string) => void;

  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  toggleCategoryRequired: (id: string) => void;
  moveCategory: (id: string, direction: "up" | "down") => void;

  addManualCookie: (entry?: Partial<ManualCookieEntry>) => void;
  updateManualCookie: (index: number, partial: Partial<ManualCookieEntry>) => void;
  removeManualCookie: (index: number) => void;

  loadConfig: (config: ConsentBannerConfig) => void;
  resetToDefault: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    immer((set) => ({
      config: createDefaultConfig(),

      setId: (id) =>
        set((state) => {
          state.config.id = id;
        }),

      setDefaultLanguage: (code) =>
        set((state) => {
          state.config.defaultLanguage = code;
        }),

      updateTheme: (partial) =>
        set((state) => {
          Object.assign(state.config.theme, partial);
        }),

      updateLayout: (partial) =>
        set((state) => {
          Object.assign(state.config.layout, partial);
        }),

      updateBehavior: (partial) =>
        set((state) => {
          Object.assign(state.config.behavior, partial);
        }),

      updateLanguageMeta: (code, field, value) =>
        set((state) => {
          const lang = state.config.languages.find((l) => l.code === code);
          if (!lang) return;
          if (field === "code") {
            const wasDefault = state.config.defaultLanguage === lang.code;
            lang.code = value;
            if (wasDefault) state.config.defaultLanguage = value;
          } else {
            lang.label = value;
          }
        }),

      updateLanguageText: (code, field, value) =>
        set((state) => {
          const lang = state.config.languages.find((l) => l.code === code);
          if (lang) lang[field] = value;
        }),

      updateLanguageButton: (code, field, value) =>
        set((state) => {
          const lang = state.config.languages.find((l) => l.code === code);
          if (lang) lang.buttons[field] = value;
        }),

      updateCategoryText: (code, categoryId, field, value) =>
        set((state) => {
          const lang = state.config.languages.find((l) => l.code === code);
          if (!lang) return;
          if (!lang.categories[categoryId]) lang.categories[categoryId] = { name: categoryId, description: "" };
          lang.categories[categoryId][field] = value;
        }),

      addLanguage: () =>
        set((state) => {
          const base = state.config.languages.find((l) => l.code === state.config.defaultLanguage) ?? state.config.languages[0] ?? englishLanguage;
          let code = "xx";
          let n = 2;
          while (state.config.languages.some((l) => l.code === code)) {
            code = `xx${n}`;
            n += 1;
          }
          state.config.languages.push({
            ...JSON.parse(JSON.stringify(base)),
            code,
            label: "New language",
          });
        }),

      removeLanguage: (code) =>
        set((state) => {
          if (state.config.languages.length <= 1) return;
          state.config.languages = state.config.languages.filter((l) => l.code !== code);
          if (state.config.defaultLanguage === code) {
            state.config.defaultLanguage = state.config.languages[0].code;
          }
        }),

      addCategory: (name) =>
        set((state) => {
          let id = slugify(name);
          let n = 2;
          while (state.config.categories.some((c) => c.id === id)) {
            id = `${slugify(name)}-${n}`;
            n += 1;
          }
          state.config.categories.push({ id, required: false });
          for (const lang of state.config.languages) {
            lang.categories[id] = { name: name || id, description: "" };
          }
        }),

      removeCategory: (id) =>
        set((state) => {
          state.config.categories = state.config.categories.filter((c) => c.id !== id);
          for (const lang of state.config.languages) {
            delete lang.categories[id];
          }
          const fallback = state.config.categories.find((c) => c.id === "unclassified")?.id ?? state.config.categories[0]?.id;
          if (fallback) {
            state.config.manualCookies.forEach((cookie) => {
              if (cookie.category === id) cookie.category = fallback;
            });
          }
        }),

      toggleCategoryRequired: (id) =>
        set((state) => {
          const category = state.config.categories.find((c) => c.id === id);
          if (category) category.required = !category.required;
        }),

      moveCategory: (id, direction) =>
        set((state) => {
          const index = state.config.categories.findIndex((c) => c.id === id);
          if (index === -1) return;
          const swapWith = direction === "up" ? index - 1 : index + 1;
          if (swapWith < 0 || swapWith >= state.config.categories.length) return;
          const [item] = state.config.categories.splice(index, 1);
          state.config.categories.splice(swapWith, 0, item);
        }),

      addManualCookie: (entry) =>
        set((state) => {
          state.config.manualCookies.push({
            key: entry?.key ?? "",
            category: entry?.category ?? state.config.categories[0]?.id ?? "functional",
            controller: entry?.controller ?? "",
            description: entry?.description ?? "",
            retention: entry?.retention ?? "",
            domain: entry?.domain ?? "",
          });
        }),

      updateManualCookie: (index, partial) =>
        set((state) => {
          const cookie = state.config.manualCookies[index];
          if (cookie) Object.assign(cookie, partial);
        }),

      removeManualCookie: (index) =>
        set((state) => {
          state.config.manualCookies.splice(index, 1);
        }),

      loadConfig: (config) =>
        set((state) => {
          state.config = mergeConfig(config);
        }),

      resetToDefault: () =>
        set((state) => {
          state.config = createDefaultConfig();
        }),
    })),
    {
      name: "ocb-builder-config",
      partialize: (state) => ({ config: state.config }),
      merge: (persisted, current) => ({
        ...current,
        config: mergeConfig((persisted as { config?: ConsentBannerConfig } | undefined)?.config),
      }),
    },
  ),
);

export function generateShareId(): string {
  return nanoid(8);
}
