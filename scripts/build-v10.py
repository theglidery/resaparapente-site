#!/usr/bin/env python3
"""Construit le classeur V10 à partir du V9 : ajoute le périmètre Suisse romande (CH) et Belgique francophone (BE).

- colonnes « Pays (ISO) » (Écoles, Villes de recherche), « Prix publié (montant) » / « Prix maximum publié (montant) » (Baptêmes, Stages)
  et « Prix session (montant) » (Sessions), comme le prévoit docs/PAYS-ET-DOMAINES.md
- écoles, baptêmes, stages et villes de recherche de data/research_chbe.py
Usage : python3 scripts/build-v10.py data/resaparapente-base-ecoles-offres-v9.xlsx data/resaparapente-base-ecoles-offres-v10.xlsx
Ensuite : recalc.py (LibreOffice) pour remplir les formules, puis npm run data.
"""
import sys, os, re, hashlib, datetime as dt
from copy import copy
import openpyxl
from openpyxl.formula.translate import Translator
from openpyxl.worksheet.datavalidation import DataValidation

SRC, DST = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'data'))
import research_chbe as R

TODAY = dt.datetime(2026, 11, 14)
wb = openpyxl.load_workbook(SRC)
wsE, wsB, wsS, wsT, wsV = wb['Écoles'], wb['Baptêmes'], wb['Stages'], wb['Sessions'], wb['Villes de recherche']


def hdr(ws):
    return {c.value: c.column for c in ws[1] if c.value}


def clone_row(ws, src, dst):
    for c in range(1, ws.max_column + 1):
        s, d = ws.cell(src, c), ws.cell(dst, c)
        d._style = copy(s._style)
        v = s.value
        d.value = Translator(v, origin=s.coordinate).translate_formula(d.coordinate) if isinstance(v, str) and v.startswith('=') else None


def add_column(ws, title, like):
    """Ajoute une colonne de saisie à droite, avec l'en-tête et le style de la colonne « like »."""
    col = ws.max_column + 1
    ws.cell(1, col).value = title
    ws.cell(1, col)._style = copy(ws.cell(1, like)._style)
    ws.column_dimensions[openpyxl.utils.get_column_letter(col)].width = 18
    for r in range(2, ws.max_row + 1):
        ws.cell(r, col)._style = copy(ws.cell(r, like)._style)
    return col


# ------------------------------------------------------------------ colonnes pays et montants
hE0, hB0, hS0, hT0, hV0 = hdr(wsE), hdr(wsB), hdr(wsS), hdr(wsT), hdr(wsV)
if 'Pays (ISO)' not in hE0:
    c = add_column(wsE, 'Pays (ISO)', hE0['Code département'])
    for r in range(2, wsE.max_row + 1):
        if wsE.cell(r, 1).value:
            wsE.cell(r, c).value = 'FR'
    dv = DataValidation(type='list', formula1='"FR,CH,BE"', allow_blank=True)
    wsE.add_data_validation(dv); dv.add(f'{openpyxl.utils.get_column_letter(c)}2:{openpyxl.utils.get_column_letter(c)}1329')
if 'Pays (ISO)' not in hV0:
    c = add_column(wsV, 'Pays (ISO)', hV0['Code département'])
    for r in range(2, wsV.max_row + 1):
        if wsV.cell(r, 1).value:
            wsV.cell(r, c).value = 'FR'
for ws, names in ((wsB, ('Prix publié (montant)', 'Prix maximum publié (montant)')), (wsS, ('Prix publié (montant)', 'Prix maximum publié (montant)')),
                  (wsT, ('Prix session (montant)',))):
    h = hdr(ws)
    for n in names:
        if n not in h:
            add_column(ws, n, h.get('Prix publié (€)') or h.get('Prix session (€)'))
hE, hB, hS, hT, hV = hdr(wsE), hdr(wsB), hdr(wsS), hdr(wsT), hdr(wsV)

# ------------------------------------------------------------------ écoles
rowE = {wsE.cell(r, 1).value: r for r in range(2, wsE.max_row + 1)}
tmplE = wsE.max_row
slug = lambda n: re.sub(r'[^a-z0-9]+', '-', __import__('unicodedata').normalize('NFKD', n).encode('ascii', 'ignore').decode().lower()).strip('-')
n_sch = 0
for (sid, pays, nom, adr, cp, ville, code, nomreg, region, lat, lng, site, labels, langues, desc) in R.SCHOOLS:
    if sid in rowE:
        raise SystemExit(f'{sid} existe déjà')
    r = wsE.max_row + 1
    clone_row(wsE, tmplE, r)
    vals = {'ID école': sid, 'Pays (ISO)': pays, 'Nom': nom, 'Statut publication': 'Brouillon', 'Adresse': adr, 'Code postal': cp, 'Ville': ville,
            'Code département': code, 'Département': nomreg, 'Région': region, 'Latitude': lat, 'Longitude': lng,
            'Site officiel': site, 'Page source du site': site or None, 'Mode de réservation': 'Lien école', 'Accepte les bons': 'À confirmer',
            'Mis en avant': 'Non', 'Statut identité': 'À confirmer', 'Slug (URL)': slug(nom), 'Labels et agréments': labels, 'Langues parlées': langues,
            'Description (nos mots, 400 à 600 caractères)': desc, 'Rédaction (statut)': 'Rédigé',
            'Afficher le logo (Oui / Non)': 'Non', 'Logo validé pour publication': 'Non',
            'État de la collecte': 'Relevé sur la page officielle de l’école ou sur la fiche de l’office de tourisme (14/11/2026) ; à valider',
            'Champs à compléter': 'email ; logo ; photos' + ('' if site else ' ; site officiel') + ('' if adr else ' ; adresse exacte')}
    for k, v in vals.items():
        if v is not None:
            wsE.cell(r, hE[k]).value = v
    rowE[sid] = r
    n_sch += 1
for sid, other in (('S340', 'S341'), ('S341', 'S340')):   # même point de rendez-vous à Noville
    wsE.cell(rowE[sid], hE['Doublon possible']).value = f'Même point de rendez-vous que {other} (Noville) : à vérifier'
wsE.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsE.max_column)}{wsE.max_row}"

# ------------------------------------------------------------------ offres
tmplB, tmplS = wsB.max_row, wsS.max_row
PMAX = {('S350', 'Vol biplace'): 180}
n_off = {'B': 0, 'S': 0}
for kind, sid, formule, prix, nature, dmin, dmax, lieu, age, poids, resa, url, urlr, note, niveau in R.O:
    oid = f"OFF-{'CH' if sid < 'S352' else 'BE'}-" + hashlib.md5(f'{sid}|{kind}|{formule}'.encode()).hexdigest()[:12].upper()
    common = {'ID offre': oid, 'ID école': sid, 'Formule': formule, 'Prix publié (montant)': prix, 'Prix maximum publié (montant)': PMAX.get((sid, formule)),
              'Nature du prix': nature if prix is not None else 'Tarif non relevé', 'Unité (texte source)': 'Par personne', 'Unité (code)': 'PERSONNE',
              'URL source': url, 'URL réservation': urlr, 'Niveau de vérification': 'Prix et durée relus sur source officielle' if prix is not None else 'Site officiel relu',
              'Date du relevé': TODAY, 'Statut': 'Actif'}
    if kind == 'B':
        r = wsB.max_row + 1; clone_row(wsB, tmplB, r); ws, hh = wsB, hB
        common.update({'Durée du vol min (min)': dmin, 'Durée du vol max (min)': dmax,
                       'Nature de la durée': ('plage annoncée' if dmin != dmax else 'durée annoncée') if dmin else None,
                       'Durée (texte source)': (f'{dmin} à {dmax} min' if dmin != dmax else f'{dmin} min') if dmin else None,
                       'Lieu / décollage': lieu, 'Âge': age, 'Poids': poids, 'Modalités de réservation': resa,
                       'Options et suppléments': note if note and ('Option' in note or 'Photos' in note or 'Remontée' in note) else None,
                       'Réserves / informations manquantes': note if note and not ('Option' in note or 'Photos' in note or 'Remontée' in note) else None})
    else:
        r = wsS.max_row + 1; clone_row(wsS, tmplS, r); ws, hh = wsS, hS
        common.update({'Durée min': dmin, 'Durée max': dmax, 'Unité de durée': 'jour' if dmin else None,
                       'Durée (texte source)': f'{dmin} jour' + ('s' if dmin and dmin > 1 else '') if dmin else None,
                       'Niveau (normalisé)': niveau, 'Niveau relu ?': 'Non', 'Réserves / informations manquantes': note})
    for k, v in common.items():
        if v is not None and k in hh:
            ws.cell(r, hh[k]).value = v
    n_off[kind] += 1
wsB.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsB.max_column)}{wsB.max_row}"
wsS.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsS.max_column)}{wsS.max_row}"

# ------------------------------------------------------------------ villes de recherche
n_city = 0
for vid, ville, pays, code, region, lat, lng, rayon in R.CITIES:
    r = wsV.max_row + 1
    clone_row(wsV, 2, r)
    for k, v in {'ID ville': vid, 'Ville': ville, 'Pays (ISO)': pays, 'Code département': code, 'Région': region, 'Latitude': lat, 'Longitude': lng,
                 'Rayon par défaut (km)': rayon, 'Proposée dans la liste': 'Oui',
                 'Source des coordonnées': 'Approximatif (centre-ville, saisi à la main) : à vérifier'}.items():
        wsV.cell(r, hV[k]).value = v
    n_city += 1
wsV.auto_filter.ref = f"A1:{openpyxl.utils.get_column_letter(wsV.max_column)}{wsV.max_row}"

wb.save(DST)
print(f'écoles ajoutées {n_sch} ; offres ajoutées {n_off} ; villes ajoutées {n_city}')
long = [(s[0], len(s[-1])) for s in R.SCHOOLS if not 380 <= len(s[-1]) <= 640]
print('descriptions hors 380–640 caractères :', long)
