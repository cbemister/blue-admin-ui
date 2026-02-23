# D2C Admin UI Enhancements

Chrome DevTools Local Overrides enhancement layer for `admin.d2cmedia.ca`. Adds quality-of-life improvements to the dealership management admin panel without requiring source access.

## Features

- **Command palette** (Ctrl+K) — fuzzy search across all pages and dealerships
- **Section TOC** — floating right panel with jump links and collapse/expand all
- **Dealer nav** — floating left panel with the current dealer's page links
- **Breadcrumb** — dealer › section › page in the header
- **Floating save button** — always visible in the right panel
- **Save indicator** — AJAX-aware status notification (Saving… / Saved / Error)
- **Scroll to top** — appears after scrolling 400px
- **Clean UI** — full-width layout, sticky header, consistent typography

## Setup

### Option 1 — Chrome DevTools Local Override (recommended)

1. In Chrome DevTools → **Sources** → **Overrides** → enable and select a local folder
2. Map the following file to your local copy:

   | Remote URL | Local file |
   |------------|------------|
   | `admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js` | `devtools-loader.js` |

3. The loader fetches the enhancement script from jsDelivr CDN automatically.

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

Open `sandbox.html` in a browser to test changes locally without touching the live admin panel.

Edit source files in [src/js/modules/](src/js/modules/). The bundle at `src/js/d2c-enhancements.js` is generated automatically — do not edit it directly.

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
├── devtools-loader.js       # DevTools override — loads CDN script
├── src/js/
│   ├── d2c-enhancements.js  # Build output (served via jsDelivr)
│   └── modules/             # Source — edit these files
│       ├── index.js
│       ├── stylesheet.js
│       ├── palette.js
│       └── ...
└── docs/                    # DOM and UI system reference docs
```

## CDN URL

```
https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
```
