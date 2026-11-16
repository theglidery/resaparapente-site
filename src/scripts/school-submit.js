// Page "Pour les écoles": shows the blocks the school asked for, adds session rows, validates and builds the payload.
// Nothing is sent until the endpoint exists (src/config.ts, SCHOOL_SUBMISSION): the draft only shows a summary.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const form = $('#school-form');
if (form) {
  const levels = JSON.parse(form.dataset.levels || '[]');
  const okEmail = (x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x);
  const msg = $('#school-msg');
  const sync = () => $$('[data-topic]', form).forEach((f) => { f.hidden = !$(`input[name=topic][value=${f.dataset.topic}]`, form).checked; if (!f.hidden && f.dataset.topic === 'stage' && !$('.row-card', f)) addRow(); });
  const sessions = $('#sessions');
  function addRow() {
    const n = $$('.row-card', sessions).length + 1;
    const d = document.createElement('div'); d.className = 'row-card';
    d.innerHTML = `<div class="grid2">
      <div class="field"><label for="s${n}-type">Type de stage</label><select id="s${n}-type" name="type">${levels.map((l) => `<option value="${l.key}">${l.name}</option>`).join('')}</select></div>
      <div class="field"><label for="s${n}-name">Intitulé</label><input id="s${n}-name" name="name" type="text"></div>
      <div class="field"><label for="s${n}-start">Début</label><input id="s${n}-start" name="start" type="date"></div>
      <div class="field"><label for="s${n}-end">Fin</label><input id="s${n}-end" name="end" type="date"></div>
      <div class="field"><label for="s${n}-price">Prix TTC (€)</label><input id="s${n}-price" name="price" type="number" min="0" inputmode="decimal"></div>
      <div class="field"><label for="s${n}-places">Places restantes (facultatif)</label><input id="s${n}-places" name="places" type="number" min="0" inputmode="numeric"></div>
      <div class="field"><label for="s${n}-city">Ville du stage</label><input id="s${n}-city" name="city" type="text"></div>
      <div class="field"><label for="s${n}-url">Lien vers l’offre</label><input id="s${n}-url" name="url" type="url" placeholder="https://"></div>
    </div><button type="button" class="linklike small" data-remove>Retirer cette date</button>`;
    sessions.appendChild(d);
  }
  $('#add-session')?.addEventListener('click', addRow);
  sessions?.addEventListener('click', (e) => { const b = e.target.closest('[data-remove]'); if (b) { b.closest('.row-card').remove(); } });
  $$('input[name=topic]', form).forEach((c) => c.addEventListener('change', sync));
  const wanted = new URLSearchParams(location.search).get('type');
  if (wanted) { const c = $(`input[name=topic][value=${wanted}]`, form); if (c) c.checked = true; }
  sync();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (n) => (form.elements[n]?.value || '').trim();
    const topics = $$('input[name=topic]:checked', form).map((c) => c.value);
    const errs = [];
    if (!v('school')) errs.push('Indiquez le nom de l’école.');
    if (!v('name')) errs.push('Indiquez votre nom et votre fonction.');
    if (!okEmail(v('email'))) errs.push('Indiquez un email valide.');
    if (!topics.length) errs.push('Cochez ce que vous souhaitez publier.');
    if (topics.includes('stage') && !$$('.row-card', sessions).length) errs.push('Ajoutez au moins une date de stage.');
    if (topics.includes('bon') && !v('gift-url')) errs.push('Indiquez le lien direct vers la vente de votre bon.');
    if (topics.includes('promo') && !(v('promo-price') && v('promo-start') && v('promo-end'))) errs.push('Indiquez le prix promotionnel et les dates de l’offre.');
    if (!$('#f-consent').checked) errs.push('Cochez la case de confirmation.');
    msg.className = 'small';
    if (errs.length) { msg.innerHTML = '<strong>À corriger :</strong><ul>' + errs.map((x) => `<li>${x}</li>`).join('') + '</ul>'; msg.classList.add('error'); msg.focus(); return; }
    const rows = $$('.row-card', sessions).map((r) => Object.fromEntries($$('input,select', r).map((i) => [i.name, i.value.trim()])));
    const payload = {
      school: v('school'), site: v('site'), contact: { name: v('name'), email: v('email'), phone: v('phone') }, topics,
      sessions: topics.includes('stage') ? rows : [], bapteme: topics.includes('bapteme') ? { text: v('bapteme'), url: v('bapteme-url') } : null,
      gift: topics.includes('bon') ? { name: v('gift-name'), url: v('gift-url'), price: v('gift-price'), validity: v('gift-validity') } : null,
      promo: topics.includes('promo') ? { title: v('promo-title'), price: v('promo-price'), regular: v('promo-regular'), start: v('promo-start'), end: v('promo-end'), conditions: v('promo-conditions'), url: v('promo-url') } : null,
      message: v('msg'),
    };
    window.rpTrack?.('school_submission', { topics: topics.join(',') });
    // TODO(developer): POST payload as JSON to form.dataset.endpoint; the team reviews it, then adds it to the workbook (docs/COLLECTE-DES-STAGES.md).
    msg.classList.add('ok');
    msg.innerHTML = `<strong>Envoi prêt (maquette : rien n’est encore envoyé).</strong><br>${payload.school} : ${topics.length} type${topics.length > 1 ? 's' : ''} d’information, dont ${payload.sessions.length} date${payload.sessions.length > 1 ? 's' : ''} de stage. Quand le serveur sera raccordé, l’équipe recevra ce message, relira les informations et les publiera.`;
    msg.focus();
  });
}
