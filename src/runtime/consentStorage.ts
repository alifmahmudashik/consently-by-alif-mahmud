import type { ConsentState, StoredConsent } from "./types";

function storageKey(configId: string): string {
  return `ocb_consent__${configId}`;
}

export function loadConsent(configId: string): StoredConsent | null {
  try {
    const raw = localStorage.getItem(storageKey(configId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed || parsed.version !== 1) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(configId: string, categories: ConsentState, expiryDays: number): StoredConsent {
  const record: StoredConsent = {
    version: 1,
    savedAt: Date.now(),
    expiresAt: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    categories,
  };
  try {
    localStorage.setItem(storageKey(configId), JSON.stringify(record));
  } catch {
    // storage unavailable (private mode / quota) — consent still applies for this pageview
  }
  return record;
}

export function clearConsent(configId: string): void {
  try {
    localStorage.removeItem(storageKey(configId));
  } catch {
    // ignore
  }
}

export function loadLanguagePreference(configId: string): string | null {
  try {
    return localStorage.getItem(`ocb_lang__${configId}`);
  } catch {
    return null;
  }
}

export function saveLanguagePreference(configId: string, code: string): void {
  try {
    localStorage.setItem(`ocb_lang__${configId}`, code);
  } catch {
    // ignore
  }
}
