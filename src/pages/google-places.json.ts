// List of the Google Place IDs of our schools. Read by functions/api/google-rating.js so that it only answers for these IDs.
// Place IDs are the one Google datum we may store. No rating is stored anywhere.
import { schools } from '../lib/data';
export const GET = () =>
  new Response(JSON.stringify({ ids: schools.map((s) => s.googlePlaceId).filter(Boolean) }), { headers: { 'content-type': 'application/json' } });
