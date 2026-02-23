# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What This Project Is

A Chrome DevTools Local Overrides enhancement layer for `admin.d2cmedia.ca` — a dealership management admin panel. There is **no source access** to the admin panel itself. All changes are applied by overriding CSS and JS files the browser loads, or via a Tampermonkey userscript.

## Build System

This project uses **esbuild** to bundle ES modules into a single IIFE file.

```bash
npm install          # install esbuild (one-time)
npm run build        # one-shot bundle → src/js/d2c-enhancements.js
npm run watch        # rebuild on every save (use during development)
```

> **Node requirement:** System Node must be v20+. If the system Node is older, use the portable binary at `C:\Users\cbemister\node-portable\node-v20.10.0-win-x64\node.exe`.

A **pre-push git hook** (`.git/hooks/pre-push`) runs `npm run build` automatically before every push and commits the updated bundle if it changed.

**Do not edit `src/js/d2c-enhancements.js` directly** — it is the build output. Edit files in `src/js/modules/` instead.

## Repository Structure

```
blue-admin-ui/
├── devtools-loader.js          # DevTools override — loads CDN script + registers SW
├── package.json                # npm scripts: build, watch
├── CHANGELOG.md                # Narrative log of every significant change + rationale
├── README.md                   # Setup and usage guide
├── src/
│   ├── js/
│   │   ├── d2c-enhancements.js # BUILD OUTPUT — do not edit directly
│   │   └── modules/            # Source modules (edit these)
│   │       ├── index.js        # Entry point
│   │       ├── stylesheet.js   # All injected CSS
│   │       ├── utils.js        # Shared helpers
│   │       ├── toc.js          # Section table of contents
│   │       ├── dealer-nav.js   # Floating left dealer nav
│   │       ├── breadcrumb.js   # Header breadcrumb
│   │       ├── palette.js      # Ctrl+K command palette
│   │       ├── save-indicator.js # AJAX save status
│   │       ├── search-hint.js  # Search button in header
│   │       ├── scroll-top.js   # Scroll-to-top button
│   │       └── floating-save.js # Save button in right panel
│   └── sw/
│       └── d2c-sw.js           # Service Worker — NOT built by esbuild, edit directly
└── docs/                       # UI system documentation
```

## Deployment

1. Edit files in `src/js/modules/`
2. `npm run build` (or let the pre-push hook do it)
3. `git push` → jsDelivr CDN serves the updated file within minutes
4. **Purge CDN cache** if changes don't appear immediately:
   `https://purge.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js`

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

## Architecture Decisions

- **CSS injected from JS** — avoids hashed CSS bundle filenames (`resource.l-*.css`) that change on deploy. One script file does everything.
- **Single IIFE output** — `--format=iife` wraps the bundle identically to the original hand-written IIFE. No `import`/`require` in the output.
- **Build output committed** — `src/js/d2c-enhancements.js` is committed so jsDelivr can serve it from GitHub without CI/CD.
- **Palette keyboard shortcut inside `buildPalette()`** — the `Ctrl+K` listener is registered inside the builder function, after `paletteOverlay` is set, to avoid a null reference if the shortcut fires before init.
- **Service Worker via DevTools override** — `src/sw/d2c-sw.js` is mapped to `admin.d2cmedia.ca/d2c-sw.js` via a second Local Override. This file is **not processed by esbuild** — edit it directly. The SW registration runs outside the `/sites/*` pathname guard so caching applies to all admin pages.
- **`/sites/*` pathname guard** — enhancement features (styles, TOC, palette, etc.) only initialise on `/sites/[section]` URLs. Home, `/inventory`, `/leads`, etc. are skipped. Localhost always runs (for development). The guard lives at the top of `index.js`.

## Reference Documentation (docs/)

- `D2C-Platform-Overview.md` — Platform description
- `01-Navigation-Structures.md` — Menu hierarchies, sidebar DOM
- `02-Form-Elements-Controls.md` — Save fields, form attributes
- `03-Access-Control-Indicators.md` — Permission levels
- `04-UI-Components.md` — Icons, interactive components
- `05-Content-Management-Sections.md` — Expandable sections
- `D2C_CSS_Utility_Classes_Reference.md` — CSS utility classes
