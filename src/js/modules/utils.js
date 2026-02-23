export function onReady(fn) {
  if (document.readyState !== 'loading') {
    setTimeout(fn, 300);
  } else {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 300); });
  }
}

export function measureHeader() {
  var navbar = document.querySelector('nav.navbar.navbar-default');
  if (!navbar) return;
  var h = navbar.offsetHeight;
  if (h > 0) {
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }
  var sidebar = document.querySelector('.navbar-default.sidebar');
  if (sidebar) {
    sidebar.style.top = h + 'px';
    sidebar.style.height = 'calc(100vh - ' + h + 'px)';
  }
}

export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getRightPanel() {
  var panel = document.getElementById('d2c-right-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'd2c-right-panel';
    document.body.appendChild(panel);
  }
  return panel;
}
