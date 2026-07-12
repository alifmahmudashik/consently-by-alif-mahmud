// One-off script: trims the source cookie database down to the fields the
// runtime scanner actually needs, dedupes rows, and writes it into public/
// so it ships as a static asset (no backend involved).
//
// Usage: node scripts/prepare-cookie-db.mjs <path-to-source-cookie.json>

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Usage: node scripts/prepare-cookie-db.mjs <path-to-source-cookie.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(sourcePath), "utf-8"));

const seen = new Set();
const trimmed = [];

for (const row of raw) {
  const key = `${row.data_key}::${row.data_controller}::${row.domain || ""}`;
  if (seen.has(key)) continue;
  seen.add(key);

  trimmed.push({
    key: row.data_key,
    category: (row.category || "unknown").toLowerCase(),
    controller: row.data_controller || "",
    platform: row.platform || "",
    domain: row.domain || "",
    description: row.description || "",
    retention: row.retention_period || "",
    portal: row.privacy_rights_portals || "",
    wildcard: !!row.wildcard_match,
  });
}

const outPath = resolve("public/cookie-db.json");
writeFileSync(outPath, JSON.stringify(trimmed));

console.log(`Wrote ${trimmed.length} entries (from ${raw.length}) to ${outPath}`);
