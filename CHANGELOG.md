# Changelog

## 2026-02-23 — Service Worker for repeat-visit performance

**Why:** Every page load on `admin.d2cmedia.ca` fetched the full set of JS bundles, stylesheets, images, and fonts from the network — roughly 11 s on a warm connection. There was no caching layer in place.

**What:**
- Added `src/sw/d2c-sw.js` — a Service Worker that uses a cache-first strategy for JS, CSS, images, and fonts. On first load it populates the cache; all subsequent loads serve assets from local disk (~1–2 s LCP).
- The SW also intercepts requests to `use.fontawesome.com` and returns an empty 200, blocking four redundant external font requests (~1.2 s saving on each page load) since the admin panel already serves woff2 locally.
- AJAX endpoints, Google Analytics, HTML page responses, and session management URLs are always bypassed — dynamic data is never cached.
- Updated `devtools-loader.js` to register the SW via `navigator.serviceWorker.register('/d2c-sw.js')` on every page.
- Added a pathname guard in `src/js/modules/index.js`: the enhancement features (styles, TOC, palette, etc.) only initialise on `/sites/*` URLs (or localhost). The SW registration runs outside this guard so caching applies to all admin pages, not just site pages.

**Decision:** A DevTools Local Override for `admin.d2cmedia.ca/d2c-sw.js` makes the SW available without touching the server. The override maps the 404 URL to the local file — Chrome creates the override path when you "Save for overrides" on that URL. Cache-first was chosen over stale-while-revalidate because the assets are all content-hashed; they never change at the same URL, so staleness is not a concern.

**Files:**
- `src/sw/d2c-sw.js` — Service Worker: cache-first asset caching + FontAwesome blocking (not built by esbuild — edit directly)
- `devtools-loader.js` — updated to register the Service Worker; requires a second DevTools override for `admin.d2cmedia.ca/d2c-sw.js`
- `src/js/modules/index.js` — added `/sites/*` pathname guard; SW registration moved above the guard

---

## 2026-02-23 — CDN loader architecture

**Why:** The full enhancement script was pasted directly into the DevTools override for `sitepagesaddedjs.js`. Every change required manually updating the override file in DevTools, which doesn't persist easily across machines.

**What:** Moved the script to GitHub (`cbemister/blue-admin-ui`), served via jsDelivr CDN. The DevTools override now contains only a tiny loader that fetches the real script from CDN. Edits to `src/js/d2c-enhancements.js` go live after a push + jsDelivr cache purge.

**Decision:** Considered Tampermonkey userscript as an alternative (simpler for end users, no DevTools needed). Kept the loader approach for the primary workflow since DevTools overrides are already in place. A `d2c-enhancements.user.js` Tampermonkey wrapper can be added later for distribution to other users.

**Files:**
- `devtools-loader.js` — the DevTools override file (maps to `admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js`)
- `src/js/d2c-enhancements.js` — full enhancement script, hosted on GitHub/jsDelivr

---

## 2026-02-23 — Save indicator reliability fix

**Why:** The save status notification was cycling through states (saving → saved → error) without any save action being triggered. Background AJAX calls to `/ajax/` endpoints were being picked up by the jQuery AJAX hooks unrelated to saving.

**What:** Replaced URL-based AJAX filtering with a click-arm pattern. A capture-phase click listener sets a `d2cSaveArmed` flag when a save button is clicked. The flag is consumed on the next POST `ajaxSend`, and only that specific XHR object is tracked through `ajaxSuccess`/`ajaxError`. All other AJAX traffic is ignored.

**Decision:** Earlier attempt used a MutationObserver on `#saveLockScreen` alongside jQuery AJAX hooks — removed because both fired for the same save event, causing rapid state flashing. The click-arm approach is the minimal reliable solution without requiring knowledge of the specific save endpoint URLs.

---

## 2026-02-23 — Right-side panel layout (#d2c-right-panel)

**Why:** The floating save button (`position:fixed; bottom:24px; right:16px`) felt visually disconnected and contrasted awkwardly with the section TOC panel above it.

**What:** Introduced `#d2c-right-panel`, a fixed flex-column container that holds both the TOC and save button as stacked children. The container owns the fixed positioning; the children use normal flow. TOC gets `flex:1` (scrollable, fills available space), save button gets `flex-shrink:0` (always visible at bottom). A `getRightPanel()` lazy helper creates the container on first use so either component can initialise independently.

**Decision:** Considered a visual separator bar between page content and the save button. Rejected in favour of grouping with the TOC since they're both contextual right-side navigation aids.

---

## 2026-02-23 — Header UI improvements

**Why:** The dealership domain link in the header was easy to miss, and the search button looked like a form input rather than a navigation affordance.

**What:**
- **Dealer domain** (`#header_website_link a`): styled as a navy rounded pill badge (font-weight 700, white text, `background: var(--d2c-navy)`) so the active site is immediately obvious.
- **Search button** (`#d2c-search-hint > a`): removed border and background, left only the search icon and `Ctrl+K` badge. Transparent until hover.

---

## 2026-02-23 — Initial enhancement script

**Why:** `admin.d2cmedia.ca` is a third-party admin panel with no source access. UI improvements can only be applied via Chrome DevTools Local Overrides (CSS/JS file replacement) or Tampermonkey.

**What:** Single-file approach — `src/js/d2c-enhancements.js` injects all CSS via a `<style>` tag and adds all JS enhancements on `DOMContentLoaded`. No separate CSS override file needed. Features implemented:

1. `measureHeader()` — sets `--header-height` CSS variable dynamically for sticky positioning
2. `autoCollapseSections()` — collapses all expandable H2 sections on first load
3. `buildSectionTOC()` — floating right-side panel with jump links to all sections
4. `buildCompactHeader()` — slim fixed bar showing dealer/page name on scroll
5. `buildPalette()` / `openPalette()` — Ctrl+K command palette for section navigation
6. `buildSaveIndicator()` — floating save status tied to save button clicks
7. `buildScrollTop()` — scroll-to-top button

**Decision:** CSS is injected from JS rather than using a separate DevTools CSS override. This keeps everything in one file and avoids the hashed CSS bundle filenames (`resource.l-*.css`) which could change on deploy.

---

## 2026-02-23 — Modularised JS with esbuild

**Why:** `src/js/d2c-enhancements.js` grew to ~1000 lines in a single IIFE. Every feature lived in one file, making navigation slow and diffs noisy.

**What:** Split into ES modules under `src/js/modules/` (one file per feature). esbuild compiles them back into a single IIFE bundle at the same output path, so the CDN URL and DevTools override are unchanged.

| Module | Exports |
|--------|---------|
| `stylesheet.js` | `injectStyles()` — full CSS array |
| `utils.js` | `onReady`, `measureHeader`, `escHtml`, `getRightPanel` |
| `toc.js` | `buildSectionTOC()` |
| `dealer-nav.js` | `buildDealerNav()` |
| `breadcrumb.js` | `buildBreadcrumb()` |
| `palette.js` | `buildPalette()`, `openPalette()` |
| `save-indicator.js` | `buildSaveIndicator()` |
| `search-hint.js` | `buildSearchHint()` |
| `scroll-top.js` | `buildScrollTop()` |
| `floating-save.js` | `buildFloatingSave()` |
| `index.js` | Entry point — guard, imports all, runs init |

**Build commands:** `npm run build` (one-shot) · `npm run watch` (rebuild on save)

**Decision:** esbuild was chosen for zero-config, sub-second builds and native `--watch` support. Build output (`src/js/d2c-enhancements.js`) is committed to the repo so jsDelivr can serve it without a CI pipeline. A pre-push git hook rebuilds automatically before every push.

---

## 2026-02-23 — Header website link hidden

**Why:** `#header_website_link` contains both the dealer domain pill and the "Need help?" anchor. The domain link duplicates info already visible in the breadcrumb; the help link is rarely used. Both added visual clutter to the already-busy top bar.

**What:** Single CSS rule — `#header_website_link { display: none !important }`. Replaced the previous six rules that individually styled `#globe_website_link` and `#header_website_link a:not(#globe_website_link)`.

**Decision:** Hiding the entire container is simpler and more robust than hiding children individually. If the help link is ever needed it can be restored by targeting just `#needHelp`.
