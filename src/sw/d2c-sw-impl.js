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
//       Cache keyed by dealer siteID + pathname so each dealer's pages are independent
//   - Cache-first for JS / CSS / images / fonts (assets rarely change)
//   - Cache CORS responses (CDN assets with Access-Control headers) in addition to same-origin
//   - Block requests to use.fontawesome.com (site has local woff2 copies — saves ~1.2s)
//   - Skip AJAX endpoints entirely (never cache dynamic data)
//   - sitesRedirect intercepted to extract incoming dealer ID for cache key

var CACHE_NAME = 'd2c-admin-v3';
var HTML_CACHE_NAME = 'd2c-admin-html-v2'; // v2: dealer-scoped keys replace flat URL keys

// Dealer context for HTML cache scoping.
// currentDealer — siteID reported by the page via postMessage on every load.
// pendingDealer — siteID extracted from a sitesRedirect URL; consumed by the
//                 very next HTML fetch (the redirect destination page).
var currentDealer = null;
var pendingDealer = null;

// The enhancement script (index.js) sends {type:'siteId', id:'2379'} once per page load
// so the SW knows which dealer owns subsequent same-origin HTML responses.
// brand-nav.js sends {type:'prefetchDealer', id:'2349', paths:['/sites/general']}
// to proactively warm the cache for same-brand dealers the user is likely to visit.
self.addEventListener('message', function (event) {
  var data = event.data;
  if (!data) return;

  if (data.type === 'siteId') {
    currentDealer = String(data.id);
    // Confirm the pending redirect resolved to the expected dealer — clear it
    if (pendingDealer === currentDealer) pendingDealer = null;

  } else if (data.type === 'prefetchDealer') {
    // Proactively cache HTML pages for another dealer.
    // Fetches via sitesRedirect so the session cookie switches and we receive
    // that dealer's HTML — then stores it under the dealer-scoped key.
    var sid   = String(data.id);
    var paths = data.paths || [];
    caches.open(HTML_CACHE_NAME).then(function (cache) {
      paths.forEach(function (path) {
        var cacheKey = '/__d2c__/' + sid + path;
        cache.match(cacheKey).then(function (existing) {
          if (existing) return; // already warm — skip
          var redirectUrl = '/ajax/sitesRedirect?siteID=' + encodeURIComponent(sid) +
            '&dest=' + encodeURIComponent(path);
          fetch(redirectUrl, { credentials: 'include' }).then(function (response) {
            if (response && response.ok) cache.put(cacheKey, response.clone());
          }).catch(function () {});
        });
      });
    });
  }
});

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

  // Skip localhost — served by the local dev server (npm run serve), never cached
  if (url.hostname === 'localhost') return;

  // Block external FontAwesome — admin.d2cmedia.ca already serves woff2 locally
  if (url.hostname.includes('fontawesome.com')) {
    event.respondWith(new Response('', { status: 200 }));
    return;
  }

  // Only intercept GET requests
  if (req.method !== 'GET') return;

  // sitesRedirect — record the incoming dealer ID so the HTML page that the
  // redirect lands on is stored under the correct dealer-scoped cache key.
  // The request itself always goes to the network unchanged.
  if (url.pathname === '/ajax/sitesRedirect') {
    var incomingSid = url.searchParams.get('siteID');
    if (incomingSid) pendingDealer = String(incomingSid);
    return;
  }

  // Skip tracking / AJAX patterns — never cache dynamic data
  if (NO_CACHE_PATTERNS.some(function (p) { return p.test(req.url); })) return;

  var accept = req.headers.get('accept') || '';

  // Stale-while-revalidate for same-origin HTML pages.
  // Cache key is dealer-scoped: '/__d2c__/{siteID}{pathname}' so that
  // /sites/general for dealer 2379 and /sites/general for dealer 2349 are
  // stored as separate entries and never collide.
  //
  // Dealer context priority:
  //   1. pendingDealer — set moments ago by a sitesRedirect (cross-dealer nav)
  //   2. currentDealer — set by postMessage from the running page (same-dealer nav)
  //   3. Neither known (SW just installed) — falls back to raw Request key
  if (accept.includes('text/html') && url.hostname === self.location.hostname) {
    var dealerCtx = pendingDealer || currentDealer;
    if (pendingDealer) pendingDealer = null; // consume — redirect has resolved
    var htmlKey = dealerCtx ? '/__d2c__/' + dealerCtx + url.pathname : req;
    event.respondWith(
      caches.open(HTML_CACHE_NAME).then(function (cache) {
        return cache.match(htmlKey).then(function (cached) {
          var networkFetch = fetch(req).then(function (response) {
            if (response && response.ok) {
              cache.put(htmlKey, response.clone());
            }
            return response;
          }).catch(function () { return cached || new Response('', { status: 503, statusText: 'SW network error' }); });

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
          }).catch(function () { return cached || new Response('', { status: 503, statusText: 'SW network error' }); });

          // Serve stale immediately; background fetch keeps the cache current
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Always fetch the D2C enhancement script fresh — never cache it.
  // In dev mode a DevTools Local Override serves the local build for this URL,
  // so caching would hide rebuilt changes until the SW evicts the stale entry.
  // The script is small and the CDN is fast; the performance cost is negligible.
  if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('d2c-enhancements.js')) {
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
          return new Response('', { status: 503, statusText: 'SW network error' });
        });
      });
    })
  );
});
