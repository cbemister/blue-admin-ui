import { BUILD_DATE } from './build-date.js';

export function buildHelpButton() {
  if (document.getElementById('d2c-help-btn')) return;

  var topRight = document.getElementById('topRight');
  if (!topRight) return;

  // Hide the original "Need help?" button
  var needHelp = document.getElementById('needHelp');
  if (needHelp) {
    var li = needHelp.closest('li');
    if (li) li.style.display = 'none';
  }

  var dateLabel = _formatDate(BUILD_DATE);

  var el = document.createElement('div');
  el.id = 'd2c-help-btn';
  el.innerHTML =
    '<span id="d2c-version-badge" title="Enhancement script last updated">' + dateLabel + '</span>' +
    '<button id="d2c-help-toggle" title="D2C Enhancements help">' +
      '<i class="fa fa-question-circle"></i>' +
    '</button>' +
    '<div id="d2c-help-dropdown">' +
      '<div class="d2c-help-header">' +
        '<span class="d2c-help-title">D2C Enhancements</span>' +
        '<span class="d2c-help-version">Updated ' + dateLabel + '</span>' +
      '</div>' +
      '<div class="d2c-help-section">Keyboard Shortcuts</div>' +
      '<table class="d2c-help-table">' +
        '<tr><td><kbd>Ctrl+K</kbd></td><td>Open command palette</td></tr>' +
        '<tr><td><kbd>↑ / ↓</kbd></td><td>Navigate items</td></tr>' +
        '<tr><td><kbd>Enter</kbd></td><td>Go to selection</td></tr>' +
        '<tr><td><kbd>Esc</kbd></td><td>Close palette</td></tr>' +
      '</table>' +
      '<div class="d2c-help-section">Features</div>' +
      '<ul class="d2c-help-list">' +
        '<li>Sticky header with breadcrumb</li>' +
        '<li>Section table of contents (right panel)</li>' +
        '<li>Dealer navigation (left panel)</li>' +
        '<li>Ctrl+K command palette for pages &amp; dealers</li>' +
        '<li>Floating save button + save status indicator</li>' +
        '<li>Section auto-collapse &amp; session memory</li>' +
        '<li>Idle-time prefetch of nav links</li>' +
      '</ul>' +
    '</div>';

  var toggle = el.querySelector('#d2c-help-toggle');
  var dropdown = el.querySelector('#d2c-help-dropdown');

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.toggle('d2c-help-open');
  });

  document.addEventListener('click', function () {
    dropdown.classList.remove('d2c-help-open');
  });

  topRight.appendChild(el);
}

// iso format: "YYYY-MM-DD HH:MM UTC" (from build.js) or "YYYY-MM-DD" (fallback)
function _formatDate(iso) {
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var parts = iso.split(' ');           // ["2026-02-23", "14:32", "UTC"]
  var d = parts[0].split('-');          // ["2026", "02", "23"]
  var label = months[parseInt(d[1], 10) - 1] + ' ' + parseInt(d[2], 10);
  if (parts[1]) label += ' · ' + parts[1]; // append time if present
  return label;
}
