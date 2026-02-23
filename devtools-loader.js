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
  };
  document.head.appendChild(s);
})();
