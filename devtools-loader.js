/* ================================================================
   D2C Admin Panel — DevTools Local Override Loader
   ================================================================
   DevTools Local Overrides required (Sources → Overrides):

     Remote URL                                       Local file
     ───────────────────────────────────────────────  ─────────────────────
     admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js  devtools-loader.js
     admin.d2cmedia.ca/d2c-sw.js                      src/sw/d2c-sw.js

   The Service Worker caches all JS/CSS/images/fonts after the first
   page load — subsequent visits load in ~1–2 s instead of 11 s.
   It also blocks redundant external FontAwesome requests (~1.2 s saving).

   The enhancement script is loaded from GitHub/jsDelivr so you can
   push changes and they go live without updating DevTools overrides.
   ================================================================ */

(function () {
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
    navigator.serviceWorker.register('/d2c-sw.js').catch(function (e) {
      // Registration fails silently if the override isn't set up yet
      console.warn('[D2C] Service Worker not active:', e.message);
    });
  }

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js';
  s.onerror = function () {
    console.warn('[D2C] Enhancement script failed to load from jsDelivr');
    // Remove pre-collapse immediately on load failure so sections are visible
    var el = document.getElementById('d2c-precollapse');
    if (el) el.parentNode.removeChild(el);
  };
  document.head.appendChild(s);
})();
