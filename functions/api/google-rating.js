// Cloudflare Pages Function: GET /api/google-rating?place=<Google Place ID>
// Reads the rating of a school from Google Places API (New) at the moment a visitor opens the page, and returns it.
// Google's terms do not allow storing or caching ratings, so nothing is saved here and the answer is "no-store".
// Setup (docs/AVIS-ET-NOTES.md): secret GOOGLE_PLACES_API_KEY in Cloudflare Pages, key restricted to "Places API (New)", daily quota set in Google Cloud.
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

let allowed = null; // Place IDs we publish, read once per instance from the built site (protects the API key from other IDs)
async function isKnown(env, request, id) {
  if (!allowed) {
    const r = await env.ASSETS.fetch(new URL('/google-places.json', request.url));
    allowed = new Set(r.ok ? (await r.json()).ids : []);
  }
  return allowed.has(id);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('place') || '';
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(id)) return reply({ error: 'bad place' }, 400);
  // only our own pages may ask
  const from = request.headers.get('origin') || request.headers.get('referer') || '';
  try { if (from && new URL(from).host !== url.host) return reply({ error: 'forbidden' }, 403); } catch { return reply({ error: 'forbidden' }, 403); }
  if (!env.GOOGLE_PLACES_API_KEY) return reply({ error: 'not configured' }, 503);
  if (!(await isKnown(env, request, id))) return reply({ error: 'unknown place' }, 404);
  const base = env.PLACES_BASE_URL || 'https://places.googleapis.com';
  const g = await fetch(`${base}/v1/places/${encodeURIComponent(id)}?languageCode=fr`, {
    headers: { 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri' },
  });
  if (!g.ok) return reply({ error: 'upstream', status: g.status }, 502);
  const d = await g.json();
  if (typeof d.rating !== 'number') return reply({ rating: null });
  return reply({ rating: d.rating, count: d.userRatingCount ?? null, url: d.googleMapsUri ?? null });
}
