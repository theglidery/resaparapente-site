import schools from '../src/data/schools.json' with { type: 'json' };
import directory from './booking-directory.json' with { type: 'json' };
import { sendEmail, signActionToken } from '../functions/_lib/common.js';

// Standalone Cloudflare Worker for daily scheduled tasks (cron: "0 3 * * *" UTC):
// 1. Triggers Cloudflare Pages daily rebuild hook (removes expired promotions & past stage dates).
// 2. Sends a 48h reminder for unanswered booking requests (`statut = 'envoyee'`).
// 3. Sends a one-time post-flight review invite the day after the first desired date.

const slugById = Object.fromEntries(schools.map((s) => [s.id, s.slug]));
const ACTION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export default {
  async scheduled(_event, env) {
    const db = env.CONTACTS_DB;
    if (!db) return;

    // 1. Trigger daily Cloudflare Pages rebuild
    if (env.PAGES_DEPLOY_HOOK_URL) {
      try {
        await fetch(env.PAGES_DEPLOY_HOOK_URL, { method: 'POST', signal: AbortSignal.timeout(8000) });
      } catch {
        // Non-blocking
      }
    }

    const now = new Date();
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const secret = env.ACTION_SECRET || env.EXPORT_TOKEN || '';
    const siteOrigin = env.SITE_ORIGIN || 'https://resaparapente.fr';

    // 2. 48h school reminders
    const { results: overdue } = await db
      .prepare(
        `SELECT request_id, ecole_id, ecole, offre, nom, email, dates_souhaitees, envoye_le
         FROM demandes
         WHERE statut = 'envoyee'
           AND responded_at IS NULL
           AND reminder_sent_at IS NULL
           AND envoye_le IS NOT NULL
           AND envoye_le <= ?
         LIMIT 50`
      )
      .bind(cutoff48h)
      .all();

    for (const row of overdue || []) {
      const schoolInfo = Object.hasOwn(directory, row.ecole_id) ? directory[row.ecole_id] : null;
      const to = env.BOOKING_TEST_TO || schoolInfo?.email;
      if (!to) continue;

      let actionText = '';
      if (secret) {
        const exp = Date.now() + ACTION_TTL_MS;
        const mk = async (action) =>
          `${siteOrigin}/api/booking-action?token=${encodeURIComponent(
            await signActionToken(secret, { rid: row.request_id, action, exp })
          )}`;
        actionText = [
          '',
          'Répondre en un clic :',
          `- Accepter : ${await mk('accept')}`,
          `- Proposer une autre date : ${await mk('propose')}`,
          `- Refuser : ${await mk('decline')}`,
        ].join('\n');
      }

      const mail = await sendEmail({
        env,
        db,
        to,
        bcc: env.BOOKING_TEAM_TO && !env.BOOKING_TEST_TO ? [env.BOOKING_TEAM_TO] : undefined,
        replyTo: row.email,
        subject: `Rappel : demande en attente · ${row.ecole}`,
        textBody: [
          `Bonjour,`,
          '',
          `Une demande transmise il y a plus de 48 h pour « ${row.offre} » (${row.nom}, dates : ${row.dates_souhaitees || 'flexibles'}) est toujours en attente de réponse.`,
          'Merci de répondre directement au demandeur.',
          actionText,
          '',
          `Référence : ${row.request_id}`,
        ]
          .filter((l) => l !== '')
          .join('\n'),
        idempotencyKey: `reminder-${row.request_id}`,
        relatedType: 'reminder',
        relatedId: row.request_id,
        template: 'booking_48h_reminder',
      });

      if (mail.ok) {
        await db
          .prepare('UPDATE demandes SET reminder_sent_at = ? WHERE request_id = ?')
          .bind(now.toISOString(), row.request_id)
          .run();
      }
    }

    // 3. Next-day post-flight review invitations
    const { results: reviewDue } = await db
      .prepare(
        `SELECT request_id, ecole_id, ecole, nom, email, dates_souhaitees, review_token
         FROM demandes
         WHERE statut IN ('envoyee', 'acceptee')
           AND review_email_sent_at IS NULL
           AND review_token IS NOT NULL
           AND dates_souhaitees IS NOT NULL
           AND dates_souhaitees != ''
         LIMIT 100`
      )
      .all();

    for (const row of reviewDue || []) {
      const firstDate = String(row.dates_souhaitees).split(',')[0]?.trim();
      if (firstDate !== yesterday) continue;
      const slug = slugById[row.ecole_id];
      if (!slug) continue;

      const link = `${siteOrigin}/ecoles/${slug}/?avis=${encodeURIComponent(row.review_token)}`;
      const mail = await sendEmail({
        env,
        db,
        to: env.BOOKING_TEST_TO || row.email,
        subject: `${env.BOOKING_TEST_TO ? '[TEST AVIS] ' : ''}Vous avez volé avec ${row.ecole} ? Donnez votre avis`,
        textBody: [
          `Bonjour ${row.nom},`,
          '',
          `Vous avez récemment fait une demande auprès de ${row.ecole}. Si votre vol ou stage a eu lieu, votre avis aide les prochains participants :`,
          link,
          '',
          'Merci et bons vols,',
          'L’équipe Resa Parapente',
        ].join('\n'),
        idempotencyKey: `review-invite-${row.request_id}`,
        relatedType: 'review_invite',
        relatedId: row.request_id,
        template: 'review_invite',
      });

      if (mail.ok) {
        await db
          .prepare('UPDATE demandes SET review_email_sent_at = ? WHERE request_id = ?')
          .bind(now.toISOString(), row.request_id)
          .run();
      }
    }
  },
};
