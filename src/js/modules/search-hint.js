import { openPalette } from './palette.js';

export function buildSearchHint() {
  if (document.getElementById('d2c-search-hint')) return;

  var topRight = document.getElementById('topRight');
  if (!topRight) return;

  var el = document.createElement('div');
  el.id = 'd2c-search-hint';
  el.innerHTML =
    '<a href="#" title="Search pages and dealerships">' +
      '<i class="fa fa-search"></i>' +
      '<span class="d2c-hint-label">Search</span>' +
      '<span class="d2c-hint-kbd">Ctrl+K</span>' +
    '</a>';
  el.addEventListener('click', function (e) { e.preventDefault(); openPalette(); });
  // Insert at the very beginning of #topRight (before breadcrumb)
  topRight.insertBefore(el, topRight.firstChild);
}
