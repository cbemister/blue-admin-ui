# Changelog

## 2026-02-24 — Brand nav, dealer caching, dist build pipeline, minification

**Why:** Four independent improvements: (1) navigating between dealers in the same brand group requires reopening the palette every time — a `‹ [Dealer ▾] ›` widget in the breadcrumb makes this a one-click action; (2) the palette's dealer list was sourced from `#dealername select.selectpicker` which is unreliable and jQuery-dependent — needs rewriting against `#side-menu`; (3) the page flashes unstyled content briefly while UI features initialise; (4) other users sharing this SW had to manually update `d2c-sw.js` in their overrides folder on every SW change — a shim pattern eliminates this.

**What:**
- `brand-nav.js` (new): Brand navigation widget injected into the breadcrumb. Reads all dealers from `#side-menu > li[data-siteid]`, groups by brand via `SITE_BRAND` map (27 dealers: Stellantis=13, VW=7, Honda·Acura=5, Ford=2, BMW=2, MB=1). Renders `‹ [Dealer Name ▾] ›` — ‹/› arrows navigate to prev/next same-brand dealer, pill button opens dropdown listing all dealers in the group with the current one highlighted. Navigation via `/ajax/sitesRedirect?siteID=X&dest=PATH`. At 8 s idle, posts `prefetchDealer` messages to the SW for all other same-brand dealers at the current path.
- `palette.js`: Rewrote dealer data source from `#dealername select.selectpicker` (broken; jQuery-dependent) to `#side-menu > li`. Both `dealer` and `nav` command types now navigate via `sitesRedirect` URL directly instead of jQuery `.val().trigger('change')`.
- `index.js` + `stylesheet.js`: FOUC prevention — `body.d2c-loading{opacity:0}` applied immediately after `injectStyles()`; animated 3 px shimmer bar sits at the top of the page while builds run. After all build functions complete, posts `{type:'siteId', id}` to the SW controller, then swaps `d2c-loading` → `d2c-ready` which triggers a 250 ms CSS fade-in. Loader bar removed after 300 ms.
- `prefetch.js`: `fetch()` calls replaced with `<link rel="prefetch" as="document">` — browser treats these as background hints that do not keep the tab spinner running.
- `d2c-sw-impl.js` (new): Full SW logic (formerly in `d2c-sw.js`). Adds dealer-scoped HTML caching: `currentDealer` / `pendingDealer` vars; `message` listener handles `siteId` (set currentDealer) and `prefetchDealer` (fetch + cache another dealer's page); HTML pages cached under `/__d2c__/{siteID}{pathname}` key to prevent cross-dealer collisions. `sitesRedirect` requests intercepted to record `pendingDealer` before the redirect fires. HTML cache bumped to `d2c-admin-html-v2`.
- `d2c-sw.js` (now a shim): Replaced 208 lines of SW logic with a 5-line `importScripts(CDN dist/d2c-sw.js)`. Other users install this once and never need to manually update the SW again — logic auto-updates on every push.
- `build.js`: Added `buildLoader()` — reads `sitepagesaddedjs-platform.js` (D2C platform prefix, 454 lines) + minifies `devtools-loader.js` via `esbuild.transformSync` → `dist/sitepagesaddedjs.js`. Added `buildSW()` — minifies `d2c-sw-impl.js` → `dist/d2c-sw.js`; copies `devtools-loader.js` → `dist/devtools-loader.js`. esbuild bundle now outputs to `dist/d2c-enhancements.js` with `minify:true`. Watch mode includes `devtools-loader.js`, `sitepagesaddedjs-platform.js`, and `d2c-sw-impl.js`.
- `sitepagesaddedjs-platform.js` (new): First 454 lines of D2C's `sitepagesaddedjs.js` — the platform code prefix prepended by `buildLoader()`.
- `devtools-loader.js`: CDN URL updated from `src/js/d2c-enhancements.js` to `dist/d2c-enhancements.js`; header comment updated with all 4 DevTools overrides.
- `package.json`: Purge URL updated to `dist/d2c-enhancements.js`.
- `stylesheet.js`: Added `.button[style*="display:none"]` rule so platform-hidden buttons (e.g. `#btnAddContact` during update mode) are not wrongly forced visible by our `.button{display:inline-flex}` override. Tightened `.d2c-bc-dealer` padding; added `border-radius`.
- Hard links: All 4 chrome-overrides files hard-linked to project files so `npm run build`/watch updates flow through to Chrome instantly.
- Pre-push hook: Updated to stage and commit `dist/` files alongside source changes.

**Decision:** SW shim pattern (`importScripts`) means other users install a 5-line file once — all future SW logic changes deploy automatically via CDN with zero manual follow-up. `dist/` directory separates all build outputs from source for a clean boundary and a single place to hard-link all overrides. Minification at build time reduces CDN transfer: `d2c-enhancements.js` 93 KB minified, `d2c-sw.js` 3.3 KB, `devtools-loader.js` 1 KB. Brand nav uses `sitesRedirect` for navigation — same platform mechanism, no jQuery timing hacks. `prefetchDealer` posted at 8 s idle so prewarming never competes with normal page load.

**Files:**
- `src/js/modules/brand-nav.js` — new; brand nav widget + idle SW prefetch
- `src/js/modules/palette.js` — dealer source from `#side-menu`; `sitesRedirect` navigation
- `src/js/modules/index.js` — FOUC hide/show; `siteId` postMessage; `buildBrandNav()` call
- `src/js/modules/stylesheet.js` — brand nav CSS; FOUC/loader CSS; `.button` display fix; breadcrumb pill padding
- `src/js/modules/prefetch.js` — `fetch()` → `<link rel="prefetch">`
- `src/sw/d2c-sw.js` — 5-line `importScripts` shim
- `src/sw/d2c-sw-impl.js` — new; full SW logic with dealer-scoped HTML cache
- `src/js/sitepagesaddedjs-platform.js` — new; D2C platform JS prefix for `buildLoader()`
- `build.js` — `buildLoader()`, `buildSW()`, `minify:true`, `dist/` output, watch hooks
- `devtools-loader.js` — CDN URL → `dist/`; 4-override comment table
- `package.json` — purge URL → `dist/d2c-enhancements.js`
- `dist/d2c-enhancements.js`, `dist/d2c-sw.js`, `dist/devtools-loader.js`, `dist/sitepagesaddedjs.js` — build outputs; all minified; hard-linked to chrome-overrides

---

## 2026-02-24 — Holiday Hours widget restyled as collapsible card

**Why:** The Holiday Hours widget was rendered as a flat list directly in the right panel, which didn't match the card style of the TOC and other panel components. With more page-specific shortcut features planned, the panel also needed a clear section heading.

**What:**
- `holiday-hours.js`: restructured widget HTML — added `#d2c-hh-widget-header` (clickable, matching `.d2c-toc-header` pattern) and wrapped buttons + snap-info in `#d2c-hh-widget-body`. Inserted a `#d2c-shortcuts-label` divider element above the card. Collapse state (`d2c-hh-minimized` class) persisted to `localStorage` key `d2c-hh-collapsed`. Toggle indicator uses ▲ (open) / ▼ (collapsed).
- `stylesheet.js`: replaced flat `#d2c-hh-widget` padding/border-top rules with a card (`background`, `border`, `border-radius`, `box-shadow` matching `#d2c-section-toc`). Added `#d2c-hh-widget-header`, `#d2c-hh-widget-body`, `.d2c-hh-minimized` CSS. Added `#d2c-shortcuts-label` section heading style. Removed obsolete `.d2c-hh-widget-title` rules.

**Decision:** Card + collapsible header matches the TOC panel exactly — same DOM structure, same CSS variables, same ▲/▼ toggle convention. `#d2c-shortcuts-label` is a standalone element in the right panel (not inside the card) so it will naturally head any additional shortcut cards added for other pages in future.

**Files:**
- `src/js/modules/holiday-hours.js` — card HTML, Shortcuts label, collapse toggle with localStorage
- `src/js/modules/stylesheet.js` — card CSS; removed old flat widget styles

---

## 2026-02-24 — Accordion sections, TOC active state, audit log integration

**Why:** Three independent UX issues: (1) expanding a section left all other sections open, making long pages harder to navigate; (2) the TOC active-link highlight used `IntersectionObserver` which kept a collapsed section's header highlighted if it was still in the viewport; (3) the "All changes saved" toast was redundant once the audit log panel started showing save history inline.

**What:**
- `lazy-sections.js`: added accordion behavior — when an h2 section is expanded, all other open h2 sections are collapsed. Uses a `_skipSave` guard to prevent the programmatic `click()` calls from redundantly writing to `localStorage`. Fixed the open/close direction check: the native click handler toggles the class before our listener fires, so the condition is now inverted (`!closed` → expand).
- `toc.js`: replaced `IntersectionObserver` with `MutationObserver` on each section's `class` attribute. TOC entry is highlighted when the section's `closed` class is absent (i.e. it is open), not when its header is in the viewport. Added `syncActive()` call on init to set the correct state immediately.
- `save-indicator.js`: removed the "All changes saved" success toast. On XHR success, the spinner hides immediately and `addAuditEntry()` is called — the audit panel becomes the sole save confirmation. Imports `addAuditEntry` from `audit-log.js`.
- `.gitignore`: added `.github/` so the skills folder is not pushed.

**Decision:** Accordion is implemented via programmatic `click()` rather than direct class manipulation so the platform's own expand/collapse handlers (image lazy-load, etc.) still fire correctly. `MutationObserver` on class changes is more reliable than `IntersectionObserver` for open/closed state because visibility and open state are independent — a section can be visible but closed.

**Files:**
- `src/js/modules/lazy-sections.js` — accordion on h2 section expand
- `src/js/modules/toc.js` — MutationObserver active-link highlight
- `src/js/modules/save-indicator.js` — success path calls `addAuditEntry()`, removes toast
- `.gitignore` — ignore `.github/` skills folder

---

## 2026-02-24 — Holiday Hours workflow for General page

**Why:** Seasonal schedule changes (e.g. Christmas Eve, statutory holidays) require updating hours across all 6 departments simultaneously. Previously this required opening each department section individually, editing 7 rows each, and saving — error-prone and time-consuming. There was also no way to revert to normal hours after the holiday without repeating the same manual process.

**What:**
- `holiday-hours.js` (new): Right-panel widget on `/sites/general` only. Three buttons — Save Snapshot (captures all 42 hour fields to `localStorage`), Edit (opens day-centric modal editor), and Restore Snapshot (applies snapshot back to DOM).
  - **Snapshot storage key:** `d2c-hours-snapshot:{siteId}` where `siteId` is `#currentSiteID.value` — per-dealership isolation.
  - **Modal editor:** Day-selector dropdown picks a day; table shows all 6 departments' open/close fields for that day with enable/disable checkboxes. Apply button writes values to the page via `syncSelectpicker()`.
  - **Save confirmation modal:** After saving, `showInfoModal()` displays a compact dept×day summary grid so the user can verify what was captured.
  - **Restore diff modal:** Before restoring, shows a before/after diff of only the changed dept/day rows, replacing the native `confirm()` dialog.
- `stylesheet.js`: CSS for widget, editor modal, `#d2c-hh-info-overlay` confirmation modal, and all `.d2c-hh-diff-*` table classes. Removed `overflow-x:auto` from `h2.expandablesection+div` and `h5.expandablesection+div` to fix Bootstrap-select dropdown clipping.
- `index.js`: imports `buildHolidayHours` and calls it inside `onReady()`.
- `audit-log.js`: `AUDIT_PATH_MAP['general']` changed from `'/'` to `'/#footerWrapper'` so save-history QC links land at the hours section on the public dealership site.

**Decision:** Snapshot stored in `localStorage` (not sessionStorage or a server call) — survives page reloads, costs nothing, and is scoped per dealer so two tabs on different dealers don't interfere. Day-centric modal was chosen over a full 7-day grid editor because it keeps the viewport height manageable and matches how holiday exceptions are actually applied (one day at a time). Custom `showInfoModal()` was built instead of using a third-party dialog library to keep the bundle self-contained and match existing modal styling.

**Files:**
- `src/js/modules/holiday-hours.js` — new module; full Holiday Hours workflow
- `src/js/modules/stylesheet.js` — widget/modal CSS; overflow clipping fix
- `src/js/modules/index.js` — import + call for `buildHolidayHours()`
- `src/js/modules/audit-log.js` — General page audit link now anchors to `#footerWrapper`

---

## 2026-02-24 — DevTools CDN override replaces localhost dev server

**Why:** The localhost HTTP server approach (`serve.js` / `npm run dev`) was broken — Chrome's Service Worker was intercepting the `http://localhost:8765` fetch and failing with `TypeError: Failed to convert value to 'Response'` because the SW's catch handlers could return `null` or `undefined` when both cache and network failed, and `event.respondWith()` cannot accept a non-Response value. Even when the localhost error was swallowed, the CDN fallback hit the same SW bug. Additionally, iterating quickly via push → CDN purge → test was hitting jsDelivr rate limits.

**What:**
- `devtools-loader.js`: removed the `fetch()` + blob URL localhost workaround entirely. Replaced with a plain `<script src="cdn.jsdelivr.net/...">` tag. Chrome's DevTools Local Overrides intercept that CDN request before it hits the network, so the 3rd override (below) makes local dev work without a server.
- `src/sw/d2c-sw.js`: removed the stale-while-revalidate cache block for `d2c-enhancements.js` — the SW now passes it through unconditionally so the DevTools override is always served fresh and rebuilt changes appear on the next page reload without a cache eviction. Fixed three catch handlers that returned `undefined` or `null` (HTML, `resource.loader.php`, and generic cache-first strategies) — all now return a `503` Response, preventing `TypeError: Failed to convert value to 'Response'`. Added missing `localhost` skip guard that was present in working copy but not committed.
- `serve.js`, `dev.js`: deleted — no longer needed.
- `CLAUDE.md`, `README.md`: documented the 3-override dev setup and the Windows hard link required to keep the CDN override file in sync with `npm run watch` rebuilds.

**Decision:** A DevTools Local Override for the CDN URL is strictly simpler than a local HTTP server: no Chrome Private Network Access policy to work around, no CORS preflight, no server process to start, no rate-limit ceiling. The hard link (`New-Item -ItemType HardLink`) makes the override file and the build output the same inode on disk, so `npm run watch` rebuilds flow through to the browser with zero extra steps. Removing the SW cache for `d2c-enhancements.js` is safe — the file is small (~70 KB), CDN latency is negligible, and caching it was causing confusion during development regardless.

**Files:**
- `devtools-loader.js` — simplified script loader; updated header docs with 3-override table
- `src/sw/d2c-sw.js` — CDN script pass-through; catch handler bug fixes; localhost guard committed
- `CLAUDE.md` — new Local Development Workflow section
- `README.md` — 3rd override row, hard link setup instructions, updated dev loop

---

## 2026-02-23 — Fix build-date injection, bust SW cache

**Why:** The browser was throwing `ReferenceError: __BUILD_DATE__ is not defined` because the Service Worker had cached an old version of `d2c-enhancements.js` where esbuild's `define` substitution had not run. Cache-first strategy on the CDN asset meant the broken version was served indefinitely regardless of subsequent fixes pushed to GitHub.

**What:**
- `build.js`: removed `define: { __BUILD_DATE__: ... }` from esbuild config. Before running esbuild, the script now writes `src/js/modules/build-date.js` — a plain JS module containing `export var BUILD_DATE = "YYYY-MM-DD HH:MM";`. esbuild bundles this as a normal import, producing a regular string literal in the output with no magic token substitution.
- `help-button.js`: replaced `/* global __BUILD_DATE__ */ var BUILD_DATE = __BUILD_DATE__;` with `import { BUILD_DATE } from './build-date.js';`.
- `d2c-sw.js`: bumped `CACHE_NAME` from `d2c-admin-v2` to `d2c-admin-v3` — forces the SW to delete the old cache (containing the broken bundle) on next activation.
- `d2c-sw.js`: added stale-while-revalidate strategy for `cdn.jsdelivr.net/…/d2c-enhancements.js` — serves cached version instantly while always fetching a fresh copy in the background. Prevents the same stale-cache trap on future pushes.

**Decision:** The `define` approach was replaced rather than patched because it fails silently at the source level (if `build.js` doesn't run, the token reaches the browser as an identifier). A generated module fails loudly and locally (missing file = build error) and the substitution is just a normal string literal in the bundle — nothing that can be bypassed by a stale cache. The SW cache bump was the fastest way to unblock the immediate error; stale-while-revalidate on the CDN script prevents recurrence.

**Files:**
- `build.js` — writes `build-date.js` module before bundling; `define` removed
- `src/js/modules/help-button.js` — imports `BUILD_DATE` from `./build-date.js`
- `src/js/modules/build-date.js` — AUTO-GENERATED by build.js; not edited manually
- `src/sw/d2c-sw.js` — CACHE_NAME bumped to v3; stale-while-revalidate for CDN script

---

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
