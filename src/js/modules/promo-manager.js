import { getRightPanel } from './utils.js';

// ── Section config ─────────────────────────────────────────────────────────
// Each entry maps a UI label to the platform's DOM conventions:
//   key         → argument to addPromo(key)
//   prefix      → field name prefix, e.g. "promonew"
//   containerId → id of the expandable <div> wrapping the section table
var SECTIONS = [
  { label: 'New Vehicle',    key: 'new',       prefix: 'promonew',       containerId: 'promos-new'      },
  { label: 'Used Vehicle',   key: 'used',       prefix: 'promoused',      containerId: 'promos-used'     },
  { label: 'Service / Parts', key: 'aftersale', prefix: 'promoaftersale', containerId: 'promos-services' },
  { label: 'Other',          key: 'other',      prefix: 'promoother',     containerId: 'promos-others'   }
];

// ── Status ─────────────────────────────────────────────────────────────────

function getStatus(start, expire) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start) {
    var s = new Date(start);
    if (!isNaN(s.getTime()) && s > today) return 'upcoming';
  }
  if (expire) {
    var e = new Date(expire);
    if (!isNaN(e.getTime())) {
      e.setHours(23, 59, 59, 999);
      if (e < today) return 'expired';
    }
  }
  return 'active';
}

// ── Read promotions from live DOM ──────────────────────────────────────────
// Finds every <tr id="{prefix}_title{N}"> in the section container and
// extracts title, dates, and sort order.

function readPromos(section) {
  var container = document.getElementById(section.containerId);
  if (!container) return [];

  // Match only numeric-suffixed rows (not _titletr divs which share the prefix)
  var re = new RegExp('^' + section.prefix + '_title(\\d+)$');
  var allRows = container.querySelectorAll('tr[id]');
  var promos = [];

  allRows.forEach(function (row, domIdx) {
    var m = row.id.match(re);
    if (!m) return;
    var n = m[1];
    // Read inputs scoped to this row to avoid cross-row getElementById collisions
    // when the platform reuses IDs or hasn't fully committed new rows yet.
    var titleEl  = row.querySelector('input[savefield="' + section.prefix + '_title[' + n + ']"][d2c_language="ENGLISH"]');
    var startEl  = row.querySelector('input[savefield="' + section.prefix + '_start[' + n + ']"]');
    var expireEl = row.querySelector('input[savefield="' + section.prefix + '_expire[' + n + ']"]');
    var orderEl  = row.querySelector('input[savefield="' + section.prefix + '_order[' + n + ']"]');

    var rawOrder = orderEl ? parseInt(orderEl.value, 10) : NaN;
    promos.push({
      title:    (titleEl  && titleEl.value)  ? titleEl.value  : '(untitled)',
      start:    (startEl  && startEl.value)  ? startEl.value  : '',
      expire:   (expireEl && expireEl.value) ? expireEl.value : '',
      orderVal: (!isNaN(rawOrder) && rawOrder > 0) ? rawOrder : 10000 + domIdx,
      row:      row
    });
  });

  promos.sort(function (a, b) { return a.orderVal - b.orderVal; });
  return promos;
}

// ── Scroll to & highlight a promo row ─────────────────────────────────────

function scrollToPromo(section, row) {
  var h2 = document.querySelector('h2[expandablecontainer="' + section.containerId + '"]');
  var needsExpand = h2 && h2.classList.contains('closed');
  if (needsExpand) h2.click();

  setTimeout(function () {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('d2c-pm-highlight');
    setTimeout(function () { row.classList.remove('d2c-pm-highlight'); }, 2500);
  }, needsExpand ? 320 : 0);
}

// ── Template copy ──────────────────────────────────────────────────────────
// Skip file uploads (img) and sort order — keep the new row's own values.
var RE_SKIP_SF = /_(img|order)\[/;

// ── Template storage ─────────────────────────────────────────────────────
var TEMPLATE_KEY     = 'd2c-promo-templates';
var TPL_COLLAPSE_KEY = 'd2c-pm-tpl-collapsed';

function loadTemplates() {
  try {
    var raw = localStorage.getItem(TEMPLATE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveTemplates(arr) {
  try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(arr)); } catch (e) {}
}

// ── Serialize a promo row into a portable field map ────────────────────────
// Returns { 'promonew_title[*]|ENGLISH': 'My Title', … }
// Normalisation: index stripped via replace(/\[\d+\]/, '[*]').
function serializePromoRow(row) {
  var fields = {};

  // Visible inputs, textareas, selects (not file, not radio)
  row.querySelectorAll(
    'input[savefield]:not([type="file"]):not([type="radio"]),textarea[savefield],select[savefield]'
  ).forEach(function (el) {
    var sf = el.getAttribute('savefield');
    if (RE_SKIP_SF.test(sf)) return;
    var lang    = el.getAttribute('d2c_language') || 'INDEPENDENT';
    var normSf  = sf.replace(/\[\d+\]/, '[*]');
    fields[normSf + '|' + lang] = el.value;
  });

  // Hidden inputs (e.g. _models)
  row.querySelectorAll('input[savefield][type="hidden"]').forEach(function (el) {
    var sf = el.getAttribute('savefield');
    if (RE_SKIP_SF.test(sf)) return;
    var lang   = el.getAttribute('d2c_language') || 'INDEPENDENT';
    var normSf = sf.replace(/\[\d+\]/, '[*]');
    fields[normSf + '|' + lang] = el.value;
  });

  // Radio buttons — only store the checked one(s)
  row.querySelectorAll('input[savefield][type="radio"]:checked').forEach(function (el) {
    var sf = el.getAttribute('savefield');
    if (RE_SKIP_SF.test(sf)) return;
    var lang   = el.getAttribute('d2c_language') || 'INDEPENDENT';
    var normSf = sf.replace(/\[\d+\]/, '[*]');
    fields['__radio__' + normSf + '|' + lang] = 'checked';
  });

  return fields;
}

// ── Get the actual numeric field index from a row's inner elements ──────────
// The <tr> id is unreliable for newly added rows (the platform may reuse an
// existing slot number while the inner fields reference a different index).
// This reads the index from the first title input found in the row instead.
function getRowFieldIndex(section, row) {
  var el = row.querySelector(
    'input[savefield^="' + section.prefix + '_title["],' +
    'input[fieldname^="'  + section.prefix + '_title["]'
  );
  if (!el) return null;
  var sf = el.getAttribute('savefield') || el.getAttribute('fieldname');
  var m  = sf && sf.match(/\[(\d+)\]/);
  return m ? m[1] : null;
}

// ── Apply stored template fields to a blank dest row ──────────────────────
// Supports both savefield= (saved rows) and fieldname= (newly added rows that
// haven't been saved yet — the platform only writes savefield after the first save).
function applyTemplateToRow(fields, destRow) {
  var SF  = ':not([type="file"]):not([type="radio"])';
  var FNX = ':not([savefield])';
  destRow.querySelectorAll(
    'input[savefield]'   + SF + ',textarea[savefield],select[savefield],' +
    'input[fieldname]'   + SF + FNX + ',textarea[fieldname]' + FNX + ',select[fieldname]' + FNX
  ).forEach(function (el) {
    var sf = el.getAttribute('savefield') || el.getAttribute('fieldname');
    if (!sf || RE_SKIP_SF.test(sf)) return;
    var lang   = el.getAttribute('d2c_language') || 'INDEPENDENT';
    var normSf = sf.replace(/\[\d+\]/, '[*]');
    var key    = normSf + '|' + lang;
    if (!(key in fields)) return;
    el.value = fields[key];
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (el.tagName === 'TEXTAREA' && el.getAttribute('richtext') === '1') {
      try {
        if (window.CKEDITOR && window.CKEDITOR.instances[el.id]) {
          window.CKEDITOR.instances[el.id].setData(fields[key]);
        }
      } catch (e) {}
    }
  });

  // Radio buttons — also support fieldname= on new rows
  destRow.querySelectorAll(
    'input[type="radio"][savefield],input[type="radio"][fieldname]:not([savefield])'
  ).forEach(function (el) {
    var sf = el.getAttribute('savefield') || el.getAttribute('fieldname');
    if (!sf || RE_SKIP_SF.test(sf)) return;
    var lang   = el.getAttribute('d2c_language') || 'INDEPENDENT';
    var normSf = sf.replace(/\[\d+\]/, '[*]');
    if (fields['__radio__' + normSf + '|' + lang] && !el.checked) el.click();
  });
}

// ── Find the most recently added blank promo row (any section) ────────────
// Newly added rows use fieldname= instead of savefield= (savefield only appears
// after the first platform save), so we fall back to fieldname when needed.
function findMostRecentBlankRow() {
  var blankRows = [];
  SECTIONS.forEach(function (section) {
    var container = document.getElementById(section.containerId);
    if (!container) return;
    var re = new RegExp('^' + section.prefix + '_title(\\d+)$');
    container.querySelectorAll('tr[id]').forEach(function (row) {
      if (!row.id.match(re)) return;
      // Use starts-with selectors — inner field index may differ from tr id
      var titleInput =
        row.querySelector('input[savefield^="' + section.prefix + '_title["][d2c_language="ENGLISH"]') ||
        row.querySelector('input[fieldname^="'  + section.prefix + '_title["][d2c_language="ENGLISH"]');
      if (titleInput && titleInput.value.trim() === '') blankRows.push(row);
    });
  });
  return blankRows.length ? blankRows[blankRows.length - 1] : null;
}

// ── Templates widget section ──────────────────────────────────────────────
var _templateSrcSel       = null; // ref to the source promo <select>
var _selectedPromoRow     = null; // <tr> of the currently selected promo (template target)
var _selectedPromoSection = null; // SECTIONS entry for the selected promo
var _selectedPromoTitle   = '';   // display title for the target indicator
var _tplTargetEl          = null; // ref to target indicator element in templates section

function refreshTemplatePromoDropdown() {
  if (!_templateSrcSel) return;
  var prevVal = _templateSrcSel.value;
  _templateSrcSel.innerHTML = '';

  var ph = document.createElement('option');
  ph.value = '';
  ph.textContent = 'Choose a promo to save\u2026';
  _templateSrcSel.appendChild(ph);

  SECTIONS.forEach(function (section) {
    var promos = readPromos(section).filter(function (p) { return p.title !== '(untitled)'; });
    if (!promos.length) return;
    var grp = document.createElement('optgroup');
    grp.label = section.label;
    promos.forEach(function (p, idx) {
      var opt = document.createElement('option');
      opt.value = section.key + ':' + idx;
      opt.textContent = p.title;
      grp.appendChild(opt);
    });
    _templateSrcSel.appendChild(grp);
  });

  if (prevVal) _templateSrcSel.value = prevVal;
}

// ── Update the template target indicator ──────────────────────────────────
function updateTemplateTarget() {
  if (_tplTargetEl) {
    if (_selectedPromoRow && _selectedPromoTitle) {
      _tplTargetEl.textContent = '\u2192 Target: ' + _selectedPromoTitle;
      _tplTargetEl.classList.remove('d2c-pm-tpl-target-none');
    } else {
      _tplTargetEl.textContent = '\u2192 Target: new blank row';
      _tplTargetEl.classList.add('d2c-pm-tpl-target-none');
    }
  }
  // Update all Apply button titles
  document.querySelectorAll('.d2c-pm-tpl-apply').forEach(function (btn) {
    btn.title = _selectedPromoRow
      ? 'Overwrite \u201c' + _selectedPromoTitle + '\u201d with this template'
      : 'Apply to the most recent blank promo row';
  });
}

function buildTemplateList() {
  var listEl = document.getElementById('d2c-pm-tpl-list');
  if (!listEl) return;

  var templates = loadTemplates();
  var badge = document.getElementById('d2c-pm-count-templates');
  if (badge) badge.textContent = templates.length;

  listEl.innerHTML = '';
  if (!templates.length) {
    var empty = document.createElement('div');
    empty.className = 'd2c-pm-empty';
    empty.textContent = 'No templates saved yet';
    listEl.appendChild(empty);
    return;
  }

  templates.forEach(function (tpl) {
    var item = document.createElement('div');
    item.className = 'd2c-pm-tpl-item';

    var nameEl = document.createElement('span');
    nameEl.className = 'd2c-pm-tpl-name';
    nameEl.textContent = tpl.name;
    nameEl.title = 'Saved ' + new Date(tpl.savedAt).toLocaleDateString();

    var applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'd2c-pm-tpl-btn d2c-pm-tpl-apply';
    applyBtn.textContent = 'Apply';
    applyBtn.title = 'Apply to the most recent blank promo row';
    applyBtn.addEventListener('click', function () {
      var targetRow     = null;
      var targetSection = null;

      if (_selectedPromoRow && document.body.contains(_selectedPromoRow)) {
        // Apply to the currently selected existing promo (with confirmation)
        if (!confirm('Overwrite \u201c' + _selectedPromoTitle + '\u201d with template \u201c' + tpl.name + '\u201d?')) return;
        targetRow     = _selectedPromoRow;
        targetSection = _selectedPromoSection;
      } else {
        // Fall back to the most recent blank row
        targetRow = findMostRecentBlankRow();
      }

      if (!targetRow) {
        applyBtn.textContent = 'No blank row!';
        applyBtn.classList.add('d2c-pm-tpl-err');
        setTimeout(function () {
          applyBtn.textContent = 'Apply';
          applyBtn.classList.remove('d2c-pm-tpl-err');
        }, 2500);
        return;
      }

      applyTemplateToRow(tpl.fields, targetRow);

      var rowSection = targetSection;
      if (!rowSection) {
        SECTIONS.forEach(function (s) {
          if (targetRow.id.indexOf(s.prefix + '_title') === 0) rowSection = s;
        });
      }
      if (rowSection) {
        var loadWrap = targetRow.querySelector('.d2c-pm-load-wrap');
        if (loadWrap) loadWrap.remove();
        scrollToPromo(rowSection, targetRow);
      }
      setTimeout(buildPromoList, 400);
    });

    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'd2c-pm-tpl-btn d2c-pm-tpl-del';
    delBtn.textContent = '\u00d7';
    delBtn.title = 'Delete this template';
    delBtn.addEventListener('click', function () {
      var arr = loadTemplates().filter(function (t) { return t.id !== tpl.id; });
      saveTemplates(arr);
      buildTemplateList();
    });

    item.appendChild(nameEl);
    item.appendChild(applyBtn);
    item.appendChild(delBtn);
    listEl.appendChild(item);
  });
}

function buildTemplatesSection() {
  var tplCollapsed = false;
  try { tplCollapsed = localStorage.getItem(TPL_COLLAPSE_KEY) === '1'; } catch (e) {}

  var sec = document.createElement('div');
  sec.className = 'd2c-pm-section' + (tplCollapsed ? ' d2c-pm-sec-collapsed' : '');
  sec.id = 'd2c-pm-sec-templates';

  sec.innerHTML =
    '<div class="d2c-pm-section-hdr">' +
      '<button class="d2c-pm-sec-toggle" type="button" id="d2c-pm-tpl-toggle" title="Collapse/expand templates">' +
        '<span class="d2c-pm-sec-arrow">' + (tplCollapsed ? '\u25b8' : '\u25be') + '</span>' +
        '<span class="d2c-pm-section-lbl"><i class="fa fa-bookmark d2c-pm-tpl-icon"></i> Templates ' +
          '<span class="d2c-pm-badge" id="d2c-pm-count-templates">0</span>' +
        '</span>' +
      '</button>' +
    '</div>' +
    '<div class="d2c-pm-tpl-body">' +
      '<div class="d2c-pm-tpl-save-row">' +
        '<select id="d2c-pm-tpl-src-sel" class="d2c-pm-tpl-src-sel"></select>' +
        '<input id="d2c-pm-tpl-name-input" class="d2c-pm-tpl-name-input" type="text" placeholder="Template name\u2026" maxlength="60">' +
        '<button id="d2c-pm-tpl-save-btn" class="d2c-pm-tpl-btn d2c-pm-tpl-save" type="button">Save</button>' +
      '</div>' +
      '<div id="d2c-pm-tpl-target" class="d2c-pm-tpl-target d2c-pm-tpl-target-none">\u2192 Target: new blank row</div>' +
      '<div id="d2c-pm-tpl-list" class="d2c-pm-tpl-list"></div>' +
    '</div>';

  return sec;
}

function copyPromoFields(section, srcRow, destRow) {
  // Read indices from actual field elements — the <tr> id is unreliable for
  // newly added rows where the tr id slot and inner field index can differ.
  var srcN  = getRowFieldIndex(section, srcRow)  || srcRow.id.replace(section.prefix + '_title', '');
  var destN = getRowFieldIndex(section, destRow) || destRow.id.replace(section.prefix + '_title', '');

  // Plain inputs, textareas, selects — not file inputs, not radios
  // Source rows always have savefield=; dest rows may only have fieldname= if
  // they were just added and haven't been saved yet.
  var srcEls = srcRow.querySelectorAll(
    'input[savefield]:not([type="file"]):not([type="radio"]),textarea[savefield],select[savefield]'
  );
  srcEls.forEach(function (srcEl) {
    var sf = srcEl.getAttribute('savefield');
    if (RE_SKIP_SF.test(sf)) return;
    var lang   = srcEl.getAttribute('d2c_language');
    var destSf = sf.replace('[' + srcN + ']', '[' + destN + ']');
    var destEl = destRow.querySelector('[savefield="' + destSf + '"][d2c_language="' + lang + '"]')
              || destRow.querySelector('[fieldname="' + destSf + '"][d2c_language="' + lang + '"]');
    if (!destEl || destEl.type === 'file') return;
    destEl.value = srcEl.value;
    destEl.dispatchEvent(new Event('input',  { bubbles: true }));
    destEl.dispatchEvent(new Event('change', { bubbles: true }));
    // Sync CKEditor richtext instance if present
    if (srcEl.tagName === 'TEXTAREA' && srcEl.getAttribute('richtext') === '1') {
      try {
        if (window.CKEDITOR && window.CKEDITOR.instances[destEl.id]) {
          window.CKEDITOR.instances[destEl.id].setData(srcEl.value);
        }
      } catch (e) {}
    }
  });

  // Radio buttons (offer type) — replicate which one was checked
  srcRow.querySelectorAll('input[savefield][type="radio"]').forEach(function (srcRadio) {
    var sf = srcRadio.getAttribute('savefield');
    if (RE_SKIP_SF.test(sf)) return;
    var lang   = srcRadio.getAttribute('d2c_language');
    var destSf = sf.replace('[' + srcN + ']', '[' + destN + ']');
    var destRadio = destRow.querySelector('input[savefield="' + destSf + '"][d2c_language="' + lang + '"][type="radio"]')
                 || destRow.querySelector('input[fieldname="' + destSf + '"][d2c_language="' + lang + '"][type="radio"]');
    if (!destRadio) return;
    if (srcRadio.checked !== destRadio.checked) destRadio.click();
  });
}

// ── Widget rendering ───────────────────────────────────────────────────────

// Map of section.key → the list container <div> inside the widget.
// Populated once by buildWidget(), re-used by buildPromoList().
var _listEls = {};
// Per-section collapsed state (key → bool). Persisted in localStorage.
var _sectionCollapsed = {};

function loadSectionCollapsed() {
  try {
    var saved = localStorage.getItem('d2c-pm-section-collapsed');
    _sectionCollapsed = saved ? JSON.parse(saved) : {};
  } catch (e) { _sectionCollapsed = {}; }
}

function saveSectionCollapsed() {
  try { localStorage.setItem('d2c-pm-section-collapsed', JSON.stringify(_sectionCollapsed)); } catch (e) {}
}

// Expand a widget section — called when the page h2 opens for that section.
function expandSection(key) {
  if (!_sectionCollapsed[key]) return; // already open
  _sectionCollapsed[key] = false;
  // Collapse all other sections
  SECTIONS.forEach(function (s) {
    if (s.key === key) return;
    _sectionCollapsed[s.key] = true;
    var otherBlock = document.getElementById('d2c-pm-sec-' + s.key);
    if (otherBlock && !otherBlock.classList.contains('d2c-pm-sec-collapsed')) {
      otherBlock.classList.add('d2c-pm-sec-collapsed');
      var otherArrow = otherBlock.querySelector('.d2c-pm-sec-arrow');
      if (otherArrow) otherArrow.textContent = '\u25b8';
    }
  });
  saveSectionCollapsed();
  var block = document.getElementById('d2c-pm-sec-' + key);
  if (block) {
    block.classList.remove('d2c-pm-sec-collapsed');
    var arrow = block.querySelector('.d2c-pm-sec-arrow');
    if (arrow) arrow.textContent = '\u25be';
  }
}

function buildPromoList() {
  // Clear stale selection if the row was removed from the DOM
  if (_selectedPromoRow && !document.body.contains(_selectedPromoRow)) {
    _selectedPromoRow = null;
    _selectedPromoSection = null;
    _selectedPromoTitle = '';
    updateTemplateTarget();
  }

  SECTIONS.forEach(function (section) {
    var listEl = _listEls[section.key];
    if (!listEl) return;

    var promos = readPromos(section);

    var badge = document.getElementById('d2c-pm-count-' + section.key);
    if (badge) badge.textContent = promos.length;

    listEl.innerHTML = '';

    if (promos.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'd2c-pm-empty';
      empty.textContent = 'No promotions';
      listEl.appendChild(empty);
      return;
    }

    promos.forEach(function (p) {
      var status = getStatus(p.start, p.expire);

      var item = document.createElement('div');
      item.className = 'd2c-pm-item';
      item.title = 'Scroll to promotion';

      var dot = document.createElement('span');
      dot.className = 'd2c-pm-dot d2c-pm-dot-' + status;
      dot.title = status.charAt(0).toUpperCase() + status.slice(1);

      var titleEl = document.createElement('span');
      titleEl.className = 'd2c-pm-item-title';
      titleEl.textContent = p.title;
      titleEl.title = p.title;

      var dupBtn = document.createElement('button');
      dupBtn.type = 'button';
      dupBtn.className = 'd2c-pm-dup-btn';
      dupBtn.title = 'Duplicate this promotion';
      dupBtn.innerHTML = '<i class="fa fa-clone"></i>';
      dupBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (typeof window.addPromo !== 'function') return;
        var container = document.getElementById(section.containerId);
        if (!container) return;
        dupBtn.disabled = true;
        dupBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
        var reNew = new RegExp('^' + section.prefix + '_title(\\d+)$');
        // Observe the full container with subtree so we catch the row regardless
        // of which nested element the platform appends it to (varies by section).
        var obs = new MutationObserver(function (mutations) {
          mutations.forEach(function (mut) {
            mut.addedNodes.forEach(function (node) {
              if (node.nodeType !== 1 || node.tagName !== 'TR') return;
              if (!node.id || !node.id.match(reNew)) return;
              obs.disconnect();
              // Give the platform ~200 ms to finish writing field elements
              setTimeout(function () {
                copyPromoFields(section, p.row, node);
                scrollToPromo(section, node);
                setTimeout(buildPromoList, 400);
              }, 200);
            });
          });
        });
        obs.observe(container, { childList: true, subtree: true });
        window.addPromo(section.key);
        // Safety: re-enable button after 5 s if observer never fired
        setTimeout(function () {
          obs.disconnect();
          dupBtn.disabled = false;
          dupBtn.innerHTML = '<i class="fa fa-clone"></i>';
        }, 5000);
      });

      item.appendChild(dot);
      item.appendChild(titleEl);
      item.appendChild(dupBtn);

      if (p.row === _selectedPromoRow) item.classList.add('d2c-pm-item-selected');

      item.addEventListener('click', function () {
        scrollToPromo(section, p.row);
        if (_selectedPromoRow === p.row) {
          // Toggle off — click the selected promo again to deselect it
          _selectedPromoRow = null;
          _selectedPromoSection = null;
          _selectedPromoTitle = '';
          item.classList.remove('d2c-pm-item-selected');
        } else {
          // Move selection to this promo
          document.querySelectorAll('.d2c-pm-item-selected').forEach(function (el) {
            el.classList.remove('d2c-pm-item-selected');
          });
          _selectedPromoRow = p.row;
          _selectedPromoSection = section;
          _selectedPromoTitle = p.title;
          item.classList.add('d2c-pm-item-selected');
        }
        updateTemplateTarget();
      });

      listEl.appendChild(item);
    });
  });

  // Inject inline load-from-template selects into any blank rows
  injectLoadSelects();
  // Keep the template source dropdown in sync with current promos
  refreshTemplatePromoDropdown();
}

// ── Inline "load from existing" select on blank rows ──────────────────────
// After a blank row is added, a <select> appears under its title field so the
// user can populate all fields from an existing promo without timing hacks.
function injectLoadSelects() {
  SECTIONS.forEach(function (section) {
    var container = document.getElementById(section.containerId);
    if (!container) return;

    var re = new RegExp('^' + section.prefix + '_title(\\d+)$');
    var allRows = container.querySelectorAll('tr[id]');

    // Source list = titled promos in this section
    var sources = readPromos(section).filter(function (p) {
      return p.title !== '(untitled)';
    });

    allRows.forEach(function (row) {
        var m = row.id.match(re);
        if (!m) return;

        // Remove any previously injected wrapper (list rebuild)
        var prev = row.querySelector('.d2c-pm-load-wrap');
        if (prev) prev.remove();

        // Use starts-with selectors — inner field index may differ from tr id
        var titleInput =
          row.querySelector('input[savefield^="' + section.prefix + '_title["][d2c_language="ENGLISH"]') ||
          row.querySelector('input[fieldname^="'  + section.prefix + '_title["][d2c_language="ENGLISH"]');

        var isBlank = titleInput && titleInput.value.trim() === '';
        if (!isBlank || sources.length === 0) return;

        // Find the titletr div by querying within the row — id suffix is unreliable
        // across saved vs newly added rows (platform uses different numbering).
        var titletr = row.querySelector('[id$="_titletr"]');
        if (!titletr) return;

        var wrap = document.createElement('div');
        wrap.className = 'd2c-pm-load-wrap';

      var sel = document.createElement('select');
      sel.className = 'd2c-pm-load-sel';

      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = '\u21b3 Load from existing promo\u2026';
      sel.appendChild(ph);

      sources.forEach(function (p, idx) {
        var opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = p.title;
        sel.appendChild(opt);
      });

      sel.addEventListener('change', function () {
        var idx = parseInt(sel.value, 10);
        if (isNaN(idx) || !sources[idx]) return;
        copyPromoFields(section, sources[idx].row, row);
        wrap.remove(); // row is no longer blank
        scrollToPromo(section, row);
        setTimeout(buildPromoList, 200);
      });

      wrap.appendChild(sel);
      titletr.insertAdjacentElement('afterend', wrap);
    });
  });
}

function buildWidget() {
  if (document.getElementById('d2c-pm-widget')) return;

  var COLLAPSE_KEY = 'd2c-pm-collapsed';
  var isCollapsed = false;
  try { isCollapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) {}

  var widget = document.createElement('div');
  widget.id = 'd2c-pm-widget';
  if (isCollapsed) widget.classList.add('d2c-pm-minimized');

  // Build inner HTML — accordion sections
  var sectionsHtml = '';
  SECTIONS.forEach(function (section) {
    var secCollapsed = !!_sectionCollapsed[section.key];
    sectionsHtml +=
      '<div class="d2c-pm-section' + (secCollapsed ? ' d2c-pm-sec-collapsed' : '') + '" id="d2c-pm-sec-' + section.key + '">' +
        '<div class="d2c-pm-section-hdr">' +
          '<button class="d2c-pm-sec-toggle" data-key="' + section.key + '" type="button" title="Collapse/expand">' +
            '<span class="d2c-pm-sec-arrow">' + (secCollapsed ? '\u25b8' : '\u25be') + '</span>' +
            '<span class="d2c-pm-section-lbl">' +
              section.label +
              ' <span class="d2c-pm-badge" id="d2c-pm-count-' + section.key + '">0</span>' +
            '</span>' +
          '</button>' +
          '<button class="d2c-pm-add-btn" data-key="' + section.key + '" type="button" title="Add a promotion to this section">+ Add</button>' +
        '</div>' +
        '<div class="d2c-pm-list" id="d2c-pm-list-' + section.key + '"></div>' +
      '</div>';
  });

  widget.innerHTML =
    '<div id="d2c-pm-hdr">' +
      '<span><i class="fa fa-list-ul"></i> Promotions</span>' +
      '<span id="d2c-pm-toggle">' + (isCollapsed ? '\u25bc' : '\u25b2') + '</span>' +
    '</div>' +
    '<div id="d2c-pm-body">' + sectionsHtml + '</div>';

  var panel = getRightPanel();
  // Reuse the "Shortcuts" label if holiday-hours already placed it
  if (!document.getElementById('d2c-shortcuts-label')) {
    var lbl = document.createElement('div');
    lbl.id = 'd2c-shortcuts-label';
    lbl.textContent = 'Shortcuts';
    panel.appendChild(lbl);
  }
  panel.appendChild(widget);

  // Cache list container references
  SECTIONS.forEach(function (section) {
    _listEls[section.key] = document.getElementById('d2c-pm-list-' + section.key);
  });

  // ── Templates section ──────────────────────────────────────────────────
  var tplSection = buildTemplatesSection();
  document.getElementById('d2c-pm-body').appendChild(tplSection);
  _templateSrcSel = document.getElementById('d2c-pm-tpl-src-sel');
  _tplTargetEl    = document.getElementById('d2c-pm-tpl-target');
  updateTemplateTarget();

  // Collapse toggle
  document.getElementById('d2c-pm-tpl-toggle').addEventListener('click', function (e) {
    e.stopPropagation();
    var secEl = document.getElementById('d2c-pm-sec-templates');
    var nowCollapsed = secEl.classList.toggle('d2c-pm-sec-collapsed');
    var arrow = secEl.querySelector('.d2c-pm-sec-arrow');
    if (arrow) arrow.textContent = nowCollapsed ? '\u25b8' : '\u25be';
    try { localStorage.setItem(TPL_COLLAPSE_KEY, nowCollapsed ? '1' : '0'); } catch (e) {}
  });

  // Save button — serialize the chosen promo row and push to template store
  document.getElementById('d2c-pm-tpl-save-btn').addEventListener('click', function () {
    var sel       = document.getElementById('d2c-pm-tpl-src-sel');
    var nameInput = document.getElementById('d2c-pm-tpl-name-input');

    if (!sel.value) {
      sel.style.borderColor = '#ef4444';
      setTimeout(function () { sel.style.borderColor = ''; }, 1500);
      return;
    }
    var tplName = nameInput.value.trim();
    if (!tplName) {
      nameInput.style.borderColor = '#ef4444';
      setTimeout(function () { nameInput.style.borderColor = ''; }, 1500);
      return;
    }

    var parts      = sel.value.split(':');
    var sectionKey = parts[0];
    var idx        = parseInt(parts[1], 10);
    var secConfig  = SECTIONS.filter(function (s) { return s.key === sectionKey; })[0];
    if (!secConfig) return;

    var promos = readPromos(secConfig).filter(function (p) { return p.title !== '(untitled)'; });
    var promo  = promos[idx];
    if (!promo) return;

    var arr = loadTemplates();
    arr.push({
      id:      String(Date.now()),
      name:    tplName,
      savedAt: new Date().toISOString(),
      fields:  serializePromoRow(promo.row)
    });
    saveTemplates(arr);
    nameInput.value = '';
    buildTemplateList();
  });

  // Initial populate of saved templates list
  buildTemplateList();

  // Widget-level collapse / expand
  document.getElementById('d2c-pm-hdr').addEventListener('click', function () {
    var min = widget.classList.toggle('d2c-pm-minimized');
    document.getElementById('d2c-pm-toggle').textContent = min ? '\u25bc' : '\u25b2';
    try { localStorage.setItem(COLLAPSE_KEY, min ? '1' : '0'); } catch (e) {}
  });

  // Section accordion toggles
  widget.querySelectorAll('.d2c-pm-sec-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var key = btn.getAttribute('data-key');
      var block = document.getElementById('d2c-pm-sec-' + key);
      var nowCollapsed = block.classList.toggle('d2c-pm-sec-collapsed');
      btn.querySelector('.d2c-pm-sec-arrow').textContent = nowCollapsed ? '\u25b8' : '\u25be';
      _sectionCollapsed[key] = nowCollapsed;

      // Collapse all other sections when this one opens
      if (!nowCollapsed) {
        SECTIONS.forEach(function (s) {
          if (s.key === key) return;
          var otherBlock = document.getElementById('d2c-pm-sec-' + s.key);
          if (otherBlock && !otherBlock.classList.contains('d2c-pm-sec-collapsed')) {
            otherBlock.classList.add('d2c-pm-sec-collapsed');
            var otherArrow = otherBlock.querySelector('.d2c-pm-sec-arrow');
            if (otherArrow) otherArrow.textContent = '\u25b8';
            _sectionCollapsed[s.key] = true;
          }
        });
      }

      saveSectionCollapsed();

      // When expanding: scroll the page to the corresponding section h2
      if (!nowCollapsed) {
        var sec = SECTIONS.filter(function (s) { return s.key === key; })[0];
        if (sec) {
          var h2 = document.querySelector('h2[expandablecontainer="' + sec.containerId + '"]');
          if (h2) {
            var wasClosed = h2.classList.contains('closed');
            if (wasClosed) h2.click();
            var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 95;
            setTimeout(function () {
              var top = h2.getBoundingClientRect().top + window.scrollY - headerH - 12;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }, wasClosed ? 320 : 0);
          }
        }
      }
    });
  });

  // "Add" buttons — use MutationObserver to detect the new row precisely,
  // then scroll to it and rebuild the list once the platform has finished
  // writing all field values (800 ms gives the platform's AJAX time to settle).
  SECTIONS.forEach(function (addSection) {
    var btn = widget.querySelector('.d2c-pm-add-btn[data-key="' + addSection.key + '"]');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (typeof window.addPromo !== 'function') return;
      var container = document.getElementById(addSection.containerId);
      var tbody = container ? container.querySelector('tbody') : null;
      if (!tbody) {
        window.addPromo(addSection.key);
        setTimeout(buildPromoList, 900);
        return;
      }
      var reAdd = new RegExp('^' + addSection.prefix + '_title(\\d+)$');
      var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function (mut) {
          mut.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1 || node.tagName !== 'TR') return;
            if (!node.id || !node.id.match(reAdd)) return;
            obs.disconnect();
            scrollToPromo(addSection, node);
            setTimeout(buildPromoList, 800);
          });
        });
      });
      obs.observe(tbody, { childList: true });
      window.addPromo(addSection.key);
    });
  });
}

// ── Public export ──────────────────────────────────────────────────────────

export function buildPromoManager() {
  // Guard: only on /sites/promotions (and /sites/grouppromotions) or localhost
  if (
    !/\/sites\/(?:group)?promotions\/?$/.test(window.location.pathname) &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) return;

  if (document.getElementById('d2c-pm-widget')) return;

  // Load persisted per-section collapsed states
  loadSectionCollapsed();

  // Default: collapse all sections that are currently closed on the page.
  // (Sections that are open on the page start expanded in the widget.)
  SECTIONS.forEach(function (s) {
    var h2 = document.querySelector('h2[expandablecontainer="' + s.containerId + '"]');
    if (h2 && h2.classList.contains('closed') && !(_sectionCollapsed[s.key] === false)) {
      // Only set collapsed if the user hasn't explicitly expanded it before
      if (_sectionCollapsed[s.key] === undefined) _sectionCollapsed[s.key] = true;
    }
  });

  buildWidget();
  buildPromoList();

  // Watch each promo section h2 — auto-expand widget section when user opens it
  SECTIONS.forEach(function (s) {
    var h2 = document.querySelector('h2[expandablecontainer="' + s.containerId + '"]');
    if (!h2) return;
    new MutationObserver(function () {
      if (!h2.classList.contains('closed')) expandSection(s.key);
    }).observe(h2, { attributes: true, attributeFilter: ['class'] });
  });

  // Auto-refresh sidebar list when promos are added, deleted, or reordered
  SECTIONS.forEach(function (s) {
    var container = document.getElementById(s.containerId);
    if (!container) return;

    // Debounce helper scoped per section
    var debounceTimer = null;
    function debouncedRebuild() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(buildPromoList, 400);
    }

    // Add / delete: tbody childList changes
    var tbody = container.querySelector('tbody');
    if (tbody) {
      new MutationObserver(debouncedRebuild).observe(tbody, { childList: true });
    }

    // Reorder: order input change events bubble up to the container
    container.addEventListener('change', function (e) {
      var sf = e.target && e.target.getAttribute && e.target.getAttribute('savefield');
      if (sf && /_(order)\[/.test(sf)) debouncedRebuild();
    });
  });
}
