import { escHtml } from './utils.js';

// Direct siteID → brand lookup (most reliable — no text matching needed).
// Add new sites here as they are onboarded.
var SITE_BRAND = {
  // Stellantis (Chrysler / Dodge / Jeep / Ram)
  2349: 'Stellantis', // ddodge.com
  2350: 'Stellantis', // shopwellingtons.com
  2370: 'Stellantis', // courtesychrysler.com
  2371: 'Stellantis', // parklanddodge.com
  2373: 'Stellantis', // mapleridgechrysler.com
  2374: 'Stellantis', // gpchrysler.com
  2375: 'Stellantis', // crosstownautocentre.com
  2377: 'Stellantis', // monctonchrysler.com
  2379: 'Stellantis', // capitaljeep.com
  2381: 'Stellantis', // northlanddodge.ca
  2383: 'Stellantis', // towerchrysler.com
  2385: 'Stellantis', // dodgecityauto.com
  2388: 'Stellantis', // easternchrysler.com
  // Volkswagen
  862:  'Volkswagen', // mapleridge-vw.ca
  863:  'Volkswagen', // abbotsfordvw.ca
  864:  'Volkswagen', // chilliwackvw.ca
  2285: 'Volkswagen', // stjamesvw.ca
  2306: 'Volkswagen', // sherwoodpark-vw.ca
  2332: 'Volkswagen', // northland-vw.ca
  2333: 'Volkswagen', // gpvolkswagen.ca
  // Honda · Acura
  1138: 'Honda \u00B7 Acura', // brantfordhonda.com
  1285: 'Honda \u00B7 Acura', // sterlinghonda.com
  1768: 'Honda \u00B7 Acura', // acuraofhamilton.ca
  2114: 'Honda \u00B7 Acura', // londonhonda.com
  2118: 'Honda \u00B7 Acura', // waterloohonda.com
  // Ford
  1420: 'Ford', // rosecityford.com
  2465: 'Ford', // kelleherford.com
  // Mercedes-Benz
  2512: 'Mercedes-Benz', // mercedes-benz-heritagevalley.ca
  // BMW (incl. MINI)
  838:  'BMW', // bmwmontrealcentre.ca
  1016: 'BMW', // minimontrealcentre.ca
};

// Fallback: name-fragment matching for sites not yet in SITE_BRAND.
var BRAND_FRAGS = {
  'Stellantis':        ['chrysler', 'dodge', 'jeep', 'ram', 'wellington'],
  'Volkswagen':        ['volkswagen', '-vw.', 'vw.ca'],
  'Honda \u00B7 Acura': ['honda', 'acura'],
  'Ford':              ['ford'],
  'Mercedes-Benz':     ['mercedes'],
  'BMW':               ['bmw', 'mini'],
};

export function getBrand(siteId, domainTitle) {
  // Primary: direct siteID lookup
  var id = parseInt(siteId, 10);
  if (SITE_BRAND[id]) return SITE_BRAND[id];
  // Fallback: domain/title substring match
  var lower = (domainTitle || '').toLowerCase();
  var brands = Object.keys(BRAND_FRAGS);
  for (var i = 0; i < brands.length; i++) {
    var frags = BRAND_FRAGS[brands[i]];
    for (var j = 0; j < frags.length; j++) {
      if (lower.indexOf(frags[j]) !== -1) return brands[i];
    }
  }
  return null;
}

// Navigate to another dealer at the same section path using sitesRedirect.
function switchDealer(siteId, currentPath) {
  window.location.href = '/ajax/sitesRedirect?siteID=' +
    encodeURIComponent(siteId) + '&dest=' + encodeURIComponent(currentPath);
}

export function buildBrandNav() {
  var bc = document.getElementById('d2c-breadcrumb');
  if (!bc) return;

  var dealerPill = bc.querySelector('.d2c-bc-dealer');
  if (!dealerPill) return;

  // Resolve current site ID
  var siteIdEl = document.getElementById('currentSiteID');
  var currentSiteId = siteIdEl ? siteIdEl.value : null;
  if (!currentSiteId) return;

  // Read all dealer entries from #side-menu > li.
  // Each top-level li is a dealer site; its title attr = domain; siteID is on
  // any [data-siteid] element nested inside.
  var sideMenu = document.getElementById('side-menu');
  if (!sideMenu) return;

  var allDealers = [];
  var topLis = sideMenu.children; // direct children only
  for (var i = 0; i < topLis.length; i++) {
    var li = topLis[i];
    var topAnchor = li.querySelector(':scope > a');
    if (!topAnchor) continue;
    // Domain title, e.g. "capitaljeep.com"
    var domainTitle = (topAnchor.getAttribute('title') || '').trim();
    if (!domainTitle) continue;
    // SiteID from first [data-siteid] inside this li
    var siteIdEl2 = li.querySelector('[data-siteid]');
    if (!siteIdEl2) continue;
    var siteId = siteIdEl2.getAttribute('data-siteid');
    if (!siteId) continue;
    allDealers.push({ id: siteId, name: domainTitle, brand: getBrand(siteId, domainTitle) });
  }

  // Find current dealer + its brand
  var currentDealer = null;
  for (var d = 0; d < allDealers.length; d++) {
    if (allDealers[d].id === currentSiteId) { currentDealer = allDealers[d]; break; }
  }
  if (!currentDealer || !currentDealer.brand) return;

  var currentBrand = currentDealer.brand;

  // Collect same-brand dealers sorted alphabetically
  var brandDealers = allDealers
    .filter(function (d) { return d.brand === currentBrand; })
    .sort(function (a, b) { return a.name.localeCompare(b.name); });

  if (brandDealers.length < 2) { console.warn('[BrandNav] only 1 or 0 same-brand dealers found:', brandDealers); return; }

  var currentIdx = -1;
  for (var k = 0; k < brandDealers.length; k++) {
    if (brandDealers[k].id === currentSiteId) { currentIdx = k; break; }
  }
  if (currentIdx === -1) { console.warn('[BrandNav] current dealer not found in brandDealers list'); return; }

  var currentPath = window.location.pathname;
  var prevIdx = (currentIdx - 1 + brandDealers.length) % brandDealers.length;
  var nextIdx = (currentIdx + 1) % brandDealers.length;

  // ── Build the pill widget (replaces .d2c-bc-dealer span) ──────────────────
  var wrapper = document.createElement('span');
  wrapper.className = 'd2c-bn-wrapper';
  wrapper.innerHTML =
    '<button class="d2c-bn-arrow d2c-bn-prev" title="' + escHtml(brandDealers[prevIdx].name) + '" data-sid="' + escHtml(brandDealers[prevIdx].id) + '">\u2039</button>' +
    '<button class="d2c-bc-dealer d2c-bn-pill">' + escHtml(currentDealer.name) + '<span class="d2c-bn-caret"> \u25BE</span></button>' +
    '<button class="d2c-bn-arrow d2c-bn-next" title="' + escHtml(brandDealers[nextIdx].name) + '" data-sid="' + escHtml(brandDealers[nextIdx].id) + '">\u203A</button>';

  dealerPill.parentNode.replaceChild(wrapper, dealerPill);

  // ── Build dropdown (appended to body, positioned fixed) ───────────────────
  var dropdown = document.createElement('ul');
  dropdown.className = 'd2c-bn-dropdown';
  dropdown.innerHTML =
    '<li class="d2c-bn-dropdown-header">' + escHtml(currentBrand) + '</li>' +
    brandDealers.map(function (d) {
      return '<li><a href="#" data-sid="' + escHtml(d.id) + '"' +
        (d.id === currentSiteId ? ' class="d2c-bn-current"' : '') + '>' +
        escHtml(d.name) + '</a></li>';
    }).join('');
  document.body.appendChild(dropdown);

  var pillBtn   = wrapper.querySelector('.d2c-bn-pill');
  var prevBtn   = wrapper.querySelector('.d2c-bn-prev');
  var nextBtn   = wrapper.querySelector('.d2c-bn-next');
  var isOpen    = false;

  function openDropdown() {
    var rect = pillBtn.getBoundingClientRect();
    dropdown.style.top  = (rect.bottom + 4) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.classList.add('d2c-bn-open');
    isOpen = true;
  }

  function closeDropdown() {
    dropdown.classList.remove('d2c-bn-open');
    isOpen = false;
  }

  prevBtn.addEventListener('click', function () {
    switchDealer(brandDealers[prevIdx].id, currentPath);
  });

  nextBtn.addEventListener('click', function () {
    switchDealer(brandDealers[nextIdx].id, currentPath);
  });

  pillBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen ? closeDropdown() : openDropdown();
  });

  dropdown.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[data-sid]');
    if (!anchor) return;
    e.preventDefault();
    var targetId = anchor.getAttribute('data-sid');
    if (targetId === currentSiteId) { closeDropdown(); return; }
    switchDealer(targetId, currentPath);
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !wrapper.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  // Proactively warm the SW cache for all same-brand dealers at the current section.
  // Runs at browser-idle time so it never competes with foreground work.
  // After this, switching to any same-brand dealer loads instantly from cache.
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    var sw = navigator.serviceWorker.controller;
    var idleFn = typeof requestIdleCallback === 'function'
      ? function (fn) { requestIdleCallback(fn, { timeout: 8000 }); }
      : function (fn) { setTimeout(fn, 4000); };
    idleFn(function () {
      brandDealers.forEach(function (d) {
        if (d.id === currentSiteId) return; // already on this dealer
        sw.postMessage({ type: 'prefetchDealer', id: d.id, paths: [currentPath] });
      });
    });
  }
}
