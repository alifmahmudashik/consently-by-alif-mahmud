# Consently

A free, open source cookie consent banner builder by [Alif Mahmud](https://alifmahmud.com). Design it visually, preview it live, and export a copy‑paste snippet — no backend, no account, no per-site fees.

It's two things in one repo:

- **The builder** (`src/` React app) — a visual editor with a live preview for configuring colors, position, copy, languages, and cookie categories.
- **The runtime** (`src/runtime/`) — a small framework-agnostic (vanilla JS/CSS) engine that actually renders the banner on your website. It's what the builder's snippet points to.

## Highlights

- **5 layouts**: center modal, top bar, bottom bar, bottom-left, bottom-right.
- **Full theming**: colors, corner radius, font, logo — all live in the preview.
- **Multi-language**: add as many languages as you want; visitors get the one matching their browser, with an optional switcher in the banner.
- **Automatic cookie scanning**: the runtime reads `document.cookie` on your live site and matches names against a bundled ~2,200-entry open cookie database (`public/cookie-db.json`) to auto-categorize and describe them — no server round-trip.
- **Manual cookie overrides**: declare cookies that can't be auto-detected (httpOnly, server-set, or added later by a third-party script); these always show and take priority over the automatic scan.
- **Google Consent Mode v2**: optional `dataLayer`/`gtag` consent signal integration for GA4 / GTM.
- **No backend required**: everything ships as static files — deploy the builder and the runtime bundle to Cloudflare Pages (or any static host) and you're done.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Configure your banner in the left sidebar; the right panel is a live, sandboxed preview (an iframe) that renders the *actual* runtime engine — not a mockup.

## Building for deployment

```bash
npm run build
```

This produces `dist/`:

```
dist/
  index.html, assets/...     # the builder app
  cookie-db.json             # the cookie database, served statically
  runtime/
    consent-banner.js        # the standalone embeddable banner engine
    consent-banner.css
```

Deploy `dist/` as-is to Cloudflare Pages (or Netlify, Vercel, GitHub Pages, S3 — any static host). Build command: `npm run build`, output directory: `dist`.

## Embedding the banner on a website

The **Export** tab in the builder generates this for you — copy it as-is or point `Runtime base URL` at wherever you host `runtime/`:

```html
<link rel="stylesheet" href="https://your-domain/runtime/consent-banner.css" />
<script src="https://your-domain/runtime/consent-banner.js"></script>
<script>
  window.addEventListener("DOMContentLoaded", function () {
    ConsentBanner.init({ /* your exported config */ });
  });
</script>
```

Paste it before `</body>` on every page. No build step required on the consuming site.

### Runtime API

```js
ConsentBanner.init(config); // mount the banner
ConsentBanner.getInstance().show(); // reopen it later (e.g. from a footer link)
ConsentBanner.getInstance().reset(); // clear stored consent and show again
ConsentBanner.getInstance().getConsent(); // { functional: true, analytics: false, ... }
```

You can also set `behavior.reopenTriggerSelector` in the config (e.g. `"#cookie-settings"`) so any matching element on the page reopens the preferences dialog automatically.

## Project structure

```
src/
  runtime/          framework-agnostic banner engine (types, DOM, CSS, scanner, i18n, consent mode)
  runtime/embed.ts  library entry point — bundled separately into dist/runtime/
  preview/          postMessage-based bridge used by the builder's live preview iframe
  store/            zustand config store (persisted to localStorage)
  components/       builder UI (panels, preview frame, form primitives)
  lib/               snippet generation, file download helpers
public/
  cookie-db.json    trimmed open cookie database used for auto-categorization
  preview.html       the iframe harness the builder's preview loads
scripts/
  prepare-cookie-db.mjs  regenerates public/cookie-db.json from a source export
```

The runtime has its own Vite build (`vite.runtime.config.ts`) so it ships as a small standalone bundle, independent of the React builder app.

## Regenerating the cookie database

If you have a newer/larger cookie database export (same shape as [Cookiebot](https://www.cookiebot.com/)'s: `data_key`, `category`, `data_controller`, `description`, `retention_period`, `wildcard_match`, ...):

```bash
node scripts/prepare-cookie-db.mjs /path/to/source-cookie.json
```

## Limitations & notes

- Automatic scanning only sees cookies readable via `document.cookie` (i.e. not `HttpOnly`). Use manual entries for anything else.
- The builder's live preview scans cookies on the *builder's own page*, not an arbitrary target site — that's a browser sandboxing limitation, not a bug. Manually-declared cookies always show correctly in the preview regardless.
- This tool helps you build and manage a consent UI; it doesn't constitute legal advice. Review your categories, retention periods, and copy against the regulations that apply to you (GDPR, ePrivacy, CCPA, etc.).

## License

MIT — see [LICENSE](LICENSE).
