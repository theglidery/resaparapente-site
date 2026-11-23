// Filter + sort of the tandem comparator. The rows are server-rendered (indexable); this only shows/hides and reorders them.
const root = document.querySelector('[data-cmp="bapteme"]');
if (root) {
  const body = root.querySelector('#cmp-body');
  const rows = [...body.querySelectorAll('.cmp-row')];
  const form = root.querySelector('.cmp-filters');
  const count = root.querySelector('#cmp-n');
  const empty = root.querySelector('#cmp-empty');
  const more = root.querySelector('#cmp-more');
  const step = Number(root.dataset.max) || 40;
  let limit = step;
  const num = (v) => (v === '' || v == null ? null : Number(v));
  const f = () => Object.fromEntries(new FormData(form).entries());
  function apply() {
    const q = f();
    const budgetMin = num(q.budgetMin);
    const budget = num(q.budget);
    const vis = rows.filter((r) => {
      const d = r.dataset;
      if (q.currency && d.currency !== q.currency) return false;
      if (q.region && d.region !== q.region) return false;
      if (budgetMin != null && Number(d.total) < budgetMin) return false;
      if (budget != null && Number(d.total) > budget) return false;
      if (q.dur) {
        const m = num(d.dmax) ?? num(d.dmin);
        if (m == null) return false;
        if (q.dur === '1' && m > 15) return false;
        if (q.dur === '2' && (m <= 15 || m > 30)) return false;
        if (q.dur === '3' && m <= 30) return false;
      }
      if (q.photo === 'yes' && d.photo !== 'yes') return false;
      if (q.photo === 'any' && d.photo === 'unknown') return false;
      if (q.lift === 'yes' && d.lift !== 'yes') return false;
      if (q.profile && !d.profiles.split('|').includes(q.profile)) return false;
      if (q.lang && !d.langs.split('|').includes(q.lang)) return false;
      return true;
    });
    const key = { total: (r) => Number(r.dataset.total), price: (r) => Number(r.dataset.price), dur: (r) => -(num(r.dataset.dmax) ?? num(r.dataset.dmin) ?? 0), permin: (r) => num(r.dataset.permin) ?? 1e9 }[q.sort || 'total'];
    vis.sort((a, b) => key(a) - key(b));
    rows.forEach((r) => (r.hidden = true));
    vis.forEach((r, i) => { r.hidden = i >= limit; body.append(r); });
    count.textContent = String(vis.length);
    empty.hidden = vis.length > 0;
    more.hidden = vis.length <= limit;
  }
  form.addEventListener('input', () => { limit = step; apply(); });
  form.addEventListener('reset', () => setTimeout(() => { limit = step; apply(); }));
  more.addEventListener('click', () => { limit += step * 2; apply(); });
  // Landing links such as ?profile=Enfant or ?photo=any preselect the filters.
  const params = new URLSearchParams(location.search);
  for (const [k, v] of params) { const el = form.elements[k]; if (el && 'value' in el) el.value = v; }
  apply();
}
