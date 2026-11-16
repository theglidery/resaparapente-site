// Local pages: filter (children, winter), sort and switch between cards and a comparison table. Same data in both views.
const form = document.getElementById('compare');
if (form) {
  const cards = document.getElementById('cmp-cards'), table = document.getElementById('cmp-table');
  const tbody = table.querySelector('tbody');
  const lis = [...cards.children], trs = [...tbody.children];
  const flagEls = [...form.querySelectorAll('input[data-flag]')], sort = document.getElementById('cmp-sort'), count = document.getElementById('cmp-count');
  lis.forEach((li, i) => (li.dataset.order = i));
  let view = 'cards';
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const cmp = (by) => (a, b) => {
    if (by === 'prix') return (num(a.dataset.price) ?? 1e9) - (num(b.dataset.price) ?? 1e9);
    if (by === 'note') return (num(b.dataset.rating) ?? -1) - (num(a.dataset.rating) ?? -1) || (num(b.dataset.reviews) ?? 0) - (num(a.dataset.reviews) ?? 0);
    return num(a.dataset.order) - num(b.dataset.order);
  };
  const apply = (track) => {
    const on = flagEls.filter((f) => f.checked).map((f) => f.dataset.flag);
    let n = 0;
    for (const [box, items] of [[cards, lis], [tbody, trs]]) {
      items.sort(cmp(sort.value)).forEach((el) => {
        const flags = (el.dataset.flags || '').split(' ');
        const ok = on.every((f) => flags.includes(f));
        el.hidden = !ok; box.appendChild(el);
      });
    }
    n = lis.filter((el) => !el.hidden).length;
    count.textContent = on.length || sort.value ? `${n} école${n > 1 ? 's' : ''} affichée${n > 1 ? 's' : ''} sur ${lis.length}` : '';
    if (track) window.rpTrack?.('compare_filter', { filters: on.join(',') || 'none', sort: sort.value || 'default', view });
  };
  flagEls.forEach((f) => f.addEventListener('change', () => apply(true)));
  sort.addEventListener('change', () => apply(true));
  form.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view;
    form.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cards.hidden = view !== 'cards'; table.hidden = view !== 'table';
    window.rpTrack?.('compare_view', { view });
  }));
  form.addEventListener('submit', (e) => e.preventDefault());
  // Presets from the address (used by ads): ?kids=1, ?winter=1, ?tri=prix|note, ?vue=tableau
  const q = new URLSearchParams(location.search);
  for (const f of flagEls) if (q.get(f.dataset.flag) === '1') f.checked = true;
  if (['prix', 'note'].includes(q.get('tri')) && [...sort.options].some((o) => o.value === q.get('tri'))) sort.value = q.get('tri');
  if (q.get('vue') === 'tableau') form.querySelector('[data-view=table]').click();
  if (flagEls.some((f) => f.checked) || sort.value) apply(false);
}
