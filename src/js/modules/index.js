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
import { buildHelpButton } from './help-button.js';
import { prefetchSections } from './prefetch.js';
import { buildAuditPanel } from './audit-log.js';
import { buildLazySections } from './lazy-sections.js';
import { buildHolidayHours } from './holiday-hours.js';

// Guard: only run on site-specific pages (/sites/*) or local sandbox, and only once
// Skips home, /inventory, /leads, and all other top-level routes on the live admin
var _host = window.location.hostname;
var _isLocal = _host === 'localhost' || _host === '127.0.0.1';
var _isSitePage = /^\/sites\//.test(window.location.pathname);
if ((_isLocal || _isSitePage) && !document.getElementById('d2c-custom-styles')) {
  injectStyles();

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

    // Prefetch stays idle-deferred — background work, never needs to be fast
    var deferIdle = typeof requestIdleCallback === 'function'
      ? function (fn) { requestIdleCallback(fn, { timeout: 6000 }); }
      : function (fn) { setTimeout(fn, 3000); };
    deferIdle(prefetchSections);
  });
}
