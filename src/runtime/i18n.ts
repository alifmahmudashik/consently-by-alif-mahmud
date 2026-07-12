import type { ConsentBannerConfig, LanguageText } from "./types";
import { loadLanguagePreference } from "./consentStorage";

function getPathSegments(): string[] {
  return window.location.pathname.split("/").filter(Boolean);
}

function getQueryValue(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function getCookieValue(name: string): string | null {
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function getLocalStorageValue(name: string): string | null {
  try {
    return window.localStorage.getItem(name);
  } catch {
    return null;
  }
}

function extractJsonPath(raw: string, path: string): string | null {
  if (!path) return raw;
  try {
    const parsed = JSON.parse(raw);
    const value = path.split(".").reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]), parsed);
    return value == null ? null : String(value);
  } catch {
    return raw;
  }
}

/** Resolves the active language code from the URL/cookie/localStorage, per the configured detection method. Returns null if detection is off or found nothing. */
function detectLanguageCode(config: ConsentBannerConfig): string | null {
  const detection = config.behavior.languageDetection;
  if (typeof window === "undefined" || !detection || detection.method === "browser") return null;

  if (detection.method === "path") {
    const segments = getPathSegments().map((s) => s.toLowerCase());
    const match = config.languages.find((lang) => segments.includes(lang.code.toLowerCase()));
    return match?.code ?? null;
  }

  let raw: string | null = null;
  if (detection.method === "query") raw = getQueryValue(detection.paramName);
  else if (detection.method === "cookie") raw = getCookieValue(detection.paramName);
  else if (detection.method === "localStorage") raw = getLocalStorageValue(detection.paramName);

  if (raw == null) return null;
  return extractJsonPath(raw, detection.jsonPath);
}

export function resolveLanguage(config: ConsentBannerConfig): LanguageText {
  const byCode = new Map(config.languages.map((lang) => [lang.code.toLowerCase(), lang]));
  const fallback = byCode.get(config.defaultLanguage.toLowerCase()) ?? config.languages[0];

  const detected = detectLanguageCode(config);
  if (detected && byCode.has(detected.toLowerCase())) return byCode.get(detected.toLowerCase())!;

  const method = config.behavior.languageDetection?.method ?? "browser";
  if (method !== "browser") return fallback;

  const stored = loadLanguagePreference(config.id);
  if (stored && byCode.has(stored.toLowerCase())) return byCode.get(stored.toLowerCase())!;

  if (typeof navigator !== "undefined") {
    const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const short = candidate.toLowerCase().split("-")[0];
      const exact = byCode.get(candidate.toLowerCase());
      if (exact) return exact;
      const partial = byCode.get(short);
      if (partial) return partial;
    }
  }

  return fallback;
}
