// lazy-sections.js
// On every /sites/* page:
//   1. Collapse all sections immediately and cancel in-flight image requests for
//      collapsed sections — only the target section's images are ever fetched.
//   2. Remember which section was last open (stored per page-path in localStorage)
//      and auto-expand + scroll to it on the next visit.
//   3. When a section is manually opened, restore its deferred images on demand.

// Storage key is per-page so each admin section remembers its own last-open state.
var _storageKey = 'd2c-section:' + window.location.pathname;

// Flag used to suppress localStorage saves during programmatic expand/collapse
var _skipSave = false;

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

  // --- Programmatic setup: collapse all, defer images, open last section ---
  _skipSave = true;
  try {
    // Collapse every open section and immediately defer its images.
    // Removing `src` from in-flight <img> requests causes Chrome to cancel them,
    // so only the section the user actually opens will incur image network cost.
    sections.forEach(function (s) {
      if (s.classList.contains('open')) s.click();
      deferImages(getContentDiv(s));
    });

    // Re-open the section the user last worked in (per-page memory)
    var lastId;
    try { lastId = localStorage.getItem(_storageKey); } catch (e) {}
    if (lastId) {
      var target = sections.find(function (s) { return s.id === lastId; });
      if (target) {
        if (target.classList.contains('closed')) target.click();
        restoreImages(getContentDiv(target));
        scrollToSection(target);
      }
    }
  } finally {
    _skipSave = false;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getContentDiv(section) {
  // The expandable content is always the immediately adjacent sibling <div>
  var next = section.nextElementSibling;
  return (next && next.tagName === 'DIV') ? next : null;
}

function deferImages(content) {
  if (!content) return;
  content.querySelectorAll('img[src]').forEach(function (img) {
    // Stash the original src, then remove it.
    // Chrome cancels the in-flight request when src is removed.
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
