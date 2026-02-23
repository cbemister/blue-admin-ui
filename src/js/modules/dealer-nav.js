export function buildDealerNav() {
  if (document.getElementById('d2c-dealer-nav')) return;

  var activeLi = document.querySelector('#side-menu > li.active');
  if (!activeLi) return;

  var dealerLinks = activeLi.children;
  var dealerName = '';
  for (var di = 0; di < dealerLinks.length; di++) {
    if (dealerLinks[di].tagName === 'A') {
      var ts = dealerLinks[di].querySelector('.title');
      dealerName = (ts || dealerLinks[di]).textContent.trim();
      break;
    }
  }
  if (!dealerName) return;

  var sectionLis = activeLi.querySelectorAll('.nav-second-level > li');
  if (sectionLis.length === 0) return;

  var currentPath = window.location.pathname;
  var nav = document.createElement('div');
  nav.id = 'd2c-dealer-nav';

  var header = document.createElement('div');
  header.className = 'd2c-dn-header';
  header.textContent = dealerName;
  header.title = dealerName;
  nav.appendChild(header);

  var seenTitles = {};
  var extraSections = [];

  function buildList(secLi) {
    var pageLinks = secLi.querySelectorAll('.nav-third-level a[data-islink="true"]');
    var list = document.createElement('ul');
    list.className = 'd2c-dn-list';
    pageLinks.forEach(function (a) {
      var title = a.getAttribute('title') || a.textContent.trim();
      var href = a.getAttribute('href');
      if (!title || !href) return;
      var key = title.toLowerCase();
      if (seenTitles[key]) return;
      seenTitles[key] = true;
      var iconEl = a.querySelector('i.fa:not(.menu_connected_users)');
      var icon = iconEl ? iconEl.className : 'fa fa-fw fa-file-o';
      var isActive = currentPath === href || (href !== '/' && currentPath.indexOf(href) === 0);
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = href;
      link.innerHTML = '<i class="' + icon + '"></i> ' + title;
      if (isActive) link.className = 'd2c-dn-active';
      li.appendChild(link);
      list.appendChild(li);
    });
    return list.children.length > 0 ? list : null;
  }

  sectionLis.forEach(function (secLi) {
    var secA = null;
    for (var si = 0; si < secLi.children.length; si++) {
      if (secLi.children[si].tagName === 'A') { secA = secLi.children[si]; break; }
    }
    if (!secA) return;
    var secTitle = secA.getAttribute('title') || secA.textContent.trim();
    var isConfigurator = secTitle.toLowerCase().indexOf('configurator') !== -1;

    if (isConfigurator) {
      var list = buildList(secLi);
      if (list) nav.appendChild(list);
    } else {
      var list = buildList(secLi);
      if (list) extraSections.push({ title: secTitle, list: list });
    }
  });

  if (extraSections.length > 0) {
    var moreWrap = document.createElement('div');
    moreWrap.className = 'd2c-dn-more';

    var moreBtn = document.createElement('button');
    moreBtn.className = 'd2c-dn-more-btn';
    moreBtn.textContent = 'More\u2026';
    moreWrap.appendChild(moreBtn);

    var moreContent = document.createElement('div');
    moreContent.className = 'd2c-dn-more-content';
    moreContent.style.display = 'none';

    extraSections.forEach(function (sec) {
      var label = document.createElement('div');
      label.className = 'd2c-dn-section';
      label.textContent = sec.title;
      moreContent.appendChild(label);
      moreContent.appendChild(sec.list);
    });

    moreWrap.appendChild(moreContent);
    nav.appendChild(moreWrap);

    moreBtn.addEventListener('click', function () {
      var open = moreContent.style.display !== 'none';
      moreContent.style.display = open ? 'none' : 'block';
      moreBtn.textContent = open ? 'More\u2026' : 'Less';
    });
  }

  document.body.appendChild(nav);
}
