export function buildBreadcrumb() {
  if (document.getElementById('d2c-breadcrumb')) return;

  var topRight = document.getElementById('topRight');
  if (!topRight) return;

  // Find active dealer
  var activeLi = document.querySelector('#side-menu > li.active');
  if (!activeLi) return;

  var dealerA = null;
  for (var di = 0; di < activeLi.children.length; di++) {
    if (activeLi.children[di].tagName === 'A') { dealerA = activeLi.children[di]; break; }
  }
  if (!dealerA) return;
  var ts = dealerA.querySelector('.title');
  var dealerName = (ts || dealerA).textContent.trim();

  // Find active section (Configurator, Group Mgmt, etc.)
  var activeSec = activeLi.querySelector('.nav-second-level > li.active');
  var secName = '';
  if (activeSec) {
    var secA = null;
    for (var si = 0; si < activeSec.children.length; si++) {
      if (activeSec.children[si].tagName === 'A') { secA = activeSec.children[si]; break; }
    }
    if (secA) secName = secA.getAttribute('title') || secA.textContent.trim();
  }

  // Find active page
  var activePage = activeLi.querySelector('.nav-third-level li.active a[data-islink="true"]');
  var pageName = '';
  if (activePage) pageName = activePage.getAttribute('title') || activePage.textContent.trim();

  // Build breadcrumb
  var bc = document.createElement('div');
  bc.id = 'd2c-breadcrumb';

  var parts = [];
  if (dealerName) parts.push('<span class="d2c-bc-dealer">' + dealerName + '</span>');
  if (secName) parts.push('<span class="d2c-bc-section">' + secName + '</span>');
  if (pageName) parts.push('<span class="d2c-bc-page">' + pageName + '</span>');

  bc.innerHTML = parts.join('<span class="d2c-bc-sep">\u203A</span>');

  // Insert at the beginning of #topRight so it sits on the left
  topRight.insertBefore(bc, topRight.firstChild);
}
