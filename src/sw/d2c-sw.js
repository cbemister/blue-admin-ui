// d2c-sw.js — Service Worker for admin.d2cmedia.ca performance caching
// Registered by devtools-loader.js (the Local Override for sitepagesaddedjs.js)
//
// DevTools Override setup:
//   Remote URL: admin.d2cmedia.ca/d2c-sw.js
//   Local file: <this file>
//
// Strategy:
//   - Stale-while-revalidate for same-origin HTML pages:
//       serve cached HTML instantly, fetch fresh copy in background
//   - Cache-first for JS / CSS / images / fonts (assets rarely change)
//   - Cache CORS responses (CDN assets with Access-Control headers) in addition to same-origin
//   - Block requests to use.fontawesome.com (site has local woff2 copies — saves ~1.2s)
//   - Skip AJAX endpoints entirely (never cache dynamic data)

var CACHE_NAME = 'd2c-admin-v3';
var HTML_CACHE_NAME = 'd2c-admin-html-v1';

// Responses for these origins/paths are always fetched fresh (never cached)
var NO_CACHE_PATTERNS = [
  /\/ajax\//,
  /\/service\//,
  /sessionMng/,
  /googletagmanager/,
  /google-analytics/,
  /addUuid/,
];

// Only cache these content-types for the asset cache (everything else passes through)
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

self.addEventListener('install', function () {
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  // Delete caches from old SW versions, then claim all open tabs
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME && key !== HTML_CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return clients.claim();
    })
  );
});

// Return a normalized cache key URL for resource.loader.php requests.
// The `cb=` parameter is a timestamp cache-buster that changes every load
// but the actual bundle content is determined by `v=` + `js=` alone.
// Stripping `cb=` lets the SW serve cached responses across reloads.
function normalizeResourceLoaderUrl(url) {
  if (!url.pathname.includes('resource.loader.php')) return null;
  var normalized = new URL(url.href);
  normalized.searchParams.delete('cb');
  return normalized.href;
}

// Strip `t=<number>` cache-buster from asset URLs (images, CSS, JS).
// D2C appends ?t=<timestamp> to image URLs to bypass the browser HTTP cache,
// but the SW can serve the same file for any value of t=.
function normalizeAssetUrl(url) {
  var t = url.searchParams.get('t');
  if (!t || !/^\d+$/.test(t)) return url.href; // only strip pure-numeric t=
  var normalized = new URL(url.href);
  normalized.searchParams.delete('t');
  return normalized.href;
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url;

  try {
    url = new URL(req.url);
  } catch (e) {
    return; // malformed URL — let it fail naturally
  }

  // Skip non-HTTP schemes (chrome-extension://, data:, blob:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Block external FontAwesome — admin.d2cmedia.ca already serves woff2 locally
  if (url.hostname.includes('fontawesome.com')) {
    event.respondWith(new Response('', { status: 200 }));
    return;
  }

  // Only intercept GET requests
  if (req.method !== 'GET') return;

  // Skip tracking / AJAX patterns — never cache dynamic data
  if (NO_CACHE_PATTERNS.some(function (p) { return p.test(req.url); })) return;

  var accept = req.headers.get('accept') || '';

  // Stale-while-revalidate for same-origin HTML pages:
  // Serve cached HTML instantly, then fetch a fresh copy in the background.
  // This makes repeat navigation to any admin page nearly instant.
  if (accept.includes('text/html') && url.hostname === self.location.hostname) {
    event.respondWith(
      caches.open(HTML_CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var networkFetch = fetch(req).then(function (response) {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(function () { return cached; });

          // Serve stale immediately; let background fetch update the cache
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // resource.loader.php — stale-while-revalidate with cb= stripped from cache key.
  // cb= is a timestamp that busts the browser HTTP cache on every load, meaning
  // D2C may push script updates without changing v=. Cache-first would serve
  // stale JS indefinitely in that case. Stale-while-revalidate gives instant
  // load from cache while always fetching a fresh copy in the background.
  var normalizedKey = normalizeResourceLoaderUrl(url);
  if (normalizedKey) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(normalizedKey).then(function (cached) {
          var networkFetch = fetch(req).then(function (response) {
            if (response && response.ok) {
              cache.put(normalizedKey, response.clone());
            }
            return response;
          }).catch(function () { return cached; });

          // Serve stale immediately; background fetch keeps the cache current
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for the D2C enhancement script from jsDelivr.
  // Cache-first would serve the old version indefinitely after a push.
  // Stale-while-revalidate gives instant load from cache while always fetching
  // a fresh copy in the background so the next page load gets the update.
  if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('d2c-enhancements.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var networkFetch = fetch(req).then(function (response) {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(function () { return cached; });

          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Cache-first strategy for all remaining requests (assets).
  // Use a normalized cache key so the same asset with different ?t= timestamps
  // resolves to a single cache entry instead of one per cache-buster value.
  var assetKey = normalizeAssetUrl(url);
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(assetKey).then(function (cached) {
        if (cached) {
          return cached; // served from cache — ~0 ms
        }

        return fetch(req).then(function (response) {
          // Skip opaque responses (cross-origin without CORS headers) — status unknown, risky to cache
          if (!response || !response.ok || response.type === 'opaque') {
            return response;
          }

          var contentType = response.headers.get('content-type') || '';
          var isCacheable = CACHEABLE_TYPES.some(function (t) {
            return contentType.includes(t);
          });

          if (!isCacheable) return response;

          // Clone before consuming — cache the clone, return the original
          cache.put(assetKey, response.clone());

          return response;
        }).catch(function () {
          // Network failure — nothing cached, nothing to return
        });
      });
    })
  );
});
