/* ================================================================
   D2C Admin Panel — DevTools Local Override Loader
   ================================================================
   Place this file as a Chrome DevTools Local Override for:
     admin.d2cmedia.ca/assets/js/sitepagesaddedjs.js

   It loads the real enhancement script from GitHub/jsDelivr so
   you can edit d2c-enhancements.js and push — no DevTools change needed.

   After pushing to GitHub, purge the jsDelivr cache:
     https://purge.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js
   ================================================================ */

(function () {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/cbemister/blue-admin-ui@main/src/js/d2c-enhancements.js';
  s.onerror = function () {
    console.warn('[D2C] Enhancement script failed to load from jsDelivr');
  };
  document.head.appendChild(s);
})();
