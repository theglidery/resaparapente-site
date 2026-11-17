import directory from '../../server/booking-directory.json';
import {
  respond,
  emailPattern,
  text,
  isoDate,
  escHtml,
  readJsonBody,
  verifyTurnstile,
  sendEmail,
  signActionToken,
} from '../_lib/common.js';

// Booking request: validates, STORES the contact (D1 table `demandes` + `participants`, see server/schema-contacts.sql),
// generates a review_token + signed school action links, emails the school and sends a receipt to the visitor.
// Required settings: RESEND_API_KEY, BOOKING_FROM, CONTACTS_DB (D1 binding).
// Optional: ACTION_SECRET (falls back to EXPORT_TOKEN for HMAC signing), BOOKING_TEAM_TO, BOOKING_TEST_TO,
// BOOKING_RATE_LIMIT, TURNSTILE_SECRET_KEY.
const CONSENT_TEXT = 'J’accepte la transmission de ma demande à {école} pour qu’elle me réponde.';
const ACTION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: ip });
    if (!success) return respond(429, { error: 'Trop de demandes. Réessayez dans quelques minutes.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM || !env.CONTACTS_DB) {
    return respond(503, { error: 'Envoi indisponible. Contactez directement l’école.' });
  }

  const parsed = await readJsonBody(request, 16384);
  if (parsed.error) return parsed.error;
  const data = parsed.data;

  const school = Object.hasOwn(directory, data.schoolId) ? directory[data.schoolId] : null;
  const offer = school && Object.hasOwn(school.offers, data.offerId) ? school.offers[data.offerId] : null;
  const name = text(data.contact?.name, 120);
  const email = text(data.contact?.email, 254);
  const phone = text(data.contact?.phone, 35);
  const note = text(data.message, 800);
  const isGift = data.bookingMode === 'gift';
  const giftName = isGift ? text(data.giftRecipient?.name, 120) : '';
  const giftEmail = isGift ? text(data.giftRecipient?.email, 254) : '';
  const giftNote = isGift ? text(data.giftRecipient?.note, 200) : '';
  const count = data.participantCount;
  const today = new Date().toISOString().slice(0, 10);
  const dates = data.dates;

  if (
    !offer || !name || !emailPattern.test(email) || (phone && phone.replace(/\D/g, '').length < 8) ||
    (isGift && (!giftName || (giftEmail && !emailPattern.test(giftEmail)))) ||
    (data.message && !note) || data.consent !== true || data.website ||
    !Array.isArray(dates) || dates.length > 3 || new Set(dates).size !== dates.length ||
    dates.some((v) => !isoDate(v) || v < today) || !Number.isInteger(count) || count < 1 || count > 8 ||
    !/^[a-f0-9-]{36}$/i.test(data.requestId || '')
  ) {
    return respond(400, { error: 'Vérifiez les informations de votre demande.' });
  }
  const storedNote = isGift
    ? [`[CADEAU POUR : ${giftName}${giftEmail ? ' · ' + giftEmail : ''}${giftNote ? ' · ' + giftNote : ''}]`, note].filter(Boolean).join('\n')
    : note;
  if (text(data.contact?.phone, 35) !== String(data.contact?.phone ?? '').trim()) {
    return respond(400, { error: 'Téléphone invalide.' });
  }
  if (!(await verifyTurnstile(env, data.turnstileToken, ip))) {
    return respond(400, { error: 'Vérification anti-robot refusée.' });
  }

  const [kind, offerName] = offer;
  const isStage = kind === 'stage';
  const people = Array.isArray(data.participants) ? data.participants : [];
  if (
    people.length !== count ||
    people.some(
      (p) =>
        !p || typeof p !== 'object' ||
        !(Number.isInteger(p.weight) && p.weight >= 15 && p.weight <= 200) ||
        (p.name && text(p.name, 80) !== String(p.name).trim()) ||
        (isStage && !(Number.isInteger(p.height) && p.height >= 100 && p.height <= 230))
    )
  ) {
    return respond(400, { error: 'Vérifiez le poids (et la taille pour un stage) de chaque participant.' });
  }

  const contactType = isStage ? 'student' : 'bapteme-passenger';
  const optin = data.marketingOptIn === true ? 1 : 0;
  const now = new Date().toISOString();
  const db = env.CONTACTS_DB;
  const reviewToken = crypto.randomUUID().replace(/-/g, '');

  // 1. Store first: keep contact even if email fails; same requestId never duplicates.
  try {
    const existing = await db
      .prepare('SELECT statut FROM demandes WHERE request_id = ?')
      .bind(data.requestId)
      .first();
    if (existing && ['envoyee', 'acceptee', 'autre_date', 'refusee'].includes(existing.statut)) {
      return respond(200, { ok: true, test: Boolean(env.BOOKING_TEST_TO), reference: data.requestId });
    }
    if (!existing) {
      const batch = [
        db
          .prepare(
            `INSERT INTO demandes (request_id, created_at, type_contact, ecole_id, ecole, offre_id, offre, nom, email, telephone, dates_souhaitees,
              nb_participants, message, consentement_ecole, texte_consentement, optin_monparapente, page_source, statut, review_token)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'enregistree', ?)`
          )
          .bind(
            data.requestId,
            now,
            contactType,
            data.schoolId,
            school.name,
            data.offerId,
            offerName,
            name,
            email,
            phone || null,
            dates.join(','),
            count,
            storedNote || null,
            CONSENT_TEXT.replace('{école}', school.name),
            optin,
            text(request.headers.get('referer'), 300) || null,
            reviewToken
          ),
      ];
      people.forEach((p, i) =>
        batch.push(
          db
            .prepare('INSERT INTO participants (request_id, rang, prenom, poids_kg, taille_cm) VALUES (?, ?, ?, ?, ?)')
            .bind(data.requestId, i + 1, text(p.name, 80) || null, p.weight, isStage ? p.height : null)
        )
      );
      await db.batch(batch);
    }
  } catch {
    return respond(500, { error: 'Enregistrement impossible. Réessayez dans un instant.' });
  }

  // 2. Build signed school action links (if ACTION_SECRET or EXPORT_TOKEN is configured).
  const origin = new URL(request.url).origin;
  const secret = env.ACTION_SECRET || env.EXPORT_TOKEN || '';
  let actionLinks = null;
  if (secret) {
    const exp = Date.now() + ACTION_TTL_MS;
    const mk = async (action) =>
      `${origin}/api/booking-action?token=${encodeURIComponent(
        await signActionToken(secret, { rid: data.requestId, action, exp })
      )}`;
    actionLinks = {
      accept: await mk('accept'),
      propose: await mk('propose'),
      decline: await mk('decline'),
    };
  }

  // 3. Email the school (with BCC to team if configured and not in test mode).
  const recipient = env.BOOKING_TEST_TO || school.email;
  const paxLines = people.map(
    (p, i) => `  ${i + 1}. ${text(p.name, 80) || 'prénom non indiqué'} · ${p.weight} kg${isStage ? ` · ${p.height} cm` : ''}`
  );
  const lines = [
    `Demande de ${isStage ? 'stage' : isGift ? 'baptême à offrir (cadeau)' : 'baptême'} pour ${school.name}`,
    `Référence : ${data.requestId}`,
    `Formule : ${offerName}`,
    ...(isGift ? [`Bénéficiaire du cadeau : ${giftName}${giftEmail ? ' · ' + giftEmail : ''}${giftNote ? ' · Message : ' + giftNote : ''}`] : []),
    `Dates souhaitées : ${dates.join(', ') || 'flexibles, à définir avec l’école'}`,
    `Participants : ${count}`,
    ...paxLines,
    `Contact${isGift ? ' (offreur)' : ''} : ${name} · ${email}${phone ? ' · ' + phone : ''}`,
    note && `Message : ${note}`,
    '',
    'Répondez directement au demandeur pour confirmer les conditions et les disponibilités.',
    ...(actionLinks
      ? [
          '',
          'Ou indiquez votre réponse en un clic :',
          `- Accepter : ${actionLinks.accept}`,
          `- Proposer une autre date : ${actionLinks.propose}`,
          `- Refuser : ${actionLinks.decline}`,
        ]
      : []),
  ].filter((l) => l === '' || Boolean(l));

  const htmlBody = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;color:#1b2430;line-height:1.5">
      <h2 style="margin:0 0 12px">Demande de ${isStage ? 'stage' : isGift ? 'baptême à offrir (cadeau)' : 'baptême'} · ${escHtml(school.name)}</h2>
      <p style="margin:0 0 8px"><strong>Formule :</strong> ${escHtml(offerName)}</p>
      ${isGift ? `<p style="margin:0 0 8px"><strong>Bénéficiaire du cadeau :</strong> ${escHtml(giftName)}${giftEmail ? ` · <a href="mailto:${escHtml(giftEmail)}">${escHtml(giftEmail)}</a>` : ''}${giftNote ? ` · <em>${escHtml(giftNote)}</em>` : ''}</p>` : ''}
      <p style="margin:0 0 8px"><strong>Dates souhaitées :</strong> ${escHtml(dates.join(', ') || 'flexibles, à définir avec l’école')}</p>
      <p style="margin:0 0 8px"><strong>Participants (${count}) :</strong></p>
      <ul style="margin:0 0 12px;padding-left:20px">
        ${people
          .map(
            (p, i) =>
              `<li>${i + 1}. ${escHtml(text(p.name, 80) || 'prénom non indiqué')} · ${p.weight} kg${isStage ? ` · ${p.height} cm` : ''}</li>`
          )
          .join('')}
      </ul>
      <p style="margin:0 0 8px"><strong>Contact :</strong> ${escHtml(name)} · <a href="mailto:${escHtml(email)}">${escHtml(email)}</a>${phone ? ` · ${escHtml(phone)}` : ''}</p>
      ${note ? `<p style="margin:0 0 12px"><strong>Message :</strong> ${escHtml(note)}</p>` : ''}
      <p style="margin:12px 0">Répondez directement à cet e-mail pour confirmer les conditions et les disponibilités au demandeur.</p>
      ${
        actionLinks
          ? `<div style="margin:18px 0;display:flex;gap:10px;flex-wrap:wrap">
              <a href="${actionLinks.accept}" style="background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Accepter la demande</a>
              <a href="${actionLinks.propose}" style="background:#1d4ed8;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Proposer une autre date</a>
              <a href="${actionLinks.decline}" style="background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Refuser</a>
            </div>`
          : ''
      }
      <p style="font-size:12px;color:#64748b">Référence : ${escHtml(data.requestId)}</p>
    </div>
  `;

  const schoolMail = await sendEmail({
    env,
    db,
    to: recipient,
    bcc: env.BOOKING_TEAM_TO && !env.BOOKING_TEST_TO ? [env.BOOKING_TEAM_TO] : undefined,
    replyTo: email,
    subject: `Demande Resa Parapente · ${school.name}`,
    textBody: lines.join('\n'),
    htmlBody,
    idempotencyKey: `booking-${data.requestId}`,
    relatedType: 'booking',
    relatedId: data.requestId,
    template: 'booking_school',
  });

  const status = schoolMail.ok ? 'envoyee' : 'echec_email';
  try {
    await db
      .prepare('UPDATE demandes SET statut = ?, envoye_le = ? WHERE request_id = ?')
      .bind(status, schoolMail.ok ? new Date().toISOString() : null, data.requestId)
      .run();
  } catch {
    // Row exists already.
  }
  if (!schoolMail.ok) return respond(502, { error: 'Envoi indisponible. Réessayez ou contactez l’école.' });

  // 4. Send visitor confirmation receipt (in test mode, route to BOOKING_TEST_TO so sandboxed senders don't fail).
  const receiptTo = env.BOOKING_TEST_TO || email;
  await sendEmail({
    env,
    db,
    to: receiptTo,
    subject: `${env.BOOKING_TEST_TO ? '[TEST VISITEUR] ' : ''}Votre demande auprès de ${school.name}`,
    textBody: [
      `Bonjour ${name},`,
      '',
      `Votre demande pour « ${offerName} » a été transmise à ${school.name}.`,
      `Elle vous répondra directement et organisera le paiement.`,
      '',
      `Dates souhaitées : ${dates.join(', ') || 'flexibles'}`,
      `Référence : ${data.requestId}`,
      '',
      'L’équipe Resa Parapente',
    ].join('\n'),
    idempotencyKey: `booking-receipt-${data.requestId}`,
    relatedType: 'booking',
    relatedId: data.requestId,
    template: 'booking_visitor_receipt',
  });

  return respond(200, { ok: true, test: Boolean(env.BOOKING_TEST_TO), reference: data.requestId });
}
