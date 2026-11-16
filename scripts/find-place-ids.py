"""Find the Google Place ID of each school (the only Google datum we may store) and write a CSV to review by hand.
Usage:  GOOGLE_PLACES_API_KEY=... python3 scripts/find-place-ids.py [--limit 20] [--out place-ids-a-verifier.csv]
Reads src/data/schools.json (run `npm run data` first). Calls Places API (New) Text Search once per school that has no Google Place ID yet.
Output columns: ID école, Nom, Ville, Place ID proposé, Nom Google, Adresse Google, Distance (m), Confiance (haute / moyenne / faible), Raison.
Paste the "haute" rows after a quick look into the workbook column "Google Place ID"; check the others on Google Maps.
Never stores ratings: only place IDs. See docs/AVIS-ET-NOTES.md. Test mode: PLACES_BASE_URL=http://localhost:PORT points to a fake server."""
import os, sys, json, csv, re, math, argparse, unicodedata, urllib.request, urllib.error
from urllib.parse import urlparse

ap = argparse.ArgumentParser(); ap.add_argument('--limit', type=int, default=0); ap.add_argument('--out', default='place-ids-a-verifier.csv'); ap.add_argument('--delay', type=float, default=0.2)
a = ap.parse_args()
KEY = os.environ.get('GOOGLE_PLACES_API_KEY')
if not KEY: sys.exit('Set GOOGLE_PLACES_API_KEY (Places API (New) enabled).')
BASE = os.environ.get('PLACES_BASE_URL', 'https://places.googleapis.com')

def norm(t): return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', t or '').encode('ascii', 'ignore').decode().lower())
STOP = {'parapente', 'ecole', 'de', 'du', 'des', 'la', 'le', 'les', 'et', 'vol', 'libre', 'club', 'air', 'en', 'a', 'd'}
def toks(t): return {w for w in norm(t).split() if w not in STOP and len(w) > 1}
def host(u):
    try: return urlparse(u).hostname.replace('www.', '') if u else ''
    except Exception: return ''
def dist(la1, lo1, la2, lo2):
    r = math.pi / 180; dl = (la2 - la1) * r; dg = (lo2 - lo1) * r
    h = math.sin(dl / 2) ** 2 + math.cos(la1 * r) * math.cos(la2 * r) * math.sin(dg / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))

def search(query, lat, lng):
    body = {'textQuery': query, 'languageCode': 'fr', 'regionCode': 'FR', 'maxResultCount': 3}
    if lat and lng: body['locationBias'] = {'circle': {'center': {'latitude': lat, 'longitude': lng}, 'radius': 20000.0}}
    req = urllib.request.Request(f'{BASE}/v1/places:searchText', data=json.dumps(body).encode(), method='POST', headers={
        'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri'})
    with urllib.request.urlopen(req, timeout=20) as r: return json.load(r).get('places', [])

def score(s, p):
    name = (p.get('displayName') or {}).get('text', ''); reasons = []; pts = 0
    ov = len(toks(s['name']) & toks(name)) / max(1, len(toks(s['name'])))
    if ov >= 0.6: pts += 2; reasons.append('nom proche')
    elif ov > 0: pts += 1; reasons.append('nom en partie')
    d = None
    loc = p.get('location')
    if loc and s.get('lat') and s.get('lng'):
        d = dist(s['lat'], s['lng'], loc['latitude'], loc['longitude'])
        if d <= 1500: pts += 2; reasons.append('à moins de 1,5 km')
        elif d <= 8000: pts += 1; reasons.append('à moins de 8 km')
    if host(s.get('website')) and host(s.get('website')) == host(p.get('websiteUri')): pts += 3; reasons.append('même site web')
    return pts, d, ', '.join(reasons) or 'aucun point commun'

schools = json.load(open('src/data/schools.json'))
todo = [s for s in schools if not s.get('googlePlaceId') and (s['baptemes'] or s['stages'])]
if a.limit: todo = todo[:a.limit]
import time
with open(a.out, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['ID école', 'Nom', 'Ville', 'Place ID proposé', 'Nom Google', 'Adresse Google', 'Distance (m)', 'Confiance', 'Raison'])
    for s in todo:
        try: found = search(f"{s['name']} parapente {s.get('city') or ''}".strip(), s.get('lat'), s.get('lng'))
        except urllib.error.HTTPError as e: sys.exit(f'Google answered {e.code}: {e.read()[:200]!r}')
        best = max(((score(s, p), p) for p in found), key=lambda x: x[0][0], default=None)
        if not best: w.writerow([s['id'], s['name'], s.get('city'), '', '', '', '', 'aucun résultat', '']); continue
        (pts, d, why), p = best
        conf = 'haute' if pts >= 4 else 'moyenne' if pts >= 3 else 'faible'
        w.writerow([s['id'], s['name'], s.get('city'), p['id'], (p.get('displayName') or {}).get('text', ''), p.get('formattedAddress', ''), '' if d is None else round(d), conf, why])
        time.sleep(a.delay)
print(f'{len(todo)} schools searched, result in {a.out}')
