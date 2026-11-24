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
let onKindChange = null;
const visibleKind = () => (sections.find((el) => !el.hidden) || sections[0])?.dataset.section;
const showKind = (kind) => {
  sections.forEach((el) => (el.hidden = el.dataset.section !== kind));
  tabs?.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.kind === kind)));
  setContactKind(kind);
  if (onKindChange) onKindChange(kind);
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
  const chosen = $('#chosen'), giftChosen = $('#gift-chosen'), n = $('#b-n'), hint = $('#weight-hint');
  const d1 = $('#b-d1'), d2 = $('#b-d2'), d3 = $('#b-d3'), alts = $('#alts'), chips = $('#sess-chips'), msg = $('#booking-msg');
  const giftForm = $('#gift-form'), giftMsg = $('#gift-msg');
  const step1Weight = $('#pax-step1-weight'), bWeight = $('#b-weight');
  const step1Stage = $('#pax-step1-stage'), bStageWeight = $('#b-stage-weight'), bStageHeight = $('#b-stage-height');
  let sel = null;
  let mode = 'book'; // 'book' | 'gift'

  // A stage has participants (height and weight asked); a baptême has passengers (weight asked). Neutral wording until a formula is chosen.
  const only = form.dataset.onlyKind || '';
  const kindWords = (kind) => {
    const k = kind || only;
    if (k === 'bapteme') return { dateLegend: 'Dates souhaitées', d1: 'Date souhaitée', pax: 'Passagers', n: 'Nombre de passagers', one: 'Passager', height: false };
    if (k === 'stage') return { dateLegend: 'Date du stage', d1: 'Date de début souhaitée', pax: 'Participants', n: 'Nombre de participants', one: 'Participant', height: true };
    return { dateLegend: 'Dates souhaitées', d1: 'Date souhaitée', pax: 'Participants', n: 'Nombre de participants', one: 'Participant', height: false };
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
    if (aside) aside.classList.toggle('is-gift', mode === 'gift');
    if (giftForm) giftForm.hidden = mode !== 'gift';
    form.hidden = mode === 'gift';
    offers.forEach((o) => {
      const on = o === li;
      o.classList.toggle('selected', on);
      const bBook = $('.choose', o);
      if (bBook instanceof HTMLButtonElement) {
        const active = on && mode === 'book';
        bBook.setAttribute('aria-pressed', String(active));
        bBook.textContent = active ? 'Formule sélectionnée' : 'Réserver';
      }
      const bGift = $('.choose-gift', o);
      if (bGift instanceof HTMLButtonElement) {
        const active = on && mode === 'gift';
        bGift.setAttribute('aria-pressed', String(active));
        bGift.textContent = active ? 'Offre sélectionnée' : '🎁 Offrir';
      }
    });
    showInfo(li); setContactKind(li.dataset.kind);
    if (open) window.rpTrack?.(mode === 'gift' ? 'click_voucher' : 'select_offer', { school_id: form.dataset.schoolId, offer_id: li.dataset.id, offer_name: li.dataset.name, kind: li.dataset.kind, mode });
    if (mode === 'gift' && giftChosen) {
      giftChosen.innerHTML = `<p style="margin:0"><strong>Bon cadeau · ${li.dataset.name}</strong><br><span class="muted small">${li.dataset.priceLabel}</span></p>`;
    } else {
      openBooking(li);
    }
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

  function syncKindUI(kind) {
    const k = kind || only || visibleKind() || 'bapteme';
    const isStage = k === 'stage';
    const w = kindWords(k);
    setContactKind(k);
    if (step1Weight) step1Weight.hidden = isStage;
    if (step1Stage) step1Stage.hidden = !isStage;
    if (alts) alts.hidden = isStage;
    const dl = $('#date-legend'); if (dl) dl.textContent = w.dateLegend;
    const d1l = $('#d1-label'); if (d1l) d1l.textContent = w.d1;
    const pl = $('#pax-legend'); if (pl) pl.textContent = w.pax;
    const nl = $('#n-label'); if (nl) nl.textContent = w.n;
    queueMicrotask(() => typeof drawRows === 'function' && drawRows());
  }

  onKindChange = (kind) => {
    if (sel && sel.dataset.kind !== kind) {
      offers.forEach((o) => {
        o.classList.remove('selected');
        const bBook = $('.choose', o);
        if (bBook instanceof HTMLButtonElement) { bBook.setAttribute('aria-pressed', 'false'); bBook.textContent = 'Réserver'; }
        const bGift = $('.choose-gift', o);
        if (bGift instanceof HTMLButtonElement) { bGift.setAttribute('aria-pressed', 'false'); bGift.textContent = '🎁 Offrir'; }
      });
      sel = null;
      if (chosen) chosen.innerHTML = '<p class="muted" style="margin:0">Choisissez une formule dans la liste pour ouvrir les détails et le contact de l’école.</p>';
      if (chips) { chips.innerHTML = ''; chips.hidden = true; }
      if (hint) hint.hidden = true;
    }
    syncKindUI(kind);
  };

  function openBooking(li) {
    syncKindUI(li.dataset.kind);
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
  const kindNow = () => (sel ? sel.dataset.kind : (only || visibleKind() || 'bapteme'));
  const drawRows = () => {
    if (!rows) return;
    const w = kindWords(kindNow()), count = Number(n.value) || 1;
    const old = $$('.pax', rows).map((r) => ({ name: $('[data-f=name]', r).value, weight: $('[data-f=weight]', r).value, height: $('[data-f=height]', r)?.value || '' }));
    rows.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const r = document.createElement('fieldset'); r.className = 'pax';
      r.innerHTML = `<legend></legend>
        <div class="field"><label>Prénom (facultatif)</label><input data-f="name" type="text" maxlength="80" autocomplete="off" /></div>
        <div class="field"><label>${w.height ? 'Poids approx. (kg)' : 'Poids (kg)'}</label><input data-f="weight" type="number" inputmode="numeric" min="15" max="200" step="1" /></div>
        ${w.height ? '<div class="field"><label>Taille (cm)</label><input data-f="height" type="number" inputmode="numeric" min="100" max="230" step="1" /></div>' : ''}`;
      $('legend', r).textContent = `${w.one} ${i + 1}`;
      const prev = old[i]; if (prev) { $('[data-f=name]', r).value = prev.name; $('[data-f=weight]', r).value = prev.weight; const h = $('[data-f=height]', r); if (h) h.value = prev.height; }
      rows.appendChild(r);
    }
  };
  n.addEventListener('change', drawRows);
  syncKindUI(visibleKind());
  drawRows();
  const participants = () => $$('.pax', rows).map((r) => ({
    name: $('[data-f=name]', r).value.trim(), weight: Math.round(Number($('[data-f=weight]', r).value)),
    ...($('[data-f=height]', r) ? { height: Math.round(Number($('[data-f=height]', r).value)) } : {}),
  }));
  const participantErrors = () => {
    const errs = [];
    participants().forEach((p, i) => {
      if (!(Number.isFinite(p.weight) && p.weight >= 15 && p.weight <= 200)) errs.push(`Indiquez le poids (15 à 200 kg) du participant ${i + 1}.`);
      if ('height' in p && !(Number.isFinite(p.height) && p.height >= 100 && p.height <= 230)) errs.push(`Indiquez la taille (100 à 230 cm) du participant ${i + 1}.`);
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
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date) && (!d1.min || date >= d1.min)) {
      d1.value = date;
    }
  }

  // Two steps: 1 = who and when (short), 2 = participants, consent. Step 1 is validated before step 2 opens.
  const step1 = $('#step-1'), step2 = $('#step-2'), s1msg = $('#step1-msg'), fs1 = $('#fs-1'), fs2 = $('#fs-2');
  const v = (id) => ($(id)?.value || '').trim();
  const isStageNow = () => kindNow() === 'stage';
  const step1Errors = () => {
    const errs = [];
    if (!sel) errs.push('Choisissez une formule dans la liste (bouton « Réserver » ou « Offrir »).');
    if (!v('#b-first')) errs.push('Indiquez votre prénom.');
    if (!v('#b-last')) errs.push('Indiquez votre nom.');
    if (!okEmail(v('#b-email'))) errs.push('Indiquez un email valide.');
    if (v('#b-phone').replace(/\D/g, '').length < 8) errs.push('Indiquez un numéro de téléphone.');
    if (isStageNow()) {
      const sw = Math.round(Number(v('#b-stage-weight')));
      const sh = Math.round(Number(v('#b-stage-height')));
      if (!v('#b-stage-weight') || !Number.isFinite(sw) || sw < 15 || sw > 200) errs.push('Indiquez votre poids approximatif (de 15 à 200 kg).');
      if (!v('#b-stage-height') || !Number.isFinite(sh) || sh < 100 || sh > 230) errs.push('Indiquez votre taille en cm (de 100 à 230 cm, ex. 175).');
      if (d1.value && d1.value < d1.min) errs.push('Choisissez une date à venir.');
    } else {
      const w = Math.round(Number(v('#b-weight')));
      if (!v('#b-weight') || !Number.isFinite(w) || w < 15 || w > 200) errs.push('Indiquez le poids du passager volant (de 15 à 200 kg).');
      if ([d1, d2, d3].some((d) => d.value && d.value < d.min)) errs.push('Choisissez une date à venir.');
      const dates = [d1.value, d2.value, d3.value].filter(Boolean);
      if (new Set(dates).size !== dates.length) errs.push('Les dates doivent être différentes.');
    }
    return errs;
  };
  const gotoStep = (k) => {
    step1.hidden = k !== 1; step2.hidden = k !== 2;
    fs1.toggleAttribute('aria-current', k === 1); fs2.toggleAttribute('aria-current', k === 2);
    if (k === 1) fs1.setAttribute('aria-current', 'step'); else fs2.setAttribute('aria-current', 'step');
    fs1.classList.toggle('done', k === 2);
    if (k === 2) {
      drawRows();
      const firstPax = $('.pax', rows);
      if (firstPax) {
        const firstPaxN = $('[data-f=name]', firstPax);
        if (firstPaxN && !firstPaxN.value && v('#b-first')) firstPaxN.value = v('#b-first');
        const firstPaxW = $('[data-f=weight]', firstPax);
        const firstPaxH = $('[data-f=height]', firstPax);
        if (isStageNow()) {
          if (firstPaxW && bStageWeight?.value) firstPaxW.value = String(Math.round(Number(bStageWeight.value)));
          if (firstPaxH && bStageHeight?.value) firstPaxH.value = String(Math.round(Number(bStageHeight.value)));
        } else if (firstPaxW && bWeight?.value) {
          firstPaxW.value = String(Math.round(Number(bWeight.value)));
        }
      }
    }
    aside?.scrollTo?.({ top: 0 });
    if (!phone()) { const r = aside.getBoundingClientRect(); if (r.top < 0) aside.scrollIntoView({ block: 'start' }); }
    (k === 2 ? n : $('#b-first'))?.focus({ preventScroll: true });
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
  const readConsents = (targetForm) => {
    const grp = $('[data-consent-group]', targetForm);
    const box1 = $('[data-consent-box="1"]', targetForm);
    const box2 = $('[data-consent-box="2"]', targetForm);
    return {
      cgv: Boolean(box1?.checked),
      partners: Boolean(box2?.checked),
      version: grp?.dataset.consentVersion || '',
      market: grp?.dataset.consentMarket || 'fr',
      language: grp?.dataset.consentLang || 'fr',
    };
  };
  const bindConsentToggle = (targetForm, btn) => {
    const box1 = $('[data-consent-box="1"]', targetForm);
    const errEl = $('.consent-err', targetForm);
    if (!box1 || !btn) return;
    const sync = () => {
      btn.disabled = !box1.checked;
      if (errEl) errEl.hidden = box1.checked;
    };
    box1.addEventListener('change', sync);
    sync();
  };
  if (canSend) bindConsentToggle(form, button);
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
    const fullName = `${v('#b-first')} ${v('#b-last')}`.trim();
    const consents = readConsents(form);
    const payload = {
      schoolId: form.dataset.schoolId, offerId: sel.dataset.id,
      bookingMode: 'book',
      contact: { firstName: v('#b-first'), lastName: v('#b-last'), name: fullName, email: v('#b-email'), phone: v('#b-phone'), type: v('#b-ctype') },
      weightKg: isStageNow() ? Math.round(Number(v('#b-stage-weight'))) : Math.round(Number(v('#b-weight'))),
      heightCm: isStageNow() ? Math.round(Number(v('#b-stage-height'))) : undefined,
      dates: (isStageNow() ? [d1.value] : [d1.value, d2.value, d3.value]).filter(Boolean), participantCount: Number(n.value), participants: participants(),
      message: v('#b-msg'), consent: true, consents, marketingOptIn: consents.partners, website: v('#b-website'),
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

  if (giftForm) {
    let giftPending = false;
    let giftAttempt;
    const giftBtn = $('button[type=submit]', giftForm);
    bindConsentToggle(giftForm, giftBtn);
    giftForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (giftPending || !sel) return;
      const errs = [];
      if (!v('#g-first')) errs.push('Indiquez votre prénom.');
      if (!v('#g-last')) errs.push('Indiquez votre nom.');
      if (!okEmail(v('#g-email'))) errs.push('Indiquez votre email.');
      if (v('#g-phone').replace(/\D/g, '').length < 8) errs.push('Indiquez votre numéro de téléphone.');
      if (!v('#gp-first')) errs.push('Indiquez le prénom du passager.');
      if (!v('#gp-last')) errs.push('Indiquez le nom du passager.');
      if (!okEmail(v('#gp-email'))) errs.push('Indiquez l’email du passager.');
      if (v('#gp-phone').replace(/\D/g, '').length < 8) errs.push('Indiquez le téléphone du passager.');
      const pw = Number(v('#gp-weight'));
      if (!Number.isInteger(pw) || pw < 15 || pw > 200) errs.push('Indiquez le poids du passager (15 à 200 kg).');
      if (!$('#g-consent')?.checked) errs.push('Autorisez la transmission de votre demande à l’école.');
      if (errs.length) {
        giftMsg.className = 'small error';
        giftMsg.innerHTML = '<strong>À corriger :</strong><ul>' + errs.map((x) => `<li>${x}</li>`).join('') + '</ul>';
        giftMsg.focus();
        return;
      }
      const consents = readConsents(giftForm);
      const payload = {
        schoolId: giftForm.dataset.schoolId,
        offerId: sel.dataset.id,
        offerName: sel.dataset.name,
        offerKind: sel.dataset.kind,
        offerPriceLabel: sel.dataset.priceLabel,
        giver: { firstName: v('#g-first'), lastName: v('#g-last'), email: v('#g-email'), phone: v('#g-phone') },
        passenger: { firstName: v('#gp-first'), lastName: v('#gp-last'), email: v('#gp-email'), phone: v('#gp-phone'), weightKg: pw, approxFlightMonth: v('#gp-month') },
        message: v('#gp-msg'),
        consent: true,
        consents,
        marketingOptIn: consents.partners,
        website: v('#g-website'),
      };
      const signature = JSON.stringify(payload);
      if (giftAttempt?.signature !== signature) giftAttempt = { signature, id: crypto.randomUUID(), sent: false };
      if (giftAttempt.sent) return;
      giftPending = true;
      giftBtn.disabled = true;
      giftMsg.className = 'small';
      giftMsg.textContent = 'Envoi en cours…';
      try {
        const result = await fetch(giftForm.dataset.endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, requestId: giftAttempt.id }), signal: AbortSignal.timeout(12000),
        });
        const outcome = await result.json().catch(() => ({}));
        if (!result.ok || !outcome.ok || outcome.reference !== giftAttempt.id) {
          throw new Error(outcome.error || 'Envoi indisponible. Réessayez ou contactez directement l’école.');
        }
        giftAttempt.sent = true;
        const next = `/merci/cadeau/?${new URLSearchParams({
          ref: giftAttempt.id,
          ecole: giftForm.dataset.school || '',
          slug: giftForm.dataset.schoolSlug || '',
          school_id: giftForm.dataset.schoolId || '',
          offer: sel.dataset.name || '',
          offer_id: sel.dataset.id || '',
          price: sel.dataset.priceLabel || '',
          route: outcome.route || 'school',
          ...(outcome.test ? { test: '1' } : {}),
        })}`;
        location.assign(next);
      } catch (err) {
        giftMsg.className = 'small error';
        giftMsg.textContent = err.name === 'TimeoutError' || err instanceof TypeError
          ? 'Envoi non confirmé. Réessayez ou contactez directement l’école.' : err.message;
      } finally {
        giftPending = false;
        giftBtn.disabled = false;
        giftMsg.focus();
      }
    });
  }
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
