import { getRightPanel } from './utils.js';

export function buildSectionTOC() {
  var sections = document.querySelectorAll('#content h2.expandablesection');
  if (sections.length < 2) return;

  var toc = document.createElement('div');
  toc.id = 'd2c-section-toc';

  var header = document.createElement('div');
  header.className = 'd2c-toc-header';
  header.innerHTML = 'Sections <span class="d2c-toc-toggle">\u25b2</span>';

  var actions = document.createElement('div');
  actions.className = 'd2c-toc-actions';
  actions.innerHTML =
    '<button class="d2c-toc-btn" id="d2c-collapse-all">Collapse All</button>' +
    '<button class="d2c-toc-btn" id="d2c-expand-all">Expand All</button>';

  var list = document.createElement('ul');
  list.className = 'd2c-toc-list';

  sections.forEach(function (section, i) {
    var titleEl = section.querySelector('.expandableHeaderText') || section.querySelector('.first');
    var title = titleEl ? titleEl.textContent.trim() : section.textContent.trim();
    if (!section.id) section.id = 'd2c-s' + i;

    var li = document.createElement('li');
    li.className = 'd2c-toc-item';
    var a = document.createElement('a');
    a.href = '#' + section.id;
    a.textContent = title;
    a.setAttribute('data-idx', i);
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (section.classList.contains('closed')) section.click();
      var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 95;
      var top = section.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
    li.appendChild(a);
    list.appendChild(li);
  });

  toc.appendChild(header);
  toc.appendChild(actions);
  toc.appendChild(list);
  getRightPanel().appendChild(toc);

  document.getElementById('d2c-collapse-all').addEventListener('click', function () {
    sections.forEach(function (s) { if (s.classList.contains('open')) s.click(); });
  });
  document.getElementById('d2c-expand-all').addEventListener('click', function () {
    sections.forEach(function (s) { if (s.classList.contains('closed')) s.click(); });
  });

  var isMin = false;
  header.addEventListener('click', function () {
    isMin = !isMin;
    toc.classList.toggle('d2c-toc-minimized', isMin);
    header.querySelector('.d2c-toc-toggle').textContent = isMin ? '\u25bc' : '\u25b2';
  });

  if ('IntersectionObserver' in window) {
    var links = list.querySelectorAll('a');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(sections, entry.target);
        links.forEach(function (l) { l.classList.remove('d2c-toc-active'); });
        if (idx >= 0 && links[idx]) links[idx].classList.add('d2c-toc-active');
      });
    }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
    sections.forEach(function (s) { obs.observe(s); });
  }
}
