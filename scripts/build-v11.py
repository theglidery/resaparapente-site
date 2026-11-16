"""Builds data/resaparapente-base-ecoles-offres-v11.xlsx from the v10b1 workbook.
Adds the fields the comparators need (photo/video, ski lift, estimated total, profiles), the sheet "Parcours brevet"
(total cost to the licence, per school), "Frais fédéraux", "Goodies", and the school-side gift voucher relay.
Usage: python3 scripts/build-v11.py <v10b1.xlsx> data/resaparapente-base-ecoles-offres-v11.xlsx
Then recalculate: python3 <skill>/xlsx/scripts/recalc.py data/...v11.xlsx 180"""
import sys, re, statistics, datetime
from copy import copy
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.datavalidation import DataValidation

src, dst = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src)
vals = openpyxl.load_workbook(src, data_only=True)

BLUE, GREY = 'FF1F4E79', 'FF7F7F7F'
def head(ws, col, text, formula=False, width=22):
    c = ws.cell(1, col, text)
    c.fill = PatternFill('solid', fgColor=GREY if formula else BLUE)
    c.font = Font(name='Arial', size=10, bold=True, color='FFFFFFFF')
    c.alignment = Alignment(wrap_text=True, vertical='center')
    ws.column_dimensions[L(col)].width = width
    return c
def cell(ws, r, col, v, fmt=None):
    c = ws.cell(r, col, v)
    c.font = Font(name='Arial', size=10)
    c.alignment = Alignment(wrap_text=True, vertical='top')
    if fmt: c.number_format = fmt
    return c
def colmap(ws):
    return {c.value: c.column for c in ws[1] if c.value}
def dv_list(ws, col, items, rows):
    dv = DataValidation(type='list', formula1='"' + ','.join(items) + '"', allow_blank=True)
    ws.add_data_validation(dv); dv.add(f'{L(col)}2:{L(col)}{rows}')

# ---------------------------------------------------------------- Baptêmes
wsB, wvB = wb['Baptêmes'], vals['Baptêmes']
cb = colmap(wsB)
nB = wsB.max_row
need = {k: cb[k] for k in ['Statut', 'Fiche : photos et vidéo incluses', 'Photo et vidéo (supplément)', 'Remontée : inclusion',
        'Minimum chiffré (prix + supplément identifié)', 'Prix par personne (€)', 'Formule', 'Durée du vol min (min)', 'Durée du vol max (min)',
        'Pays effectif de l’activité', 'ID école']}
col = wsB.max_column + 1
C = {}
for key, title, formula, w in [
    ('photo', 'Photo / vidéo : statut', True, 20),
    ('lift', 'Remontée : montant à ajouter (montant)', False, 22),
    ('total', 'Prix total estimé par personne (montant)', True, 24),
    ('todo', 'Total : ce qui reste à confirmer', True, 34),
    ('prof', 'Profil conseillé (séparer par ;)', False, 34),
    ('profok', 'Profil : relu ?', False, 14),
]:
    head(wsB, col, title, formula, w); C[key] = col; col += 1
A = {k: L(v) for k, v in need.items()}
for r in range(2, nB + 1):
    st, ph, php, lf, mn, pp = (f'{A[k]}{r}' for k in ['Statut', 'Fiche : photos et vidéo incluses', 'Photo et vidéo (supplément)', 'Remontée : inclusion',
                                'Minimum chiffré (prix + supplément identifié)', 'Prix par personne (€)'])
    lift_amt = f'{L(C["lift"])}{r}'
    photo = f'{L(C["photo"])}{r}'
    cell(wsB, r, C['photo'], f'=IF({st}<>"Actif","",IF({ph}="Oui","Incluse",IF(ISNUMBER({php}),"En supplément","À confirmer")))')
    base = f'IF(ISNUMBER({mn}),{mn},IF(ISNUMBER({pp}),{pp},""))'
    cell(wsB, r, C['total'], f'=IF({st}<>"Actif","",IF(ISNUMBER({base}),{base}+IF(AND(LEFT({lf},9)="Non inclu",ISNUMBER({lift_amt})),{lift_amt},0),""))', '#,##0')
    cell(wsB, r, C['todo'], f'=IF({st}<>"Actif","",TRIM(IF(OR({lf}="",LEFT({lf},5)="À con"),"Remontée à confirmer. ","")&IF({photo}="À confirmer","Photo et vidéo à confirmer. ","")))')
dv_list(wsB, C['profok'], ['Oui', 'Non'], nB)

# Prefilled profiles (proposal, to be reviewed: column "Profil : relu ?" = Non)
rows = {}
for r in range(2, nB + 1):
    g = lambda k: wvB.cell(r, cb[k]).value
    rows[r] = dict(name=str(g('Formule') or ''), dmin=g('Durée du vol min (min)'), dmax=g('Durée du vol max (min)'),
                   price=g('Minimum chiffré (prix + supplément identifié)') or g('Prix par personne (€)'),
                   country=g('Pays effectif de l’activité') or 'FR', status=g('Statut'))
by_country = {}
for d in rows.values():
    if d['status'] == 'Actif' and isinstance(d['price'], (int, float)) and d['price'] > 0:
        by_country.setdefault(d['country'], []).append(d['price'])
q25 = {k: statistics.quantiles(v, n=4)[0] for k, v in by_country.items() if len(v) >= 8}
photo_included = {r: (wvB.cell(r, cb['Fiche : photos et vidéo incluses']).value == 'Oui') for r in rows}
for r, d in rows.items():
    if d['status'] != 'Actif':
        cell(wsB, r, C['profok'], 'Non'); continue
    n, tags = d['name'].lower(), []
    dur = d['dmax'] or d['dmin']
    if re.search(r'enfant|kid|junior|jeune|famille', n): tags.append('Enfant')
    if re.search(r'acro|sensation|aventure|adr[ée]naline|vrille|loop|extr[eê]me', n): tags.append('Sensations')
    if isinstance(dur, (int, float)) and dur >= 30: tags.append('Longue durée')
    if (isinstance(dur, (int, float)) and dur <= 15) or re.search(r'd[ée]couverte|initiation|premier|classique', n): tags.append('Première fois')
    if isinstance(d['price'], (int, float)) and d['country'] in q25 and d['price'] <= q25[d['country']]: tags.append('Petit budget')
    if photo_included[r]: tags.append('Souvenir photo/vidéo')
    cell(wsB, r, C['prof'], '; '.join(tags) or None)
    cell(wsB, r, C['profok'], 'Non')
wsB.auto_filter.ref = f'A1:{L(wsB.max_column)}{nB}'

# ---------------------------------------------------------------- Stages
wsS = wb['Stages']
nS = wsS.max_row
cS = wsS.max_column + 1
head(wsS, cS, 'Parcours brevet : lié ?', True, 16)
for r in range(2, nS + 1):
    cell(wsS, r, cS, f"=IF(COUNTIF('Parcours brevet'!$AB$2:$AB$500,A{r})>0,\"Oui\",\"\")")
wsS.auto_filter.ref = f'A1:{L(wsS.max_column)}{nS}'

# ---------------------------------------------------------------- Écoles
wsE = wb['Écoles']
nE = wsE.max_row
cE = wsE.max_column + 1
head(wsE, cE, 'Relais des demandes de bon cadeau (Oui / Non / À confirmer)', False, 26)  # default Oui for every school: a school can only opt out with Non
head(wsE, cE + 1, 'Email des demandes de bon cadeau (vide = email professionnel)', False, 30)
for r in range(2, nE + 1):
    if wsE.cell(r, 1).value: cell(wsE, r, cE, 'Oui')
dv_list(wsE, cE, ['Oui', 'Non', 'À confirmer'], nE)
wsE.auto_filter.ref = f'A1:{L(wsE.max_column)}{nE}'

# ---------------------------------------------------------------- Frais fédéraux
wsF = wb.create_sheet('Frais fédéraux')
fcols = ['Pays (ISO)', 'Organisme', 'Poste', 'Groupe', 'Montant', 'Devise ISO', 'Périodicité', 'S’applique à', 'Source (URL)', 'Date de vérification', 'Statut', 'Remarque']
for i, h in enumerate(fcols, 1): head(wsF, i, h, False, 18 if i < 9 else 34)
SHV = 'https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Ausbildung/Pruefungen/SHV_Gebuehrenreglement_V8_2026_08122025.pdf'
TH = 'https://www.thalia-parapente.ch/ecole-parapente/prix-brevet-parapente/'
today = datetime.date(2026, 11, 15)
fees = [
    ('CH', 'SHV/FSVL', 'Examen théorique pilote solo parapente', 'Examens', 125, 'CHF', 'Par examen', 'Brevet suisse de pilote solo', SHV, today, 'Vérifié – publiable', 'Barème 2026 (V8), § 2a'),
    ('CH', 'SHV/FSVL', 'Examen pratique pilote solo parapente', 'Examens', 125, 'CHF', 'Par examen', 'Brevet suisse de pilote solo', SHV, today, 'Vérifié – publiable', 'Barème 2026 (V8), § 2a'),
    ('CH', 'SHV/FSVL', 'Première délivrance du brevet (membre)', 'Brevet', 0, 'CHF', 'Une fois', 'Membre SHV', SHV, today, 'Vérifié – publiable', 'Gratuit pour les membres'),
    ('CH', 'SHV/FSVL', 'Première délivrance du brevet (non-membre)', 'Brevet', 100, 'CHF', 'Une fois', 'Non-membre', SHV, today, 'Vérifié – publiable', 'Non inclus dans le total estimé : la plupart des élèves sont membres'),
    ('CH', 'SHV/FSVL', 'Cotisation annuelle', 'Cotisation', 120, 'CHF', 'Par an', 'Membre SHV', TH, today, 'Relevé à relire', 'Montant cité par une école (Thalia). Le barème SHV ne la mentionne pas : à vérifier auprès de la fédération'),
    ('CH', 'Assureur de l’école', 'RC pilote', 'Assurance', 82.5, 'CHF', 'Par an', 'Élève', TH, today, 'Relevé à relire', 'Montant cité par une école (Thalia). Varie selon l’assureur'),
    ('FR', 'FFVL', 'Licence fédérale (assurance responsabilité civile incluse)', 'Licence', None, 'EUR', 'Par an', 'Élève', 'https://www.ffvl.fr/', None, 'À collecter', 'Montant à relever sur le site de la FFVL avant publication : le total France affichera « licence à ajouter » tant qu’il manque'),
    ('FR', 'Ligue régionale (exemple Auvergne-Rhône-Alpes)', 'Frais de dossier brevet de pilote', 'Examens', 25, 'EUR', 'Une fois', 'Brevet de pilote', 'https://www.freedom-parapente.fr/en/paragliding-courses/passing-of-paragliding-patents', datetime.date(2026, 11, 15), 'Relevé à relire', 'Cité par une école (Freedom). Les frais de validation varient selon l’école et la ligue : non ajouté au total par défaut'),
    ('BE', 'Fédération belge de vol libre', 'À collecter', 'Licence', None, 'EUR', 'Par an', 'Élève', None, None, 'À collecter', 'Système belge de brevets non vérifié'),
]
for i, f in enumerate(fees, 2):
    for j, v in enumerate(f, 1):
        c = cell(wsF, i, j, v)
        if j == 10 and v: c.number_format = 'yyyy-mm-dd'
wsF.freeze_panes = 'A2'

# ---------------------------------------------------------------- Parcours brevet
wsP = wb.create_sheet('Parcours brevet')
pcols = [
    ('ID parcours', False, 14), ('ID école', False, 10), ('École', True, 26), ('Pays (ISO)', True, 8), ('Devise', True, 8), ('Canton / région', True, 16),
    ('Nom du parcours', False, 34), ('Brevet visé', False, 24), ('Nombre de vols visé', False, 10),
    ('Prix du parcours chez l’école (montant)', False, 14), ('Matériel personnel compris dans le prix ? (Oui / Non / Partiel / À confirmer)', False, 18),
    ('Ce que couvre ce prix', False, 44), ('Supplément si matériel acheté hors école (montant)', False, 16),
    ('Autre supplément possible (montant)', False, 14), ('Nature de cet autre supplément', False, 30),
    ('Examens fédération (montant)', True, 12), ('Autres frais obligatoires connus (montant)', False, 14), ('Nature de ces frais', False, 30),
    ('Reste à prévoir (matériel, remontées, transports…)', False, 36),
    ('Total école + frais connus (montant)', True, 14), ('Total si matériel acheté hors école (montant)', True, 14),
    ('Validité du forfait (mois)', False, 10), ('Durée habituelle', False, 18),
    ('URL source', False, 40), ('Date du relevé', False, 12), ('Statut', False, 18), ('Publiable', True, 10), ('ID offre stage source', False, 20), ('Remarque', False, 44),
]
for i, (h, f, w) in enumerate(pcols, 1): head(wsP, i, h, f, w)
P = {h: i for i, (h, _, _) in enumerate(pcols, 1)}
K = lambda r, name: f'{L(P[name])}{r}'
ECO = 'Écoles'
def parcours(pid, sid, name, brevet, vols, price, mat, covers, supp=None, other=None, other_nat=None, fees_amt=None, fees_nat=None, remain=None,
             valid=None, dur=None, url=None, status='Relevé à relire', offer=None, note=None):
    return dict(pid=pid, sid=sid, name=name, brevet=brevet, vols=vols, price=price, mat=mat, covers=covers, supp=supp, other=other, other_nat=other_nat,
                fees_amt=fees_amt, fees_nat=fees_nat, remain=remain, valid=valid, dur=dur, url=url, status=status, offer=offer, note=note)
SCH = {r[0].value: r[0].row for r in wsE.iter_rows(min_row=2, max_col=1) if r[0].value}
vE = vals['Écoles']
def sid_of(name):
    for r in vE.iter_rows(min_row=2):
        if r[1].value and name.lower() in str(r[1].value).lower(): return r[0].value
    raise KeyError(name)
BREVET_CH = 'Brevet suisse de pilote solo (SHV/FSVL)'
SEED = [
    parcours('PB-CH-001', sid_of('Thalia'), 'Préparation au brevet suisse – parcours de 50 vols', BREVET_CH, 50, 2510, 'Non',
             'Initiation de 2 jours (vol n°1 guidé), Pack Progression (vols 2 à 20), vols dès le 21e à 30 CHF, cours de météo obligatoire, grand vol autonome supervisé. Matériel de l’école jusqu’au vol n°11.',
             870, None, None, 202.5, 'Cotisation annuelle FSVL 120 CHF + RC pilote 82,50 CHF',
             'Matériel personnel (voile, sellette, casque, secours, radio), navette 10 CHF par montée, remontées mécaniques (non chiffrées)',
             None, None, TH, 'Vérifié – publiable', 'OFF-CH-3A63ECD78622',
             'Total hors école annoncé : 3 380 CHF (30 vols à 60 CHF au lieu de 30 CHF après le Pack Progression). Page lue le 15/11/2026.'),
    parcours('PB-CH-002', sid_of('Thalia'), 'Préparation au brevet suisse – parcours de 75 vols', BREVET_CH, 75, 3260, 'Non',
             'Même parcours que 50 vols, avec 25 vols école de plus après le Pack Progression.',
             1620, None, None, 202.5, 'Cotisation annuelle FSVL 120 CHF + RC pilote 82,50 CHF',
             'Matériel personnel, navette 10 CHF par montée, remontées mécaniques', None, None, TH, 'Vérifié – publiable', None,
             'Total hors école annoncé : 4 880 CHF. Page lue le 15/11/2026.'),
    parcours('PB-CH-003', sid_of('Swissgliders'), 'Brevetkurs', BREVET_CH, None, 2800, 'À confirmer', 'Vols illimités pendant 13 mois.', None, None, None, None, None,
             'Matériel, examens, remontées et autres frais : à lire sur la page de l’école', 13, None, 'https://swissgliders.ch/kosten/', 'Relevé à relire', 'OFF-CH-1F2BBE477F25',
             'Probablement le module brevet seul : vérifier s’il comprend le cours de base.'),
    parcours('PB-CH-004', sid_of('Swissgliders'), 'Grund- und Brevetkurs – pack', BREVET_CH, None, 3490, 'À confirmer', 'Cours de base et cours de brevet. L’école détaille plusieurs scénarios de matériel.',
             None, None, None, None, None, 'Matériel, examens, remontées et autres frais : budget détaillé par l’école', 13, None, 'https://swissgliders.ch/kosten/', 'Relevé à relire', 'OFF-CH-C984C5030A64', None),
    parcours('PB-CH-005', sid_of('Appenzell'), 'Pauschale FIX – formation jusqu’au brevet', BREVET_CH, None, 2490, 'À confirmer', 'Forfait de formation jusqu’au brevet.',
             1800, None, None, None, None, 'Remontées, examens et autres frais : grille de l’école', 12, None, 'https://gleitschirm.ch/preise/', 'Relevé à relire', 'OFF-CH-212DA93F7DFB',
             '+1 800 CHF si l’équipement est acheté ailleurs.'),
    parcours('PB-CH-006', sid_of('Engelberg'), 'Formation jusqu’au brevet', BREVET_CH, None, 2190, 'Partiel', 'Matériel de l’école jusqu’au 10e grand vol.',
             1400, 200, 'Si le cours de base a été suivi dans une autre école', None, None, 'Examens et autres frais : voir la page de l’école', None, None,
             'https://www.flugschule-engelberg.ch/de/gleitschirm-schulung/kosten-bis-zum-brevet.html', 'Relevé à relire', 'OFF-CH-C33DF4E7FDE2', '+1 400 CHF si le matériel est acheté ailleurs.'),
    parcours('PB-CH-007', sid_of('timetofly'), 'Brevetkurs Primo (deux modules)', BREVET_CH, None, 3880, 'Non', 'Deux modules (cours de base et cours de brevet), vols illimités pendant 18 mois.',
             None, None, None, None, None, 'Matériel, transports et autres frais', 18, None, 'https://www.timetofly.ch/ausbildung/kosten', 'Relevé à relire', 'OFF-CH-46FCAC99A1CC',
             'Le module brevet seul coûte 2 990 CHF.'),
    parcours('PB-CH-008', sid_of('timetofly'), 'Brevetkurs Intenso (deux modules)', BREVET_CH, None, 3680, 'Non', 'Deux modules (cours de base et cours de brevet), vols illimités pendant 18 mois.',
             None, None, None, None, None, 'Matériel, transports et autres frais', 18, None, 'https://www.timetofly.ch/ausbildung/kosten', 'Relevé à relire', 'OFF-CH-6B818D852E59',
             'Le module brevet seul coûte 1 990 CHF.'),
    parcours('PB-CH-009', sid_of('Chill Out'), 'Brevetkurs (deux modules, navettes école comprises)', BREVET_CH, None, 4630, 'Non', 'Deux modules avec navettes de l’école.',
             None, None, None, None, None, 'Matériel et frais annexes', None, None, 'https://chilloutparagliding.com/ausbildung/kosten-bis-zum-brevet-2/', 'Relevé à relire', 'OFF-CH-66E5A3E50BFB',
             'Le module brevet seul coûte 3 300 CHF.'),
    parcours('PB-CH-010', sid_of('Flugrausch'), 'Forfait de formation – matériel acheté chez Flugrausch', BREVET_CH, None, 4600, 'À confirmer',
             'Cours de théorie et vols illimités pendant 12 mois. Matériel à acheter auprès de l’école.', None, None, None, None, None, None, 12, None,
             'https://flugrausch.ch/angebot/preise', 'Relevé à relire', 'OFF-CH-395A44EB3C12', 'À relire : le matériel est-il compris dans les 4 600 CHF ?'),
    parcours('PB-CH-011', sid_of('Flugrausch'), 'Forfait de formation – matériel propre', BREVET_CH, None, 5600, 'Non', 'Prix « à partir de », jusqu’à 6 600 CHF selon le matériel personnel apporté.',
             None, None, None, None, None, None, 12, None, 'https://flugrausch.ch/angebot/preise', 'Relevé à relire', 'OFF-CH-64544D11BE6F', 'À relire.'),
    parcours('PB-CH-012', sid_of('Ikarus'), 'Formation complète – forfait', BREVET_CH, None, 3180, 'À confirmer', 'Forfait de formation complète. Le cours brevet seul coûte 2 390 CHF.',
             None, None, None, None, None, None, None, None, 'https://fly-ikarus.ch/preisliste/', 'Relevé à relire', 'OFF-CH-F12FF0721A3F', None),
    parcours('PB-CH-013', sid_of('Gypaete'), 'Pack Fidélité – 50 vols', BREVET_CH, 50, 2765, 'À confirmer', '50 vols encadrés, initiation incluse.',
             None, None, None, None, None, None, None, None, 'https://www.gypaete-parapente.ch/tarifs.php', 'Relevé à relire', 'OFF-CH-9C2980F10E26', None),
    parcours('PB-CH-014', sid_of('Gypaete'), 'Pack 70 vols', BREVET_CH, 70, 3265, 'À confirmer', '70 vols encadrés, initiation incluse.',
             None, None, None, None, None, None, None, None, 'https://www.gypaete-parapente.ch/tarifs.php', 'Relevé à relire', 'OFF-CH-589C461222FF', None),
    parcours('PB-CH-015', sid_of('Win Wings'), 'Brevetkurs', BREVET_CH, None, 2850, 'Partiel', 'Matériel de l’école jusqu’au 15e vol et vols illimités pendant la durée du forfait.',
             None, None, None, None, None, None, 18, None, 'https://winwings.ch/kosten-bis-zum-brevet/', 'Relevé à relire', 'OFF-CH-FAA20B8B3966', None),
    parcours('PB-CH-016', sid_of('Vertical Paragliding'), 'Brevetkurs', BREVET_CH, None, 2950, 'À confirmer', None, None, None, None, None, None, None, None, None,
             'https://www.vertical-paragliding.com/brevetkurs', 'Relevé à relire', 'OFF-CH-5C20105A122F', None),
    parcours('PB-CH-017', sid_of('PMO Air'), 'Brevet-Kurs Durchstarter', BREVET_CH, None, 5555, 'Non', None, None, None, None, None, None, None, 3, None,
             'https://pmo-air.ch/preise-und-leistungen/', 'Relevé à relire', 'OFF-CH-CE8AFB6A8089', 'Forfait valable 3 mois.'),
    parcours('PB-CH-018', sid_of('PMO Air'), 'Brevet-Kurs inkl. Material', BREVET_CH, None, 8888, 'Oui', 'Matériel compris.', None, None, None, None, None, None, 3, None,
             'https://pmo-air.ch/preise-und-leistungen/', 'Relevé à relire', 'OFF-CH-BCB664BFD919', 'Forfait valable 3 mois, matériel compris : à comparer au total des autres écoles avec matériel.'),

    parcours('PB-FR-001', sid_of('Flying Puy de Dôme'), 'Pack Initiation + Perfectionnement (2 stages)', 'Brevet initial FFVL puis préparation du brevet de pilote', None, 1400, 'À confirmer',
             'Deux stages : initiation puis perfectionnement, ou deux perfectionnements.', None, None, None, None, None,
             'Licence FFVL, matériel personnel, hébergement, frais de validation des brevets', None, '2 stages', 'https://www.flying-puydedome.fr/pratique/tarifs', 'Relevé à relire', 'OFF-R5-8CC5B64FB34A',
             'Ce n’est pas un forfait jusqu’au brevet de pilote : le nombre de stages nécessaires dépend de l’élève.'),
]
exam_formula = "SUMIFS('Frais fédéraux'!$E$2:$E$200,'Frais fédéraux'!$A$2:$A$200,{pays},'Frais fédéraux'!$D$2:$D$200,\"Examens\")"
for i, d in enumerate(SEED, 2):
    r = i
    base = [d['pid'], d['sid']]
    for j, v in enumerate(base, 1): cell(wsP, r, j, v)
    sr = SCH[d['sid']]
    cell(wsP, r, P['École'], f"=IFERROR(INDEX({ECO}!$B$2:$B$2000,MATCH(B{r},{ECO}!$A$2:$A$2000,0)),\"ID école inconnu\")")
    cell(wsP, r, P['Pays (ISO)'], f"=IFERROR(IF(INDEX({ECO}!$BO$2:$BO$2000,MATCH(B{r},{ECO}!$A$2:$A$2000,0))=\"\",\"FR\",INDEX({ECO}!$BO$2:$BO$2000,MATCH(B{r},{ECO}!$A$2:$A$2000,0))),\"FR\")")
    cell(wsP, r, P['Devise'], f'=IF(D{r}="CH","CHF","EUR")')
    cell(wsP, r, P['Canton / région'], f"=IFERROR(INDEX({ECO}!$J$2:$J$2000,MATCH(B{r},{ECO}!$A$2:$A$2000,0)),\"\")")
    for name, v in [('Nom du parcours', d['name']), ('Brevet visé', d['brevet']), ('Nombre de vols visé', d['vols']), ('Prix du parcours chez l’école (montant)', d['price']),
                    ('Matériel personnel compris dans le prix ? (Oui / Non / Partiel / À confirmer)', d['mat']), ('Ce que couvre ce prix', d['covers']),
                    ('Supplément si matériel acheté hors école (montant)', d['supp']), ('Autre supplément possible (montant)', d['other']), ('Nature de cet autre supplément', d['other_nat']),
                    ('Autres frais obligatoires connus (montant)', d['fees_amt']), ('Nature de ces frais', d['fees_nat']), ('Reste à prévoir (matériel, remontées, transports…)', d['remain']),
                    ('Validité du forfait (mois)', d['valid']), ('Durée habituelle', d['dur']), ('URL source', d['url']), ('Statut', d['status']), ('ID offre stage source', d['offer']), ('Remarque', d['note'])]:
        c = cell(wsP, r, P[name], v)
        if name.endswith('(montant)') and v is not None: c.number_format = '#,##0.##'
    c = cell(wsP, r, P['Date du relevé'], datetime.date(2026, 11, 15)); c.number_format = 'yyyy-mm-dd'
    cell(wsP, r, P['Examens fédération (montant)'], '=' + exam_formula.format(pays=f'D{r}'), '#,##0.##')
    cell(wsP, r, P['Total école + frais connus (montant)'], f"=IF(ISNUMBER({K(r,'Prix du parcours chez l’école (montant)')}),{K(r,'Prix du parcours chez l’école (montant)')}+N({K(r,'Examens fédération (montant)')})+N({K(r,'Autres frais obligatoires connus (montant)')}),\"\")", '#,##0.##')
    cell(wsP, r, P['Total si matériel acheté hors école (montant)'], f"=IF(AND(ISNUMBER({K(r,'Total école + frais connus (montant)')}),ISNUMBER({K(r,'Supplément si matériel acheté hors école (montant)')})),{K(r,'Total école + frais connus (montant)')}+{K(r,'Supplément si matériel acheté hors école (montant)')},\"\")", '#,##0.##')
    cell(wsP, r, P['Publiable'], f'=IF(AND(Z{r}="Vérifié – publiable",ISNUMBER(J{r}),X{r}<>"",Y{r}<>""),"Oui","Non")')
nP = len(SEED) + 1
assert L(P['Statut']) == 'Z' and L(P['URL source']) == 'X' and L(P['Date du relevé']) == 'Y' and L(P['ID offre stage source']) == 'AB' and L(P['Pays (ISO)']) == 'D'
dv_list(wsP, P['Statut'], ['Brouillon', 'Relevé à relire', 'Vérifié – publiable', 'Masqué'], 500)
dv_list(wsP, P['Matériel personnel compris dans le prix ? (Oui / Non / Partiel / À confirmer)'], ['Oui', 'Non', 'Partiel', 'À confirmer'], 500)
wsP.freeze_panes = 'D2'
wsP.auto_filter.ref = f'A1:{L(len(pcols))}{nP}'
# the ECO!BO column must be "Pays (ISO)" of Écoles (column 67)
assert wsE.cell(1, 67).value == 'Pays (ISO)' and L(67) == 'BO'


# ---------------------------------------------------------------- Hypothèses parcours
wsH = wb.create_sheet('Hypothèses parcours')
hcols = ['Pays (ISO)', 'Étape', 'Clé site (niveau du stage)', 'Nombre de stages par défaut', 'Maximum proposé', 'Durée de référence (jours, min)', 'Durée de référence (jours, max)', 'Justification', 'Statut']
for i, h in enumerate(hcols, 1): head(wsH, i, h, False, 20 if i < 8 else 50)
HYP_NOTE = 'Hypothèse de travail pour comparer des écoles à parcours égal. Le nombre de stages dépend de l’élève, de la météo et du rythme : le visiteur peut le modifier sur la page. À valider avec un moniteur.'
hyp = []
for country in ('FR', 'CH', 'BE'):
    hyp += [(country, 'Initiation', 'initiation', 1, 3, 3, 7, HYP_NOTE, 'À valider'),
            (country, 'Progression et autonomie', 'progression', 2, 6, 3, 7, HYP_NOTE, 'À valider'),
            (country, 'Perfectionnement', 'perfectionnement', 1, 4, 3, 7, HYP_NOTE, 'À valider')]
for i, row in enumerate(hyp, 2):
    for j, v in enumerate(row, 1): cell(wsH, i, j, v)
dv_list(wsH, 9, ['À valider', 'Validé'], 100)

# ---------------------------------------------------------------- Goodies
wsG = wb.create_sheet('Goodies')
gcols = ['ID goodie', 'Nom', 'Pour', 'Boutique', 'Pays où on le propose', 'URL du produit', 'Prix catalogue (€)', 'Remise (€)', 'Prix après remise (€)', 'Frais de port (€)',
         'Prix livré après remise (€)', 'Code promo', 'Statut', 'Remarque']
for i, h in enumerate(gcols, 1): head(wsG, i, h, h in ('Prix après remise (€)', 'Prix livré après remise (€)'), 22 if i != 14 else 50)
goodies = [
    ('GD-001', 'Casquette réglable « Premier vol »', 'Baptême', 'monparapente.fr', 'FR', None, None, 5, None, None, None, None, 'À créer',
     'Petit parapente brodé, marquage discret. Afficher prix final et frais de port dès le départ. Créer le code promo dans la boutique avant mise en ligne.'),
    ('GD-002', 'Casquette réglable « Premier vol »', 'Baptême', 'myparaglide.com', 'CH; BE; DE; autres', None, None, 5, None, None, None, None, 'À créer', 'Frais de port à vérifier par pays.'),
    ('GD-003', 'T-shirt « Je vole »', 'Baptême', 'monparapente.fr', 'FR', None, None, 5, None, None, None, None, 'À créer', None),
    ('GD-004', 'T-shirt « Je vole »', 'Baptême', 'myparaglide.com', 'CH; BE; DE; autres', None, None, 5, None, None, None, None, 'À créer', None),
    ('GD-005', 'Autocollants « Premier vol »', 'Baptême', 'monparapente.fr', 'FR', None, None, 2, None, None, None, None, 'À créer',
     'Repli si le prix livré de la casquette est jugé trop élevé : plus facile à offrir et à expédier.'),
    ('GD-006', 'Carnet de progression (PDF gratuit)', 'Stage', 'monparapente.fr', 'FR; CH; BE', '/documents/carnet-de-progression-parapente.pdf', 0, 0, None, 0, None, None, 'Prêt',
     'Gratuit, téléchargement direct (PDF de 8 pages généré par scripts/build-carnet-pdf.py) : fait découvrir MonParapente avant le stage. Version en allemand et en anglais à faire pour myparaglide.com.'),
]
for i, g in enumerate(goodies, 2):
    for j, v in enumerate(g, 1):
        if j == 9: v = f'=IF(AND(ISNUMBER(G{i}),ISNUMBER(H{i})),MAX(0,G{i}-H{i}),"")'
        if j == 11: v = f'=IF(AND(ISNUMBER(I{i}),ISNUMBER(J{i})),I{i}+J{i},"")'
        cell(wsG, i, j, v)
dv_list(wsG, 13, ['À créer', 'Prêt', 'Retiré'], 100)
dv_list(wsG, 3, ['Baptême', 'Stage'], 100)

# ---------------------------------------------------------------- Lisez-moi
wsR = wb['Lisez-moi']
last = wsR.max_row
def readme(a, b, bold=False):
    global last
    last += 1
    ca, cb_ = wsR.cell(last, 1, a), wsR.cell(last, 2, b)
    ref_a, ref_b = wsR.cell(last - 1, 1), wsR.cell(last - 1, 2)
    for c, ref in ((ca, ref_a), (cb_, ref_b)):
        c.font = copy(ref.font); c.alignment = copy(ref.alignment); c.fill = copy(ref.fill); c.border = copy(ref.border)
    if bold: ca.font = Font(name='Arial', size=10, bold=True)
readme('Version 11 : comparateurs, bons cadeaux, goodies (15/11/2026)', None, True)
readme('Photo / vidéo : statut', 'Calculé : Incluse si « Fiche : photos et vidéo incluses » = Oui ; En supplément si un montant est saisi dans « Photo et vidéo (supplément) » ; sinon À confirmer. Le comparateur ne dit jamais « non » sans information.')
readme('Remontée : montant', 'À saisir seulement quand « Remontée : inclusion » vaut « Non inclus ». Le total estimé l’ajoute alors au prix.')
readme('Prix total estimé', 'Prix de la formule + supplément obligatoire connu (+ remontée chiffrée si non incluse). « Ce qui reste à confirmer » liste ce qui manque : le site affiche « total à confirmer » tant que la liste n’est pas vide.')
readme('Profil conseillé', 'Proposé automatiquement d’après le nom, la durée, le prix et la photo (Première fois, Enfant, Sensations, Longue durée, Petit budget, Souvenir photo/vidéo). À relire : passer « Profil : relu ? » à Oui. Le site s’en sert pour la page « Quel baptême choisir ».')
readme('Langue du vol', 'La colonne existante « Langue du vol (confirmée) » (Baptêmes) et « Langue du stage (confirmée) » (Stages) est vide pour toutes les lignes. Saisir les langues séparées par « ; » (fr; en; de). Le filtre de langue du comparateur n’apparaît qu’à partir de 10 lignes renseignées.')
readme('Parcours brevet', 'Un parcours par ligne : prix du parcours chez l’école, ce qu’il couvre, supplément si le matériel est acheté hors de l’école, examens de la fédération (formule, depuis « Frais fédéraux »), autres frais obligatoires et ce qui reste à prévoir. Les totaux sont calculés ; le matériel personnel n’est jamais estimé par nous. Publiable = statut « Vérifié – publiable » + prix + lien + date. Thalia est vérifié (page lue le 15/11/2026) ; les autres écoles sont « Relevé à relire » et n’apparaissent pas tant que personne n’a contrôlé la page.')
readme('Hypothèses parcours', 'Pour les pays où les écoles ne publient pas de forfait jusqu’au brevet (France, Belgique, une partie de la Suisse), le comparateur additionne le stage publié le moins cher de chaque étape. Le nombre de stages par étape est une hypothèse de travail modifiable par le visiteur : elle est saisie ici, par pays, et marquée « À valider ».')
readme('Frais fédéraux', 'Examens et brevet suisses : barème SHV/FSVL 2026 (V8), vérifié. Cotisation et RC : montants cités par une école, à vérifier. France et Belgique : à collecter.')
readme('Relais des demandes de bon cadeau', 'Onglet Écoles : Oui = l’école accepte de recevoir par e-mail les demandes de bon cadeau envoyées depuis le site (option B). Valeur par défaut : Oui pour toutes les écoles. Mettre Non uniquement si une école demande à ne plus recevoir ces demandes : elle disparaît alors du formulaire.')
readme('Goodies', 'Réductions proposées sur la page de confirmation d’une demande : MonParapente.fr pour la France, MyParaglide.com pour les autres pays. Aucun produit n’existe encore : statut « À créer ».')

wb.save(dst)
print('saved', dst, 'parcours', len(SEED))
