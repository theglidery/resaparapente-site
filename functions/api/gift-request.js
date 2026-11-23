// Gift request: validates giver + passenger details + consents, stores in D1 (`cadeaux`),
// and relays to the school (or contact@locawing.fr for route: team). ResaParapente sells nothing and takes no payment.
// Needs RESEND_API_KEY, BOOKING_FROM, and CONTACTS_DB. GIFT_TEST_TO redirects every message to a test mailbox.
import directory from '../../server/gift-directory.json';
import { validateConsents } from '../_lib/consents.js';

const respond = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const text = (v, max) => (typeof v === 'string' && v.trim().length <= max ? v.trim() : '');
const TEAM_EMAIL = 'contact@locawing.fr';

export async function onRequestPost({ request, env }) {
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: 'gift-' + (request.headers.get('CF-Connecting-IP') || 'unknown') });
    if (!success) return respond(429, { error: 'Trop de demandes.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM || !env.CONTACTS_DB) {
    return respond(503, { error: 'Envoi indisponible.' });
  }
  if (request.headers.get('origin') !== new URL(request.url).origin) return respond(403, { error: 'Origine non autorisée.' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return respond(415, { error: 'Format invalide.' });

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 16384) return respond(413, { error: 'Demande trop longue.' });
    data = JSON.parse(raw);
  } catch {
    return respond(400, { error: 'Demande illisible.' });
  }
  if (!data || typeof data !== 'object') return respond(400, { error: 'Demande invalide.' });

  const school = Object.hasOwn(directory, data.schoolId) ? directory[data.schoolId] : null;
  const gFirst = text(data.giver?.firstName, 60);
  const gLast = text(data.giver?.lastName, 60);
  const gEmail = text(data.giver?.email, 254);
  const gPhone = text(data.giver?.phone, 35);

  const pFirst = text(data.passenger?.firstName, 60);
  const pLast = text(data.passenger?.lastName, 60);
  const pEmail = text(data.passenger?.email, 254);
  const pPhone = text(data.passenger?.phone, 35);
  const pWeight = data.passenger?.weightKg;
  const approxMonth = text(data.passenger?.approxFlightMonth, 60);

  const offerId = text(data.offerId, 40);
  const offerName = text(data.offerName, 160);
  const offerKind = text(data.offerKind, 20) || 'bapteme';
  const offerPriceLabel = text(data.offerPriceLabel, 60);
  const note = text(data.message, 800);

  if (
    !school ||
    !gFirst || !gLast || !emailPattern.test(gEmail) || gPhone.replace(/\D/g, '').length < 8 ||
    !pFirst || !pLast || !emailPattern.test(pEmail) || pPhone.replace(/\D/g, '').length < 8 ||
    !(Number.isInteger(pWeight) && pWeight >= 15 && pWeight <= 200) ||
    !offerId || !offerName || data.website ||
    !/^[a-f0-9-]{36}$/i.test(data.requestId || '')
  ) {
    return respond(400, { error: 'Vérifiez les informations de votre demande.' });
  }

  const consentCheck = validateConsents(data.consents, school.name, data.consent, data.marketingOptIn);
  if (!consentCheck.ok) {
    return respond(400, { error: consentCheck.error });
  }

  const route = school.route === 'team' ? 'team' : 'school';
  const now = new Date().toISOString();
  const db = env.CONTACTS_DB;

  // 1. Store first in `cadeaux` (idempotent on request_id).
  try {
    const existing = await db.prepare('SELECT statut FROM cadeaux WHERE request_id = ?').bind(data.requestId).first();
    if (existing && existing.statut === 'envoyee') {
      return respond(200, { ok: true, route, test: Boolean(env.GIFT_TEST_TO), reference: data.requestId });
    }
    if (!existing) {
      await db
        .prepare(
          `INSERT INTO cadeaux (
            request_id, created_at, route, ecole_id, ecole, pays_ecole, offre_id, offre, offre_type, prix_affiche,
            donateur_prenom, donateur_nom, donateur_email, donateur_telephone,
            passager_prenom, passager_nom, passager_email, passager_telephone, passager_poids_kg, vol_souhaite_mois, message,
            cgv_accepte, consent_tiers, consent_version, consent_marche, consent_langue, consent_texte_1, consent_texte_2, consent_at,
            page_source, statut
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, 'enregistree')`
        )
        .bind(
          data.requestId,
          now,
          route,
          data.schoolId,
          school.name,
          school.country || null,
          offerId,
          offerName,
          offerKind,
          offerPriceLabel || null,
          gFirst,
          gLast,
          gEmail,
          gPhone,
          pFirst,
          pLast,
          pEmail,
          pPhone,
          pWeight,
          approxMonth || null,
          note || null,
          consentCheck.partners,
          consentCheck.version,
          consentCheck.market,
          consentCheck.language,
          consentCheck.text1,
          consentCheck.text2,
          now,
          text(request.headers.get('referer'), 300) || null
        )
        .run();
    }
  } catch {
    return respond(500, { error: 'Enregistrement impossible. Réessayez dans un instant.' });
  }

  // 2. Send email to school (or team route).
  const to = env.GIFT_TEST_TO || (route === 'team' ? TEAM_EMAIL : school.email);
  const bcc = route === 'school' && env.BOOKING_TEAM_TO && !env.GIFT_TEST_TO ? [env.BOOKING_TEAM_TO] : undefined;

  const lines = [
    ...(route === 'team'
      ? [
          '[À TRANSMETTRE À L’ÉCOLE]',
          `École : ${school.name}${school.country ? ` (${school.country})` : ''}`,
          `Consentement partenaires (case 2) : ${consentCheck.partners ? 'Oui' : 'Non'}`,
          '',
        ]
      : []),
    `Demande de bon cadeau pour ${school.name}`,
    `Référence : ${data.requestId}`,
    `Formule : ${offerName}${offerPriceLabel ? ` (${offerPriceLabel})` : ''}`,
    '',
    `Offreur (payeur) : ${gFirst} ${gLast} · ${gEmail} · ${gPhone}`,
    `Passager : ${pFirst} ${pLast} · ${pEmail} · ${pPhone} · ${pWeight} kg`,
    approxMonth && `Date de vol souhaitée (approximative) : ${approxMonth}`,
    note && `Message pour le passager : ${note}`,
    '',
    route === 'team'
      ? 'L’école n’a pas été contactée directement. Merci de lui transmettre cette demande manuellement.'
      : 'Cette personne souhaite offrir un vol via ResaParapente. Répondez-lui directement pour lui envoyer le bon cadeau et organiser le paiement. ResaParapente n’encaisse aucun paiement.',
  ].filter((l) => l === '' || Boolean(l));

  let sentOk = false;
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `gift-${data.requestId}`,
      },
      body: JSON.stringify({
        from: env.BOOKING_FROM,
        to: [to],
        ...(bcc ? { bcc } : {}),
        reply_to: gEmail,
        subject: `${route === 'team' ? '[À TRANSMETTRE] ' : ''}Demande de bon cadeau · ${school.name}`,
        text: lines.join('\n'),
      }),
      signal: AbortSignal.timeout(8000),
    });
    sentOk = result.ok;
  } catch {
    sentOk = false;
  }

  try {
    await db
      .prepare('UPDATE cadeaux SET statut = ?, envoye_le = ? WHERE request_id = ?')
      .bind(sentOk ? 'envoyee' : 'echec_email', sentOk ? new Date().toISOString() : null, data.requestId)
      .run();
  } catch {}

  if (!sentOk) return respond(502, { error: 'Envoi indisponible.' });
  return respond(200, { ok: true, route, test: Boolean(env.GIFT_TEST_TO), reference: data.requestId });
}
