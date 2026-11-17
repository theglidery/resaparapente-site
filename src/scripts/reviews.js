// Review form on the school page. Validation in the browser; the server (docs/AVIS-ET-NOTES.md) validates again,
// refuses bots, sends the team the review to moderate and emails the visitor. Nothing is published without review.
const $ = (s, r = document) => r.querySelector(s);
const form = $('#review-form');
if (form) {
  const msg = $('#review-msg'), box = $('#review-box');
  const params = new URLSearchParams(location.search);
  // A link in the email sent after the flight carries ?avis=<signed token>: the review is then tied to a real request.
  const token = params.get('avis');
  if (token) { $('#r-token').value = token; $('#r-verified').hidden = false; box.open = true; if (location.hash !== '#avis') box.scrollIntoView({ block: 'start' }); }
  if (location.hash === '#donner-mon-avis') box.open = true;
  const okEmail = (x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x);
  const v = (id) => $(id).value.trim();
  let pending = false;
  const button = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pending) return;
    const errs = [];
    const rating = Number((form.querySelector('input[name=rating]:checked') || {}).value || 0);
    const min = Number(form.dataset.min) || 40;
    if (!rating) errs.push('Choisissez une note de 1 à 5.');
    if (!v('#r-kind')) errs.push('Indiquez si vous avez fait un baptême ou un stage.');
    if (!v('#r-month')) errs.push('Indiquez le mois de votre expérience.');
    if (v('#r-text').length < min) errs.push(`Écrivez votre avis (au moins ${min} caractères).`);
    if (/(\+?\d[\s.-]?){9,}|@|https?:\/\//i.test(v('#r-text'))) errs.push('Retirez les numéros de téléphone, adresses email et liens de votre texte.');
    if (!v('#r-name')) errs.push('Indiquez votre prénom.');
    if (!v('#r-last')) errs.push('Indiquez votre nom (seule l’initiale sera affichée).');
    if (!okEmail(v('#r-email'))) errs.push('Indiquez un email valide (il n’est pas publié).');
    if (!$('#r-honest').checked) errs.push('Confirmez que l’avis décrit votre propre expérience, sans contrepartie.');
    if (!$('#r-consent').checked) errs.push('Cochez la case pour autoriser la publication.');
    msg.className = 'small';
    if (form.elements.website.value) return; // honeypot: a bot filled the hidden field
    if (errs.length) { msg.innerHTML = '<strong>À corriger :</strong><ul>' + errs.map((x) => `<li>${x}</li>`).join('') + '</ul>'; msg.classList.add('error'); msg.focus(); return; }
    const payload = {
      schoolId: form.dataset.schoolId, token: token || null, rating, kind: v('#r-kind'), experienceMonth: v('#r-month'),
      title: v('#r-title') || null, text: v('#r-text'), author: { first: v('#r-name'), last: v('#r-last'), email: v('#r-email') },
      honest: true, consent: true, website: form.elements.website.value,
    };
    pending = true;
    if (button) button.disabled = true;
    msg.textContent = 'Envoi en cours…';
    try {
      const res = await fetch(form.dataset.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(12000),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'Envoi indisponible. Réessayez dans un instant.');
      window.rpTrack?.('submit_review', { school_id: payload.schoolId, rating, verified: out.verification === 'Demande vérifiée' });
      msg.classList.add('ok');
      msg.innerHTML = `<strong>Avis envoyé (${rating}/5 pour ${form.dataset.school}).</strong><br>Vous allez recevoir un email de confirmation ; votre avis sera relu par une personne avant publication, sous 7 jours.`;
      form.reset();
    } catch (err) {
      msg.classList.add('error');
      msg.textContent = err.name === 'TimeoutError' || err instanceof TypeError
        ? 'Envoi non confirmé. Réessayez dans un instant.' : err.message;
    } finally {
      pending = false;
      if (button) button.disabled = false;
      msg.focus();
    }
  });
}
