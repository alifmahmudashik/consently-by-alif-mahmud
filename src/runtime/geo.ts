// EU/EEA-only consent targeting without any external geo-IP API or network call: the browser's
// own IANA timezone (`Intl`) is a free, zero-latency, no-consent-needed signal that's a solid proxy
// for "is this visitor plausibly in Europe" — good enough for defaulting behavior, not a legal geofence.

// A handful of "Europe/*" zones are NOT EU/EEA (Russia, Belarus, Turkey) — exclude them explicitly.
const EUROPE_PREFIX_EXCLUDE = new Set([
  "Europe/Moscow",
  "Europe/Kirov",
  "Europe/Volgograd",
  "Europe/Samara",
  "Europe/Saratov",
  "Europe/Ulyanovsk",
  "Europe/Astrakhan",
  "Europe/Kaliningrad",
  "Europe/Minsk",
  "Europe/Istanbul",
]);

// EEA territories that don't use the "Europe/" prefix.
const EEA_EXTRA_ZONES = new Set(["Atlantic/Reykjavik", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Canary", "Atlantic/Azores"]);

/**
 * Returns true if the visitor's timezone looks European (EU/EEA/UK), false if it clearly doesn't,
 * or null if the timezone couldn't be read at all (very old browsers, locked-down environments).
 */
export function isLikelyEuropeVisitor(): boolean | null {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return null;
    if (EEA_EXTRA_ZONES.has(timeZone)) return true;
    if (timeZone.startsWith("Europe/")) return !EUROPE_PREFIX_EXCLUDE.has(timeZone);
    return false;
  } catch {
    return null;
  }
}
