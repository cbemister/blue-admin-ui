import { injectStyles } from './stylesheet.js';
import { onReady, measureHeader } from './utils.js';
import { buildSectionTOC } from './toc.js';
import { buildDealerNav } from './dealer-nav.js';
import { buildBreadcrumb } from './breadcrumb.js';
import { buildPalette, openPalette } from './palette.js';
import { buildSaveIndicator } from './save-indicator.js';
import { buildSearchHint } from './search-hint.js';
import { buildScrollTop } from './scroll-top.js';
import { buildFloatingSave } from './floating-save.js';

// Guard: only run once even if script is loaded multiple times
if (!document.getElementById('d2c-custom-styles')) {
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
