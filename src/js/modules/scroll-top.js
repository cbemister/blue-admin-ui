export function buildScrollTop() {
  if (document.getElementById('d2c-scroll-top')) return;
  var btn = document.createElement('button');
  btn.id = 'd2c-scroll-top';
  btn.title = 'Scroll to top';
  btn.innerHTML = '&#8679;'; // ↑
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', function () {
    btn.classList.toggle('d2c-st-visible', window.scrollY > 400);
  }, { passive: true });
}
