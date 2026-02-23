import { escHtml } from './utils.js';

var paletteOverlay, paletteInput, paletteResults;
var commands = [];
var filtered = [];
var selIdx = 0;

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
    cmds.push({ type: 'page', title: displayTitle, href: href, icon: icon, q: (dealerName ? dealerName + ' ' + title : title).toLowerCase() });
  });

  // Dealerships from selector
  var sel = document.querySelector('#dealername select.selectpicker');
  if (sel) {
    var currentId = '';
    var currentSiteEl = document.getElementById('currentSiteID');
    if (currentSiteEl) currentId = currentSiteEl.value;
    if (!currentId && sel.options.length) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].selected) { currentId = sel.options[i].value; break; }
      }
    }

    var pages = [
      { name: 'General',      path: '/sites/general' },
      { name: 'Homepage',     path: '/sites/homepage' },
      { name: 'New Vehicles', path: '/sites/new-vehicles' },
      { name: 'Pre-owned',    path: '/sites/used-vehicles' },
      { name: 'Promotions',   path: '/sites/promotions' },
      { name: 'Financing',    path: '/sites/financing' },
      { name: 'Service',      path: '/sites/services' },
      { name: 'Our Team',     path: '/sites/our-team' },
      { name: 'Contact Us',   path: '/sites/contact-us' },
      { name: 'Custom Pages', path: '/sites/custom-pages' },
      { name: 'Clearance',    path: '/sites/clearance' },
      { name: 'Statistics',   path: '/sites/stats' }
    ];

    for (var j = 0; j < sel.options.length; j++) {
      var opt = sel.options[j];
      var sid  = opt.value;
      var name = opt.textContent.trim().replace(/\s*\(\d+\)\s*$/, '');
      if (!sid || !name) continue;

      cmds.push({
        type:  'dealer',
        title: name,
        sub:   sid === currentId ? '(current site)' : 'Switch to this dealership',
        siteId: sid,
        icon:  'fa fa-fw fa-globe',
        q:     name.toLowerCase()
      });

      if (sid !== currentId) {
        pages.forEach(function (pg) {
          cmds.push({
            type:  'nav',
            title: name + ' \u203A ' + pg.name,
            href:  pg.path,
            siteId: sid,
            icon:  'fa fa-fw fa-arrow-right',
            q:     (name + ' ' + pg.name).toLowerCase()
          });
        });
      }
    }
  }
  return cmds;
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
  if (!lq) {
    filtered = commands.filter(function (c) { return c.type === 'page'; }).slice(0, 20);
    if (filtered.length === 0) {
      filtered = commands.filter(function (c) { return c.type === 'dealer'; }).slice(0, 20);
    }
  } else {
    var scored = commands.map(function (c) { return { c: c, s: fuzzyScore(lq, c.q) }; })
      .filter(function (x) { return x.s > 0; });
    scored.sort(function (a, b) { return b.s - a.s; });
    filtered = scored.slice(0, 20).map(function (x) { return x.c; });
  }

  selIdx = Math.min(selIdx, Math.max(0, filtered.length - 1));

  if (filtered.length === 0) {
    var emptyMsg = lq
      ? 'No results for \u201c' + escHtml(q) + '\u201d'
      : 'No shortcuts found \u2014 navigate to a section page first';
    paletteResults.innerHTML = '<div class="d2c-palette-empty">' + emptyMsg + '</div>';
    return;
  }

  var html = '';
  filtered.forEach(function (cmd, i) {
    var active = i === selIdx ? ' d2c-palette-active' : '';
    var badge = cmd.type === 'page' ?
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
    var sel = document.querySelector('#dealername select.selectpicker');
    if (sel && typeof jQuery !== 'undefined') {
      jQuery(sel).val(cmd.siteId).trigger('change');
    }
  } else if (cmd.type === 'nav') {
    var selEl = document.querySelector('#dealername select.selectpicker');
    if (selEl && typeof jQuery !== 'undefined') {
      jQuery(selEl).val(cmd.siteId).trigger('change');
      setTimeout(function () { window.location.href = cmd.href; }, 400);
    } else {
      window.location.href = cmd.href;
    }
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
  paletteOverlay.style.display = 'flex';
  paletteInput.value = '';
  selIdx = 0;
  render('');
  setTimeout(function () { paletteInput.focus(); }, 40);
}

function closePalette() {
  paletteOverlay.style.display = 'none';
}
