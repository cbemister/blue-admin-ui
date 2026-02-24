import { getRightPanel } from './utils.js';

var DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var DEPTS   = ['New','Used','Service','Parts','Finance','Other'];

// Open-time options: hour_600 … hour_1300 then special values
var OPEN_OPTIONS = [
  ['hour_600','6:00am'],['hour_630','6:30am'],['hour_700','7:00am'],['hour_730','7:30am'],
  ['hour_800','8:00am'],['hour_830','8:30am'],['hour_900','9:00am'],['hour_930','9:30am'],
  ['hour_1000','10:00am'],['hour_1030','10:30am'],['hour_1100','11:00am'],['hour_1130','11:30am'],
  ['hour_1200','12:00pm'],['hour_1230','12:30pm'],['hour_1300','1:00pm'],
  ['hour_concess','See dealership'],['hour_contact','Contact'],['hour_rdv','By appointment'],['hour_online','Online only']
];

// Close-time options: hour_1000 … hour_300 (3am next day)
var CLOSE_OPTIONS = [
  ['hour_1000','10:00am'],['hour_1030','10:30am'],['hour_1100','11:00am'],['hour_1130','11:30am'],
  ['hour_1200','12:00pm'],['hour_1230','12:30pm'],['hour_1300','1:00pm'],['hour_1330','1:30pm'],
  ['hour_1400','2:00pm'],['hour_1430','2:30pm'],['hour_1500','3:00pm'],['hour_1530','3:30pm'],
  ['hour_1600','4:00pm'],['hour_1630','4:30pm'],['hour_1700','5:00pm'],['hour_1730','5:30pm'],
  ['hour_1800','6:00pm'],['hour_1830','6:30pm'],['hour_1900','7:00pm'],['hour_1930','7:30pm'],
  ['hour_2000','8:00pm'],['hour_2030','8:30pm'],['hour_2100','9:00pm'],['hour_2130','9:30pm'],
  ['hour_2200','10:00pm'],['hour_2300','11:00pm'],['hour_2400','12:00am'],
  ['hour_100','1:00am'],['hour_200','2:00am'],['hour_300','3:00am']
];

// Label lookup for hour_* values
var OPT_LABELS = {};
OPEN_OPTIONS.concat(CLOSE_OPTIONS).forEach(function (o) { OPT_LABELS[o[0]] = o[1]; });
var DAY_ABBR = { Monday:'Mon',Tuesday:'Tue',Wednesday:'Wed',Thursday:'Thu',Friday:'Fri',Saturday:'Sat',Sunday:'Sun' };

function optLabel(val) { return OPT_LABELS[val] || val; }

function getSiteId() {
  var el = document.getElementById('currentSiteID');
  return el ? el.value : 'unknown';
}

function storageKey() {
  return 'd2c-hours-snapshot:' + getSiteId();
}

// ── Snapshot read / write ──────────────────────────────────────────────────

function readSnapshot() {
  try { return JSON.parse(localStorage.getItem(storageKey())); } catch (e) { return null; }
}

function captureCurrentHours() {
  var data = { savedAt: new Date().toISOString(), depts: {} };
  DEPTS.forEach(function (dept) {
    data.depts[dept] = {};
    DAYS.forEach(function (day) {
      var enabledEl = document.getElementById(day + '_' + dept + '_INDEPENDENT');
      var openEl    = document.getElementById('Open_Hours_'   + day + '_' + dept + '_INDEPENDENT');
      var closeEl   = document.getElementById('Closed_Hours_' + day + '_' + dept + '_INDEPENDENT');
      data.depts[dept][day] = {
        enabled: enabledEl ? enabledEl.checked  : true,
        open:    openEl    ? openEl.value        : 'hour_900',
        close:   closeEl   ? closeEl.value       : 'hour_1700'
      };
    });
  });
  return data;
}

function saveSnapshot() {
  var data = captureCurrentHours();
  localStorage.setItem(storageKey(), JSON.stringify(data));
  return data;
}

// ── Info / Confirm modal ──────────────────────────────────────────────────

function showInfoModal(title, bodyHtml, confirmLabel, onConfirm) {
  var existing = document.getElementById('d2c-hh-info-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'd2c-hh-info-overlay';
  overlay.innerHTML =
    '<div id="d2c-hh-info-modal">' +
      '<div id="d2c-hh-modal-header">' +
        '<span id="d2c-hh-modal-title">' + title + '</span>' +
        '<button class="d2c-hh-info-close" title="Close">×</button>' +
      '</div>' +
      '<div id="d2c-hh-modal-body">' + bodyHtml + '</div>' +
      '<div id="d2c-hh-modal-footer">' +
        (onConfirm
          ? '<button class="d2c-hh-btn-secondary d2c-hh-info-close">Cancel</button>' +
            '<button class="d2c-hh-btn-primary" id="d2c-hh-info-confirm"><i class="fa fa-undo"></i> ' + confirmLabel + '</button>'
          : '<button class="d2c-hh-btn-primary d2c-hh-info-close">Done</button>'
        ) +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.style.display = 'flex';

  function closeInfo() { overlay.remove(); }
  overlay.querySelectorAll('.d2c-hh-info-close').forEach(function (b) {
    b.addEventListener('click', closeInfo);
  });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeInfo(); });
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') { closeInfo(); document.removeEventListener('keydown', escListener); }
  });
  if (onConfirm) {
    document.getElementById('d2c-hh-info-confirm').addEventListener('click', function () {
      closeInfo();
      onConfirm();
    });
  }
}

function buildSaveSummaryHtml(data) {
  var cols = DAYS.map(function (d) { return '<th>' + DAY_ABBR[d] + '</th>'; }).join('');
  var rows = DEPTS.map(function (dept) {
    var cells = DAYS.map(function (day) {
      var r = data.depts[dept] && data.depts[dept][day];
      if (!r || !r.enabled) return '<td class="d2c-hh-diff-closed">Closed</td>';
      return '<td>' + optLabel(r.open) + '<br><span class="d2c-hh-diff-close">' + optLabel(r.close) + '</span></td>';
    }).join('');
    return '<tr><td class="d2c-hh-day">' + dept + '</td>' + cells + '</tr>';
  }).join('');
  return '<table class="d2c-hh-diff-table"><thead><tr><th>Dept</th>' + cols + '</tr></thead><tbody>' + rows + '</tbody></table>';
}

function buildRestoreDiffHtml(snap) {
  var changes = [];
  DEPTS.forEach(function (dept) {
    DAYS.forEach(function (day) {
      var s = snap.depts[dept] && snap.depts[dept][day];
      if (!s) return;
      var enabledEl = document.getElementById(day + '_' + dept + '_INDEPENDENT');
      var openEl    = document.getElementById('Open_Hours_'   + day + '_' + dept + '_INDEPENDENT');
      var closeEl   = document.getElementById('Closed_Hours_' + day + '_' + dept + '_INDEPENDENT');
      var curEnabled = enabledEl ? enabledEl.checked : true;
      var curOpen    = openEl    ? openEl.value       : 'hour_900';
      var curClose   = closeEl   ? closeEl.value      : 'hour_1700';
      var snapEnabled = !!s.enabled;
      if (curEnabled === snapEnabled && curOpen === s.open && curClose === s.close) return;
      var curLabel  = !curEnabled  ? 'Closed' : (optLabel(curOpen)  + ' – ' + optLabel(curClose));
      var snapLabel = !snapEnabled ? 'Closed' : (optLabel(s.open) + ' – ' + optLabel(s.close));
      changes.push('<tr><td class="d2c-hh-day">' + dept + '</td><td>' + DAY_ABBR[day] + '</td>' +
        '<td class="d2c-hh-diff-from">' + curLabel + '</td>' +
        '<td class="d2c-hh-diff-arrow">→</td>' +
        '<td class="d2c-hh-diff-to">' + snapLabel + '</td></tr>');
    });
  });
  if (changes.length === 0) {
    return '<p class="d2c-hh-diff-empty">No differences found — current hours already match the snapshot.</p>';
  }
  return '<p class="d2c-hh-diff-count">' + changes.length + ' change' + (changes.length > 1 ? 's' : '') + ' will be applied:</p>' +
    '<table class="d2c-hh-diff-table d2c-hh-diff-compact"><thead><tr>' +
      '<th>Dept</th><th>Day</th><th>Current</th><th></th><th>Snapshot</th>' +
    '</tr></thead><tbody>' + changes.join('') + '</tbody></table>';
}

// ── Apply values to DOM (one day, all departments) ────────────────────────

function applyDayToDOM(day, deptSchedule) {
  // deptSchedule: { New: { open, close, closed }, Used: {…}, … }
  DEPTS.forEach(function (dept) {
    var row = deptSchedule[dept];
    if (!row) return;

    var enabledEl = document.getElementById(day + '_' + dept + '_INDEPENDENT');
    var openEl    = document.getElementById('Open_Hours_'   + day + '_' + dept + '_INDEPENDENT');
    var closeEl   = document.getElementById('Closed_Hours_' + day + '_' + dept + '_INDEPENDENT');

    if (enabledEl) {
      enabledEl.checked = !row.closed;
      enabledEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (openEl && !row.closed) { openEl.value = row.open;  syncSelectpicker(openEl);  }
    if (closeEl && !row.closed){ closeEl.value = row.close; syncSelectpicker(closeEl); }
  });
}

function restoreSnapshot(data) {
  // data.depts[dept][day] = { enabled, open, close }
  DEPTS.forEach(function (dept) {
    if (!data.depts[dept]) return;
    DAYS.forEach(function (day) {
      var row = data.depts[dept][day];
      if (!row) return;

      var enabledEl = document.getElementById(day + '_' + dept + '_INDEPENDENT');
      var openEl    = document.getElementById('Open_Hours_'   + day + '_' + dept + '_INDEPENDENT');
      var closeEl   = document.getElementById('Closed_Hours_' + day + '_' + dept + '_INDEPENDENT');

      if (enabledEl) {
        enabledEl.checked = !!row.enabled;
        enabledEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (openEl) { openEl.value = row.open;  syncSelectpicker(openEl);  }
      if (closeEl){ closeEl.value = row.close; syncSelectpicker(closeEl); }
    });
  });
}

function syncSelectpicker(selectEl) {
  // Bootstrap-select cosmetic wrapper requires a refresh when the underlying value changes
  if (typeof jQuery === 'function' && jQuery.fn && jQuery.fn.selectpicker) {
    try { jQuery(selectEl).selectpicker('refresh'); } catch (e) { /* ignore */ }
  }
}

// ── Modal ──────────────────────────────────────────────────────────────────

function buildOptionsHtml(optList, selectedVal) {
  return optList.map(function (o) {
    return '<option value="' + o[0] + '"' + (o[0] === selectedVal ? ' selected' : '') + '>' + o[1] + '</option>';
  }).join('');
}

function getDeptRowsForDay(day) {
  // Returns { New: { open, close, closed }, … } seeded from live DOM
  var result = {};
  DEPTS.forEach(function (dept) {
    var enabledEl = document.getElementById(day + '_' + dept + '_INDEPENDENT');
    var openEl    = document.getElementById('Open_Hours_'   + day + '_' + dept + '_INDEPENDENT');
    var closeEl   = document.getElementById('Closed_Hours_' + day + '_' + dept + '_INDEPENDENT');
    result[dept] = {
      open:   openEl    ? openEl.value         : 'hour_900',
      close:  closeEl   ? closeEl.value        : 'hour_1700',
      closed: enabledEl ? !enabledEl.checked   : false
    };
  });
  return result;
}

function renderDeptRows(tbody, day) {
  var seed = getDeptRowsForDay(day);
  tbody.innerHTML = DEPTS.map(function (dept) {
    var s = seed[dept];
    var closedChecked = s.closed ? 'checked' : '';
    return (
      '<tr class="d2c-hh-row">' +
        '<td class="d2c-hh-day">' + dept + '</td>' +
        '<td>' +
          '<select class="d2c-hh-open" data-dept="' + dept + '"' + (s.closed ? ' disabled' : '') + '>' +
            buildOptionsHtml(OPEN_OPTIONS, s.open) +
          '</select>' +
        '</td>' +
        '<td>' +
          '<select class="d2c-hh-close" data-dept="' + dept + '"' + (s.closed ? ' disabled' : '') + '>' +
            buildOptionsHtml(CLOSE_OPTIONS, s.close) +
          '</select>' +
        '</td>' +
        '<td class="d2c-hh-closed-cell">' +
          '<label class="d2c-hh-closed-label">' +
            '<input type="checkbox" class="d2c-hh-closed-chk" data-dept="' + dept + '" ' + closedChecked + '> Closed' +
          '</label>' +
        '</td>' +
      '</tr>'
    );
  }).join('');

  // Closed checkbox toggles open/close selects in the same row
  tbody.querySelectorAll('.d2c-hh-closed-chk').forEach(function (chk) {
    var dept = chk.getAttribute('data-dept');
    chk.addEventListener('change', function () {
      updateDeptRowDisabled(tbody, dept, chk.checked);
    });
  });
}

function updateDeptRowDisabled(tbody, dept, closed) {
  var openSel  = tbody.querySelector('.d2c-hh-open[data-dept="'  + dept + '"]');
  var closeSel = tbody.querySelector('.d2c-hh-close[data-dept="' + dept + '"]');
  if (openSel)  openSel.disabled  = closed;
  if (closeSel) closeSel.disabled = closed;
}

function buildModal() {
  var dayOpts = DAYS.map(function (d) {
    return '<option value="' + d + '">' + d + '</option>';
  }).join('');

  var overlay = document.createElement('div');
  overlay.id = 'd2c-hh-overlay';
  overlay.innerHTML =
    '<div id="d2c-hh-modal">' +
      '<div id="d2c-hh-modal-header">' +
        '<span id="d2c-hh-modal-title"><i class="fa fa-clock-o"></i> Holiday Hours Editor</span>' +
        '<button id="d2c-hh-modal-close" title="Close">\u00D7</button>' +
      '</div>' +
      '<div id="d2c-hh-modal-body">' +
        '<div id="d2c-hh-preset-bar">' +
          '<label for="d2c-hh-day-sel">Day:</label>' +
          '<select id="d2c-hh-day-sel">' + dayOpts + '</select>' +
        '</div>' +
        '<div id="d2c-hh-dept-note"><i class="fa fa-info-circle"></i> Hours will be applied to all 6 departments for the selected day.</div>' +
        '<table id="d2c-hh-table">' +
          '<thead><tr>' +
            '<th>Department</th><th>Opens</th><th>Closes</th><th>Status</th>' +
          '</tr></thead>' +
          '<tbody id="d2c-hh-tbody"></tbody>' +
        '</table>' +
      '</div>' +
      '<div id="d2c-hh-modal-footer">' +
        '<button id="d2c-hh-cancel" class="d2c-hh-btn-secondary">Cancel</button>' +
        '<button id="d2c-hh-apply" class="d2c-hh-btn-primary"><i class="fa fa-check"></i> Apply to All Departments</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  var daySel = document.getElementById('d2c-hh-day-sel');
  var tbody  = document.getElementById('d2c-hh-tbody');

  // Seed rows for the initially selected day
  renderDeptRows(tbody, daySel.value);

  // Re-seed when day changes
  daySel.addEventListener('change', function () {
    renderDeptRows(tbody, daySel.value);
  });

  // Apply button
  document.getElementById('d2c-hh-apply').addEventListener('click', function () {
    var day = daySel.value;
    var deptSchedule = {};
    DEPTS.forEach(function (dept) {
      var chk      = tbody.querySelector('.d2c-hh-closed-chk[data-dept="' + dept + '"]');
      var openSel  = tbody.querySelector('.d2c-hh-open[data-dept="'       + dept + '"]');
      var closeSel = tbody.querySelector('.d2c-hh-close[data-dept="'      + dept + '"]');
      deptSchedule[dept] = {
        closed: chk.checked,
        open:   openSel.value,
        close:  closeSel.value
      };
    });
    applyDayToDOM(day, deptSchedule);
    closeModal();
  });

  document.getElementById('d2c-hh-cancel').addEventListener('click', closeModal);
  document.getElementById('d2c-hh-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escListener); }
  });
}

function openModal() {
  // Rebuild so it always seeds from current DOM state
  var existing = document.getElementById('d2c-hh-overlay');
  if (existing) existing.remove();
  buildModal();
  document.getElementById('d2c-hh-overlay').style.display = 'flex';
}

function closeModal() {
  var el = document.getElementById('d2c-hh-overlay');
  if (el) el.style.display = 'none';
}

// ── Right-panel widget ─────────────────────────────────────────────────────

function fmtDate(isoStr) {
  try {
    var d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
           ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch (e) { return ''; }
}

export function buildHolidayHours() {
  // Guard: only on /sites/general (handles both /sites/general and /sites/general/)
  if (!/\/sites\/general\/?$/.test(window.location.pathname) && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
  if (document.getElementById('d2c-hh-widget')) return;

  var existing = readSnapshot();
  var hasSnap  = !!existing;

  var COLLAPSE_KEY = 'd2c-hh-collapsed';
  var isCollapsed;
  try { isCollapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) { isCollapsed = false; }

  // Section label (Shortcuts heading above the card)
  var label = document.createElement('div');
  label.id = 'd2c-shortcuts-label';
  label.textContent = 'Shortcuts';

  var widget = document.createElement('div');
  widget.id = 'd2c-hh-widget';
  if (isCollapsed) widget.classList.add('d2c-hh-minimized');

  widget.innerHTML =
    '<div id="d2c-hh-widget-header">' +
      '<span><i class="fa fa-calendar-o"></i> Holiday Hours</span>' +
      '<span id="d2c-hh-widget-toggle">' + (isCollapsed ? '\u25bc' : '\u25b2') + '</span>' +
    '</div>' +
    '<div id="d2c-hh-widget-body">' +
      '<div id="d2c-hh-snap-info"' + (hasSnap ? '' : ' style="display:none"') + '>' +
        '<i class="fa fa-check-circle"></i> Snapshot saved<br>' +
        '<span id="d2c-hh-snap-date">' + (hasSnap ? fmtDate(existing.savedAt) : '') + '</span>' +
      '</div>' +
      '<button id="d2c-hh-btn-snap" class="d2c-hh-btn-widget" title="Save current hours so you can restore them later">' +
        '<i class="fa fa-camera"></i> Save Snapshot' +
      '</button>' +
      '<button id="d2c-hh-btn-edit" class="d2c-hh-btn-widget d2c-hh-btn-primary-widget">' +
        '<i class="fa fa-pencil"></i> Edit Holiday Hours\u2026' +
      '</button>' +
      '<button id="d2c-hh-btn-restore" class="d2c-hh-btn-widget d2c-hh-btn-danger-widget"' + (hasSnap ? '' : ' disabled') + ' title="Restore hours from last snapshot">' +
        '<i class="fa fa-undo"></i> Restore Snapshot' +
      '</button>' +
    '</div>';

  var panel = getRightPanel();
  panel.appendChild(label);
  panel.appendChild(widget);

  document.getElementById('d2c-hh-widget-header').addEventListener('click', function () {
    var min = widget.classList.toggle('d2c-hh-minimized');
    document.getElementById('d2c-hh-widget-toggle').textContent = min ? '\u25bc' : '\u25b2';
    try { localStorage.setItem(COLLAPSE_KEY, min ? '1' : '0'); } catch (e) {}
  });

  document.getElementById('d2c-hh-btn-snap').addEventListener('click', function () {
    var data = saveSnapshot();
    document.getElementById('d2c-hh-snap-date').textContent = fmtDate(data.savedAt);
    document.getElementById('d2c-hh-snap-info').style.display = '';
    document.getElementById('d2c-hh-btn-restore').disabled = false;
    showInfoModal(
      '<i class="fa fa-check-circle" style="color:#10b981;margin-right:6px"></i> Snapshot Saved',
      '<p class="d2c-hh-diff-count">Saved on ' + fmtDate(data.savedAt) + '</p>' + buildSaveSummaryHtml(data),
      null, null
    );
  });

  document.getElementById('d2c-hh-btn-edit').addEventListener('click', openModal);

  document.getElementById('d2c-hh-btn-restore').addEventListener('click', function () {
    var snap = readSnapshot();
    if (!snap) return;
    var diffHtml = '<p class="d2c-hh-diff-count" style="margin-bottom:8px">Snapshot from ' + fmtDate(snap.savedAt) + '</p>' + buildRestoreDiffHtml(snap);
    showInfoModal(
      '<i class="fa fa-undo" style="margin-right:6px"></i> Restore Snapshot',
      diffHtml,
      'Confirm Restore',
      function () { restoreSnapshot(snap); }
    );
  });
}
