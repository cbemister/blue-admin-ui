// d2c-sw.js — Service Worker for admin.d2cmedia.ca performance caching
// Registered by devtools-loader.js (the Local Override for sitepagesaddedjs.js)
//
// DevTools Override setup:
//   Remote URL: admin.d2cmedia.ca/d2c-sw.js
//   Local file: <this file>
//
// Strategy:
//   - Cache-first for JS / CSS / images / fonts (assets rarely change)
//   - Network-first for HTML pages (always want fresh page content)
//   - Block requests to use.fontawesome.com (site has local woff2 copies — saves ~1.2s)
//   - Skip AJAX endpoints entirely (never cache dynamic data)

var CACHE_NAME = 'd2c-admin-v1';

// Responses for these origins/paths are always fetched fresh (never cached)
var NO_CACHE_PATTERNS = [
  /\/ajax\//,
  /\/service\//,
  /sessionMng/,
  /googletagmanager/,
  /google-analytics/,
  /addUuid/,
];

// Only cache these content-types (everything else passes through)
var CACHEABLE_TYPES = [
  'text/css',
  'text/javascript',
  'application/javascript',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'font/woff',
  'font/woff2',
  'font/ttf',
  'application/font-woff',
  'application/vnd.ms-fontobject',
];

self.addEventListener('install', function (event) {
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  // Delete caches from old SW versions, then claim all open tabs
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url;

  try {
    url = new URL(req.url);
  } catch (e) {
    return; // malformed URL — let it fail naturally
  }

  // Block external FontAwesome — admin.d2cmedia.ca already serves woff2 locally
  // Returning an empty 200 prevents the 4 × ~1.2 s font requests (~1.2 s total saving)
  if (url.hostname.includes('fontawesome.com')) {
    event.respondWith(new Response('', { status: 200 }));
    return;
  }

  // Only intercept GET requests
  if (req.method !== 'GET') return;

  // Skip tracking / AJAX patterns — never cache dynamic data
  if (NO_CACHE_PATTERNS.some(function (p) { return p.test(req.url); })) return;

  // Skip HTML page requests — always serve fresh from server
  var accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) return;

  // Cache-first strategy for all remaining requests
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) {
        return cached; // served from cache — ~0 ms
      }

      return fetch(req).then(function (response) {
        // Don't cache errors or opaque (cross-origin) responses
        if (!response || !response.ok || response.type !== 'basic') {
          return response;
        }

        var contentType = response.headers.get('content-type') || '';
        var isCacheable = CACHEABLE_TYPES.some(function (t) {
          return contentType.includes(t);
        });

        if (!isCacheable) return response;

        // Clone before consuming — cache the clone, return the original
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(req, clone);
        });

        return response;
      }).catch(function () {
        // Network failure — nothing cached, nothing to return
      });
    })
  );
});
