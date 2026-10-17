/* Theme toggle + cursor spotlight. Loaded on every page.
   Tells the starfield to recolour via a "themechange" event. */
(function () {
  var root = document.documentElement;
  var togs = Array.prototype.slice.call(document.querySelectorAll('.tog'));

  /* label reflects the real current state, including a theme restored from storage */
  function setTogLabel() {
    var cur = root.getAttribute('data-theme');
    var lbl = cur === 'dark' ? 'Theme — Dark' : (cur === 'light' ? 'Theme — Light' : 'Theme — Auto');
    togs.forEach(function (b) { b.textContent = lbl; });
  }

  function flipTheme() {
    var cur = root.getAttribute('data-theme');
    if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}   /* private windows throw */
    setTogLabel();
    document.dispatchEvent(new Event('themechange'));
  }
  togs.forEach(function (b) { b.addEventListener('click', flipTheme); });
  setTogLabel();

  /* cursor spotlight follows the pointer (CSS hides it on touch devices) */
  window.addEventListener('pointermove', function (ev) {
    root.style.setProperty('--mx', ev.clientX + 'px');
    root.style.setProperty('--my', ev.clientY + 'px');
  });
})();
