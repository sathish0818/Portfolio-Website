// Portfolio page: category filter. Cards are plain HTML, so the page works (and indexes) without JS.
(function () {
  const chips = document.querySelectorAll('.pf-chip');
  const cards = document.querySelectorAll('.pf-card');
  const n = document.getElementById('pf-n');
  if (!chips.length) return;

  function apply(filter) {
    let shown = 0;
    cards.forEach(c => {
      const ok = filter === 'all' || c.dataset.cat === filter;
      c.hidden = !ok;
      if (ok) shown++;
    });
    chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    if (n) n.textContent = shown;
    try { history.replaceState(null, '', filter === 'all' ? location.pathname : '#' + filter); } catch (e) {}
  }

  chips.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter)));
  const start = location.hash.slice(1);
  if (start && [...chips].some(b => b.dataset.filter === start)) apply(start);
})();
