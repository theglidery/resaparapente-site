// Shared by the school lists (baptême, stage) and the stage calendar: the same filter form behaves the same way everywhere.
export const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const rad = (d) => (d * Math.PI) / 180;
export function km(a, b) {
  const R = 6371, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const words = (text) => norm(text).split(/[\s'’\-]+/).filter(Boolean);

/** Reads data-* attributes of an element: name, city, dept, region, near (a|b|c), lat, lng, levels (space separated). */
export const readItem = (el) => ({
  name: el.dataset.name || '', city: el.dataset.city || '', dept: el.dataset.dept || '', region: el.dataset.region || '',
  near: (el.dataset.near || '').split('|').filter(Boolean), lat: parseFloat(el.dataset.lat), lng: parseFloat(el.dataset.lng),
  levels: (el.dataset.levels || '').split(' ').filter(Boolean), start: el.dataset.start || '', flags: (el.dataset.flags || '').split(' ').filter(Boolean),
});

export function makeFilters(form) {
  const towns = JSON.parse(document.getElementById('towns-data').textContent);
  const els = { q: form.elements.q, r: form.elements.r, region: form.elements.region, sort: form.elements.sort, level: form.elements.level, school: form.elements.school, month: form.elements.month };
  const chips = [...document.querySelectorAll('#type-chips [data-level]')];
  const flagEls = [...form.querySelectorAll('input[data-flag]')]; // checkboxes: kids, winter, gift
  const syncChips = () => chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.level === (els.level ? els.level.value : ''))));
  const geo = document.getElementById('geo');
  let origin = null; // { lat, lng } from "Autour de moi"
  const params = new URLSearchParams(location.search);
  for (const [k, el] of Object.entries(els)) if (el && params.get(k)) el.value = params.get(k);
  for (const f of flagEls) if (params.get(f.dataset.flag) === '1') f.checked = true;
  const findTown = (text) => { const t = norm(text); return t ? towns.find((x) => norm(x.name) === t) || null : null; };

  const state = () => {
    const town = origin ? null : findTown(els.q.value);
    return {
      qText: norm(els.q.value), town, from: origin || (town ? { lat: town.lat, lng: town.lng } : null),
      radius: Number(els.r.value) || 0, nameWords: words(els.school.value),
      flags: flagEls.filter((f) => f.checked).map((f) => f.dataset.flag), level: els.level ? els.level.value : '', month: els.month ? els.month.value : '', region: els.region.value, sort: els.sort ? els.sort.value : '',
    };
  };
  /** { ok, d } for one item (see readItem) under a state */
  const match = (it, st) => {
    const d = st.from && !isNaN(it.lat) ? km(st.from, { lat: it.lat, lng: it.lng }) : null;
    let ok = true;
    if (st.region && it.region !== st.region) ok = false;
    if (ok && st.level && !it.levels.includes(st.level)) ok = false;
    if (ok && st.flags.length && !st.flags.every((f) => it.flags.includes(f))) ok = false;
    if (ok && st.month) ok = !!it.start && it.start.slice(0, 7) === st.month;   // dated sessions only: a school without dates has nothing in that month
    if (ok && st.nameWords.length) ok = st.nameWords.every((w) => it.name.includes(w));
    if (ok && st.from) ok = st.radius ? (d !== null && d <= st.radius) || (st.town && it.near.includes(norm(st.town.name))) : true;
    if (ok && !st.from && st.qText) ok = it.city.includes(st.qText) || it.dept.includes(st.qText) || it.near.some((c) => c.includes(st.qText));
    return { ok, d };
  };
  /** Calls apply() now and whenever a field changes. onGeoError(message) is called if the position is refused. */
  const bind = (applyNow, onGeoError) => {
    const apply = () => { syncChips(); applyNow(); };
    form.addEventListener('submit', (e) => { e.preventDefault(); origin = null; apply(); });
    for (const el of [els.r, els.region, els.sort, els.level, els.month, ...flagEls]) el && el.addEventListener('change', apply);
    for (const el of [els.q, els.school]) el.addEventListener('input', () => { if (el === els.q) origin = null; apply(); });
    chips.forEach((c) => c.addEventListener('click', () => { if (els.level) els.level.value = c.dataset.level; apply(); }));
    form.addEventListener('reset', () => setTimeout(() => { origin = null; if (els.level) els.level.value = ''; apply(); }, 0));
    if (geo && 'geolocation' in navigator) {
      geo.hidden = false;
      geo.addEventListener('click', () => {
        geo.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (p) => { origin = { lat: p.coords.latitude, lng: p.coords.longitude }; els.q.value = ''; if (!els.r.value) els.r.value = '100'; if (els.sort) els.sort.value = 'distance'; geo.disabled = false; apply(); },
          () => { geo.disabled = false; onGeoError && onGeoError('Position refusée ou indisponible. Choisissez une ville à la place.'); }
        );
      });
    }
    if (geo && !geo.hidden && params.get('geo') === '1') geo.click(); // arrived from the home page with "Autour de moi"
    apply();
  };
  return { els, state, match, bind };
}
