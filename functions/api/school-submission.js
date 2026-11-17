import directory from '../../server/booking-directory.json';
import {
  respond,
  emailPattern,
  text,
  readJsonBody,
  verifyTurnstile,
  sendEmail,
} from '../_lib/common.js';

const VALID_TOPICS = new Set(['stage', 'bapteme', 'bon', 'promo']);

function emailDomain(addr) {
  const i = addr.lastIndexOf('@');
  return i > -1 ? addr.slice(i + 1).toLowerCase() : '';
}

function urlHost(raw) {
  try {
    return new URL(raw).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: `sub-${ip}` });
    if (!success) return respond(429, { error: 'Trop de demandes. Réessayez dans quelques minutes.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM || !env.CONTACTS_DB) {
    return respond(503, { error: 'Envoi indisponible pour le moment.' });
  }

  const parsed = await readJsonBody(request, 32768);
  if (parsed.error) return parsed.error;
  const data = parsed.data;

  const school = text(data.school, 140);
  const site = text(data.site, 300);
  const contactName = text(data.contact?.name, 120);
  const contactEmail = text(data.contact?.email, 254);
  const contactPhone = text(data.contact?.phone, 35);
  const message = text(data.message, 1500);
  const topics = Array.isArray(data.topics) ? [...new Set(data.topics.filter((t) => VALID_TOPICS.has(t)))] : [];
  const sessions = Array.isArray(data.sessions) ? data.sessions.slice(0, 50) : [];

  if (
    !school || !contactName || !emailPattern.test(contactEmail) ||
    !topics.length || data.consent !== true || data.website ||
    (topics.includes('stage') && !sessions.length) ||
    (topics.includes('bon') && !text(data.gift?.url, 300)) ||
    (topics.includes('promo') && !(text(data.promo?.price, 20) && text(data.promo?.start, 20) && text(data.promo?.end, 20)))
  ) {
    return respond(400, { error: 'Vérifiez les informations saisies.' });
  }
  if (!(await verifyTurnstile(env, data.turnstileToken, ip))) {
    return respond(400, { error: 'Vérification anti-robot refusée.' });
  }

  // Check whether the submitter's email domain matches a known school email or the submitted official site.
  const dom = emailDomain(contactEmail);
  const siteDom = urlHost(site);
  const knownEmails = Object.values(directory).map((s) => (s.email || '').toLowerCase());
  const domainVerified =
    knownEmails.includes(contactEmail.toLowerCase()) ||
    (siteDom && dom && (dom === siteDom || dom.endsWith('.' + siteDom)))
      ? 1
      : 0;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const bapteme = topics.includes('bapteme') && data.bapteme ? data.bapteme : null;
  const gift = topics.includes('bon') && data.gift ? data.gift : null;
  const promo = topics.includes('promo') && data.promo ? data.promo : null;

  try {
    await env.CONTACTS_DB.prepare(
      `INSERT INTO school_submissions
       (id, school, site, contact_name, contact_email, contact_phone, topics_json, sessions_json, bapteme_json, gift_json, promo_json, message, domain_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        school,
        site || null,
        contactName,
        contactEmail,
        contactPhone || null,
        JSON.stringify(topics),
        JSON.stringify(sessions),
        bapteme ? JSON.stringify(bapteme) : null,
        gift ? JSON.stringify(gift) : null,
        promo ? JSON.stringify(promo) : null,
        message || null,
        domainVerified,
        now
      )
      .run();
  } catch {
    return respond(500, { error: 'Enregistrement impossible. Réessayez dans un instant.' });
  }

  // Build ready-to-paste TSV blocks for the Excel workbook.
  const tsvSessions = sessions.map((s) =>
    [school, s.type || '', s.name || '', s.start || '', s.end || '', s.price || '', s.places || '', s.city || '', s.url || ''].join('\t')
  );
  const tsvGift = gift
    ? [school, gift.name || '', gift.url || '', gift.price || '', gift.validity || '', 'À vérifier'].join('\t')
    : '';
  const tsvPromo = promo
    ? [school, promo.title || '', promo.price || '', promo.regular || '', promo.start || '', promo.end || '', promo.conditions || '', promo.url || ''].join('\t')
    : '';

  const teamTo = env.BOOKING_TEST_TO || env.BOOKING_TEAM_TO || 'contact@resaparapente.fr';
  const teamMail = await sendEmail({
    env,
    db: env.CONTACTS_DB,
    to: teamTo,
    replyTo: contactEmail,
    subject: `[Pour les écoles] ${school} (${topics.join(', ')})`,
    textBody: [
      `Nouvelle soumission d’école · ${school}`,
      `Vérification domaine : ${domainVerified ? 'DOMAINE / EMAIL CONNU' : 'À VÉRIFIER MANUELLEMENT'}`,
      `Site officiel : ${site || 'non indiqué'}`,
      `Contact : ${contactName} · ${contactEmail}${contactPhone ? ' · ' + contactPhone : ''}`,
      `Sujets : ${topics.join(', ')}`,
      message ? `Message : ${message}` : '',
      tsvSessions.length ? `\n--- SESSIONS (copier-coller dans l’onglet Sessions) ---\n${tsvSessions.join('\n')}` : '',
      bapteme ? `\n--- BAPTÊMES ---\n${bapteme.text || ''}\nURL : ${bapteme.url || ''}` : '',
      tsvGift ? `\n--- BON CADEAU (onglet Bons cadeaux écoles) ---\n${tsvGift}` : '',
      tsvPromo ? `\n--- PROMOTION (onglet Promotions écoles) ---\n${tsvPromo}` : '',
      `\nID soumission : ${id}`,
    ]
      .filter((l) => l !== '')
      .join('\n'),
    idempotencyKey: `sub-team-${id}`,
    relatedType: 'school_submission',
    relatedId: id,
    template: 'school_submission_team',
  });

  if (!teamMail.ok) {
    return respond(502, { error: 'Envoi indisponible. Réessayez ou écrivez à contact@resaparapente.fr.' });
  }

  await sendEmail({
    env,
    db: env.CONTACTS_DB,
    to: env.BOOKING_TEST_TO || contactEmail,
    subject: `${env.BOOKING_TEST_TO ? '[TEST ÉCOLE] ' : ''}Réception de vos informations · Resa Parapente`,
    textBody: [
      `Bonjour ${contactName},`,
      '',
      `Nous avons bien reçu votre envoi pour ${school} (${topics.join(', ')}).`,
      'Notre équipe va vérifier ces informations sur votre site officiel avant de les publier sur ResaParapente.',
      '',
      `Référence : ${id}`,
      'L’équipe Resa Parapente',
    ].join('\n'),
    idempotencyKey: `sub-ack-${id}`,
    relatedType: 'school_submission',
    relatedId: id,
    template: 'school_submission_ack',
  });

  return respond(200, { ok: true, id, test: Boolean(env.BOOKING_TEST_TO) });
}
