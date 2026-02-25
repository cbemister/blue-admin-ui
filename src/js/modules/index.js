import { injectStyles } from './stylesheet.js';
import { onReady, measureHeader } from './utils.js';
import { buildSectionTOC } from './toc.js';
import { buildDealerNav } from './dealer-nav.js';
import { buildBreadcrumb } from './breadcrumb.js';
import { buildBrandNav } from './brand-nav.js';
import { buildPalette } from './palette.js';
import { buildSaveIndicator } from './save-indicator.js';
import { buildSearchHint } from './search-hint.js';
import { buildScrollTop } from './scroll-top.js';
import { buildFloatingSave } from './floating-save.js';
import { buildHelpButton } from './help-button.js';
import { prefetchSections } from './prefetch.js';
import { buildAuditPanel } from './audit-log.js';
import { buildLazySections } from './lazy-sections.js';
import { buildHolidayHours } from './holiday-hours.js';
import { buildPromoManager } from './promo-manager.js';

// Guard: only run on site-specific pages (/sites/*) or local sandbox, and only once
// Skips home, /inventory, /leads, and all other top-level routes on the live admin
var _host = window.location.hostname;
var _isLocal = _host === 'localhost' || _host === '127.0.0.1';
var _isSitePage = /^\/sites\//.test(window.location.pathname);
if ((_isLocal || _isSitePage) && !document.getElementById('d2c-custom-styles')) {
  injectStyles();

  // Hide body immediately to prevent flash of unstyled content.
  // The loading bar stays visible while builds run; body fades in when done.
  document.body.classList.add('d2c-loading');
  var _loaderBar = document.createElement('div');
  _loaderBar.className = 'd2c-loader-bar';
  document.body.appendChild(_loaderBar);

  // Run buildLazySections immediately on DOMContentLoaded — no 300ms delay —
  // so image src removal races ahead of browser prefetch as early as possible.
  if (document.readyState !== 'loading') {
    buildLazySections();
  } else {
    document.addEventListener('DOMContentLoaded', buildLazySections);
  }

  onReady(function () {
    measureHeader();
    window.addEventListener('resize', measureHeader, { passive: true });

    // Build all UI features immediately — visible to the user, no reason to delay
    buildBreadcrumb();
    buildBrandNav();
    buildSectionTOC();
    buildDealerNav();
    buildSearchHint();
    buildPalette();
    buildSaveIndicator();
    buildScrollTop();
    buildFloatingSave();
    buildHelpButton();
    buildAuditPanel();
    buildHolidayHours();
    buildPromoManager();

    // Inform the SW which dealer is active so HTML pages are cached under the
    // correct dealer-scoped key (avoids cross-dealer HTML collisions).
    var _siteIdEl = document.getElementById('currentSiteID');
    if (_siteIdEl && _siteIdEl.value && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'siteId', id: _siteIdEl.value });
    }

    // Reveal: swap class so the CSS transition fires, then clean up the loader bar
    document.body.classList.remove('d2c-loading');
    document.body.classList.add('d2c-ready');
    var bar = document.querySelector('.d2c-loader-bar');
    if (bar) { setTimeout(function () { bar.remove(); }, 300); }

    // Prefetch stays idle-deferred — background work, never needs to be fast
    var deferIdle = typeof requestIdleCallback === 'function'
      ? function (fn) { requestIdleCallback(fn, { timeout: 6000 }); }
      : function (fn) { setTimeout(fn, 3000); };
    deferIdle(prefetchSections);
  });
}
