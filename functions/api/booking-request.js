import directory from '../../server/booking-directory.json' with { type: 'json' };

// Booking request: validates, STORES the contact (D1 table `demandes` + `participants`, see server/schema-contacts.sql), then emails the school.
// Required settings: RESEND_API_KEY, BOOKING_FROM, CONTACTS_DB (D1 binding). Optional: BOOKING_TEAM_TO (copy of every request to the team),
// BOOKING_TEST_TO (all emails go to this address instead of the school), BOOKING_RATE_LIMIT (rate-limit binding).
const respond = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const text = (v, max) => typeof v === 'string' && v.trim().length <= max ? v.trim() : '';
const iso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const CONSENT_TEXT = 'J’accepte la transmission de ma demande à {école} pour qu’elle me réponde.';
const OPTIN_TEXT = 'Je souhaite recevoir par email les conseils et offres de MonParapente.fr (facultatif).';

export async function onRequestPost({ request, env }) {
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
    if (!success) return respond(429, { error: 'Trop de demandes. Réessayez dans quelques minutes.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM || !env.CONTACTS_DB) return respond(503, { error: 'Envoi indisponible. Contactez directement l’école.' });
  if (request.headers.get('origin') !== new URL(request.url).origin) return respond(403, { error: 'Origine non autorisée.' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return respond(415, { error: 'Format invalide.' });
  let data;
  try {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let size = 0, raw = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); return respond(413, { error: 'Demande trop longue.' }); }
      raw += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(raw + decoder.decode());
  } catch { return respond(400, { error: 'Demande illisible.' }); }
  if (!data || typeof data !== 'object') return respond(400, { error: 'Demande invalide.' });
  const school = Object.hasOwn(directory, data.schoolId) ? directory[data.schoolId] : null;
  const offer = school && Object.hasOwn(school.offers, data.offerId) ? school.offers[data.offerId] : null;
  const name = text(data.contact?.name, 120), email = text(data.contact?.email, 254);
  const phone = text(data.contact?.phone, 35), note = text(data.message, 800);
  const count = data.participantCount;
  const today = new Date().toISOString().slice(0, 10);
  const dates = data.dates;
  if (!offer || !name || !emailPattern.test(email) || (phone && phone.replace(/\D/g, '').length < 8) ||
      (data.message && !note) || data.consent !== true || data.website ||
      !Array.isArray(dates) || dates.length > 3 || new Set(dates).size !== dates.length ||
      dates.some((v) => !iso(v) || v < today) || !Number.isInteger(count) || count < 1 || count > 8 ||
      !/^[a-f0-9-]{36}$/i.test(data.requestId || '')) {
    return respond(400, { error: 'Vérifiez les informations de votre demande.' });
  }
  if (text(data.contact?.phone, 35) !== String(data.contact?.phone ?? '').trim()) return respond(400, { error: 'Téléphone invalide.' });

  const [kind, offerName] = offer;
  const isStage = kind === 'stage';
  // Participants: one entry per person, weight always, height for a course. The contact type comes from the formula, never from the browser.
  const people = Array.isArray(data.participants) ? data.participants : [];
  if (people.length !== count || people.some((p) => !p || typeof p !== 'object' ||
      !(Number.isInteger(p.weight) && p.weight >= 15 && p.weight <= 200) ||
      (p.name && text(p.name, 80) !== String(p.name).trim()) ||
      (isStage && !(Number.isInteger(p.height) && p.height >= 100 && p.height <= 230)))) {
    return respond(400, { error: 'Vérifiez le poids (et la taille pour un stage) de chaque participant.' });
  }
  const contactType = isStage ? 'student' : 'bapteme-passenger';
  const optin = data.marketingOptIn === true ? 1 : 0;

  // 1. Store first: the contact is kept even if the email fails. Same requestId = same row (a retry never duplicates).
  const now = new Date().toISOString();
  const db = env.CONTACTS_DB;
  let status = 'enregistree';
  try {
    const existing = await db.prepare('SELECT statut FROM demandes WHERE request_id = ?').bind(data.requestId).first();
    if (existing?.statut === 'envoyee') return respond(200, { ok: true, test: Boolean(env.BOOKING_TEST_TO), reference: data.requestId });
    if (!existing) {
      const batch = [db.prepare(`INSERT INTO demandes (request_id, created_at, type_contact, ecole_id, ecole, offre_id, offre, nom, email, telephone, dates_souhaitees,
          nb_participants, message, consentement_ecole, texte_consentement, optin_monparapente, page_source, statut)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'enregistree')`).bind(
        data.requestId, now, contactType, data.schoolId, school.name, data.offerId, offerName, name, email, phone || null, dates.join(','),
        count, note || null, CONSENT_TEXT.replace('{école}', school.name), optin, text(request.headers.get('referer'), 300) || null)];
      people.forEach((p, i) => batch.push(db.prepare('INSERT INTO participants (request_id, rang, prenom, poids_kg, taille_cm) VALUES (?, ?, ?, ?, ?)')
        .bind(data.requestId, i + 1, text(p.name, 80) || null, p.weight, isStage ? p.height : null)));
      await db.batch(batch);
    }
  } catch { return respond(500, { error: 'Enregistrement impossible. Réessayez dans un instant.' }); }

  // 2. Email the school (copy to the team).
  const recipient = env.BOOKING_TEST_TO || school.email;
  const lines = [
    `Demande de ${isStage ? 'stage' : 'baptême'} pour ${school.name}`,
    `Formule : ${offerName}`,
    `Dates souhaitées : ${dates.join(', ') || 'flexibles, à définir avec l’école'}`,
    `Participants : ${count}`,
    ...people.map((p, i) => `  ${i + 1}. ${text(p.name, 80) || 'prénom non indiqué'} · ${p.weight} kg${isStage ? ` · ${p.height} cm` : ''}`),
    `Contact : ${name} · ${email}${phone ? ' · ' + phone : ''}`,
    note && `Message : ${note}`,
    'Répondez directement au demandeur pour confirmer les conditions et les disponibilités.',
  ].filter(Boolean);
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `booking-${data.requestId}` },
      body: JSON.stringify({ from: env.BOOKING_FROM, to: [recipient], ...(env.BOOKING_TEAM_TO && !env.BOOKING_TEST_TO ? { bcc: [env.BOOKING_TEAM_TO] } : {}),
        reply_to: email, subject: `Demande Resa Parapente · ${school.name}`, text: lines.join('\n') }),
      signal: AbortSignal.timeout(8000),
    });
    status = result.ok ? 'envoyee' : 'echec_email';
  } catch { status = 'echec_email'; }
  try { await db.prepare('UPDATE demandes SET statut = ?, envoye_le = ? WHERE request_id = ?').bind(status, status === 'envoyee' ? new Date().toISOString() : null, data.requestId).run(); } catch { /* the row exists already */ }
  if (status !== 'envoyee') return respond(502, { error: 'Envoi indisponible. Réessayez ou contactez l’école.' });
  return respond(200, { ok: true, test: Boolean(env.BOOKING_TEST_TO), reference: data.requestId });
}
