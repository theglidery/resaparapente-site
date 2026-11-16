#!/usr/bin/env python3
"""Construit le classeur V9 à partir du V8 de Philippe.

- ajoute les sessions de stage relevées sur les calendriers BookAndGlide (data/bag/*.txt)
- crée les offres de stage manquantes et les écoles absentes du classeur
- met à jour « Sources de collecte »
- applique les présentations rédigées (data/descriptions/*.json)

Usage : python3 scripts/build-v9.py data/v8-philippe.xlsx data/resaparapente-base-ecoles-offres-v9.xlsx
Ensuite : recalc.py (LibreOffice) pour remplir les formules.
"""
import sys, re, json, glob, hashlib, unicodedata, datetime as dt, collections, os
import openpyxl
from copy import copy
from openpyxl.formula.translate import Translator

SRC, DST = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = dt.datetime(2026, 11, 14)

wb = openpyxl.load_workbook(SRC)
wsE, wsS, wsT, wsB, wsC = wb['Écoles'], wb['Stages'], wb['Sessions'], wb['Baptêmes'], wb['Sources de collecte']


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    s = s.replace("'", ' ')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def hdr(ws):
    return {c.value: c.column for c in ws[1] if c.value}


def clone_row(ws, src, dst, keep_values=False):
    """Copie styles et formules (traduites) de src vers dst ; vide les valeurs saisies."""
    for c in range(1, ws.max_column + 1):
        s = ws.cell(src, c)
        d = ws.cell(dst, c)
        d._style = copy(s._style)
        v = s.value
        if isinstance(v, str) and v.startswith('='):
            d.value = Translator(v, origin=s.coordinate).translate_formula(d.coordinate)
        else:
            d.value = v if keep_values else None


# ------------------------------------------------------------------ lecture des relevés
def read_bag():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data/bag/*.txt'))):
        lines = [l.rstrip('\n') for l in open(f, encoding='utf-8') if l.strip()]
        head = lines[0].lstrip('# ').split('|')
        sid, url, addr = head[0].split()[0], head[1].strip(), head[2].strip()
        sessions = []
        for l in lines[1:]:
            t, s, e, p, a, pl = l.split('|')
            d = lambda x: dt.datetime.strptime(x, '%d/%m/%Y')
            sessions.append(dict(title=t.strip(), start=d(s), end=d(e), price=float(p) if p else None,
                                 arrhes=float(a) if a else None, places=int(pl) if pl else None))
        out.append(dict(id=sid, name=' '.join(head[0].split()[1:]), url=url, addr=addr, sessions=sessions, file=os.path.basename(f)))
    return out


NEW_SCHOOLS = [
    # id, nom, adresse, CP, ville, lat, lon, site
    ('S329', 'Wayup Parapente', '371 route de la gare', '74210', 'Doussard', 45.7897, 6.2117, 'https://wayup-parapente.bookandglide.com/'),
    ('S330', 'Sur Un Nuage', '1950 route des Miaz', '74700', 'Cordon', 45.9425, 6.5667, 'https://sur-un-nuage.bookandglide.com/'),
    ('S331', 'Wing Over Chamonix', '451 avenue de l’Aiguille du Midi', '74400', 'Chamonix-Mont-Blanc', 45.9237, 6.8694, 'https://wingoverchamonix.bookandglide.com/'),
    ('S332', 'EPiC – École de Parapente de Chambéry', None, '73000', 'Chambéry', 45.5646, 5.9178, 'https://chamberyparapente.bookandglide.com/'),
    ('S333', 'Les Hirondailes', '64 place du Gros Tilleul', '74340', 'Samoëns', 46.0833, 6.7167, 'https://leshirondailes.bookandglide.com/'),
]
ID_BY_KEY = {'wayup': 'S329', 'sur-un-nuage': 'S330'}

hE, hS, hT, hC = hdr(wsE), hdr(wsS), hdr(wsT), hdr(wsC)

# ------------------------------------------------------------------ nouvelles écoles
nextE = wsE.max_row + 1
tmplE = wsE.max_row  # S328
slug_ok = lambda n: re.sub(r'[^a-z0-9]+', '-', norm(n)).strip('-')
for sid, nom, adr, cp, ville, lat, lon, site in NEW_SCHOOLS:
    r = nextE
    clone_row(wsE, tmplE, r)
    vals = {'ID école': sid, 'Nom': nom, 'Statut publication': 'Brouillon', 'Adresse': adr, 'Code postal': cp, 'Ville': ville,
            'Latitude': lat, 'Longitude': lon, 'Site officiel': site, 'Page source du site': site,
            'Mode de réservation': 'Lien école', 'Accepte les bons': 'À confirmer', 'Mis en avant': 'Non',
            'Statut identité': 'À confirmer', 'Slug (URL)': slug_ok(nom), 'Rédaction (statut)': 'À rédiger',
            'Afficher le logo (Oui / Non)': 'Non', 'Logo validé pour publication': 'Non',
            'État de la collecte': 'École repérée sur BookAndGlide (14/11/2026) ; à confirmer sur le site officiel',
            'Champs à compléter': 'site officiel ; email ; logo ; baptêmes' + ('' if adr else ' ; adresse exacte')}
    for k, v in vals.items():
        if v is not None:
            wsE.cell(r, hE[k]).value = v
    nextE += 1
wsE.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsE.max_column)}{wsE.max_row}"

# ------------------------------------------------------------------ offres existantes par école
offers = collections.defaultdict(list)  # id école -> [(row, formule, prix, durée)]
for r in range(2, wsS.max_row + 1):
    sid = wsS.cell(r, 2).value
    if sid:
        offers[sid].append((r, wsS.cell(r, 4).value, wsS.cell(r, 5).value, wsS.cell(r, 11).value, wsS.cell(r, 1).value))

LEVELS = [  # (regex, niveau normalisé)
    (r'siv|pilotage|speedriding', 'SIV et pilotage'),
    (r'marche|hike|voyage|espagne|andalousie|dolomites|ardeche|aragon|alpes du sud|italie|itin', 'Marche et vol, séjours et voyages'),
    (r'week.?end vols|reprise|gessien|journee vol', 'Vols encadrés et séances'),
    (r'thermique|cross|xc|perf|ippi|suivre le vent|evasion|handi', 'Perfectionnement, thermique et cross'),
    (r'progression|prog|autonomie|potentiels|cycle 2', 'Progression et autonomie'),
    (r'initiation|init|beginner|decouverte|cycle 1|basse saison', 'Initiation'),
]
def level_of(t):
    n = norm(t)
    for rx, lv in LEVELS:
        if re.search(rx, n):
            return lv
    return 'À classer'

# tableau de correspondance titre BookAndGlide -> offre existante (Virevolte, offres relevées sur virevolte.net)
MANUAL = {
    ('S318', 'stage initiation'): 'OFF-B2213E485DB1', ('S318', 'stage perfectionnement'): 'OFF-5E508C46E3F7',
    ('S318', 'stage initiation cross'): 'OFF-D061B3C59A48', ('S318', 'stage cross alpes'): 'OFF-C0EA1CF55704',
    ('S318', 'stage marche et vol cross'): 'OFF-7356B99C92DB', ('S318', 'stage initiation marche et vol'): 'OFF-08519889F054',
    ('S318', 'stage marche et vol thermique et itinerance'): 'OFF-A03A9BBF954E', ('S318', 'stage dolomites'): 'OFF-EDD9133E139E',
    ('S318', 'stage thermique espagne pension complete'): 'OFF-7C47955422CE', ('S318', 'stage cross espagne pension complete'): 'OFF-B401C022203D',
    ('S318', 'stage week end progression niveau 2'): 'OFF-D917A3826B54',
    ('S040', 'stage cycle 1'): 'OFF-R5-0DF6C4AE8499', ('S040', 'stage cycle 2'): 'OFF-R5-C12AC4E27B66',
    ('S040', 'stage decouverte'): 'OFF-R5-48F99D2594DD',
    ('S124', 'autonomie'): 'OFF-R5-CB25A13FA0F3', ('S124', 'progression'): 'OFF-R5-CE04F887BE79',
    ('S124', 'week end vols'): 'OFF-R5-4E92DB397122', ('S124', 'thermique'): 'OFF-R5-6910B5A7165B',
    ('S124', 'reprise d activite 1 jour de pente ecole week end vols'): 'OFF-R5-97E7AF928014',
    ('S125', 'initiation basse saison'): 'OFF-R3-594F13AD42D6', ('S125', 'progression 1 et 2 basse saison'): 'OFF-R3-92413322BA14',
    ('S309', 'initiation 5 jours'): 'OFF-R3-166E0836878C', ('S309', 'prog perf 5 jours'): 'OFF-R3-04EE75A0F8A4',
}
PRICE_RULES = {('S124', 'initiation'): lambda p: 'OFF-R5-073FEA4F1DCB' if p <= 650 else 'OFF-R5-BB8FC647F386'}

# sessions déjà présentes (dédoublonnage)
existing, pre_keys = set(), set()
PRE_COMPLETE = {'S213'}   # école déjà relevée en entier le 13/11 : on ne rajoute que ce qui manque
for r in range(2, wsT.max_row + 1):
    if wsT.cell(r, 2).value:
        existing.add((wsT.cell(r, 2).value, wsT.cell(r, 6).value, wsT.cell(r, 7).value, wsT.cell(r, 10).value, wsT.cell(r, 4).value))
        pre_keys.add((wsT.cell(r, 2).value, wsT.cell(r, 6).value, wsT.cell(r, 7).value, wsT.cell(r, 10).value))
last_sess = max(r for r in range(2, wsT.max_row + 1) if wsT.cell(r, 1).value)
nextT = last_sess + 1
nextS = wsS.max_row + 1
TMPL_S, TMPL_T = 432, 363
added = collections.Counter(); created_offers = collections.Counter(); skipped = collections.Counter()

def mk_offer(sid, title, ss, url):
    global nextS
    prices = sorted({s['price'] for s in ss if s['price']})
    days = collections.Counter((s['end'] - s['start']).days + 1 for s in ss).most_common(1)[0][0]
    oid = 'OFF-BAG-' + hashlib.md5(f'{sid}|{title}'.encode()).hexdigest()[:12].upper()
    r = nextS
    clone_row(wsS, TMPL_S, r)
    v = {'ID offre': oid, 'ID école': sid, 'Formule': title, 'Prix publié (€)': prices[0] if prices else None,
         'Prix maximum publié (€)': prices[-1] if len(prices) > 1 else None,
         'Nature du prix': 'À partir de' if len(prices) > 1 else 'Prix publié',
         'Unité (texte source)': 'Par personne pour la formule', 'Unité (code)': 'PERSONNE',
         'Durée min': days, 'Durée max': days, 'Unité de durée': 'jour', 'Durée (texte source)': f'{days} jour' + ('s' if days > 1 else ''),
         'Niveau / prérequis': None, 'URL source': url, 'URL réservation': url,
         'Niveau de vérification': 'Prix et durée relus sur source officielle', 'Date du relevé': TODAY, 'Statut': 'Actif',
         'Niveau (normalisé)': level_of(title), 'Niveau relu ?': 'Non',
         'Réserves / informations manquantes': 'Inclusions, âge, poids et conditions à détailler (calendrier BookAndGlide)'}
    for k, val in v.items():
        if val is not None:
            wsS.cell(r, hS[k]).value = val
    nextS += 1
    offers[sid].append((r, title, prices[0] if prices else None, days, oid))
    created_offers[sid] += 1
    return oid


def find_offer(sid, title, price=None):
    nt = norm(title)
    if (sid, nt) in PRICE_RULES and price:
        return PRICE_RULES[(sid, nt)](price)
    if (sid, nt) in MANUAL:
        return MANUAL[(sid, nt)]
    for row, f, p, d, oid in offers[sid]:
        if norm(f) == nt or norm(f) == norm('Stage ' + title) or norm('Stage ' + f) == nt:
            return oid
    return None


bag = read_bag()
for sch in bag:
    sid = sch['id']
    if sid == 'NEW':
        pass
    by_title = collections.defaultdict(list)
    for s in sch['sessions']:
        by_title[s['title']].append(s)
    for title, ss in by_title.items():
        todo = []
        for s_ in ss:
            if not s_['price']:
                skipped[sid] += 1
                continue
            if sid in PRE_COMPLETE and (sid, s_['start'], s_['end'], s_['price']) in pre_keys:
                skipped[sid] += 1
                continue
            todo.append(s_)
        if not todo:
            continue
        oid_fixed = find_offer(sid, title)
        for s in todo:
            oid = find_offer(sid, title, s['price'])
            if not oid:
                oid = mk_offer(sid, title, todo, sch['url'])
            key = (sid, s['start'], s['end'], s['price'], oid)
            if key in existing:
                skipped[sid] += 1
                continue
            existing.add(key)
            r = nextT
            clone_row(wsT, TMPL_T, r)
            sesid = 'SES-BAG-' + hashlib.md5(f"{sid}|{title}|{s['start']:%Y%m%d}|{s['end']:%Y%m%d}|{s['price']}".encode()).hexdigest()[:12].upper()
            full = (s['places'] == 0)
            rem = f"Arrhes : {s['arrhes']:.0f} €" if s['arrhes'] else ''
            if re.search(r'espagne|andalousie|dolomites|ardeche|aragon|italie|alpes du sud', norm(title)):
                rem = (rem + ' · ' if rem else '') + 'Destination hors site de l’école : voir le détail sur la page de l’école'
            vals = {'ID session': sesid, 'ID école': sid, 'ID offre stage': oid, 'Début': s['start'], 'Fin': s['end'],
                    'Prix session (€)': int(s['price']) if s['price'] == int(s['price']) else s['price'],
                    'Places restantes': s['places'] if s['places'] is not None else 'Non publié',
                    'Statut': 'Complet' if full else 'Actif', 'Source (URL)': sch['url'], 'Vérifié le': TODAY,
                    'Remarque': rem or None}
            for k, val in vals.items():
                if val is not None:
                    wsT.cell(r, hT[k]).value = val
            nextT += 1
            added[sid] += 1
wsT.auto_filter.ref = f"A1:AB{max(nextT - 1, 501)}"
wsS.auto_filter.ref = f"A1:BB{wsS.max_row}"


# ------------------------------------------------------------------ offres relevées sur les pages des écoles (data/research_offers.py)
sys.path.insert(0, os.path.join(ROOT, 'data'))
import importlib; research = importlib.import_module('research_offers').R
hB = hdr(wsB)
site_of = {wsE.cell(r, 1).value: wsE.cell(r, hE['Site officiel']).value for r in range(2, wsE.max_row + 1)}
nextB = wsB.max_row + 1
TMPL_B = wsB.max_row
res_n = collections.Counter()
for kind, sid, formule, prix, nature, dmin, dmax, lieu, age, poids, resa, url, urlr, note in research:
    url = url or site_of.get(sid); urlr = urlr or url
    oid = 'OFF-WEB-' + hashlib.md5(f'{sid}|{kind}|{formule}'.encode()).hexdigest()[:12].upper()
    if kind == 'B':
        r = nextB; clone_row(wsB, TMPL_B, r); nextB += 1
        v = {'ID offre': oid, 'ID école': sid, 'Formule': formule, 'Prix publié (€)': prix, 'Nature du prix': nature if prix else 'Tarif non relevé',
             'Unité (texte source)': 'Par personne', 'Unité (code)': 'PERSONNE', 'Durée du vol min (min)': dmin, 'Durée du vol max (min)': dmax,
             'Nature de la durée': ('plage annoncée' if dmin != dmax else 'durée annoncée') if dmin else None,
             'Durée (texte source)': (f'{dmin} à {dmax} min' if dmin != dmax else f'{dmin} min') if dmin else None,
             'Lieu / décollage': lieu, 'Âge': age, 'Poids': poids, 'Options et suppléments': note if note and 'Option' in note else None,
             'Réserves / informations manquantes': note if note and 'Option' not in note else None, 'URL source': url, 'URL réservation': urlr,
             'Modalités de réservation': resa, 'Niveau de vérification': 'Prix et durée relus sur source officielle' if prix else 'Site officiel relu',
             'Date du relevé': TODAY, 'Statut': 'Actif', 'Rédaction (statut)': None}
        ws, hh = wsB, hB
    else:
        r = nextS; clone_row(wsS, TMPL_S, r); nextS += 1
        v = {'ID offre': oid, 'ID école': sid, 'Formule': formule, 'Prix publié (€)': prix, 'Nature du prix': nature if prix else 'Tarif non relevé',
             'Unité (texte source)': 'Par personne pour la formule', 'Unité (code)': 'PERSONNE', 'Durée min': dmin, 'Durée max': dmax, 'Unité de durée': 'jour',
             'Durée (texte source)': f'{dmin} jours', 'URL source': url, 'URL réservation': urlr, 'Niveau de vérification': 'Site officiel relu',
             'Date du relevé': TODAY, 'Statut': 'Actif', 'Niveau (normalisé)': level_of(formule), 'Niveau relu ?': 'Non',
             'Réserves / informations manquantes': note}
        ws, hh = wsS, hS
    for k, val in v.items():
        if val is not None and k in hh:
            ws.cell(r, hh[k]).value = val
    res_n[sid] += 1
wsB.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsB.max_column)}{wsB.max_row}"
wsS.auto_filter.ref = f"A1:BB{wsS.max_row}"
print('offres relevées sur les sites', dict(res_n), sum(res_n.values()))

# ------------------------------------------------------------------ sources de collecte
src_rows = {wsC.cell(r, 1).value: r for r in range(2, wsC.max_row + 1) if wsC.cell(r, 1).value and wsC.cell(r, 3).value == 'BookAndGlide'}
def set_source(sid, url, found, note, contact=None):
    r = src_rows.get(sid)
    if r is None:
        r = wsC.max_row + 1
        clone_row(wsC, 2, r)
        wsC.cell(r, hC['ID école']).value = sid
        src_rows[sid] = r
    wsC.cell(r, hC['Canal de collecte']).value = 'BookAndGlide'
    wsC.cell(r, hC['Adresse du flux ou de la page à lire']).value = url
    wsC.cell(r, hC['Fréquence de contrôle']).value = 'Hebdomadaire'
    wsC.cell(r, hC['Dernier contrôle']).value = TODAY
    wsC.cell(r, hC['Résultat du dernier contrôle']).value = note
    wsC.cell(r, hC['Sessions trouvées']).value = found
    if contact and not wsC.cell(r, hC['Contact école pour les dates']).value:
        wsC.cell(r, hC['Contact école pour les dates']).value = contact

for sch in bag:
    n = sum(1 for s in sch['sessions'] if s['price'])
    set_source(sch['id'], sch['url'], n, f'{n} sessions publiques à venir (relevé 14/11/2026)')
# écoles BookAndGlide relevées sans session publique
for sid, url in [('S332', 'https://chamberyparapente.bookandglide.com/stages'), ('S333', 'https://leshirondailes.bookandglide.com/stages'),
                 ('S217', 'https://montlambairparapente.bookandglide.com/stages')]:
    set_source(sid, url, 0 if sid != 'S332' else 1, 'Aucune session publique à venir sur la page de réservation' if sid != 'S332' else '2 sessions publiques (dont 1 complète), relevé 14/11/2026')
for sid, url in [('S028', 'https://aerotrek.bookandglide.com/'), ('S068', 'https://altitude-parapente-annecy.bookandglide.com/'),
                 ('S036', 'https://parapente-2alpes.bookandglide.com/'), ('S151', 'https://fly-tandem.bookandglide.com/'),
                 ('S181', 'https://jokair-parapente.bookandglide.com/'), ('S331', 'https://wingoverchamonix.bookandglide.com/')]:
    set_source(sid, url, 0, 'Page de réservation BookAndGlide repérée : biplaces et bons cadeaux sans tarif affiché, pas de calendrier de stages')
wsC.auto_filter.ref = f"A1:J{wsC.max_row}"

# ------------------------------------------------------------------ présentations
desc_n = 0
descs = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'data/descriptions/*.json'))):
    descs.update(json.load(open(f, encoding='utf-8')))
for f in sorted(glob.glob(os.path.join(ROOT, 'data/descriptions/*.txt'))):
    for line in open(f, encoding='utf-8'):
        if '\t' in line:
            k, t = line.rstrip('\n').split('\t', 1)
            descs[k] = t
rowE = {wsE.cell(r, 1).value: r for r in range(2, wsE.max_row + 1)}
for sid, txt in descs.items():
    r = rowE.get(sid)
    if r:
        wsE.cell(r, hE['Description (nos mots, 400 à 600 caractères)']).value = txt
        wsE.cell(r, hE['Rédaction (statut)']).value = 'Rédigé'
        desc_n += 1

wb.save(DST)
print('sessions ajoutées', dict(added), sum(added.values()))
print('offres créées', dict(created_offers), sum(created_offers.values()))
print('ignorées (déjà présentes ou prix 0)', dict(skipped))
print('descriptions appliquées', desc_n)
