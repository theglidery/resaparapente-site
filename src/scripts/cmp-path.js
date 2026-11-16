// Recomputes the step-based training total when the visitor changes the number of courses, the equipment budget or the exams option.
const form = document.getElementById('path-form');
if (form) {
  const body = document.getElementById('path-body');
  const rows = [...body.querySelectorAll('.path-row')];
  const count = document.getElementById('path-n');
  const empty = document.getElementById('path-empty');
  const fmt = JSON.parse(document.getElementById('path-fmt').textContent);
  const money = (n) => new Intl.NumberFormat(fmt.locale, { style: 'currency', currency: fmt.currency, maximumFractionDigits: 0 }).format(n);
  const keys = ['initiation', 'progression', 'perfectionnement'];
  function apply() {
    const q = Object.fromEntries(new FormData(form).entries());
    const n = Object.fromEntries(keys.map((k) => [k, Math.max(0, Number(q[k]) || 0)]));
    const gear = Math.max(0, Number(q.gear) || 0);
    const exams = form.elements.exams && form.elements.exams.checked ? Number(form.elements.exams.dataset.exams) : 0;
    const scored = [];
    for (const r of rows) {
      let total = 0, ok = keys.some((k) => n[k] > 0);
      for (const k of keys) {
        if (!n[k]) continue;
        const p = r.dataset['p' + k[0].toUpperCase() + k.slice(1)];
        if (p === '' || p == null) { ok = false; break; }
        total += n[k] * Number(p);
      }
      if (q.region && r.dataset.region !== q.region) ok = false;
      r.hidden = !ok;
      if (ok) { total += gear + exams; r.querySelector('.path-total').textContent = money(total); scored.push([r, total]); }
    }
    scored.sort((a, b) => a[1] - b[1]).forEach(([r]) => body.append(r));
    count.textContent = String(scored.length);
    empty.hidden = scored.length > 0;
  }
  document.querySelectorAll('.path-presets [data-preset]').forEach((b) => b.addEventListener('click', () => {
    b.dataset.preset.split(',').forEach((v, i) => { form.elements[keys[i]].value = v; });
    apply();
  }));
  form.addEventListener('input', apply);
  apply();
}
