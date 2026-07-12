import type { CookieDbEntry, ConsentBannerConfig, ResolvedCookie } from "./types";

let dbCache: Map<string, CookieDbEntry[]> | null = null;
let dbCacheUrl: string | null = null;

/** Reads the cookie names actually present on the current page. */
export function readBrowserCookieNames(): string[] {
  if (typeof document === "undefined" || !document.cookie) return [];
  return document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name));
}

async function loadCookieDb(url: string): Promise<Map<string, CookieDbEntry[]>> {
  if (dbCache && dbCacheUrl === url) return dbCache;
  try {
    const response = await fetch(url);
    const entries = (await response.json()) as CookieDbEntry[];
    const byKey = new Map<string, CookieDbEntry[]>();
    for (const entry of entries) {
      const key = entry.key.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(entry);
    }
    dbCache = byKey;
    dbCacheUrl = url;
    return byKey;
  } catch {
    return new Map();
  }
}

function findDbMatch(cookieName: string, byKey: Map<string, CookieDbEntry[]>): CookieDbEntry | null {
  const lower = cookieName.toLowerCase();
  const exact = byKey.get(lower);
  if (exact && exact.length > 0) return exact[0];

  for (const [key, entries] of byKey) {
    const entry = entries[0];
    if (entry.wildcard && lower.startsWith(key)) return entry;
  }
  return null;
}

function fallbackCategory(config: ConsentBannerConfig): string {
  const unclassified = config.categories.find((c) => c.id === "unclassified");
  return unclassified?.id ?? config.categories[config.categories.length - 1]?.id ?? "unclassified";
}

export interface ResolveOptions {
  /** Override the cookies "found" on the page — used by the builder preview. */
  cookieNamesOverride?: string[];
}

/**
 * Merges manually declared cookies with cookies actually detected via
 * document.cookie + the static cookie database, deduped by name (manual
 * entries win), grouped by category id.
 */
export async function resolveCookies(
  config: ConsentBannerConfig,
  options: ResolveOptions = {},
): Promise<Record<string, ResolvedCookie[]>> {
  const grouped: Record<string, ResolvedCookie[]> = {};
  for (const category of config.categories) grouped[category.id] = [];

  const seen = new Map<string, ResolvedCookie>();
  const validCategoryIds = new Set(config.categories.map((c) => c.id));

  for (const manual of config.manualCookies) {
    const category = validCategoryIds.has(manual.category) ? manual.category : fallbackCategory(config);
    seen.set(manual.key.toLowerCase(), {
      key: manual.key,
      category,
      controller: manual.controller ?? "",
      description: manual.description ?? "",
      retention: manual.retention ?? "",
      domain: manual.domain ?? "",
      portal: "",
      source: "manual",
    });
  }

  const detectedNames = options.cookieNamesOverride ?? readBrowserCookieNames();
  const byKey = config.cookieDbUrl ? await loadCookieDb(config.cookieDbUrl) : new Map<string, CookieDbEntry[]>();

  for (const name of detectedNames) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    const match = findDbMatch(name, byKey);
    if (match) {
      const category = validCategoryIds.has(match.category) ? match.category : fallbackCategory(config);
      seen.set(key, {
        key: name,
        category,
        controller: match.controller,
        description: match.description,
        retention: match.retention,
        domain: match.domain,
        portal: match.portal,
        source: "database",
      });
    } else {
      seen.set(key, {
        key: name,
        category: fallbackCategory(config),
        controller: "",
        description: "",
        retention: "",
        domain: "",
        portal: "",
        source: "unknown",
      });
    }
  }

  for (const cookie of seen.values()) {
    if (!grouped[cookie.category]) grouped[cookie.category] = [];
    grouped[cookie.category].push(cookie);
  }

  return grouped;
}
