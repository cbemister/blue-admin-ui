/* ================================================================
   D2C Admin Panel — DevTools Local Override Loader
   ================================================================
   DevTools Local Overrides required (Sources → Overrides):

     Remote URL                                                                Local file
     ────────────────────────────────────────────────────────────────────────  ──────────────────────────────
     admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js                           dist/sitepagesaddedjs.js
     admin.d2cmedia.ca/d2c-sw.js                                               src/sw/d2c-sw.js  (shim)
     cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-enhancements.js dist/d2c-enhancements.js
     cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-sw.js           dist/d2c-sw.js

   The 1st override (sitepagesaddedjs.js) only needs redistributing if D2C
   changes their platform code. Our loader logic is minified and inlined at
   the bottom of dist/sitepagesaddedjs.js — rebuilt by `npm run build`.

   The 2nd override (d2c-sw.js) is a permanent one-line shim that importScripts
   the CDN URL — it never needs to change after initial setup.

   The 3rd and 4th overrides let Chrome serve local dist/ builds instead of
   hitting the CDN — so `npm run watch` changes are live on next page reload
   with no push or CDN purge needed.

   The Service Worker caches all JS/CSS/images/fonts after the first
   page load — subsequent visits load in ~1–2 s instead of 11 s.
   It also blocks redundant external FontAwesome requests (~1.2 s saving).
   ================================================================ */

(function () {
  // Guard against double-execution (sitepagesaddedjs.js is loaded twice on some pages)
  if (window._d2cLoaderRan) return;
  window._d2cLoaderRan = true;

  // Pre-collapse all expandable section content immediately.
  // This runs synchronously before the first paint so the user never sees
  // the flash of all sections expanded. buildLazySections() removes this
  // style once it has set the correct open/closed state.
  // The 5 s timeout is a safety net: if the enhancement script fails to load
  // (CDN down, network error) sections become visible again automatically.
  var preCollapse = document.createElement('style');
  preCollapse.id = 'd2c-precollapse';
  preCollapse.textContent =
    '#content .expandablesection+div,' +
    '#content .expandablesection+table{display:none!important}';
  (document.head || document.documentElement).appendChild(preCollapse);

  setTimeout(function () {
    var el = document.getElementById('d2c-precollapse');
    if (el) el.parentNode.removeChild(el);
  }, 5000);

  // Register Service Worker for asset caching.
  // On first load: fills the cache. On all subsequent loads: assets served
  // from local disk — dramatically reduces LCP for repeat visits.
  // Requires the d2c-sw.js DevTools override to be active (see header above).
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/d2c-sw.js')
      .then(function (reg) {
        var state = reg.active ? 'active' : reg.installing ? 'installing' : 'waiting';
        console.log('[D2C] SW:', state, '| controller:', !!navigator.serviceWorker.controller);
      })
      .catch(function (e) {
        console.warn('[D2C] Service Worker not active:', e.message);
      });
  }

  // Load the enhancement script from jsDelivr CDN.
  // In dev mode, the 3rd DevTools override intercepts this request and serves
  // the local build (dist/d2c-enhancements.js) — no server or CDN needed.
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/dist/d2c-enhancements.js';
  script.onerror = function () {
    console.warn('[D2C] Enhancement script failed to load');
    var el = document.getElementById('d2c-precollapse');
    if (el) el.parentNode.removeChild(el);
  };
  document.head.appendChild(script);
})();
