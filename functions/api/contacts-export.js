// Export of the stored contacts for the team (CSV for Excel, or JSON).
//   GET /api/contacts-export?table=demandes|participants&format=csv|json&since=2026-11-01
//   Header:  Authorization: Bearer <EXPORT_TOKEN>      (EXPORT_TOKEN = secret of the Pages project, at least 32 random characters)
// The CSV uses ";" and a UTF-8 BOM so that French Excel opens it directly. Cells starting with = + - @ are prefixed with ' (no formula injection).
const COLUMNS = {
  demandes: ['request_id', 'created_at', 'type_contact', 'ecole_id', 'ecole', 'offre_id', 'offre', 'nom', 'email', 'telephone', 'dates_souhaitees', 'nb_participants', 'message',
    'consentement_ecole', 'texte_consentement', 'optin_monparapente', 'cgv_accepte', 'consent_tiers', 'consent_version', 'consent_marche', 'consent_langue', 'consent_texte_1', 'consent_texte_2', 'consent_at',
    'page_source', 'statut', 'envoye_le'],
  participants: ['request_id', 'rang', 'prenom', 'poids_kg', 'taille_cm'],
  cadeaux: ['request_id', 'created_at', 'route', 'ecole_id', 'ecole', 'pays_ecole', 'offre_id', 'offre', 'offre_type', 'prix_affiche',
    'donateur_prenom', 'donateur_nom', 'donateur_email', 'donateur_telephone',
    'passager_prenom', 'passager_nom', 'passager_email', 'passager_telephone', 'passager_poids_kg', 'vol_souhaite_mois', 'message',
    'cgv_accepte', 'consent_tiers', 'consent_version', 'consent_marche', 'consent_langue', 'consent_texte_1', 'consent_texte_2', 'consent_at',
    'page_source', 'statut', 'envoye_le'],
};
const safe = (v) => { const s = v == null ? '' : String(v).replace(/\r?\n/g, ' '); return /^[=+\-@\t]/.test(s) ? "'" + s : s; };
const csv = (cols, rows) => '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => `"${safe(r[c]).replace(/"/g, '""')}"`).join(';'))].join('\r\n');

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const ok = env.EXPORT_TOKEN && env.EXPORT_TOKEN.length >= 32 && token.length === env.EXPORT_TOKEN.length &&
    [...token].reduce((a, ch, i) => a | (ch.charCodeAt(0) ^ env.EXPORT_TOKEN.charCodeAt(i)), 0) === 0;
  if (!ok) return new Response('Non autorisé', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  if (!env.CONTACTS_DB) return new Response('Base indisponible', { status: 503 });
  const reqTable = url.searchParams.get('table');
  const table = reqTable === 'participants' ? 'participants' : reqTable === 'cadeaux' ? 'cadeaux' : 'demandes';
  const since = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('since') || '') ? url.searchParams.get('since') : '1970-01-01';
  const cols = COLUMNS[table];
  const sql = table === 'participants'
    ? `SELECT p.${cols.join(', p.')} FROM participants p JOIN demandes d ON d.request_id = p.request_id WHERE d.created_at >= ? ORDER BY d.created_at, p.rang`
    : `SELECT ${cols.join(', ')} FROM ${table} WHERE created_at >= ? ORDER BY created_at`;
  const { results } = await env.CONTACTS_DB.prepare(sql).bind(since).all();
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (url.searchParams.get('format') === 'json') return Response.json(results, { headers });
  return new Response(csv(cols, results), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="resaparapente-${table}.csv"` } });
}
