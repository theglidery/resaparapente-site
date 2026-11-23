// Simple course comparator: filter by training type, country, region, nearby city + distance, currency, sorted by price ascending by default.
const form = document.getElementById('stage-cmp-form');
if (form) {
  const body = document.getElementById('stage-cmp-body');
  const rows = [...body.querySelectorAll('.stage-cmp-row')];
  const count = document.getElementById('stage-cmp-n');
  const empty = document.getElementById('stage-cmp-empty');
  const towns = JSON.parse(document.getElementById('stage-cmp-towns')?.textContent || '[]');

  const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const rad = (d) => (d * Math.PI) / 180;
  const km = (a, b) => {
    const R = 6371, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const syncRegions = () => {
    const p = form.elements.pays?.value || 'FR';
    if (form.elements.region) {
      [...form.elements.region.querySelectorAll('option[data-country]')].forEach((opt) => {
        opt.hidden = p !== 'all' && opt.dataset.country !== p;
      });
    }
  };

  if (form.elements.pays && form.elements.currency) {
    form.elements.pays.addEventListener('change', () => {
      const p = form.elements.pays.value;
      if (p === 'CH') form.elements.currency.value = 'CHF';
      else if (p === 'FR' || p === 'BE') form.elements.currency.value = 'EUR';
      if (form.elements.region) form.elements.region.value = '';
      syncRegions();
      apply();
    });
  }

  function apply() {
    syncRegions();
    const q = Object.fromEntries(new FormData(form).entries());
    const qText = norm(q.q);
    const town = qText ? towns.find((t) => norm(t.name) === qText) || null : null;
    const radius = Number(q.r) || 0;

    const matched = [];
    for (const r of rows) {
      const d = r.dataset;
      let ok = true;
      if (q.level && d.level !== q.level) ok = false;
      if (ok && q.pays && q.pays !== 'all' && d.country !== q.pays) ok = false;
      if (ok && q.currency && d.currency !== q.currency) ok = false;
      if (ok && q.region && d.region !== q.region) ok = false;

      let dist = null;
      if (ok && town) {
        const lat = parseFloat(d.lat), lng = parseFloat(d.lng);
        if (!isNaN(lat) && !isNaN(lng)) dist = km(town, { lat, lng });
        if (radius) {
          const nearList = (d.near || '').split('|').filter(Boolean);
          if (!(dist !== null && dist <= radius) && !nearList.includes(norm(town.name))) ok = false;
        }
      } else if (ok && qText) {
        const nearList = (d.near || '').split('|').filter(Boolean);
        if (!d.city.includes(qText) && !nearList.some((x) => x.includes(qText))) ok = false;
      }

      r.hidden = !ok;
      const distEl = r.querySelector('.stage-dist');
      if (distEl) distEl.textContent = ok && dist !== null ? ` · à ${Math.round(dist)} km` : '';
      if (ok) matched.push({ r, price: Number(d.price), dist, school: d.school || '' });
    }

    const sort = q.sort || 'price';
    matched.sort((a, b) => {
      if (sort === 'distance' && (a.dist != null || b.dist != null)) return (a.dist ?? 1e9) - (b.dist ?? 1e9) || a.price - b.price;
      if (sort === 'school') return a.school.localeCompare(b.school, 'fr') || a.price - b.price;
      return a.price - b.price || a.school.localeCompare(b.school, 'fr');
    });
    for (const m of matched) body.appendChild(m.r);
    count.textContent = String(matched.length);
    empty.hidden = matched.length > 0;
  }

  const params = new URLSearchParams(location.search);
  for (const [k, v] of params) {
    const el = form.elements[k];
    if (el && 'value' in el && v) el.value = v;
  }
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(apply, 0));
  apply();
}
