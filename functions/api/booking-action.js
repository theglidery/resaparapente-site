import directory from '../../server/booking-directory.json';
import { escHtml, sendEmail, verifyActionToken, text } from '../_lib/common.js';

const ACTIONS = {
  accept: { statut: 'acceptee', label: 'Accepter la demande', badge: 'Demande acceptée' },
  propose: { statut: 'autre_date', label: 'Proposer une autre date', badge: 'Autre date proposée' },
  decline: { statut: 'refusee', label: 'Refuser la demande', badge: 'Demande refusée' },
};

const htmlPage = (title, body, status = 200) =>
  new Response(
    `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${escHtml(title)} · Resa Parapente</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:24px}
    .card{max-width:560px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(15,23,42,.04)}
    h1{font-size:1.3rem;margin:0 0 12px}
    p{line-height:1.5;margin:0 0 12px}
    .meta{background:#f1f5f9;border-radius:8px;padding:12px 14px;margin:14px 0;font-size:.95rem}
    label{display:block;font-weight:600;margin:12px 0 6px}
    input,textarea,select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}
    button{margin-top:16px;background:#0f766e;color:#fff;border:0;border-radius:8px;padding:12px 18px;font:inherit;font-weight:600;cursor:pointer}
    button.decline{background:#b91c1c}
    button.propose{background:#1d4ed8}
    .muted{color:#64748b;font-size:.88rem}
  </style>
</head>
<body><main class="card">${body}</main></body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );

async function loadFromToken(request, env, token) {
  const secret = env.ACTION_SECRET || env.EXPORT_TOKEN || '';
  if (!secret || !env.CONTACTS_DB) {
    return { err: htmlPage('Service indisponible', '<h1>Service indisponible</h1><p>Configuration serveur incomplète.</p>', 503) };
  }
  const payload = await verifyActionToken(secret, token);
  if (!payload) {
    return { err: htmlPage('Lien invalide', '<h1>Lien invalide</h1><p>Ce lien de réponse est invalide ou corrompu.</p>', 400) };
  }
  if (payload.expired) {
    return { err: htmlPage('Lien expiré', '<h1>Lien expiré</h1><p>Ce lien a expiré. Vous pouvez répondre directement à l’e-mail du demandeur.</p>', 410) };
  }
  const action = Object.hasOwn(ACTIONS, payload.action) ? payload.action : null;
  if (!action || !payload.rid) {
    return { err: htmlPage('Lien invalide', '<h1>Lien invalide</h1><p>Action inconnue.</p>', 400) };
  }
  const row = await env.CONTACTS_DB.prepare(
    'SELECT request_id, ecole_id, ecole, offre, nom, email, telephone, dates_souhaitees, nb_participants, statut, responded_at FROM demandes WHERE request_id = ?'
  )
    .bind(payload.rid)
    .first();
  if (!row) {
    return { err: htmlPage('Demande introuvable', '<h1>Demande introuvable</h1><p>Aucune demande correspondante n’a été trouvée.</p>', 404) };
  }
  return { payload, action, row };
}

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const loaded = await loadFromToken(request, env, token);
  if (loaded.err) return loaded.err;
  const { action, row } = loaded;
  const meta = ACTIONS[action];

  return htmlPage(
    meta.label,
    `<h1>${escHtml(meta.label)}</h1>
     <div class="meta">
       <p><strong>École :</strong> ${escHtml(row.ecole)}</p>
       <p><strong>Formule :</strong> ${escHtml(row.offre)}</p>
       <p><strong>Demandeur :</strong> ${escHtml(row.nom)} (${escHtml(row.email)})</p>
       <p><strong>Dates souhaitées :</strong> ${escHtml(row.dates_souhaitees || 'Flexibles')}</p>
       <p style="margin:0"><strong>Participants :</strong> ${row.nb_participants}</p>
     </div>
     ${row.responded_at ? `<p class="muted">Une réponse a déjà été enregistrée le ${escHtml(row.responded_at.slice(0, 10))}. Vous pouvez la mettre à jour ci-dessous.</p>` : ''}
     <form method="POST" action="/api/booking-action">
       <input type="hidden" name="token" value="${escHtml(token)}" />
       ${
         action === 'propose'
           ? '<label for="alt-date">Date alternative proposée (facultatif)</label><input id="alt-date" name="alt_date" type="date" />'
           : ''
       }
       <label for="note">Message au demandeur ${action === 'accept' ? '(ex. lieu et heure de rendez-vous)' : '(facultatif)'}</label>
       <textarea id="note" name="note" rows="4" maxlength="1000" placeholder="Précisions sur la météo, le rendez-vous, le tarif ou une autre date…"></textarea>
       <button type="submit" class="${escHtml(action)}">${escHtml(meta.label)}</button>
     </form>`
  );
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return htmlPage('Requête invalide', '<h1>Requête invalide</h1>', 400);
  }
  const token = String(form.get('token') || '');
  const loaded = await loadFromToken(request, env, token);
  if (loaded.err) return loaded.err;
  const { action, row } = loaded;
  const meta = ACTIONS[action];

  const altDate = text(String(form.get('alt_date') || ''), 20);
  const note = text(String(form.get('note') || ''), 1000);
  const combinedNote = [altDate ? `Date proposée : ${altDate}` : '', note].filter(Boolean).join('\n');
  const now = new Date().toISOString();

  await env.CONTACTS_DB.prepare(
    'UPDATE demandes SET statut = ?, school_response_note = ?, responded_at = ? WHERE request_id = ?'
  )
    .bind(meta.statut, combinedNote || null, now, row.request_id)
    .run();

  const schoolInfo = Object.hasOwn(directory, row.ecole_id) ? directory[row.ecole_id] : null;
  const visitorTo = env.BOOKING_TEST_TO || row.email;
  const statusSentence =
    action === 'accept'
      ? `${row.ecole} a accepté votre demande pour « ${row.offre} ».`
      : action === 'propose'
        ? `${row.ecole} vous propose une autre date pour « ${row.offre} ».`
        : `${row.ecole} ne peut malheureusement pas donner suite à votre demande pour « ${row.offre} ».`;

  await sendEmail({
    env,
    db: env.CONTACTS_DB,
    to: visitorTo,
    replyTo: schoolInfo?.email || undefined,
    subject: `${env.BOOKING_TEST_TO ? '[TEST VISITEUR] ' : ''}${meta.badge} · ${row.ecole}`,
    textBody: [
      `Bonjour ${row.nom},`,
      '',
      statusSentence,
      combinedNote ? `\nMessage de l’école :\n${combinedNote}` : '',
      '',
      schoolInfo?.email ? `Vous pouvez répondre directement à cet e-mail (${schoolInfo.email}).` : '',
      `Référence : ${row.request_id}`,
      '',
      'L’équipe Resa Parapente',
    ]
      .filter((l) => l !== '')
      .join('\n'),
    idempotencyKey: `booking-action-${row.request_id}-${action}-${now.slice(0, 16)}`,
    relatedType: 'booking_action',
    relatedId: row.request_id,
    template: `booking_${action}`,
  });

  return htmlPage(
    'Réponse enregistrée',
    `<h1>${escHtml(meta.badge)}</h1>
     <p>Votre réponse a bien été enregistrée et transmise à <strong>${escHtml(row.nom)}</strong> (${escHtml(row.email)}).</p>
     <p class="muted">Référence : ${escHtml(row.request_id)}</p>`
  );
}
