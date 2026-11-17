import directory from '../../server/booking-directory.json' with { type: 'json' };
import {
  respond,
  emailPattern,
  text,
  readJsonBody,
  verifyTurnstile,
  sendEmail,
} from '../_lib/common.js';

const FORBIDDEN_IN_TEXT = /(\+?\d[\s.-]?){9,}|@|https?:\/\//i;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: `rev-${ip}` });
    if (!success) return respond(429, { error: 'Trop de demandes. Réessayez plus tard.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM || !env.CONTACTS_DB) {
    return respond(503, { error: 'Envoi indisponible pour le moment.' });
  }

  const parsed = await readJsonBody(request, 16384);
  if (parsed.error) return parsed.error;
  const data = parsed.data;

  const school = Object.hasOwn(directory, data.schoolId) ? directory[data.schoolId] : null;
  const rating = data.rating;
  const kind = text(data.kind, 40);
  const experienceMonth = text(data.experienceMonth, 7);
  const title = data.title ? text(data.title, 80) : '';
  const bodyText = text(data.text, 3000);
  const first = text(data.author?.first, 60);
  const last = text(data.author?.last, 60);
  const email = text(data.author?.email, 254).toLowerCase();
  const token = data.token ? text(data.token, 128) : null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (
    !school || !Number.isInteger(rating) || rating < 1 || rating > 5 ||
    !['Baptême', 'Stage'].includes(kind) ||
    !/^\d{4}-\d{2}$/.test(experienceMonth) || experienceMonth > currentMonth ||
    bodyText.length < 40 || FORBIDDEN_IN_TEXT.test(bodyText) ||
    !first || !last || !emailPattern.test(email) ||
    data.honest !== true || data.consent !== true || data.website
  ) {
    return respond(400, { error: 'Vérifiez les informations de votre avis.' });
  }
  if (!(await verifyTurnstile(env, data.turnstileToken, ip))) {
    return respond(400, { error: 'Vérification anti-robot refusée.' });
  }

  const db = env.CONTACTS_DB;
  let verification = 'Déclaré par le participant';
  let usedToken = null;

  if (token) {
    const existingToken = await db
      .prepare('SELECT id FROM reviews WHERE token = ?')
      .bind(token)
      .first();
    if (existingToken) {
      return respond(409, { error: 'Un avis a déjà été déposé avec ce lien.' });
    }
    const booking = await db
      .prepare('SELECT request_id FROM demandes WHERE review_token = ? AND ecole_id = ?')
      .bind(token, data.schoolId)
      .first();
    if (booking) {
      verification = 'Demande vérifiée';
      usedToken = token;
    }
  }

  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const duplicate = await db
    .prepare('SELECT id FROM reviews WHERE author_email = ? AND school_id = ? AND created_at >= ?')
    .bind(email, data.schoolId, yearAgo)
    .first();
  if (duplicate) {
    return respond(409, { error: 'Vous avez déjà déposé un avis pour cette école au cours des 12 derniers mois.' });
  }

  const id = `REV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const displayAuthor = `${first} ${last.charAt(0).toUpperCase()}.`;

  try {
    await db
      .prepare(
        `INSERT INTO reviews
         (id, school_id, token, verification, rating, kind, experience_month, title, text, author_first, author_last, author_email, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'À modérer', ?)`
      )
      .bind(
        id,
        data.schoolId,
        usedToken,
        verification,
        rating,
        kind,
        experienceMonth,
        title || null,
        bodyText,
        first,
        last,
        email,
        now
      )
      .run();
  } catch {
    return respond(500, { error: 'Enregistrement impossible. Réessayez dans un instant.' });
  }

  const tsvRow = [
    id,
    data.schoolId,
    'À modérer',
    verification,
    kind,
    rating,
    title || '',
    bodyText.replace(/\r?\n/g, ' '),
    displayAuthor,
    experienceMonth,
    now.slice(0, 10),
  ].join('\t');

  const teamTo = env.BOOKING_TEST_TO || env.BOOKING_TEAM_TO || 'contact@resaparapente.fr';
  const teamMail = await sendEmail({
    env,
    db,
    to: teamTo,
    subject: `[Avis à modérer] ${school.name} · ${rating}/5 (${verification})`,
    textBody: [
      `Nouvel avis pour ${school.name} (${data.schoolId})`,
      `Note : ${rating}/5 · ${kind} · ${experienceMonth}`,
      `Vérification : ${verification}`,
      `Auteur : ${displayAuthor} (${first} ${last}, ${email})`,
      title ? `Titre : ${title}` : '',
      `Texte :\n${bodyText}`,
      '',
      '--- Ligne à coller dans l’onglet Avis ---',
      tsvRow,
    ]
      .filter((l) => l !== '')
      .join('\n'),
    idempotencyKey: `review-team-${id}`,
    relatedType: 'review',
    relatedId: id,
    template: 'review_team',
  });

  if (!teamMail.ok) {
    return respond(502, { error: 'Envoi indisponible. Réessayez dans un instant.' });
  }

  await sendEmail({
    env,
    db,
    to: env.BOOKING_TEST_TO || email,
    subject: `${env.BOOKING_TEST_TO ? '[TEST AVIS] ' : ''}Votre avis sur ${school.name} · Resa Parapente`,
    textBody: [
      `Bonjour ${first},`,
      '',
      `Merci pour votre avis (${rating}/5) sur ${school.name}.`,
      'Votre avis sera relu sous 7 jours avant publication selon nos règles (/avis-clients/).',
      '',
      `Référence : ${id}`,
      'L’équipe Resa Parapente',
    ].join('\n'),
    idempotencyKey: `review-ack-${id}`,
    relatedType: 'review',
    relatedId: id,
    template: 'review_author_ack',
  });

  return respond(200, { ok: true, id, verification, test: Boolean(env.BOOKING_TEST_TO) });
}
