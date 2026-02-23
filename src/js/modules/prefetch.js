// prefetch.js — Proactively warm the HTML cache for other admin sections.
// Runs at browser-idle time after the current page is fully loaded so it
// never competes with foreground work. On the next visit to any prefetched
// page the SW stale-while-revalidate handler serves it from cache instantly.

export function prefetchSections() {
  var nav = document.querySelector('.topnav#desktopnav');
  if (!nav) return;

  var current = window.location.pathname;
  var origin  = window.location.origin;

  // Collect unique /sites/* links from the nav bar that aren't the current page
  var seen  = {};
  var links = [];
  var anchors = nav.querySelectorAll('a[href]');
  for (var i = 0; i < anchors.length; i++) {
    var href = anchors[i].href;
    try {
      var u = new URL(href);
      if (u.origin === origin && /^\/sites\//.test(u.pathname) && u.pathname !== current && !seen[u.pathname]) {
        seen[u.pathname] = true;
        links.push(href);
      }
    } catch (e) { /* skip malformed */ }
  }

  if (!links.length) return;

  var fire = function () {
    links.forEach(function (href) {
      fetch(href, { credentials: 'same-origin' }).catch(function () {});
    });
  };

  // Wait until the browser is idle (after load + any pending tasks) before fetching
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(fire, { timeout: 6000 });
  } else {
    setTimeout(fire, 3000);
  }
}
