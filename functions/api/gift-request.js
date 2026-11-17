// Gift voucher request (option B): relays the buyer's request to the school's professional address. ResaParapente sells nothing.
// Needs RESEND_API_KEY and BOOKING_FROM (same as the booking function). GIFT_TEST_TO redirects every message to a test mailbox.
// A school whose relay is "Non" in the workbook (sheet Écoles) is never relayed to: the directory is exported by scripts/export-data.py.
import directory from '../../server/gift-directory.json';

const respond = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const text = (v, max) => (typeof v === 'string' && v.trim().length <= max ? v.trim() : '');
const KINDS = { bapteme: 'baptême en biplace', stage: 'stage d’initiation', montant: 'montant libre', autre: 'à préciser' };

export async function onRequestPost({ request, env }) {
  if (env.BOOKING_RATE_LIMIT) {
    const { success } = await env.BOOKING_RATE_LIMIT.limit({ key: 'gift-' + (request.headers.get('CF-Connecting-IP') || 'unknown') });
    if (!success) return respond(429, { error: 'Trop de demandes.' });
  }
  if (!env.RESEND_API_KEY || !env.BOOKING_FROM) return respond(503, { error: 'Envoi indisponible.' });
  if (request.headers.get('origin') !== new URL(request.url).origin) return respond(403, { error: 'Origine non autorisée.' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return respond(415, { error: 'Format invalide.' });
  let data;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return respond(413, { error: 'Demande trop longue.' });
    data = JSON.parse(raw);
  } catch { return respond(400, { error: 'Demande illisible.' }); }
  if (!data || typeof data !== 'object') return respond(400, { error: 'Demande invalide.' });
  const school = Object.hasOwn(directory, data.schoolId) ? directory[data.schoolId] : null;
  const name = text(data.contact?.name, 120), email = text(data.contact?.email, 254), phone = text(data.contact?.phone, 35);
  const formula = text(data.formula, 160), recipient = text(data.recipient, 60), note = text(data.message, 800);
  if (!school || school.relay === 'Non' || !school.email || !name || !emailPattern.test(email) || data.consent !== true || data.website ||
      !Object.hasOwn(KINDS, data.kind) || !/^[a-f0-9-]{36}$/i.test(data.requestId || '')) {
    return respond(400, { error: 'Vérifiez les informations de votre demande.' });
  }
  const lines = [
    `Demande de bon cadeau pour ${school.name}`,
    `Cadeau : ${KINDS[data.kind]}${formula ? ' · ' + formula : ''}`,
    recipient && `Pour : ${recipient}`,
    `Acheteur : ${name} · ${email}${phone ? ' · ' + phone : ''}`,
    note && `Message : ${note}`,
    '',
    'Cette personne a demandé un bon cadeau via ResaParapente. Répondez-lui directement avec le prix, le mode de paiement et l’envoi du bon. ResaParapente n’encaisse aucun paiement.',
  ].filter((l) => l === '' || Boolean(l));
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `gift-${data.requestId}` },
      body: JSON.stringify({ from: env.BOOKING_FROM, to: [env.GIFT_TEST_TO || school.email], reply_to: email, subject: `Demande de bon cadeau · ${school.name}`, text: lines.join('\n') }),
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) return respond(502, { error: 'Envoi indisponible.' });
    return respond(200, { ok: true, test: Boolean(env.GIFT_TEST_TO), reference: data.requestId });
  } catch { return respond(502, { error: 'Envoi indisponible.' }); }
}
