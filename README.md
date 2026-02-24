# D2C Admin UI Enhancements

Chrome DevTools Local Overrides enhancement layer for `admin.d2cmedia.ca`. Adds quality-of-life improvements to the dealership management admin panel without requiring source access.

## Features

- **Performance** — Service Worker caches JS/CSS/images/fonts (cache-first) and HTML pages (stale-while-revalidate); idle-time prefetch warms the HTML cache for all other sections; repeat-visit LCP drops from ~11 s to ~1–2 s
- **Help button** — header badge showing build date; dropdown with keyboard shortcuts and feature list
- **Command palette** (Ctrl+K) — fuzzy search across all pages and dealerships
- **Lazy sections** — collapses all expandable sections on load, defers image fetches until a section is opened; remembers which section was last open per page and restores it on return
- **Section TOC** — floating right panel with jump links and collapse/expand all
- **Dealer nav** — floating left panel with the current dealer's page links
- **Breadcrumb** — dealer › section › page in the header
- **Holiday Hours** (`/sites/general` only) — right-panel widget to snapshot all department hours, edit a day's schedule across all 6 departments via modal, and restore to the saved snapshot; shows save-summary and restore-diff confirmation modals
- **Floating save button** — always visible in the right panel
- **Save indicator** — AJAX-aware status notification (Saving… / Saved / Error)
- **Scroll to top** — appears after scrolling 400px
- **Clean UI** — full-width layout, sticky header, consistent typography

## Setup

### Option 1 — Chrome DevTools Local Override (recommended)

1. In Chrome DevTools → **Sources** → **Overrides** → enable and select a local folder
2. Map the following overrides:

   | Remote URL | Local file | Required |
   |------------|------------|----------|
   | `admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js` | `devtools-loader.js` | **Yes** — all UI enhancements |
   | `admin.d2cmedia.ca/d2c-sw.js` | `src/sw/d2c-sw.js` | Optional — caching only |
   | `cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js` | `src/js/d2c-enhancements.js` | Optional — local dev only |

   Without the SW override everything still works; you just don't get the caching speedup on repeat visits. The 3rd override is only needed during development (see below).

   > **How to map a file:** Navigate to the URL in Chrome, right-click the file in Sources → "Save for overrides", then replace the saved file with the local copy. For `d2c-sw.js`, navigate to `https://admin.d2cmedia.ca/d2c-sw.js` (will 404), then save for overrides — Chrome creates the file in your overrides folder at the right path.

   > **3rd override (local dev) — hard link setup:** The CDN override file must always reflect the latest build output. Rather than manually copying, create a Windows hard link so both paths point to the same file on disk. After Chrome creates the override file via "Save for overrides", replace it:
   > ```powershell
   > # Run once in PowerShell — replace <overrides> with your overrides folder path
   > New-Item -ItemType HardLink `
   >   -Path "<overrides>\cdn.jsdelivr.net\gh\cbemister\blue-admin-ui@main\src\js\d2c-enhancements.js" `
   >   -Target "<repo>\src\js\d2c-enhancements.js"
   > ```
   > After this, every `npm run watch` rebuild automatically updates the override file — no manual copying.

3. The loader fetches the enhancement script from jsDelivr CDN automatically. If the SW override is active it warms the cache on the first page load; all subsequent visits serve the large JS bundle from local cache instead of the network.

### Option 2 — Tampermonkey

Create a new userscript with the following header:

```js
// ==UserScript==
// @name         D2C Admin UI Enhancements
// @match        https://admin.d2cmedia.ca/*
// @require      https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
// @grant        none
// ==/UserScript==
```

## Development

```bash
git clone https://github.com/cbemister/blue-admin-ui
cd blue-admin-ui
npm install
npm run watch       # rebuilds src/js/d2c-enhancements.js on every save
```

Edit source files in [src/js/modules/](src/js/modules/). The bundle at `src/js/d2c-enhancements.js` is generated automatically — do not edit it directly.

### Local dev loop (live admin panel)

1. Add all three DevTools overrides from the table above (one-time setup)
2. Set up the hard link for the 3rd override so rebuilds flow through automatically (see setup notes above)
3. `npm run watch`
4. Edit files in `src/js/modules/`, save, reload the admin page

Chrome intercepts the CDN request via the 3rd override and serves the local build directly — no server, no CDN, no rate limits. Changes appear on the next page reload.

## Deploying Changes

```bash
git add src/js/modules/
git commit -m "describe your change"
git push    # pre-push hook rebuilds + commits bundle, then pushes
```

After pushing, purge the jsDelivr cache if changes don't appear within a few minutes:

```
https://purge.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
```

## Project Structure

```
blue-admin-ui/
├── devtools-loader.js       # DevTools override — loads CDN script + registers SW
├── src/
│   ├── js/
│   │   ├── d2c-enhancements.js  # Build output (served via jsDelivr)
│   │   └── modules/             # Source — edit these files
│   │       ├── index.js
│   │       ├── stylesheet.js
│   │       ├── palette.js
│   │       └── ...
│   └── sw/
│       └── d2c-sw.js        # Service Worker — asset caching + FontAwesome blocking
└── docs/                    # DOM and UI system reference docs
```

## CDN URL

```
https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
```
