/* Runs in <head> before the page paints, so a saved theme never flashes the wrong colours.
   External file (not inline) so the CSP can stay script-src 'self' with no hashes. */
/* Storage can throw in private windows — never let that break the page. */
(function () {
  try {
    var v = localStorage.getItem('theme');
    if (v === 'dark' || v === 'light') document.documentElement.setAttribute('data-theme', v);
  } catch (e) {}
})();
