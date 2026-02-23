# Changelog

## 2026-02-23 — SW cache normalization, section header controls

**Why:** The Service Worker was accumulating redundant cache entries — every reload of `resource.loader.php` used a fresh `cb=` timestamp as the cache key, and every image URL with a `?t=` cache-buster created a separate entry for the same underlying file. Separately, checkboxes and position-select dropdowns embedded inside expandable section headers were triggering a section toggle when clicked, and collapsed sections showed those controls as phantom click targets with no styling.

**What:**
- `d2c-sw.js`: added `normalizeResourceLoaderUrl()` — strips the `cb=` cache-buster and switches `resource.loader.php` from cache-first to stale-while-revalidate so JS bundle updates (pushed without a `v=` bump) are picked up in the background. Added `normalizeAssetUrl()` — strips `?t=<digits>` from image/asset URLs so the same file resolves to a single cache entry regardless of timestamp. Refactored the fetch handler to open the cache once per request and pass the normalized key to both `cache.match()` and `cache.put()`.
- `index.js`: removed redundant `navigator.serviceWorker.register()` call (SW registration already happens in `devtools-loader.js`). Moved all `build*()` calls from an idle-deferred closure to run immediately inside `onReady()` — UI features are visible work, not background work. Only `prefetchSections` keeps idle deferral (timeout raised to 6 s).
- `lazy-sections.js`: PAGE_DEFAULTS is now Priority 1 (wins over localStorage). Previously it was a fallback for first visits; now it always overrides saved state on configured pages. Added `stopPropagation` on `click` and `change` for checkboxes and `<select>` elements inside section headers, preventing the header click handler from toggling the section when a control is interacted with.
- `stylesheet.js`: added CSS for controls embedded in section headers — `input[type="checkbox"]` and `select` inside `.expandablesection.closed` are hidden; open-section styles for both (white accent, dark background for selects, focus ring, flex alignment).
- `devtools-loader.js`: added `window._d2cLoaderRan` double-execution guard — `sitepagesaddedjs.js` is loaded twice on some pages and previously ran the full init twice.
- `README.md`: clarified that the `d2c-sw.js` Local Override is optional; without it everything works but there is no caching speedup.

**Decision:** Stale-while-revalidate for `resource.loader.php` was chosen over cache-first because D2C pushes bundle updates by bumping `cb=` without changing `v=`, so cache-first would serve stale JS indefinitely. The normalized key (no `cb=`) lets the cache entry persist across reloads while the background fetch keeps it current. Stripping `t=` from asset URLs uses a conservative regex (`/^\d+$/`) to avoid accidentally stripping meaningful query params. Moving UI init to `onReady` immediate was safe because DOM is already parsed at that point; the previous idle-defer was unnecessary and caused a visible delay before controls (TOC, breadcrumb, etc.) appeared.

**Files:**
- `src/sw/d2c-sw.js` — SW cache normalization: cb= stale-while-revalidate, t= asset dedup
- `src/js/modules/index.js` — immediate UI init, redundant SW registration removed
- `src/js/modules/lazy-sections.js` — PAGE_DEFAULTS priority 1, header control stopPropagation
- `src/js/modules/stylesheet.js` — CSS for section header checkboxes and selects
- `devtools-loader.js` — double-execution guard
- `README.md` — SW override marked as optional

---

## 2026-02-23 — Button fixes, earlier image deferral, SW guard

**Why:** Action buttons in the full-width layout were pushed off-screen by an inline `margin-right:20%` that D2C injects. Image lazy-deferral was running too late (inside `onReady`), giving the browser time to start prefetching deferred images before their `src` was removed. The Service Worker's fetch handler could throw on non-HTTP URLs injected by browser extensions.

**What:**
- `stylesheet.js`: refined `.button`/`.buttonSmall` sizing — padding `8px 20px` → `6px 16px`, font-weight `600` → `500`, added `white-space:nowrap`. Added `#content input.buttonSmall[style]{margin-right:0!important}` to neutralise the inline `margin-right:20%` D2C applies to action buttons in full-width mode.
- `index.js`: moved `buildLazySections()` from inside `onReady()` to a direct `DOMContentLoaded` listener (or sync call if DOM is already parsed), so image `src` removal happens as early as possible before browser prefetch kicks in.
- `d2c-sw.js`: added a protocol guard — skip fetch events for non-HTTP/HTTPS schemes (`chrome-extension://`, `data:`, `blob:`, etc.) that would previously throw.
- `devtools-loader.js`: added a `.then()` log to SW registration reporting active state and controller presence, making it easier to confirm the SW is running during development.

**Decision:** Moving `buildLazySections()` earlier is safe because it only reads DOM state — it has no dependency on header measurement or any other `onReady` work. The `#content input.buttonSmall[style]` rule uses an attribute selector to target only elements that carry an inline `style` attribute, so it won't affect buttons that haven't been touched by D2C's inline styles. The SW protocol guard follows the standard Chrome SW pattern for avoiding errors from extension-injected fetch events.

**Files:**
- `src/js/modules/stylesheet.js` — button sizing and inline margin override
- `src/js/modules/index.js` — buildLazySections moved to DOMContentLoaded
- `src/sw/d2c-sw.js` — non-HTTP protocol guard
- `devtools-loader.js` — SW registration debug logging
- `src/js/d2c-enhancements.js` — build output (do not edit directly)

---

## 2026-02-23 — Help button, build timestamp, page defaults

**Why:** There was no visible indicator of which version of the enhancement script was running, making it impossible to confirm a new build had gone live. On first visit to a page every section was collapsed with no hint of where to start, and there was a brief flash of all sections expanded before `buildLazySections()` ran.

**What:**
- Added `src/js/modules/help-button.js` — `buildHelpButton()`: injects a `#d2c-help-btn` widget into `#topRight` containing a build-date badge (`#d2c-version-badge`) and a dropdown (`#d2c-help-dropdown`) listing keyboard shortcuts and active features. Hides the native `#needHelp` button and replaces it. Dropdown closes on any outside click.
- Added `build.js` — custom esbuild build script that captures the current local timestamp and injects it as `__BUILD_DATE__` (an esbuild `define`) at bundle time. Updated `package.json` `build` and `watch` scripts from inline esbuild CLI to `node build.js` / `node build.js --watch`.
- Updated `src/js/modules/lazy-sections.js`: added `PAGE_DEFAULTS` config map (per-page, per-path) so a specific section auto-opens on first visit before any saved state exists. Supports a simple string match or a `['parent', 'child']` array for nested sections. Added `openDefault()`, `findByText()`, and `openSection()` helpers. The `finally` block now removes the `#d2c-precollapse` style element after setup.
- Updated `devtools-loader.js`: synchronously injects a `#d2c-precollapse` `<style>` element before first paint that hides all section content (`#content .expandablesection+div, …+table`). Eliminates the flash of expanded sections before `buildLazySections()` fires. A 5 s safety timeout and an `onerror` handler on the CDN `<script>` remove the style if the enhancement script never loads.
- Updated `src/js/modules/stylesheet.js`: replaced broad `nav.navbar .btn.btn-primary` overrides (which over-reached) with a targeted `#needHelp,li:has(#needHelp){display:none!important}` rule; removed erroneous `!important` from `.button{display:inline-flex}`; added CSS for all `#d2c-help-btn` components.

**Decision:** The pre-collapse style must live in `devtools-loader.js` (not in the enhancement module) because the CDN `<script>` is async — there is a ~200–500 ms window between page parse and script execution where the page's own CSS renders all sections open. Injecting the hide rule synchronously in the loader eliminates this gap. The 5 s timeout and `onerror` path prevent permanent content loss if the CDN is unreachable. `__BUILD_DATE__` is injected by the build script at bundle time (not hardcoded) so the version badge is always accurate without a manual update step.

**Files:**
- `src/js/modules/help-button.js` — help button, version badge, keyboard shortcut dropdown
- `build.js` — esbuild script that injects `__BUILD_DATE__` define
- `package.json` — build/watch scripts now use `node build.js`
- `devtools-loader.js` — pre-collapse style injection + 5 s safety timeout
- `src/js/modules/lazy-sections.js` — PAGE_DEFAULTS, openDefault(), findByText(), openSection(), pre-collapse cleanup
- `src/js/modules/stylesheet.js` — help button CSS, #needHelp hide, .button fix
- `src/js/modules/index.js` — imports buildHelpButton()
- `src/js/d2c-enhancements.js` — build output (do not edit directly)

---

## 2026-02-23 — Lazy sections, prefetch, and SW HTML caching

**Why:** Page loads on `/sites/*` pages were slow in two ways: all expandable sections rendered (and fetched images for) every section at once, and navigating between admin sections still required a full network round-trip despite the SW already caching assets.

**What:**
- Added `src/js/modules/lazy-sections.js` — `buildLazySections()`: collapses all sections on load and removes `src` from images in collapsed sections (cancelling in-flight requests). Saves the last-open section ID to `localStorage` per page-path and auto-expands + scrolls to it on the next visit. Images in a section are restored when the user opens it.
- Added `src/js/modules/prefetch.js` — `prefetchSections()`: at browser-idle time, fetches every unique `/sites/*` link from the nav bar (excluding the current page) so the SW can populate its HTML cache. On the next visit, the stale-while-revalidate handler serves the page instantly.
- Updated `src/sw/d2c-sw.js`: added a stale-while-revalidate strategy for same-origin HTML pages (new `HTML_CACHE_NAME = 'd2c-admin-html-v1'`). Serve cached HTML immediately, update the cache in the background. Changed the opaque-response guard from `response.type !== 'basic'` to `response.type === 'opaque'` so CORS asset responses (CDN files with proper headers) are now cached. Bumped asset cache name to `d2c-admin-v2` to invalidate the old cache on activate.
- Updated `src/js/modules/index.js`: imports and calls `buildLazySections()` (critical path, before idle defer) and `prefetchSections()` (deferred).
- Added `.claude/` to `.gitignore`.

**Decision:** Lazy image deferral via `img.removeAttribute('src')` works in Chrome because removing the attribute cancels the in-flight network request — no MutationObserver or IntersectionObserver needed. The prefetch + SW stale-while-revalidate combination was chosen over `<link rel="prefetch">` because the SW handler ensures the cached response is actually used on navigation, whereas link-prefetch only warms the browser's HTTP cache, which may be bypassed.

**Files:**
- `src/js/modules/lazy-sections.js` — section collapse, image deferral, localStorage session memory
- `src/js/modules/prefetch.js` — idle-time prefetch of /sites/* nav links
- `src/js/modules/index.js` — imports both new modules
- `src/sw/d2c-sw.js` — stale-while-revalidate HTML strategy, CORS asset caching, cache v2
- `src/js/d2c-enhancements.js` — build output (do not edit directly)
- `.gitignore` — added `.claude/`

---

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
