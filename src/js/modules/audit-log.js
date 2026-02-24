var STORAGE_KEY = 'd2c-audit-log';
var MAX_ENTRIES = 100;

var SECTION_LABELS = {
  'homepage':         'Homepage',
  'promotions':       'Promotions',
  'grouppromotions':  'Group Promotions',
  'our-team':         'Our Team',
  'new-vehicles':     'New Vehicles',
  'used-vehicles':    'Pre-owned',
  'clearance':        'Clearance',
  'financing':        'Financing',
  'services':         'Service',
  'contact-us':       'Contact Us',
  'general':          'General',
  'custom-pages':     'Custom Pages',
  'groupbanners':     'Group Banners',
  'groupcustompages': 'Group Custom Pages'
};

var AUDIT_PATH_MAP = {
  'homepage':         '/',
  'promotions':       '/our-promotions.html',
  'grouppromotions':  '/our-promotions.html',
  'our-team':         '/ourteam.html',
  'new-vehicles':     '/new.html',
  'used-vehicles':    '/pre-owned.html',
  'clearance':        '/clearance.html',
  'financing':        '/financing.html',
  'services':         '/service.html',
  'contact-us':       '/contact-us.html',
  'general':          '/#footerWrapper'
};

// Maps expandablecontainer attr values → public page hash anchors (promotions page only)
var PROMO_SECTION_HASH = {
  'promos-new':      '#new',
  'promos-used':     '#used',
  'promos-services': '#service'
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveEntries(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES))); }
  catch (e) {}
}

// ── Detect save context from current page + sidebar DOM ──────────────────────

function getSaveContext() {
  var m = window.location.pathname.match(/^\/sites\/(?:\d+\/)?([^\/]+?)\/?$/);
  if (!m) return null;
  var section = m[1];

  var activeLi = document.querySelector('#side-menu > li.active');
  if (!activeLi) return null;

  // Dealer name from the top-level <a>
  var dealerName = '';
  for (var ci = 0; ci < activeLi.children.length; ci++) {
    if (activeLi.children[ci].tagName === 'A') {
      var ts = activeLi.children[ci].querySelector('.title');
      dealerName = (ts || activeLi.children[ci]).textContent.trim();
      break;
    }
  }

  // Live domain — read from the dealer's own sidebar external-link onclick
  // (the a-external-link inside the active li). Do NOT use #globe_website_link:
  // that reflects whichever site is selected in the global header selector,
  // which may differ from the dealer whose page is actually being edited.
  var auditUrl = null;
  var publicPath = AUDIT_PATH_MAP[section];
  if (publicPath) {
    var domain = null;
    var externalLinks = activeLi.querySelectorAll('[onclick*="window.open"]');
    for (var i = 0; i < externalLinks.length; i++) {
      var onclick = externalLinks[i].getAttribute('onclick') || '';
      var dm = onclick.match(/window\.open\(['"]([^'"]+)['"]/);
      if (dm) { domain = dm[1].replace(/\/$/, ''); break; }
    }
    if (domain) auditUrl = domain + publicPath;

    // For promotions pages, append #new / #used / #service based on whichever
    // matching expandable section is open at save time. Walk in DOM order so
    // we always pick the topmost open promo section.
    if (auditUrl && (section === 'promotions' || section === 'grouppromotions')) {
      var promoSections = document.querySelectorAll('h2.expandablesection[expandablecontainer]');
      for (var pi = 0; pi < promoSections.length; pi++) {
        var container = promoSections[pi].getAttribute('expandablecontainer');
        var hash = PROMO_SECTION_HASH[container];
        if (hash && promoSections[pi].getAttribute('expandablestatus') !== 'closed') {
          auditUrl += hash;
          break;
        }
      }
    }
  }

  return {
    section:  section,
    label:    SECTION_LABELS[section] || section,
    dealer:   dealerName,
    auditUrl: auditUrl,
    ts:       Date.now()
  };
}

// ── Time formatting ───────────────────────────────────────────────────────────

function relativeTime(ts) {
  var diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5)   return 'Just now';
  if (diff < 60)  return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  var d = new Date(ts);
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
         d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Panel state ───────────────────────────────────────────────────────────────

var _panel   = null;
var _listEl  = null;
var _badgeEl = null;
var _isOpen  = false;

function _pendingCount(entries) {
  return entries.filter(function (e) { return !e.qcd; }).length;
}

function _refreshList() {
  if (!_listEl) return;
  var entries = loadEntries();
  if (entries.length === 0) {
    _listEl.innerHTML = '<div class="d2c-al-empty">No saves recorded yet.\nSave a page to start tracking.</div>';
    return;
  }
  _listEl.innerHTML = entries.map(function (e) {
    var entryClass = 'd2c-al-entry' + (e.qcd ? ' d2c-al-qcd' : '');
    var checkClass = 'd2c-al-check' + (e.qcd ? ' d2c-al-check-done' : '');
    var checkTitle = e.qcd ? 'QC\u2019d \u2014 click to undo' : 'Mark as QC\u2019d';
    var title = (e.dealer ? escHtml(e.dealer) + ' &rsaquo; ' : '') + escHtml(e.label);
    var titleHtml = e.auditUrl
      ? '<div class="d2c-al-title d2c-al-link" data-url="' + escHtml(e.auditUrl) + '" title="Open live page">' + title + ' <i class="fa fa-external-link d2c-al-link-icon"></i></div>'
      : '<div class="d2c-al-title">' + title + '</div>';
    return (
      '<div class="' + entryClass + '" data-id="' + e.id + '">' +
        '<div class="d2c-al-row">' +
          '<span class="d2c-al-time">' + relativeTime(e.ts) + '</span>' +
          '<div class="d2c-al-actions">' +
            '<button class="' + checkClass + '" data-action="qc" data-id="' + e.id + '" title="' + checkTitle + '">&#10003;</button>' +
            '<button class="d2c-al-remove" data-action="remove" data-id="' + e.id + '" title="Remove from log">&times;</button>' +
          '</div>' +
        '</div>' +
        titleHtml +
      '</div>'
    );
  }).join('');
}

function _toggleQC(id) {
  var entries = loadEntries().map(function (e) {
    if (e.id === id) e.qcd = !e.qcd;
    return e;
  });
  saveEntries(entries);
  _refreshList();
  _setBadge(_pendingCount(entries));
}

function _removeEntry(id) {
  var entries = loadEntries().filter(function (e) { return e.id !== id; });
  saveEntries(entries);
  _refreshList();
  _setBadge(_pendingCount(entries));
}

function _setBadge(count) {
  if (!_badgeEl) return;
  if (count > 0) {
    _badgeEl.textContent = count > 9 ? '9+' : String(count);
    _badgeEl.style.display = '';
    _badgeEl.classList.remove('d2c-al-badge-clear');
  } else {
    // Show green dot if there are entries but all QC'd, else hide
    var allEntries = loadEntries();
    if (allEntries.length > 0) {
      _badgeEl.textContent = '\u2713';
      _badgeEl.style.display = '';
      _badgeEl.classList.add('d2c-al-badge-clear');
    } else {
      _badgeEl.style.display = 'none';
      _badgeEl.classList.remove('d2c-al-badge-clear');
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function addAuditEntry() {
  var ctx = getSaveContext();
  if (!ctx) return;
  ctx.id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  ctx.qcd = false;
  var entries = loadEntries();
  entries.unshift(ctx);
  saveEntries(entries);
  _refreshList();
  _setBadge(_pendingCount(entries));
  openAuditPanel();
}

export function openAuditPanel() {
  if (!_panel) return;
  _isOpen = true;
  _panel.classList.add('d2c-al-open');
}

export function buildAuditPanel() {
  if (document.getElementById('d2c-audit-wrap')) return;

  var wrap = document.createElement('div');
  wrap.id = 'd2c-audit-wrap';

  // ── Panel ──
  _panel = document.createElement('div');
  _panel.id = 'd2c-audit-panel';
  _panel.innerHTML =
    '<div id="d2c-al-header">' +
      '<span id="d2c-al-title"><i class="fa fa-history"></i>&nbsp; Save History</span>' +
      '<div id="d2c-al-actions">' +
        '<button id="d2c-al-clear" title="Clear all entries">Clear</button>' +
        '<button id="d2c-al-close" title="Close">&times;</button>' +
      '</div>' +
    '</div>' +
    '<div id="d2c-al-list"></div>';

  // ── Toggle button ──
  var toggle = document.createElement('button');
  toggle.id = 'd2c-audit-toggle';
  toggle.title = 'Save history';
  toggle.innerHTML =
    '<i class="fa fa-history"></i>' +
    '<span>Save History</span>' +
    '<span id="d2c-al-badge" style="display:none"></span>';

  wrap.appendChild(_panel);
  wrap.appendChild(toggle);
  document.body.appendChild(wrap);

  _listEl  = _panel.querySelector('#d2c-al-list');
  _badgeEl = toggle.querySelector('#d2c-al-badge');

  _refreshList();
  // Badge shows pending (unQC'd) count on load
  _setBadge(_pendingCount(loadEntries()));

  // Refresh relative timestamps every minute while panel is open
  setInterval(function () {
    if (_isOpen) _refreshList();
  }, 60000);

  toggle.addEventListener('click', function () {
    _isOpen = !_isOpen;
    _panel.classList.toggle('d2c-al-open', _isOpen);
    // Keep badge showing pending count — don't reset on open
  });

  _panel.querySelector('#d2c-al-close').addEventListener('click', function () {
    _isOpen = false;
    _panel.classList.remove('d2c-al-open');
  });

  _panel.querySelector('#d2c-al-clear').addEventListener('click', function () {
    saveEntries([]);
    _refreshList();
    _setBadge(0);
  });

  // Event delegation
  _listEl.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-action]');
    if (btn) {
      var id = btn.getAttribute('data-id');
      if (btn.getAttribute('data-action') === 'qc') { _toggleQC(id); return; }
      if (btn.getAttribute('data-action') === 'remove') { _removeEntry(id); return; }
    }
    // Clicking the title link: open live page in new tab
    var link = ev.target.closest('.d2c-al-link');
    if (link) {
      var url = link.getAttribute('data-url');
      if (url) window.open(url, '_blank', 'noopener');
    }
  });
}
