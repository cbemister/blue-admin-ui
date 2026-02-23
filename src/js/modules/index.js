import { injectStyles } from './stylesheet.js';
import { onReady, measureHeader } from './utils.js';
import { buildSectionTOC } from './toc.js';
import { buildDealerNav } from './dealer-nav.js';
import { buildBreadcrumb } from './breadcrumb.js';
import { buildPalette } from './palette.js';
import { buildSaveIndicator } from './save-indicator.js';
import { buildSearchHint } from './search-hint.js';
import { buildScrollTop } from './scroll-top.js';
import { buildFloatingSave } from './floating-save.js';

// Register Service Worker on every page — must run outside the /sites/ guard so assets
// are cached regardless of which admin page is visited first.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/d2c-sw.js').catch(function () {});
}

// Guard: only run on site-specific pages (/sites/*) or local sandbox, and only once
// Skips home, /inventory, /leads, and all other top-level routes on the live admin
var _host = window.location.hostname;
var _isLocal = _host === 'localhost' || _host === '127.0.0.1';
var _isSitePage = /^\/sites\//.test(window.location.pathname);
if ((_isLocal || _isSitePage) && !document.getElementById('d2c-custom-styles')) {
  injectStyles();

  onReady(function () {
    // Critical path: layout measurement runs immediately
    measureHeader();
    window.addEventListener('resize', measureHeader, { passive: true });

    // Non-critical UI: defer until browser is idle so page interactions
    // (forms, dropdowns, CKEditor init) are not delayed
    var defer = typeof requestIdleCallback === 'function'
      ? function (fn) { requestIdleCallback(fn, { timeout: 2000 }); }
      : function (fn) { setTimeout(fn, 500); };

    defer(function () {
      buildBreadcrumb();
      buildSectionTOC();
      buildDealerNav();
      buildSearchHint();
      buildPalette();
      buildSaveIndicator();
      buildScrollTop();
      buildFloatingSave();
    });
  });
}
