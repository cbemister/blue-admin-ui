# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static HTML/CSS reference implementation** of the D2C Media Admin Panel — a dealership management system UI. It is a documentation and design reference, not a runnable application. There is no build system, package manager, or test framework.

## No Build or Test Commands

This project has no `package.json`, no npm scripts, no bundler, and no test runner. Files can be opened directly in a browser. There are no commands to run.

## Repository Structure

```
blue-admin-ui/
├── docs/                    # Markdown documentation for all UI systems
├── src/
│   ├── pages/               # Four large HTML pages (admin sections)
│   ├── css/styles.css       # 42K+ line CSS (utility classes + components)
│   └── php/                 # Compiled CSS resource bundle
└── screenshots/             # UI reference screenshots
```

## Architecture & Key Concepts

### HTML Pages (src/pages/)

Each page represents a distinct admin section for a dealership site (Site ID 2379 — Capital Chrysler):

| File | Purpose | Size |
|------|---------|------|
| `home.html` | Dashboard, DMS status, site selector | 1.2 MB |
| `general.html` | Dealership info, branding, navigation config | 3.9 MB |
| `new.html` | New vehicle department settings | 6.1 MB |
| `used.html` | Used vehicle department settings | 9.6 MB |

All pages share the same header/nav structure, user context (cbemister@autocan.ca), and jQuery + Bootstrap 3 stack.

### Technology Stack

- **jQuery + Bootstrap 3** — Server-rendered admin panel pattern
- **CKEditor 4.11** — Rich text editing throughout
- **CKFinder** — File/media management
- **Spectrum** — Color picker controls
- **jGrid** — Data tables
- **Bootstrap Switch** — Toggle controls
- **DOMPurify** — HTML sanitization for user-entered content
- **OneTrust** — Cookie consent / GDPR
- **Bilingual** — English/French content with `d2c_language` attributes

### Custom Form System

Forms use D2C-specific HTML attributes that map to backend database fields:

- `savefield` — Database field name
- `savetype` — Data type: `text`, `check`, `file`, `area`, `select`
- `d2c_language` — Language variant: `ENGLISH`, `FRENCH`, `INDEPENDENT`
- `originalvalue` — Stored original value (for change detection)
- `defaultvalue` — Default fallback value

Forms submit via AJAX and support auto-save.

### Access Control

Feature restrictions are encoded in the HTML via:
- HTML comments marking `NO ACCESS` sections
- `disabled`/`readonly` attributes
- `display:none` hidden elements
- JavaScript permission checks

Restricted features include: `commercialPage`, `dataStudio`, `followupManage`, `automatedCalls`, `groupVehicleFeeIncentive`.

### CSS Architecture (src/css/styles.css)

The stylesheet uses CSS custom properties throughout:
- `--s*` variables for spacing scale
- `--fs*` variables for font size scale
- Color theming via CSS variables
- Responsive breakpoints: `sm: 576px`, `md: 768px`, `lg: 992px`, `xl: 1200px`
- Utility class system (both Bootstrap-style and custom D2C utilities)

The full utility class reference is documented in [docs/D2C_CSS_Utility_Classes_Reference.md](docs/D2C_CSS_Utility_Classes_Reference.md).

## Documentation

All UI systems are documented in `docs/`:

- `D2C-Platform-Overview.md` — High-level platform description
- `01-Navigation-Structures.md` — Menu hierarchies, CSS, JS controls
- `02-Form-Elements-Controls.md` — Form attributes, validation, element types
- `03-Access-Control-Indicators.md` — Permission levels, restriction mechanisms
- `04-UI-Components.md` — Icons, interactive components, responsive design
- `05-Content-Management-Sections.md` — Expandable sections, content types
- `D2C_CSS_Utility_Classes_Reference.md` — Comprehensive CSS utility guide
