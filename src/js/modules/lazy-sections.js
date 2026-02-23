// lazy-sections.js
// On every /sites/* page:
//   1. Collapse all sections immediately and cancel in-flight image requests for
//      collapsed sections — only the target section's images are ever fetched.
//   2. Remember which section was last open (stored per page-path in localStorage)
//      and auto-expand + scroll to it on the next visit.
//   3. Fall back to PAGE_DEFAULTS on first visit (no saved state yet).
//   4. When a section is manually opened, restore its deferred images on demand.

// ── Default section config ────────────────────────────────────────────────────
// Maps page pathname → which section(s) to auto-open on first visit.
//
// Simple (open one section by partial title match, case-insensitive):
//   '/sites/promotions': 'web specials'
//
// Nested (open a parent section, then a child section inside it):
//   '/sites/homepage': ['carousel', 'web banners']
//
// To find section titles: run in DevTools Console on the target page:
//   Array.from(document.querySelectorAll('#content h2.expandablesection')).map(s => s.textContent.trim())
//
var PAGE_DEFAULTS = {
  // Nested: ['parent section title', 'child section title'] (case-insensitive partial match)
  '/sites/homepage': ['carousel', 'dealer banners'],
  '/sites/our-team': 'add contact',
  // '/sites/promotions': 'web specials',  // fill in once section title is confirmed
};

// ── Internal state ────────────────────────────────────────────────────────────

// Storage key is per-page so each admin page remembers its own last-open section
var _storageKey = 'd2c-section:' + window.location.pathname;

// Suppresses localStorage saves during programmatic expand/collapse
var _skipSave = false;

// ── Public API ────────────────────────────────────────────────────────────────

export function buildLazySections() {
  var sections = Array.from(document.querySelectorAll('#content h2.expandablesection'));
  if (!sections.length) return;

  // Ensure every section has a stable ID for storage
  sections.forEach(function (s, i) {
    if (!s.id) s.id = 'd2c-s' + i;
  });

  // Register click listeners before doing any programmatic clicks
  sections.forEach(function (s) {
    s.addEventListener('click', function () {
      if (_skipSave) return;
      // Act only on expand clicks (section is currently closed, about to open)
      if (!s.classList.contains('closed')) return;
      restoreImages(getContentDiv(s));
      try { localStorage.setItem(_storageKey, s.id); } catch (e) {}
    });
  });

  // --- Programmatic setup: collapse all, defer images, open target section ---
  _skipSave = true;
  try {
    // Collapse every open section and immediately defer its images.
    // Removing `src` from in-flight <img> requests causes Chrome to cancel them,
    // so only the section the user actually opens incurs image network cost.
    sections.forEach(function (s) {
      if (s.classList.contains('open')) s.click();
      deferImages(getContentDiv(s));
    });

    // Priority 1: re-open the section the user last worked in
    var lastId;
    try { lastId = localStorage.getItem(_storageKey); } catch (e) {}
    if (lastId) {
      var saved = sections.find(function (s) { return s.id === lastId; });
      if (saved) {
        openSection(saved);
        scrollToSection(saved);
        return; // done — skip defaults
      }
    }

    // Priority 2: fall back to configured page default (first visit)
    openDefault(sections);
  } finally {
    _skipSave = false;
    // Remove the pre-collapse style injected by devtools-loader.js.
    // Sections are now in their correct state so the page's own CSS takes over.
    var preCollapse = document.getElementById('d2c-precollapse');
    if (preCollapse) preCollapse.parentNode.removeChild(preCollapse);
  }
}

// ── Default-section logic ─────────────────────────────────────────────────────

function openDefault(sections) {
  var cfg = PAGE_DEFAULTS[window.location.pathname];
  if (!cfg) return;

  if (typeof cfg === 'string') {
    // Simple: single section
    var target = findByText(sections, cfg);
    if (!target) return;
    openSection(target);
    scrollToSection(target);

  } else if (Array.isArray(cfg) && cfg.length >= 1) {
    // Nested: open parent, then open child inside parent's content div.
    // Expand parent WITHOUT restoring its images so sibling sub-sections
    // (e.g. OEM/GROUP banners) don't trigger unnecessary image loads.
    var parent = findByText(sections, cfg[0]);
    if (!parent) return;

    if (cfg[1]) {
      if (parent.classList.contains('closed')) parent.click();
      var parentContent = getContentDiv(parent);
      if (parentContent) {
        // Sub-sections can be h2 or h5 depending on page — use class-only selector
        var nested = Array.from(parentContent.querySelectorAll('.expandablesection'));
        var child = findByText(nested, cfg[1]);
        if (child) {
          openSection(child); // only restores images inside dealer banners
          scrollToSection(child);
          return;
        }
      }
    }

    // No child config or child not found — open parent normally
    openSection(parent);
    scrollToSection(parent);
  }
}

function findByText(sections, text) {
  var needle = text.toLowerCase();
  return sections.find(function (s) {
    var label = s.querySelector('.expandableHeaderText, .first') || s;
    return label.textContent.toLowerCase().includes(needle);
  }) || null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getContentDiv(section) {
  // The expandable content is always the immediately adjacent sibling <div>
  var next = section.nextElementSibling;
  return (next && next.tagName === 'DIV') ? next : null;
}

function openSection(section) {
  if (section.classList.contains('closed')) section.click();
  restoreImages(getContentDiv(section));
}

function deferImages(content) {
  if (!content) return;
  content.querySelectorAll('img[src]').forEach(function (img) {
    // Stash src then remove — Chrome cancels the in-flight request
    img.setAttribute('data-lazy-src', img.getAttribute('src'));
    img.removeAttribute('src');
  });
}

function restoreImages(content) {
  if (!content) return;
  content.querySelectorAll('img[data-lazy-src]').forEach(function (img) {
    img.setAttribute('src', img.getAttribute('data-lazy-src'));
    img.removeAttribute('data-lazy-src');
  });
}

function scrollToSection(section) {
  var headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height')
  ) || 95;
  var top = section.getBoundingClientRect().top + window.scrollY - headerH - 12;
  window.scrollTo({ top: top, behavior: 'smooth' });
}
