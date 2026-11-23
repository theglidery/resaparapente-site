"""Export the master workbook (v8) to the JSON files used by the site.
Usage: python3 scripts/export-data.py data/resaparapente-base-ecoles-offres-v8.xlsx
Reads cached values for calculated display fields where present.
Re-evaluates publication rules when calculated cells have no cached value."""
import sys, json, re, unicodedata, datetime
from pathlib import Path
import openpyxl

src = sys.argv[1]
wb = openpyxl.load_workbook(src, data_only=True)

def clean(v):
    if v is None: return None
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime('%Y-%m-%d')
    if isinstance(v, float) and v.is_integer(): return int(v)
    if isinstance(v, str):
        v = v.strip()
        return v or None
    return v

def rows(name):
    ws = wb[name]
    it = ws.iter_rows(values_only=True)
    head = [str(h).strip() if h else None for h in next(it)]
    for r in it:
        d = {h: clean(c) for h, c in zip(head, r) if h}
        if any(v is not None for v in d.values()): yield d

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def num(v):
    try: return float(v)
    except: return None

def split(v):
    return [x.strip() for x in str(v).split(';') if x.strip()] if v else []

# Formula names that are trips or multi-day stays rather than a walk-and-fly outing.
TRAVEL_RE = re.compile(r"voyage|s[ée]jour|itin[ée]rant|nomade|migrateur|andalousie|maroc|corse|croatie|portugal|dolomites|r[ée]union|afrique|transdromoise|pyla|castelluccio|nord au sud", re.I)
LEVEL_KEYS = {r['Niveau (stage)']: r['Clé site'] for r in rows('Listes') if r.get('Niveau (stage)')}

LEVEL_ORDER = {r['Niveau (stage)']: r['Ordre niveau'] for r in rows('Listes') if r.get('Niveau (stage)')}

def orig_desc(v):
    """'Description originelle du site': an extract from the school's own site, then (last line) the page it comes from."""
    if not v: return None
    lines = [x.strip() for x in str(v).splitlines() if x.strip()]
    url = next((x for x in reversed(lines) if x.startswith('http')), None)
    text = ' '.join(x for x in lines if x != url).strip()
    return dict(text=text or None, url=url) if (text or url) else None

COUNTRY_CURRENCIES = {'FR': 'EUR', 'CH': 'CHF', 'BE': 'EUR'}
TEAM_EMAIL = 'contact@locawing.fr'   # requests for schools that cannot receive them directly go here, to be forwarded by hand

def spoken_languages(country, value):
    """Rule (Nov 2026): every school in France lists French and English, whatever the workbook says. Other countries: unchanged."""
    if country != 'FR': return value
    items = [x.strip().capitalize() for x in re.split(r'[;,]', str(value or '')) if x.strip()]
    ordered = ['Français', 'Anglais'] + [x for x in items if x not in ('Français', 'Anglais')]
    seen, out = set(), []
    for x in ordered:
        if x not in seen: seen.add(x); out.append(x)
    return ', '.join(out)


def country_code(row):
    code = str(row.get('Pays (ISO)') or 'FR').upper()
    if code not in COUNTRY_CURRENCIES:
        raise ValueError(f"Pays (ISO) invalide : {code}")
    return code

schools = {}
slugs = set()
for r in rows('Écoles'):
    sid = r['ID école']
    if not sid: continue
    country = country_code(r)
    slug = r.get('Slug (URL)') or slugify(r['Nom'])
    if sid in schools or (country, slug) in slugs:
        raise ValueError(f"Identifiant école ou slug en double : {sid} / {country}/{slug}")
    slugs.add((country, slug))
    schools[sid] = dict(
        id=sid, name=r['Nom'], slug=slug, country=country, currency=COUNTRY_CURRENCIES[country],
        desc=next((v for k, v in r.items() if k.startswith('Description (')), None),
        orig=orig_desc(r.get('Description originelle du site')),
        address=r['Adresse'], zip=r['Code postal'], city=r['Ville'], dept=r['Département'], deptCode=r['Code département'],
        region=r['Région'], lat=num(r['Latitude']), lng=num(r['Longitude']), website=r['Site officiel'],
        mode=r['Mode de réservation'] or 'Lien école', acceptsVouchers=r['Accepte les bons'], featured=(r['Mis en avant'] == 'Oui'),
        mainCity=r.get('Ville de recherche principale'), nearCities=split(r.get('Villes de recherche (jusqu’à 3)')),
        logoShow=(r.get('Afficher le logo (Oui / Non)') != 'Non'),   # shown whenever a logo file exists, unless set to Non
        photoMainId=r.get('Photo principale : ID bibliothèque'),
        photoExtraIds=split(r.get('Photos supplémentaires : IDs bibliothèque (3 max, séparés par ;)')),
        photoCredit=r.get('Crédit photo école'),
        # Optional columns (the data file may not have them yet): school video and ratings. A rating is published only with its source.
        googlePlaceId=(r.get('Google Place ID') or '').strip() or None,   # optional; the only Google data we may store (see docs/AVIS-ET-NOTES.md)
        video=(r.get('Vidéo (URL)') or '').strip() or None,
        rating=(dict(value=num(r.get('Note moyenne')), count=int(num(r.get('Nombre d’avis')) or 0), source=r.get('Source des avis'), url=r.get('URL des avis'))
                if num(r.get('Note moyenne')) and r.get('Source des avis') else None),
        fiche=dict(presentation=r.get('Présentation : votre école (histoire, label, ancienneté)'),
                   commandes=r.get('Présentation : aux commandes (équipe, pilotes)'),
                   appareil=r.get('Présentation : l’appareil (matériel, entretien)'),
                   labels=r.get('Labels et agréments'), langues=spoken_languages(country, r.get('Langues parlées')),
                   assurance=(r.get('Assurance RC pro vérifiée') == 'Oui')),
        giftRelay=(r.get('Relais des demandes de bon cadeau (Oui / Non / À confirmer)') or 'Oui'),
        baptemes=[], stages=[], sites=[], sessions=[],
    )

def apply_offer_currency(row, country):
    if country != 'FR':
        row['Prix publié (€)'] = num(row.get('Prix publié (montant)'))
        row['Prix maximum publié (€)'] = num(row.get('Prix maximum publié (montant)'))
        row['Prix par personne (€)'] = None
        row['Prix pour tri (€)'] = None
        row['Prix affiché'] = None

def offer(r, kind):
    keep = {
      'id': r['ID offre'], 'name': r['Formule'], 'price': r['Prix publié (€)'], 'priceMax': r['Prix maximum publié (€)'],
      'priceNature': r['Nature du prix'], 'unitCode': r['Unité (code)'], 'perPerson': r['Prix par personne (€)'],
      'sortPrice': r.get('Prix pour tri (€)'), 'manualOrder': r.get('Ordre d’affichage (manuel)'),
      'priceLabel': r['Prix affiché'], 'url': r['URL source'], 'bookUrl': r['URL réservation'], 'checked': r['Date du relevé'],
      'place': r.get('Lieu / décollage'), 'age': r.get('Âge'),
      'program': next((v for k, v in r.items() if k.startswith('Programme')), None),
      'included': r.get('Inclus'), 'notIncluded': r.get('Non compris'), 'level': r.get('Niveau / prérequis'),
      'voucherStatus': r['Bon école : statut'], 'voucherPrice': r['Bon école : prix (€)'],
    }
    keep['extra'] = dict(options=r.get('Options et suppléments'), equipment=r.get('Équipement'), cancel=r.get('Annulation / météo'),
                         common=r.get('Conditions communes'))
    if kind == 'bapteme':
        keep['extra'].update(timeTotal=r.get('Temps total à prévoir'))
        keep['fiche'] = dict(saison=r.get('Fiche : saison et jours d’ouverture'), participation=r.get('Fiche : conditions de participation'),
            temps=r.get('Fiche : temps à prévoir sur place'), tenue=r.get('Fiche : tenue et affaires à prévoir'),
            langues=r.get('Fiche : langues parlées'), savoir=r.get('Fiche : bon à savoir (lieu, sites)'),
            photos=r.get('Fiche : photos et vidéo incluses'), vol=r.get('Fiche : déroulé du vol (programme)'))
        keep.update(group=r.get('Groupe de formule'), durMin=r['Durée du vol min (min)'], durMax=r['Durée du vol max (min)'],
                    durText=r['Durée (texte source)'], period=r.get('Période / saison'), weight=r.get('Poids'))
        # Comparison fields (v11). Empty = unknown: the site says "à confirmer", never "non".
        keep['cmp'] = dict(
            photo=r.get('Photo / vidéo : statut') or 'À confirmer', photoPrice=num(r.get('Photo et vidéo (supplément)')),
            lift=r.get('Remontée : inclusion'), liftPrice=num(r.get('Remontée : montant à ajouter (montant)')),
            mandatory=num(r.get('Supplément obligatoire connu (montant)')), mandatoryNature=r.get('Nature du supplément obligatoire'),
            total=num(r.get('Prix total estimé par personne (montant)')), todo=r.get('Total : ce qui reste à confirmer'),
            profiles=split(r.get('Profil conseillé (séparer par ;)')), profilesChecked=(r.get('Profil : relu ?') == 'Oui'),
            langs=[x.lower() for x in split(r.get('Langue du vol (confirmée)'))], access=r.get('Accessibilité (confirmée)'),
            totalTime=num(r.get('Temps total sur place (min)')), rule=r.get('Règle ou condition du tarif'))
    else:
        keep['fiche'] = dict(saison=r.get('Fiche : saison et dates'), participation=r.get('Fiche : conditions de participation'),
            apporter=r.get('Fiche : à apporter (équipement perso)'), hebergement=r.get('Fiche : hébergement et repas'),
            savoir=r.get('Fiche : bon à savoir (lieu, sites)'), programme=r.get('Fiche : programme détaillé jour par jour'))
        lvl = r.get('Niveau (normalisé)') or 'À classer'
        lkey, lorder = LEVEL_KEYS.get(lvl, 'autre'), r.get('Ordre niveau') or LEVEL_ORDER.get(lvl, 8)
        if lkey == 'marche-vol':
            # The workbook groups "Marche et vol, séjours et voyages"; the site shows two types (rule on the formula name).
            if TRAVEL_RE.search(str(r.get('Formule') or '')): lkey, lvl, lorder = 'voyage', 'Séjours et voyages', 8
            else: lvl = 'Marche et vol'
        elif lkey == 'autre': lorder = 9
        keep.update(levelName=lvl, levelKey=lkey, levelOrder=lorder,
                    durMin=r['Durée min'], durMax=r['Durée max'], durUnit=r['Unité de durée'], durText=r['Durée (texte source)'],
                    flights=r.get('Nombre de vols'), group=r.get('Participants / effectif'), period=r.get('Période / dates (texte)'))
        keep['cmp'] = dict(
            flightsMax=num(r.get('Nombre maximal de vols inclus')), budget=r.get('Conditions du budget annoncé'), rateType=r.get('Type de tarif / unité'),
            validity=num(r.get('Validité du forfait (mois)')), mandatory=num(r.get('Supplément obligatoire connu (montant)')),
            mandatoryNature=r.get('Nature du supplément obligatoire'), minimum=num(r.get('Minimum chiffré (prix + supplément identifié)')),
            langs=[x.lower() for x in split(r.get('Langue du stage (confirmée)'))])
    return keep

UNITS = {r.get('Unité : code'): r for r in rows('Listes') if r.get('Unité : code')}

def publish_offer(r):
    decision = r.get('Décision publication (manuel)')
    if decision == 'Bloquer':
        return False
    if not (r.get('ID offre') and r.get('Formule') and r.get('Statut')):
        return False
    if decision == 'Forcer':
        return True
    if r.get('Statut') != 'Actif':
        return False
    contradictory = (r.get('Contradiction détectée') or '').strip().lower() == 'oui'
    return not contradictory and not r.get('Contrôles bloquants')

def hydrate_price(r, currency):
    symbol = "€" if currency == "EUR" else currency
    code, price = r.get('Unité (code)'), num(r.get('Prix publié (€)'))
    unit = UNITS.get(code, {})
    divisor = num(unit.get('Diviseur (personnes)'))
    nature = r.get('Nature du prix') or ''
    if r.get('Prix par personne (€)') is None and price is not None and divisor and nature in ('Prix publié', 'Variante exacte'):
        r['Prix par personne (€)'] = price / divisor
    if r.get('Prix pour tri (€)') is None:
        r['Prix pour tri (€)'] = r.get('Prix par personne (€)') if code != 'PERSONNE' else price
    if not r.get('Prix affiché'):
        if code == 'DEVIS' or price is None or code == 'A_CONFIRMER':
            r['Prix affiché'] = 'Sur devis' if code == 'DEVIS' else 'Prix à confirmer'
        else:
            prefix = 'À partir de ' if nature.startswith('À partir de') else ''
            r['Prix affiché'] = f'{prefix}{price:g} {symbol}{unit.get("Suffixe affiché") or ""}'

stats = {'bapteme': 0, 'stage': 0}
for kind, sheet, key in (('bapteme', 'Baptêmes', 'baptemes'), ('stage', 'Stages', 'stages')):
    for r in rows(sheet):
        if not publish_offer(r): continue
        s = schools.get(r['ID école'])
        if not s: continue
        apply_offer_currency(r, s['country'])
        hydrate_price(r, s['currency'])
        s[key].append(offer(r, kind)); stats[kind] += 1

for r in rows('Sites de vol'):
    s = schools.get(r['ID école'])
    if s: s['sites'].append({'name': r['Nom du site de vol'], 'status': r['Statut']})

stage_by_id = {o['id']: (s['id'], o) for s in schools.values() for o in s['stages']}
sessions = []
for r in rows('Sessions'):
    if not r.get('ID session') or r.get('Statut') not in ('Actif', 'Complet') or not r.get('Début') or not r.get('Fin'): continue
    s = schools.get(r['ID école'])
    stage = stage_by_id.get(r.get('ID offre stage'))
    if not s or not stage or stage[0] != s['id'] or r['Fin'] < r['Début']: continue
    o = stage[1]
    price = r['Prix session (€)'] if s['country'] == 'FR' else num(r.get('Prix session (montant)'))
    currency_label = '€' if s['currency'] == 'EUR' else s['currency']
    days = (datetime.date.fromisoformat(r['Fin']) - datetime.date.fromisoformat(r['Début'])).days + 1
    sessions.append(dict(id=r['ID session'], schoolId=s['id'], school=s['name'], slug=s['slug'], offerId=r['ID offre stage'],
        name=o['name'], start=r['Début'], end=r['Fin'], days=days, price=price, places=num(r.get('Places restantes')),
        priceLabel=(f"{price:g} {currency_label}" if price is not None else o['priceLabel']), status=r['Statut'], visible=True, source=r['Source (URL)'], checked=r['Vérifié le'],
        fresh=r['Fraîcheur'],
        # the calendar filters on where the course takes place, not on the school's own town
        city=r.get('Lieu du stage (ville)') or s['city'], dept=r.get('Département (lieu)') or s['dept'],
        region=r.get('Région (lieu)') or s['region'],
        lat=num(r.get('Latitude (lieu)')) or s['lat'], lng=num(r.get('Longitude (lieu)')) or s['lng'], note=r['Remarque']))
    s['sessions'].append(sessions[-1]['id'])

cities = [dict(name=r['Ville'], country=country_code(r), dept=r['Code département'], region=r['Région'], lat=num(r['Latitude']), lng=num(r['Longitude']), radius=r.get('Rayon par défaut (km)') or 50)
          for r in rows('Villes de recherche') if r.get('Proposée dans la liste') == 'Oui']

photos = [dict(id=r['ID photo'], file=r['Fichier (dossier public/images/library/)'], type=r['Type'], place=r['Région ou lieu'],
               alt=r['Texte alternatif (décrit la scène)'], credit=r['Auteur / crédit'], licence=r['Licence'], defaultFor=r.get('Utilisée comme photo par défaut pour'))
          for r in rows('Bibliothèque photos')
          if r.get('ID photo') and r['ID photo'] != 'PH-EXEMPLE' and r.get('Statut') == 'Prête' and r.get('Licence vérifiée le')]

# School-own gift vouchers (sheet "Bons cadeaux écoles"): published only when status = "Vérifié – publiable",
# with a direct link and a check date. The site only links to the school's own sales page.
gifts = []
for r in rows('Bons cadeaux écoles'):
    s = schools.get(r.get('ID école'))
    if not s or r.get('Statut') != 'Vérifié – publiable' or not r.get('Lien direct vers la vente chez l’école') or not r.get('Date de vérification du lien'): continue
    gifts.append(dict(id=r['ID bon'], schoolId=s['id'], name=r.get('Nom du bon (tel que l’école le nomme)'), url=r['Lien direct vers la vente chez l’école'],
        source=r.get('Page où l’école annonce ce bon (source)'), checked=r.get('Date de vérification du lien'), kind=r.get('Formule couverte'),
        formulas=r.get('Formules citées par l’école'), price=num(r.get('Prix TTC (€) (vide si incertain : l’école l’affiche)')),
        validity=num(r.get('Validité (mois)')), conditions=r.get('Conditions essentielles')))

# Partner promotions (sheet "Promotions écoles"): exported when validated by the school; the site hides them outside start..end.
promos = []
for r in rows('Promotions écoles'):
    s = schools.get(r.get('ID école'))
    if not s or r.get('Statut') != 'Validée par l’école': continue
    if not (num(r.get('Prix promotionnel TTC (€)')) and r.get('Début') and r.get('Fin') and r.get('Validée par l’école le (date)')): continue
    promos.append(dict(id=r['ID promotion'], schoolId=s['id'], offerId=r.get('ID offre concernée (Baptêmes ou Stages, facultatif)'),
        title=r.get('Intitulé de la promotion'), price=num(r['Prix promotionnel TTC (€)']), regular=num(r.get('Prix habituel TTC (€)')),
        start=r['Début'], end=r['Fin'], conditions=r.get('Conditions essentielles'), url=r.get('Lien vers l’offre sur le site de l’école') or s['website']))

# Customer reviews (optional sheet "Avis"): only rows with Statut = "Publié", a rating 1-5, a text and a publication date.
reviews = []
if 'Avis' in wb.sheetnames:
    for r in rows('Avis'):
        sc = schools.get(r.get('ID école'))
        n = num(r.get('Note (1 à 5)'))
        if not sc or r.get('Statut') != 'Publié' or not n or not (1 <= n <= 5) or not r.get('Texte') or not r.get('Date de publication'): continue
        reviews.append(dict(id=r.get('ID avis'), schoolId=sc['id'], rating=int(round(n)), title=r.get('Titre'), text=r['Texte'], author=r.get('Prénom affiché') or 'Participant',
            kind=r.get('Formule'), experience=r.get('Date de l’expérience (mois)'), published=r['Date de publication'],
            verified=(r.get('Vérification') == 'Demande vérifiée'), reply=r.get('Réponse de l’école'), replyDate=r.get('Date de la réponse')))
reviews.sort(key=lambda x: x['published'], reverse=True)
json.dump(reviews, open('src/data/reviews.json', 'w'), ensure_ascii=False, indent=1)
print('reviews published', len(reviews))

# Full path to the licence (sheet "Parcours brevet"): published when status = "Vérifié – publiable" (formula column Publiable).
parcours = []
for r in rows('Parcours brevet'):
    sc = schools.get(r.get('ID école'))
    if not sc or r.get('Publiable') != 'Oui': continue
    parcours.append(dict(id=r['ID parcours'], schoolId=sc['id'], country=sc['country'], currency=sc['currency'], name=r['Nom du parcours'],
        licence=r.get('Brevet visé'), flights=num(r.get('Nombre de vols visé')), price=num(r.get('Prix du parcours chez l’école (montant)')),
        material=r.get('Matériel personnel compris dans le prix ? (Oui / Non / Partiel / À confirmer)'), covers=r.get('Ce que couvre ce prix'),
        suppElsewhere=num(r.get('Supplément si matériel acheté hors école (montant)')), other=num(r.get('Autre supplément possible (montant)')),
        otherNature=r.get('Nature de cet autre supplément'), exams=num(r.get('Examens fédération (montant)')),
        fees=num(r.get('Autres frais obligatoires connus (montant)')), feesNature=r.get('Nature de ces frais'), remains=r.get('Reste à prévoir (matériel, remontées, transports…)'),
        total=num(r.get('Total école + frais connus (montant)')), totalElsewhere=num(r.get('Total si matériel acheté hors école (montant)')),
        validity=num(r.get('Validité du forfait (mois)')), duration=r.get('Durée habituelle'), url=r['URL source'], checked=r['Date du relevé'],
        offerId=r.get('ID offre stage source'), note=r.get('Remarque')))
json.dump(parcours, open('src/data/parcours.json', 'w'), ensure_ascii=False, indent=1)

# Federation fees by country (exams, licence, insurance): shown next to the path totals.
fees = [dict(country=r['Pays (ISO)'], body=r.get('Organisme'), item=r['Poste'], group=r.get('Groupe'), amount=num(r.get('Montant')), currency=r.get('Devise ISO'),
             period=r.get('Périodicité'), applies=r.get('S’applique à'), source=r.get('Source (URL)'), checked=r.get('Date de vérification'), status=r.get('Statut'), note=r.get('Remarque'))
        for r in rows('Frais fédéraux') if r.get('Poste') and r.get('Statut') in ('Vérifié – publiable', 'Relevé à relire') and num(r.get('Montant')) is not None]
json.dump(fees, open('src/data/fees.json', 'w'), ensure_ascii=False, indent=1)

# Working assumptions for the step-based cost-to-licence estimate (FR / CH / BE): editable by the visitor on the page.
assumptions = [dict(country=r['Pays (ISO)'], step=r.get('Étape'), key=r.get('Clé site (niveau du stage)'), defaultStages=num(r.get('Nombre de stages par défaut')),
                    maxStages=num(r.get('Maximum proposé')), daysMin=num(r.get('Durée de référence (jours, min)')), daysMax=num(r.get('Durée de référence (jours, max)')),
                    status=r.get('Statut'), note=r.get('Justification'))
               for r in rows('Hypothèses parcours') if r.get('Pays (ISO)') and r.get('Clé site (niveau du stage)')]
json.dump(assumptions, open('src/data/assumptions.json', 'w'), ensure_ascii=False, indent=1)

# Goodies offered on the confirmation page (discount of a few euros on an item of the TheGlidery shops).
goodies = [dict(id=r['ID goodie'], name=r['Nom'], for_=r.get('Pour'), shop=r.get('Boutique'), countries=split(r.get('Pays où on le propose')), url=r.get('URL du produit'),
                price=num(r.get('Prix catalogue (€)')), discount=num(r.get('Remise (€)')), final=num(r.get('Prix après remise (€)')), shipping=num(r.get('Frais de port (€)')),
                delivered=num(r.get('Prix livré après remise (€)')), code=r.get('Code promo'), note=r.get('Remarque'))
           for r in rows('Goodies') if r.get('Statut') == 'Prêt' and r.get('URL du produit')]
json.dump(goodies, open('src/data/goodies.json', 'w'), ensure_ascii=False, indent=1)

generic = {r['Clé']: r['Texte (modifiable)'] for r in rows('Textes génériques') if r.get('Clé') and r.get('Texte (modifiable)')}
json.dump(generic, open('src/data/generic.json', 'w'), ensure_ascii=False, indent=1)
out = list(schools.values())
json.dump(out, open('src/data/schools.json', 'w'), ensure_ascii=False, indent=1)
json.dump(sessions, open('src/data/sessions.json', 'w'), ensure_ascii=False, indent=1)
json.dump(gifts, open('src/data/gifts.json', 'w'), ensure_ascii=False, indent=1)
json.dump(promos, open('src/data/promos.json', 'w'), ensure_ascii=False, indent=1)
json.dump(cities, open('src/data/cities.json', 'w'), ensure_ascii=False, indent=1)
json.dump(photos, open('src/data/photos.json', 'w'), ensure_ascii=False, indent=1)
# The recipient directory is bundled with the Pages Function and is never a public asset.
recipients = {}
for r in rows('Écoles'):
    school = schools.get(r.get('ID école'))
    email = r.get('Email professionnel') or ''
    if not school: continue
    entries = {o['id']: [kind, o['name']] for kind, offers in
               [('bapteme', school['baptemes']), ('stage', school['stages'])] for o in offers}
    if not entries: continue
    ok = isinstance(email, str) and re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email)
    recipients[school['id']] = dict(name=school['name'], email=email if ok else TEAM_EMAIL, offers=entries,
                                    country=school['country'], route='school' if ok else 'team')
gift_dir = {}
valid_email = lambda e: isinstance(e, str) and re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', e)
for r in rows('Écoles'):
    school = schools.get(r.get('ID école'))
    if not school: continue
    email = r.get('Email des demandes de bon cadeau (vide = email professionnel)') or r.get('Email professionnel') or ''
    if school['giftRelay'] != 'Non' and valid_email(email):
        gift_dir[school['id']] = dict(name=school['name'], email=email, relay=school['giftRelay'], country=school['country'], route='school')
# A school that cannot receive a relayed request (no usable email, relay to confirm, or relay refused) is still offered in the gift form:
# the request goes to the team mailbox with every detail, and the team forwards it by hand.
for sc in schools.values():
    if sc['id'] in gift_dir:
        sc['giftRoute'] = 'school'
    else:
        gift_dir[sc['id']] = dict(name=sc['name'], email=TEAM_EMAIL, relay=sc['giftRelay'], country=sc['country'], route='team')
        sc['giftRoute'] = 'team'
        if sc['giftRelay'] != 'Non': sc['giftRelay'] = 'Sans email'
json.dump(list(schools.values()), open('src/data/schools.json', 'w'), ensure_ascii=False, indent=1)
Path('server').mkdir(exist_ok=True)
Path('server/gift-directory.json').write_text(json.dumps(gift_dir, ensure_ascii=False, indent=1), encoding='utf-8')
Path('server/booking-directory.json').write_text(json.dumps(recipients, ensure_ascii=False, indent=1), encoding='utf-8')
Path('src/data/booking-schools.json').write_text(json.dumps(sorted(recipients)), encoding='utf-8')
print('schools', len(out), 'publishable offers', stats, 'sessions', len(sessions), 'cities', len(cities), 'library photos', len(photos), 'school vouchers', len(gifts), 'promotions', len(promos), 'parcours', len(parcours), 'fees', len(fees), 'assumptions', len(assumptions), 'goodies', len(goodies), 'gift relay', len(gift_dir), 'team-routed gifts', sum(1 for v in gift_dir.values() if v['route']=='team'), 'team-routed bookings', sum(1 for v in recipients.values() if v['route']=='team'))
