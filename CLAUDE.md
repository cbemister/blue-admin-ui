# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What This Project Is

A Chrome DevTools Local Overrides enhancement layer for `admin.d2cmedia.ca` — a dealership management admin panel. There is **no source access** to the admin panel itself. All changes are applied by overriding CSS and JS files the browser loads, or via a Tampermonkey userscript.

## Build System

This project uses **esbuild** to bundle ES modules and produce all distributable files in `dist/`.

```bash
npm install          # install esbuild (one-time)
npm run build        # one-shot: bundle → dist/d2c-enhancements.js
                     #           buildLoader → dist/sitepagesaddedjs.js
                     #           buildSW → dist/d2c-sw.js + dist/devtools-loader.js
npm run watch        # rebuild all dist/ files on every save (use during development)
```

> **Node requirement:** System Node must be v20+. If the system Node is older, use the portable binary at `C:\Users\cbemister\node-portable\node-v20.10.0-win-x64\node.exe`.

A **pre-push git hook** (`.git/hooks/pre-push`) runs `npm run build` automatically before every push and commits updated `dist/` files if they changed.

**Never edit files in `dist/` directly** — they are build outputs. Edit source files instead.

## Local Development Workflow

All four DevTools Local Overrides must be active (Sources → Overrides → Enable Local Overrides):

| Remote URL | Local file |
|-----------|------------|
| `admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js` | `dist/sitepagesaddedjs.js` |
| `admin.d2cmedia.ca/d2c-sw.js` | `src/sw/d2c-sw.js` |
| `cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-enhancements.js` | `dist/d2c-enhancements.js` |
| `cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-sw.js` | `dist/d2c-sw.js` |

The 3rd and 4th overrides are the key to local dev: Chrome intercepts CDN requests and serves the local build files directly, so changes are visible on the next page reload without pushing to GitHub or hitting the CDN.

**Dev loop:**
1. Add all four overrides (one-time setup)
2. `npm run watch` — rebuilds all `dist/` files on every save
3. Edit files in `src/js/modules/` (or `src/sw/d2c-sw-impl.js`), save, reload the admin page

No local server needed. No CDN rate limits.

## Which files require a build vs. edit directly

| File | How to change |
|------|--------------|
| `src/js/modules/*.js` | Edit source → `npm run build` → push |
| `src/sw/d2c-sw-impl.js` | Edit source → `npm run build` → push (produces `dist/d2c-sw.js`) |
| `dist/*.js` | **Never edit** — overwritten by every build |
| `devtools-loader.js` | Edit directly — used as input to `buildLoader()` which writes `dist/sitepagesaddedjs.js`. Changes flow into the dist output on the next build. |
| `src/sw/d2c-sw.js` | Edit directly only if the shim URL needs to change (very rare) — this is the chrome-overrides shim that `importScripts` the CDN d2c-sw.js. |
| `src/js/sitepagesaddedjs-platform.js` | Edit only if D2C updates their platform `sitepagesaddedjs.js` prefix — then re-extract the first N lines and rebuild. |

## Repository Structure

```
blue-admin-ui/
├── devtools-loader.js          # Input to buildLoader() — also copied to dist/devtools-loader.js
├── build.js                    # esbuild script — writes build-date.js, bundles to dist/, buildLoader(), buildSW()
├── package.json                # npm scripts: build, watch, purge
├── CHANGELOG.md                # Narrative log of every significant change + rationale
├── README.md                   # Setup and usage guide
├── dist/                       # BUILD OUTPUTS — do not edit directly; hard-linked to chrome-overrides
│   ├── d2c-enhancements.js     # Minified IIFE bundle (from src/js/modules/)
│   ├── d2c-sw.js               # Minified SW implementation (from src/sw/d2c-sw-impl.js)
│   ├── devtools-loader.js      # Minified loader (from devtools-loader.js)
│   └── sitepagesaddedjs.js     # Platform prefix + minified loader (chrome-overrides for sitepagesaddedjs.js)
├── src/
│   ├── js/
│   │   ├── sitepagesaddedjs-platform.js  # D2C platform code prefix (454 lines); prepended by buildLoader()
│   │   └── modules/            # Source modules (edit these)
│   │       ├── index.js        # Entry point
│   │       ├── stylesheet.js   # All injected CSS
│   │       ├── utils.js        # Shared helpers
│   │       ├── toc.js          # Section table of contents
│   │       ├── dealer-nav.js   # Floating left dealer nav
│   │       ├── breadcrumb.js   # Header breadcrumb
│   │       ├── brand-nav.js    # Brand nav widget (‹ [Dealer ▾] ›) + idle SW prefetch
│   │       ├── palette.js      # Ctrl+K command palette
│   │       ├── save-indicator.js # AJAX save status
│   │       ├── search-hint.js  # Search button in header
│   │       ├── scroll-top.js   # Scroll-to-top button
│   │       ├── floating-save.js # Save button in right panel
│   │       ├── lazy-sections.js # Section collapse, image deferral, PAGE_DEFAULTS, localStorage memory
│   │       ├── prefetch.js     # Idle-time prefetch of /sites/* nav links (via link rel=prefetch)
│   │       ├── help-button.js  # Header help button: build-date badge + keyboard shortcut dropdown
│   │       ├── holiday-hours.js # /sites/general only — snapshot, day-centric editor modal, restore
│   │       └── build-date.js   # AUTO-GENERATED by build.js — do not edit; contains BUILD_DATE string
│   └── sw/
│       ├── d2c-sw.js           # Chrome-overrides shim — 5 lines: importScripts(CDN dist/d2c-sw.js)
│       └── d2c-sw-impl.js      # Full SW implementation — built to dist/d2c-sw.js by buildSW()
└── docs/                       # UI system documentation
```

## Deployment

1. Edit files in `src/js/modules/` (or `src/sw/d2c-sw-impl.js`)
2. `npm run build` (or let the pre-push hook do it)
3. `git push` → jsDelivr CDN serves the updated `dist/` files within minutes
4. **Purge CDN cache** if changes don't appear immediately:
   `https://purge.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-enhancements.js`

## Key DOM Selectors

These are the live selectors used by the enhancement script:

| Element | Selector |
|---------|----------|
| Header | `nav.navbar.navbar-default.navbar-static-top` |
| Top bar | `#topRight` |
| Nav tabs | `.topnav#desktopnav` |
| Sidebar | `.navbar-default.sidebar > .sidebar-nav > ul#side-menu` |
| Active dealer | `#side-menu > li.active` |
| Content area | `#page-wrapper > #content` |
| Expandable sections | `#content h2.expandablesection` |
| Save screen | `#saveLockScreen` |
| Hours day checkbox | `input[savefield="{Day}_{Dept}_INDEPENDENT"]` |
| Hours open select | `select[id="Open_Hours_{Day}_{Dept}_INDEPENDENT"]` |
| Hours close select | `select[id="Closed_Hours_{Day}_{Dept}_INDEPENDENT"]` |
| Current site ID | `#currentSiteID` (value = dealer ID, e.g. `2379`) |

## Architecture Decisions

- **CSS injected from JS** — avoids hashed CSS bundle filenames (`resource.l-*.css`) that change on deploy. One script file does everything.
- **Single IIFE output** — `--format=iife` wraps the bundle identically to the original hand-written IIFE. No `import`/`require` in the output.
- **Build date via generated module** — `build.js` writes `src/js/modules/build-date.js` (a plain `export var BUILD_DATE = "…"`) before running esbuild, so the date becomes a regular string literal in the bundle. Avoids esbuild `define` tokens, which produce a `ReferenceError` if a stale cached build reaches the browser.
- **All build outputs in `dist/`** — `d2c-enhancements.js`, `d2c-sw.js`, `devtools-loader.js`, and `sitepagesaddedjs.js` are all committed so jsDelivr can serve them from GitHub without CI/CD. Hard-linked to chrome-overrides so `npm run watch` changes reach the browser instantly.
- **SW shim pattern** — `src/sw/d2c-sw.js` is a 5-line `importScripts(CDN dist/d2c-sw.js)` shim. Other users install this once; all future SW logic changes deploy automatically from the CDN with zero manual follow-up on their end.
- **Dealer-scoped HTML cache** — HTML pages cached under `/__d2c__/{siteID}{pathname}` key to prevent cross-dealer collisions. `siteId` postMessage from `index.js` sets the active dealer in the SW; `pendingDealer` is extracted from intercepted `sitesRedirect` navigations. Cache name: `d2c-admin-html-v2`.
- **FOUC prevention** — `body.d2c-loading{opacity:0}` applied immediately after `injectStyles()`; animated 3 px shimmer bar runs while all build functions execute. Swapped to `d2c-ready` (CSS fade-in) after `buildHolidayHours()` completes. Loader bar removed after 300 ms.
- **Brand nav idle prefetch** — after the brand nav widget is set up, a `requestIdleCallback` (or 4 s `setTimeout` fallback) posts `prefetchDealer` messages to the SW for all same-brand dealers at the current path. Keeps the cache warm for one-click brand nav switching.
- **Palette dealer source from `#side-menu`** — the original `#dealername select.selectpicker` source was jQuery-dependent and unreliable on load. `#side-menu > li[data-siteid]` is always present. Navigation uses `sitesRedirect` URL directly.
- **`<link rel="prefetch">` not `fetch()`** — `prefetch.js` used `fetch()` which kept the browser spinner running while idle-time prefetch executed. `<link rel="prefetch" as="document">` is a background hint that does not affect the spinner.
- **Palette keyboard shortcut inside `buildPalette()`** — the `Ctrl+K` listener is registered inside the builder function, after `paletteOverlay` is set, to avoid a null reference if the shortcut fires before init.
- **Service Worker via DevTools override** — `src/sw/d2c-sw.js` is mapped to `admin.d2cmedia.ca/d2c-sw.js` via a Local Override. The SW registration in `devtools-loader.js` runs outside the `/sites/*` pathname guard so caching applies to all admin pages.
- **Enhancement script never SW-cached** — `dist/d2c-enhancements.js` is always fetched fresh (the SW passes it through). In dev mode the 3rd DevTools override serves the local build for the CDN URL, so rebuilt changes appear on the very next reload.
- **`/sites/*` pathname guard** — enhancement features (styles, TOC, palette, etc.) only initialise on `/sites/[section]` URLs. Home, `/inventory`, `/leads`, etc. are skipped. Localhost always runs (for development). The guard lives at the top of `index.js`.
- **Holiday Hours snapshot in `localStorage`** — key `d2c-hours-snapshot:{siteId}` scoped by dealer ID from `#currentSiteID.value`. Captures all 42 hour fields (6 depts × 7 days × enabled/open/close). Persists across page reloads without a server round-trip. Dealership isolation prevents cross-tab interference when two tabs are open on different dealers.
- **Bootstrap-select sync** — after programmatically setting a `<select>` value under Bootstrap-select, call `$(select).selectpicker('refresh')` (not `'val'`) to re-render the dropdown. Using `'val'` bypasses native `.value` and breaks the platform's save mechanism which reads `.value` directly.
- **Holiday Hours modal — day-centric not dept-centric** — the editor shows one day at a time (all 6 depts in a table) rather than one dept at a time or a full 7×6 grid. This keeps the modal viewport-safe and matches how holiday overrides are actually applied in practice.
- **Audit log general page link** — `AUDIT_PATH_MAP['general']` is `'/#footerWrapper'` (not `'/'`) so the save-history QC link on the public dealership site scrolls to the footer/hours section where visitors see the hours.

## Reference Documentation (docs/)

- `D2C-Platform-Overview.md` — Platform description
- `01-Navigation-Structures.md` — Menu hierarchies, sidebar DOM
- `02-Form-Elements-Controls.md` — Save fields, form attributes
- `03-Access-Control-Indicators.md` — Permission levels
- `04-UI-Components.md` — Icons, interactive components
- `05-Content-Management-Sections.md` — Expandable sections
- `D2C_CSS_Utility_Classes_Reference.md` — CSS utility classes
