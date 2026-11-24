// Search and filters for the school lists (baptême and stage pages).
// Progressive enhancement: without JavaScript the full list is still shown, in alphabetical order.
import { makeFilters, readItem, defaultCountryFromHost } from './filters-lib.js';
const eur = (n, cur = 'EUR') => new Intl.NumberFormat(cur === 'CHF' ? 'fr-CH' : 'fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);

const form = document.getElementById('filters');
if (form) {
  const list = document.getElementById('board');
  const items = [...list.children];
  const count = document.getElementById('count'), none = document.getElementById('none'), note = document.getElementById('price-note');
  const baseNote = note.textContent;
  const F = makeFilters(form);

  function apply() {
    const st = F.state();
    let shown = 0;
    const defCountry = defaultCountryFromHost();
    const rows = items.map((li) => {
      const { ok, d } = F.match(readItem(li), st);
      let price = parseFloat(li.dataset.price), n = null;
      if (st.level && li.dataset.bylevel) { const b = JSON.parse(li.dataset.bylevel)[st.level]; if (b) { price = b.p ?? NaN; n = b.n; } }
      return { li, d, ok, price, n, country: li.dataset.country || 'FR', currency: li.dataset.currency || 'EUR', name: li.dataset.name, rating: parseFloat(li.dataset.rating), reviews: parseInt(li.dataset.reviews || '0', 10) };
    });
    const cPref = (a, b) => (a.country === defCountry ? 0 : 1) - (b.country === defCountry ? 0 : 1);
    const by = st.sort === 'prix' ? (a, b) => cPref(a, b) || (isNaN(a.price) - isNaN(b.price)) || a.price - b.price
      : st.sort === 'note' ? (a, b) => cPref(a, b) || (isNaN(b.rating) ? -1 : b.rating) - (isNaN(a.rating) ? -1 : a.rating) || b.reviews - a.reviews || a.name.localeCompare(b.name, 'fr')
      : st.sort === 'nom' || !st.from ? (a, b) => cPref(a, b) || a.name.localeCompare(b.name, 'fr')
      : (a, b) => cPref(a, b) || (a.d ?? 1e9) - (b.d ?? 1e9);
    rows.sort(by);
    for (const row of rows) {
      row.li.hidden = !row.ok;
      list.appendChild(row.li);
      const dist = row.li.querySelector('.dist');
      if (dist) dist.textContent = row.ok && row.d !== null ? ` · à ${Math.round(row.d)} km` : '';
      const pm = row.li.querySelector('.price-main'), ps = row.li.querySelector('.price-sub'), cn = row.li.querySelector('.count');
      if (!row.li.dataset.orig) row.li.dataset.orig = JSON.stringify([pm.textContent, ps.textContent, cn.textContent]);
      const orig = JSON.parse(row.li.dataset.orig);
      if (row.n !== null) {
        pm.textContent = isNaN(row.price) ? 'prix selon formule' : `dès ${eur(row.price, row.currency)}`;
        ps.textContent = 'ce niveau'; cn.textContent = `${row.n} formule${row.n > 1 ? 's' : ''}`;
      } else { pm.textContent = orig[0]; ps.textContent = orig[1]; cn.textContent = orig[2]; }
      if (row.ok) shown++;
    }
    const isEn = document.documentElement.lang === 'en';
    count.textContent = isEn ? (shown === 1 ? '1 school' : `${shown} schools`) : (shown === 1 ? '1 école' : `${shown} écoles`);
    note.textContent = st.level ? (isEn ? 'Prices per person for the selected level' : 'Prix par personne pour le niveau choisi') : baseNote;
    none.hidden = shown !== 0;
    if (shown === 0 && st.region && (st.qText || st.from)) {
      const cityLabel = F.els.q.value.trim() || (isEn ? 'this city' : 'cette ville');
      none.innerHTML = isEn
        ? `No results in <strong>${st.region}</strong> near <strong>${cityLabel}</strong>. <button type="button" class="btn small ghost" id="clr-reg">Remove region</button> <button type="button" class="btn small ghost" id="clr-city">Remove city</button>`
        : `Aucun résultat à la fois en <strong>${st.region}</strong> et près de <strong>${cityLabel}</strong>. <button type="button" class="btn small ghost" id="clr-reg">Retirer la région</button> <button type="button" class="btn small ghost" id="clr-city">Retirer la ville</button>`;
      document.getElementById('clr-reg')?.addEventListener('click', () => { F.els.region.value = ''; F.els.region.dispatchEvent(new Event('change')); });
      document.getElementById('clr-city')?.addEventListener('click', () => { F.els.q.value = ''; F.els.q.dispatchEvent(new Event('input')); });
    }
  }
  F.bind(apply, (msg) => { none.textContent = msg; none.hidden = false; });
}
