// School page: journey filter (baptême or stage), one selected formula, then "Réserver" -> free request form
// in the right-hand panel. No payment happens on the site: the school answers and organises it.
// Direct school links remain available when the booking endpoint is disabled.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00'));
const trim = (x) => (x || '').trim();
const okEmail = (x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x);

// ---------- 1. Journey: ?parcours=stage|bapteme shows one offer type; the canonical address never changes ----------
const sections = $$('[data-section]');
const tabs = $('#tabs');
const params = new URLSearchParams(location.search);
const wanted = params.get('parcours');
const form = $('#booking-form');
const CT = form ? JSON.parse(form.dataset.contactTypes || '{}') : {};
// Contact type: named on every form so nobody fills it in under the wrong role
const setContactKind = (kind) => {
  const t = CT[kind]; if (!t) return;
  const l = $('#contact-legend'); if (l) l.textContent = `${t.title} : vos coordonnées`;
  const h = $('#b-ctype'); if (h) h.value = t.code;
};
const visibleKind = () => (sections.find((el) => !el.hidden) || sections[0])?.dataset.section;
const showKind = (kind) => {
  sections.forEach((el) => (el.hidden = el.dataset.section !== kind));
  tabs?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.kind === kind)));
  setContactKind(kind);
};
if (sections.length > 1 && tabs) {
  tabs.hidden = false;
  showKind(sections.some((el) => el.dataset.section === wanted) ? wanted : sections[0].dataset.section);
  tabs.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) showKind(button.dataset.kind);
  });
}

// Info tabs under the list: show the block of the chosen formula
const showInfo = (li) => {
  const sec = li.closest('[data-section]');
  $$('.info-block', sec).forEach((b) => (b.hidden = b.dataset.infoFor !== li.dataset.id));
};

// ---------- 2. Selected formula and the right-hand panel ----------
if (form) {
  const offers = $$('[data-offer]');
  const chosen = $('#chosen'), n = $('#b-n'), hint = $('#weight-hint');
  const d1 = $('#b-d1'), d2 = $('#b-d2'), d3 = $('#b-d3'), alts = $('#alts'), chips = $('#sess-chips'), msg = $('#booking-msg');
  const giftFields = $('#gift-fields'), gName = $('#b-gift-name'), gEmail = $('#b-gift-email'), gNote = $('#b-gift-note');
  let sel = null;
  let mode = 'book'; // 'book' | 'gift'

  // A stage has participants (height and weight asked); a baptême has passengers (weight asked). Neutral wording until a formula is chosen.
  const only = form.dataset.onlyKind || '';
  const kindWords = (kind) => {
    const k = kind || only;
    if (k === 'bapteme') return { dateLegend: 'Date souhaitée', d1: 'Date souhaitée', pax: 'Passagers', n: 'Nombre de passagers', one: 'Passager', height: false };
    if (k === 'stage') return { dateLegend: 'Début souhaité', d1: 'Début souhaité', pax: 'Participants', n: 'Nombre de participants', one: 'Participant', height: true };
    return { dateLegend: 'Date souhaitée', d1: 'Date souhaitée', pax: 'Participants', n: 'Nombre de participants', one: 'Participant', height: false };
  };

  const summary = (box, li) => {
    box.innerHTML = '';
    const p = document.createElement('p'); p.style.margin = '0';
    p.innerHTML = '<strong></strong><br><span class="muted small"></span>';
    $('strong', p).textContent = li.dataset.name;
    $('span', p).textContent = `${li.dataset.priceLabel} · ${mode === 'gift' ? 'cadeau à offrir' : 'formule choisie'}`;
    const more = document.createElement('a'); more.className = 'small'; more.href = `#info-${li.dataset.kind}`; more.textContent = 'Voir les infos de cette formule ↓';
    p.appendChild(document.createElement('br')); p.appendChild(more);
    box.appendChild(p);
  };

  function choose(li, open = true, nextMode = 'book') {
    sel = li;
    mode = nextMode === 'gift' ? 'gift' : 'book';
    if (giftFields) giftFields.hidden = mode !== 'gift';
    offers.forEach((o) => {
      const on = o === li;
      o.classList.toggle('selected', on);
      const bBook = $('.choose', o);
      if (bBook instanceof HTMLButtonElement) {
        const active = on && mode === 'book';
        bBook.setAttribute('aria-pressed', String(active));
        bBook.textContent = active ? 'Formule sélectionnée' : 'Je Réserve';
      }
      const bGift = $('.choose-gift', o);
      if (bGift instanceof HTMLButtonElement) {
        const active = on && mode === 'gift';
        bGift.setAttribute('aria-pressed', String(active));
        bGift.textContent = active ? 'Cadeau sélectionné' : 'J’offre';
      }
    });
    showInfo(li); setContactKind(li.dataset.kind);
    const l = $('#contact-legend');
    if (l && mode === 'gift') l.textContent = 'Vos coordonnées (personne qui offre)';
    if (open) window.rpTrack?.('select_offer', { school_id: form.dataset.schoolId, offer_id: li.dataset.id, offer_name: li.dataset.name, kind: li.dataset.kind, mode });
    openBooking(li);
    if (open) showPanel();
  }

  // The panel on the right is the place where the action happens, so it is brought to the top of the screen:
  // on phones it opens as a full-screen sheet with a close button, on desktop it stays in view beside the offers.
  const aside = $('#booking');
  const phone = () => window.matchMedia('(max-width: 979px)').matches;
  function showPanel() {
    if (!aside) return;
    if (phone()) {
      aside.classList.add('sheet-open'); document.body.classList.add('sheet-lock'); aside.scrollTop = 0; syncBar();
      $('#sheet-close')?.focus({ preventScroll: true });
    } else {
      const r = aside.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.4) aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
      aside.scrollTop = 0;
    }
  }
  // Sticky bar on phones: a way back to the booking from anywhere on the page.
  const bar = $('#sticky-cta'), barBtn = $('#sticky-btn'), barLabel = $('#sticky-label');
  const offersCol = $('.offers-col');
  let offersInView = false;
  const syncBar = () => {
    if (!bar) return;
    const sheetOpen = aside?.classList.contains('sheet-open');
    const show = phone() && !sheetOpen && (sel ? true : !offersInView);
    bar.hidden = !show;
    document.body.classList.toggle('has-sticky-cta', show);
    barBtn.textContent = sel ? (form.dataset.canSend === '1' ? 'Continuer ma demande' : 'Contacter l’école') : 'Voir les formules';
    if (sel) barLabel.textContent = sel.dataset.name;
  };
  if (bar && offersCol && 'IntersectionObserver' in window) {
    new IntersectionObserver((en) => { offersInView = en[0].isIntersecting; syncBar(); }, { rootMargin: '-35% 0px -35% 0px' }).observe(offersCol);
  }
  barBtn?.addEventListener('click', () => {
    if (sel) { showPanel(); syncBar(); window.rpTrack?.('click_sticky_cta', { school_id: form.dataset.schoolId, state: 'continue' }); }
    else { offersCol?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.rpTrack?.('click_sticky_cta', { school_id: form.dataset.schoolId, state: 'browse' }); }
  });
  window.addEventListener('resize', syncBar);
  function closePanel() { aside?.classList.remove('sheet-open'); document.body.classList.remove('sheet-lock'); syncBar(); }
  
  $('#sheet-close')?.addEventListener('click', closePanel);
  aside?.addEventListener('click', (e) => { if (e.target.closest('a[href^="#info-"]')) closePanel(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  window.matchMedia('(min-width: 980px)').addEventListener('change', closePanel);

  function openBooking(li) {
    const w = kindWords(li.dataset.kind);
    $('#date-legend').textContent = w.dateLegend; $('#d1-label').textContent = w.d1 + ' (facultatif)';
    $('#pax-legend').textContent = w.pax; $('#n-label').textContent = w.n;
    queueMicrotask(() => typeof drawRows === 'function' && drawRows());
    summary(chosen, li);
    if (li.dataset.weight) { hint.hidden = false; hint.textContent = `Poids indiqué par l’école : ${li.dataset.weight}`; } else hint.hidden = true;
    // published session dates for this formula, as one-click choices
    const sess = JSON.parse(li.dataset.sessions || '[]');
    chips.innerHTML = ''; chips.hidden = sess.length === 0;
    for (const s of sess) {
      const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = `Session du ${fmtDate(s.start)}`;
      c.addEventListener('click', () => { d1.value = s.start; d1.dispatchEvent(new Event('input')); }); chips.appendChild(c);
    }
    const link = $('#school-link'); if (li.dataset.book || form.dataset.website) link.href = li.dataset.book || form.dataset.website;
    msg.textContent = '';
  }
  offers.forEach((li) => {
    $('button.choose', li)?.addEventListener('click', () => choose(li, true, 'book'));
    $('button.choose-gift', li)?.addEventListener('click', () => choose(li, true, 'gift'));
  });

  // One block per participant: first name (optional), weight (needed by the school) and, for a course, height.
  const rows = $('#pax-rows');
  const kindNow = () => (sel ? sel.dataset.kind : only);
  const drawRows = () => {
    if (!rows) return;
    const w = kindWords(kindNow()), count = Number(n.value) || 1;
    const old = $$('.pax', rows).map((r) => ({ name: $('[data-f=name]', r).value, weight: $('[data-f=weight]', r).value, height: $('[data-f=height]', r)?.value || '' }));
    rows.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const r = document.createElement('fieldset'); r.className = 'pax';
      r.innerHTML = `<legend></legend>
        <div class="field"><label>Prénom (facultatif)</label><input data-f="name" type="text" maxlength="80" autocomplete="off" /></div>
        <div class="field"><label>Poids (kg)</label><input data-f="weight" type="number" inputmode="numeric" min="15" max="200" step="1" /></div>
        ${w.height ? '<div class="field"><label>Taille (cm)</label><input data-f="height" type="number" inputmode="numeric" min="100" max="230" step="1" /></div>' : ''}`;
      $('legend', r).textContent = `${w.one} ${i + 1}`;
      const prev = old[i]; if (prev) { $('[data-f=name]', r).value = prev.name; $('[data-f=weight]', r).value = prev.weight; const h = $('[data-f=height]', r); if (h) h.value = prev.height; }
      rows.appendChild(r);
    }
  };
  n.addEventListener('change', drawRows);
  drawRows();
  const participants = () => $$('.pax', rows).map((r) => ({
    name: $('[data-f=name]', r).value.trim(), weight: Number($('[data-f=weight]', r).value),
    ...($('[data-f=height]', r) ? { height: Number($('[data-f=height]', r).value) } : {}),
  }));
  const participantErrors = () => {
    const errs = [];
    participants().forEach((p, i) => {
      if (!(p.weight >= 15 && p.weight <= 200)) errs.push(`Indiquez le poids (15 à 200 kg) du participant ${i + 1}.`);
      if ('height' in p && !(p.height >= 100 && p.height <= 230)) errs.push(`Indiquez la taille (100 à 230 cm) du participant ${i + 1}.`);
    });
    return errs;
  };
  let started = false;
  form.addEventListener('input', () => { if (!started && sel) { started = true; window.rpTrack?.('begin_request', { school_id: form.dataset.schoolId, offer_id: sel.dataset.id, kind: sel.dataset.kind }); } });
  const initial = offers.find((li) => li.dataset.id === params.get('offre'));
  if (initial) {
    showKind(initial.dataset.kind);
    choose(initial, false);
    const date = params.get('date');
    const sessions = JSON.parse(initial.dataset.sessions || '[]');
    if (sessions.some((session) => session.start === date)) {
      d1.value = date;
      alts.hidden = false;
    }
  }
  d1.addEventListener('input', () => { alts.hidden = !d1.value; });

  // Two steps: 1 = who and when (short), 2 = address, participants, consent. Step 1 is validated before step 2 opens.
  const step1 = $('#step-1'), step2 = $('#step-2'), s1msg = $('#step1-msg'), fs1 = $('#fs-1'), fs2 = $('#fs-2');
  const v = (id) => $(id).value.trim();
  const step1Errors = () => {
    const errs = [];
    if (!sel) errs.push('Choisissez une formule dans la liste (bouton « Je Réserve » ou « J’offre »).');
    if (mode === 'gift' && !v('#b-gift-name')) errs.push('Indiquez le nom et prénom du bénéficiaire du cadeau.');
    if (mode === 'gift' && v('#b-gift-email') && !okEmail(v('#b-gift-email'))) errs.push('Indiquez un email valide pour le bénéficiaire.');
    if (!v('#b-name')) errs.push('Indiquez votre nom et prénom.');
    if (!okEmail(v('#b-email'))) errs.push('Indiquez un email valide.');
    if (v('#b-phone') && v('#b-phone').replace(/\D/g, '').length < 8) errs.push('Indiquez un numéro de téléphone.');
    if ([d1, d2, d3].some((d) => d.value && d.value < d.min)) errs.push('Choisissez une date à venir.');
    const dates = [d1.value, d2.value, d3.value].filter(Boolean);
    if (new Set(dates).size !== dates.length) errs.push('Les dates doivent être différentes.');
    return errs;
  };
  const gotoStep = (k) => {
    step1.hidden = k !== 1; step2.hidden = k !== 2;
    fs1.toggleAttribute('aria-current', k === 1); fs2.toggleAttribute('aria-current', k === 2);
    if (k === 1) fs1.setAttribute('aria-current', 'step'); else fs2.setAttribute('aria-current', 'step');
    fs1.classList.toggle('done', k === 2);
    aside?.scrollTo?.({ top: 0 });
    if (!phone()) { const r = aside.getBoundingClientRect(); if (r.top < 0) aside.scrollIntoView({ block: 'start' }); }
    (k === 2 ? n : $('#b-name'))?.focus({ preventScroll: true });
  };
  $('#step-next')?.addEventListener('click', () => {
    const errs = step1Errors(); s1msg.className = 'small';
    if (errs.length) { s1msg.innerHTML = '<strong>À corriger :</strong><ul>' + errs.map((x) => `<li>${x}</li>`).join('') + '</ul>'; s1msg.classList.add('error'); s1msg.focus(); return; }
    s1msg.innerHTML = ''; gotoStep(2);
    window.rpTrack?.('request_step2', { school_id: form.dataset.schoolId, offer_id: sel.dataset.id, kind: sel.dataset.kind });
  });
  $('#step-back')?.addEventListener('click', () => gotoStep(1));
  // Enter in a step-1 field moves on instead of submitting the whole form
  step1.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); $('#step-next').click(); } });

  let pending = false;
  let attempt;
  const canSend = form.dataset.canSend === '1';
  const button = $('button[type=submit]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pending) return;
    const errors = step1Errors();
    if (errors.length) {
      gotoStep(1);
      s1msg.textContent = errors.join(' ');
      s1msg.focus();
      return;
    }
    const paxErrors = participantErrors();
    if (paxErrors.length) { msg.className = 'small error'; msg.innerHTML = '<strong>À corriger :</strong><ul>' + paxErrors.map((x) => `<li>${x}</li>`).join('') + '</ul>'; msg.focus(); return; }
    if (!canSend || !$('#b-consent').checked) {
      msg.textContent = canSend ? 'Autorisez la transmission à l’école.' : 'Aucun envoi effectué. Contactez l’école via le lien ci-dessous.';
      msg.focus();
      return;
    }
    const payload = {
      schoolId: form.dataset.schoolId, offerId: sel.dataset.id,
      bookingMode: mode,
      giftRecipient: mode === 'gift' ? { name: v('#b-gift-name'), email: v('#b-gift-email'), note: v('#b-gift-note') } : null,
      contact: { name: v('#b-name'), email: v('#b-email'), phone: v('#b-phone'), type: v('#b-ctype') },
      dates: [d1.value, d2.value, d3.value].filter(Boolean), participantCount: Number(n.value), participants: participants(),
      message: v('#b-msg'), consent: true, marketingOptIn: Boolean($('#b-optin')?.checked), website: v('#b-website'),
    };
    const signature = JSON.stringify(payload);
    if (attempt?.signature !== signature) attempt = { signature, id: crypto.randomUUID(), sent: false };
    if (attempt.sent) return;
    pending = true;
    button.disabled = true;
    msg.className = 'small';
    msg.textContent = 'Envoi en cours…';
    try {
      const result = await fetch(form.dataset.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, requestId: attempt.id }), signal: AbortSignal.timeout(12000),
      });
      const outcome = await result.json().catch(() => ({}));
      if (!result.ok || !outcome.ok || outcome.reference !== attempt.id) {
        throw new Error(outcome.error || 'Envoi indisponible. Réessayez ou contactez directement l’école.');
      }
      attempt.sent = true;
      msg.classList.add('ok');
      msg.textContent = 'Demande transmise. Redirection…';
      const kindSent = offers.find((o) => o.dataset.id === payload.offerId)?.dataset.kind === 'stage' ? 'stagiaire' : 'passager';
      const next = `/merci/${kindSent}/?${new URLSearchParams({ ref: attempt.id, ecole: form.dataset.school || '', slug: form.dataset.schoolSlug || '', ...(outcome.test ? { test: '1' } : {}) })}`;
      location.assign(next);
      return;
    } catch (err) {
      msg.classList.add('error');
      msg.textContent = err.name === 'TimeoutError' || err instanceof TypeError
        ? 'Envoi non confirmé. Réessayez ou contactez directement l’école.' : err.message;
    } finally {
      pending = false;
      button.disabled = false;
      msg.focus();
    }
  });
}

// "Plus d'information sur l'école": opens while the pointer is over it and closes as soon as the pointer leaves,
// so the visitor can go on to the formulas. Keyboard (Enter, Escape) and touch (tap) work too.
(() => {
  const box = $('#more-info'); if (!box) return;
  const btn = $('.more-info-btn', box), panel = $('.more-info-panel', box);
  const set = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  const hoverDevice = window.matchMedia('(hover: hover)').matches;
  if (hoverDevice) { box.addEventListener('mouseenter', () => set(true)); box.addEventListener('mouseleave', () => set(false)); }
  btn.addEventListener('click', (e) => { if (hoverDevice && e.detail > 0) return; set(panel.hidden); });
  box.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();

// Promotions end on their own: hide any whose end date has passed since the site was built.
(() => {
  const today = new Date().toISOString().slice(0, 10);
  $$('[data-promo][data-end]').forEach((el) => { if (el.dataset.end < today) el.hidden = true; });
})();

// Video: the third-party player is loaded only when the visitor clicks.
$$('.video-facade').forEach((b) => b.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = b.dataset.embed; f.title = b.dataset.title || 'Vidéo'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.loading = 'lazy';
  b.replaceWith(f);
}));
