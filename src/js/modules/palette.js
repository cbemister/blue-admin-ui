import { escHtml } from './utils.js';
import { getBrand } from './brand-nav.js';

var paletteOverlay, paletteInput, paletteResults;
var commands = [];
var filtered = [];
var selIdx = 0;

// Default filters (pinned stars) — loaded from localStorage, survives browser restarts
var defaultPageFilters  = new Set(JSON.parse(localStorage.getItem('d2c-palette-page-defaults')  || '[]'));
var defaultBrandFilters = new Set(JSON.parse(localStorage.getItem('d2c-palette-brand-defaults') || '[]'));

// Active filter state — persisted in localStorage so it survives dealer navigation and
// browser restarts. Falls back to the pinned defaults if no saved active state exists yet.
var _savedPageActive  = localStorage.getItem('d2c-palette-page-active');
var _savedBrandActive = localStorage.getItem('d2c-palette-brand-active');
var activePageFilters  = new Set(JSON.parse(_savedPageActive  !== null ? _savedPageActive  : JSON.stringify(Array.from(defaultPageFilters))));
var activeBrandFilters = new Set(JSON.parse(_savedBrandActive !== null ? _savedBrandActive : JSON.stringify(Array.from(defaultBrandFilters))));

// Page section definitions — shared between scrapeCommands() and buildFilterBar()
var NAV_SECTIONS = [
  { label: 'General',      slug: 'general',       path: '/sites/general' },
  { label: 'Homepage',     slug: 'homepage',      path: '/sites/homepage' },
  { label: 'New Vehicles', slug: 'new-vehicles',  path: '/sites/new-vehicles' },
  { label: 'Pre-owned',    slug: 'used-vehicles', path: '/sites/used-vehicles' },
  { label: 'Promotions',   slug: 'promotions',    path: '/sites/promotions' },
  { label: 'Financing',    slug: 'financing',     path: '/sites/financing' },
  { label: 'Service',      slug: 'services',      path: '/sites/services' },
  { label: 'Our Team',     slug: 'our-team',      path: '/sites/our-team' },
  { label: 'Contact Us',   slug: 'contact-us',    path: '/sites/contact-us' },
  { label: 'Custom Pages', slug: 'custom-pages',  path: '/sites/custom-pages' },
  { label: 'Clearance',    slug: 'clearance',     path: '/sites/clearance' },
  { label: 'Statistics',   slug: 'stats',         path: '/sites/stats' }
];

export function buildPalette() {
  if (document.getElementById('d2c-palette-overlay')) return;
  paletteOverlay = document.createElement('div');
  paletteOverlay.id = 'd2c-palette-overlay';
  paletteOverlay.style.display = 'none';
  paletteOverlay.innerHTML =
    '<div id="d2c-palette">' +
      '<input id="d2c-palette-input" type="text" autocomplete="off" placeholder="Search pages, dealerships\u2026" />' +
      '<div id="d2c-palette-results"></div>' +
      '<div id="d2c-palette-footer">' +
        '<span><kbd>\u2191</kbd><kbd>\u2193</kbd> navigate</span>' +
        '<span><kbd>Enter</kbd> open</span>' +
        '<span><kbd>Esc</kbd> close</span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(paletteOverlay);

  paletteInput   = document.getElementById('d2c-palette-input');
  paletteResults = document.getElementById('d2c-palette-results');

  paletteInput.addEventListener('input', function () { selIdx = 0; render(this.value); });
  paletteInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, filtered.length - 1); render(paletteInput.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); render(paletteInput.value); }
    else if (e.key === 'Enter')  { e.preventDefault(); execute(filtered[selIdx]); }
    else if (e.key === 'Escape') { closePalette(); }
  });
  paletteResults.addEventListener('click', function (e) {
    var item = e.target.closest('.d2c-palette-item');
    if (item) execute(filtered[parseInt(item.getAttribute('data-i'))]);
  });
  paletteOverlay.addEventListener('click', function (e) {
    if (e.target === paletteOverlay) closePalette();
  });

  // Keyboard shortcut — registered here so paletteOverlay is guaranteed to exist
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      paletteOverlay.style.display === 'none' ? openPalette() : closePalette();
    }
  });
}

function scrapeCommands() {
  var cmds = [];
  // Pages from sidebar — walk up DOM to get the parent dealer name
  var seenPageKeys = {}; // dedup EN+FR bilingual duplicates (same href, same dealer)
  var links = document.querySelectorAll('#side-menu a[data-islink="true"]');
  links.forEach(function (a) {
    var title = a.getAttribute('title') || a.textContent.trim();
    var href  = a.getAttribute('href');
    if (!href || !title) return;

    // Find the top-level dealer <li> this link belongs to
    var dealerName = '';
    var topLi = a.closest('#side-menu > li');
    if (topLi) {
      for (var ci = 0; ci < topLi.children.length; ci++) {
        if (topLi.children[ci].tagName === 'A') {
          var dealerAnchor = topLi.children[ci];
          var titleSpan = dealerAnchor.querySelector('.title');
          dealerName = (titleSpan || dealerAnchor).textContent.trim();
          break;
        }
      }
    }

    // Skip bilingual duplicates — EN/FR links have different hrefs but same title
    var dedupKey = (dealerName + '|' + title).toLowerCase();
    if (seenPageKeys[dedupKey]) return;
    seenPageKeys[dedupKey] = true;

    var icon = (a.querySelector('i.fa') || {}).className || 'fa fa-file-o';
    var displayTitle = dealerName ? dealerName + ' \u203A ' + title : title;
    var pgSiteIdEl = topLi ? topLi.querySelector('[data-siteid]') : null;
    var pgSiteId   = pgSiteIdEl ? pgSiteIdEl.getAttribute('data-siteid') : null;
    var pgSection  = (href.match(/\/sites\/(?:\d+\/)?([^/?#]+)/) || [])[1] || null;
    cmds.push({ type: 'page', title: displayTitle, href: href, icon: icon, q: (dealerName ? dealerName + ' ' + title : title).toLowerCase(), section: pgSection, brand: pgSiteId ? getBrand(pgSiteId, dealerName) : null });
  });

  // Dealerships from #side-menu
  var sideMenu = document.getElementById('side-menu');
  var currentSiteEl = document.getElementById('currentSiteID');
  var currentId = currentSiteEl ? currentSiteEl.value : '';

  if (sideMenu) {
    var topLis = sideMenu.children;
    for (var j = 0; j < topLis.length; j++) {
      var li = topLis[j];
      var anchor = li.querySelector(':scope > a');
      if (!anchor) continue;
      var siteIdEl = li.querySelector('[data-siteid]');
      if (!siteIdEl) continue;
      var sid = siteIdEl.getAttribute('data-siteid');
      if (!sid) continue;
      var titleSpan = anchor.querySelector('.title');
      var name = titleSpan ? titleSpan.textContent.trim() : (anchor.getAttribute('title') || '');
      if (!name) continue;

      cmds.push({
        type:    'dealer',
        title:   name,
        sub:     sid === currentId ? '(current site)' : 'Switch to this dealership',
        siteId:  sid,
        icon:    'fa fa-fw fa-globe',
        q:       name.toLowerCase(),
        section: null,
        brand:   getBrand(sid, name)
      });

      if (sid !== currentId) {
        NAV_SECTIONS.forEach(function (pg) {
          cmds.push({
            type:    'nav',
            title:   name + ' \u203A ' + pg.label,
            href:    pg.path,
            siteId:  sid,
            icon:    'fa fa-fw fa-arrow-right',
            q:       (name + ' ' + pg.label).toLowerCase(),
            section: pg.slug,
            brand:   getBrand(sid, name)
          });
        });
      }
    }
  }
  return cmds;
}

function buildFilterBar() {
  var existing = document.getElementById('d2c-palette-filters');
  if (existing) existing.parentNode.removeChild(existing);

  // Collect unique brands that actually appear in the current command set
  var brandSet = {};
  commands.forEach(function (c) { if (c.brand) brandSet[c.brand] = true; });
  var brands = Object.keys(brandSet).sort();

  var barEl = document.createElement('div');
  barEl.id = 'd2c-palette-filters';

  // Page pills row
  var pageRowHtml = '<div class="d2c-pf-row"><span class="d2c-pf-label">Pages</span>';
  NAV_SECTIONS.forEach(function (pg) {
    var cls = 'd2c-pf-pill' +
      (activePageFilters.has(pg.slug)  ? ' d2c-pf-active'  : '') +
      (defaultPageFilters.has(pg.slug) ? ' d2c-pf-pinned' : '');
    pageRowHtml +=
      '<button class="' + cls + '" data-page="' + pg.slug + '">' +
        '<span class="d2c-pf-pill-label">' + escHtml(pg.label) + '</span>' +
        '<span class="d2c-pf-star" data-pin-page="' + pg.slug + '" title="Pin as default">\u2605</span>' +
      '</button>';
  });
  pageRowHtml += '</div>';

  // Brand pills row (only rendered when brands exist in side-menu)
  var brandRowHtml = '';
  if (brands.length > 0) {
    brandRowHtml = '<div class="d2c-pf-row"><span class="d2c-pf-label">Brands</span>';
    brands.forEach(function (brand) {
      var cls = 'd2c-pf-pill' +
        (activeBrandFilters.has(brand)  ? ' d2c-pf-active'  : '') +
        (defaultBrandFilters.has(brand) ? ' d2c-pf-pinned' : '');
      brandRowHtml +=
        '<button class="' + cls + '" data-brand="' + escHtml(brand) + '">' +
          '<span class="d2c-pf-pill-label">' + escHtml(brand) + '</span>' +
          '<span class="d2c-pf-star" data-pin-brand="' + escHtml(brand) + '" title="Pin as default">\u2605</span>' +
        '</button>';
    });
    brandRowHtml += '</div>';
  }

  barEl.innerHTML = pageRowHtml + brandRowHtml;

  // Insert between input and results
  var resultsEl = document.getElementById('d2c-palette-results');
  resultsEl.parentNode.insertBefore(barEl, resultsEl);

  barEl.addEventListener('click', function (e) {
    // Star click — toggle pin/default (must check before pill so the star wins)
    var starEl = e.target.closest('[data-pin-page],[data-pin-brand]');
    if (starEl) {
      e.stopPropagation();
      var pinPage  = starEl.getAttribute('data-pin-page');
      var pinBrand = starEl.getAttribute('data-pin-brand');
      if (pinPage) {
        if (defaultPageFilters.has(pinPage)) defaultPageFilters.delete(pinPage);
        else defaultPageFilters.add(pinPage);
        localStorage.setItem('d2c-palette-page-defaults', JSON.stringify(Array.from(defaultPageFilters)));
      }
      if (pinBrand) {
        if (defaultBrandFilters.has(pinBrand)) defaultBrandFilters.delete(pinBrand);
        else defaultBrandFilters.add(pinBrand);
        localStorage.setItem('d2c-palette-brand-defaults', JSON.stringify(Array.from(defaultBrandFilters)));
      }
      buildFilterBar(); // rebuild to reflect new pin state
      return;
    }

    // Pill click — toggle active filter and persist to localStorage
    var pillEl = e.target.closest('[data-page],[data-brand]');
    if (!pillEl) return;
    var pageSl = pillEl.getAttribute('data-page');
    var brand  = pillEl.getAttribute('data-brand');
    if (pageSl) {
      if (activePageFilters.has(pageSl)) activePageFilters.delete(pageSl);
      else activePageFilters.add(pageSl);
      localStorage.setItem('d2c-palette-page-active', JSON.stringify(Array.from(activePageFilters)));
    }
    if (brand) {
      if (activeBrandFilters.has(brand)) activeBrandFilters.delete(brand);
      else activeBrandFilters.add(brand);
      localStorage.setItem('d2c-palette-brand-active', JSON.stringify(Array.from(activeBrandFilters)));
    }
    // Update pill active classes in-place (faster than full rebuild)
    barEl.querySelectorAll('.d2c-pf-pill').forEach(function (p) {
      var ps = p.getAttribute('data-page');
      var pb = p.getAttribute('data-brand');
      p.classList.toggle('d2c-pf-active',
        (ps && activePageFilters.has(ps)) || (pb && activeBrandFilters.has(pb)));
    });
    selIdx = 0;
    render(paletteInput.value);
  });
}

function fuzzyScore(query, text) {
  if (!text) return 0;
  if (text.includes(query)) return 100 - text.indexOf(query);
  var qi = 0, score = 0, last = -1;
  for (var i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) {
      score += 10;
      if (last === i - 1) score += 5;
      if (i === 0 || text[i - 1] === ' ' || text[i - 1] === '\u203A') score += 8;
      last = i; qi++;
    }
  }
  return qi === query.length ? score : 0;
}

function render(q) {
  var lq = q.trim().toLowerCase();
  var hasPageFilter  = activePageFilters.size > 0;
  var hasBrandFilter = activeBrandFilters.size > 0;
  var hasFilters     = hasPageFilter || hasBrandFilter;

  if (!lq) {
    if (hasFilters) {
      // With active filters and no query, expose nav (cross-dealer) + page entries for filtering
      filtered = commands.filter(function (c) { return c.type === 'nav' || c.type === 'page'; });
    } else {
      filtered = commands.filter(function (c) { return c.type === 'page'; });
      if (filtered.length === 0) {
        filtered = commands.filter(function (c) { return c.type === 'dealer'; });
      }
    }
  } else {
    var scored = commands.map(function (c) { return { c: c, s: fuzzyScore(lq, c.q) }; })
      .filter(function (x) { return x.s > 0; });
    scored.sort(function (a, b) { return b.s - a.s; });
    filtered = scored.map(function (x) { return x.c; });
  }

  // Apply active filters — OR within each group, AND between groups
  if (hasPageFilter) {
    filtered = filtered.filter(function (c) { return c.section && activePageFilters.has(c.section); });
  }
  if (hasBrandFilter) {
    filtered = filtered.filter(function (c) { return c.brand && activeBrandFilters.has(c.brand); });
  }
  filtered = filtered.slice(0, 20);

  selIdx = Math.min(selIdx, Math.max(0, filtered.length - 1));

  if (filtered.length === 0) {
    var emptyMsg = lq
      ? 'No results for \u201c' + escHtml(q) + '\u201d'
      : 'No shortcuts found \u2014 navigate to a section page first';
    paletteResults.innerHTML = '<div class="d2c-palette-empty">' + emptyMsg + '</div>';
    return;
  }

  var html = '';
  var pageFilterOn = activePageFilters.size > 0;
  filtered.forEach(function (cmd, i) {
    var active = i === selIdx ? ' d2c-palette-active' : '';
    var badge = (pageFilterOn || cmd.type === 'page') ?
      '<span class="d2c-palette-type d2c-pt-page">Page</span>' :
      cmd.type === 'dealer' ?
      '<span class="d2c-palette-type d2c-pt-dealer">Dealer</span>' :
      '<span class="d2c-palette-type d2c-pt-nav">Nav</span>';
    html +=
      '<div class="d2c-palette-item' + active + '" data-i="' + i + '">' +
        '<i class="' + escHtml(cmd.icon || 'fa fa-file-o') + '"></i>' +
        '<span class="d2c-palette-title">' + escHtml(cmd.title) + '</span>' +
        badge +
      '</div>';
  });
  paletteResults.innerHTML = html;

  var activeEl = paletteResults.querySelector('.d2c-palette-active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
}

function execute(cmd) {
  if (!cmd) return;
  closePalette();

  if (cmd.type === 'page') {
    window.location.href = cmd.href;
  } else if (cmd.type === 'dealer') {
    window.location.href = '/ajax/sitesRedirect?siteID=' +
      encodeURIComponent(cmd.siteId) + '&dest=' + encodeURIComponent('/sites/general');
  } else if (cmd.type === 'nav') {
    window.location.href = '/ajax/sitesRedirect?siteID=' +
      encodeURIComponent(cmd.siteId) + '&dest=' + encodeURIComponent(cmd.href);
  }
}

export function openPalette() {
  // Dismiss any open Bootstrap modal so its backdrop doesn't stack with ours
  try {
    if (typeof jQuery !== 'undefined') {
      jQuery('.modal.in').modal('hide');
      jQuery('.modal-backdrop').remove();
      jQuery('body').removeClass('modal-open').css('padding-right', '');
    }
  } catch (e) { /* ignore */ }

  commands = scrapeCommands();
  buildFilterBar();
  paletteOverlay.style.display = 'flex';
  paletteInput.value = '';
  selIdx = 0;
  render('');
  setTimeout(function () { paletteInput.focus(); }, 40);
}

function closePalette() {
  paletteOverlay.style.display = 'none';
}
