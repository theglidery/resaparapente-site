"""Builds the free PDF "Carnet de progression parapente" offered on the confirmation page of a course request
(MonParapente.fr introduction). Run: python3 scripts/build-carnet-pdf.py  ->  public/documents/carnet-de-progression-parapente.pdf
Texts are generic and never replace the instructions of the school or the instructor."""
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

pdfmetrics.registerFont(TTFont('F', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('FB', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
INK, SKY, DEEP, SUN, LINE, TINT = HexColor('#0b2540'), HexColor('#1478e0'), HexColor('#08397a'), HexColor('#ffb41f'), HexColor('#cfe2f2'), HexColor('#e3f2fe')
W, H = A4
M = 18 * 28.35 / 10  # 18 mm
c = canvas.Canvas('public/documents/carnet-de-progression-parapente.pdf', pagesize=A4)
c.setTitle('Carnet de progression parapente'); c.setAuthor('MonParapente.fr'); c.setSubject('Carnet à imprimer pour suivre son stage de parapente')
page = [0]

def para(text, x, y, width, size=10, font='F', lead=None, color=INK):
    lead = lead or size * 1.45
    c.setFont(font, size); c.setFillColor(color)
    for line in simpleSplit(text, font, size, width):
        c.drawString(x, y, line); y -= lead
    return y

def header(title, sub=None):
    page[0] += 1
    c.setFillColor(DEEP); c.rect(0, H - 22 * 2.835, W, 22 * 2.835, stroke=0, fill=1)
    c.setFillColor(HexColor('#ffffff')); c.setFont('FB', 15); c.drawString(M, H - 14.5 * 2.835, title)
    c.setFont('F', 8); c.drawRightString(W - M, H - 14.5 * 2.835, 'Carnet de progression · MonParapente.fr')
    c.setFillColor(SUN); c.rect(0, H - 22 * 2.835 - 3, W, 3, stroke=0, fill=1)
    y = H - 22 * 2.835 - 16
    if sub: y = para(sub, M, y, W - 2 * M, 9.5, color=HexColor('#35506b')) - 4
    return y

def footer():
    c.setFont('F', 7.5); c.setFillColor(HexColor('#587087'))
    c.drawString(M, 10 * 2.835, 'Ce carnet est un aide-mémoire. Les consignes de ton école et de ton moniteur priment toujours.')
    c.drawRightString(W - M, 10 * 2.835, str(page[0]))

def box(x, y, w=11, label=None):
    c.setStrokeColor(SKY); c.setLineWidth(1); c.rect(x, y - 2, 9, 9, stroke=1, fill=0)
    if label: para(label, x + 15, y, w * 10 + 330, 9.5)

# --- cover
page[0] += 1
c.setFillColor(DEEP); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(SUN); c.rect(0, H * 0.42, W, 5, stroke=0, fill=1)
c.setFillColor(HexColor('#ffffff')); c.setFont('FB', 32); c.drawString(M, H * 0.70, 'Mon carnet de')
c.drawString(M, H * 0.70 - 40, 'progression parapente')
c.setFont('F', 12); c.setFillColor(HexColor('#cfe2f2'))
c.drawString(M, H * 0.70 - 74, 'À imprimer avant ton stage. Un vol, une page, un progrès.')
c.setFillColor(HexColor('#ffffff')); c.setFont('F', 11)
for i, label in enumerate(['Nom', 'École', 'Dates du stage']):
    yy = H * 0.34 - i * 34
    c.drawString(M, yy, label); c.setStrokeColor(HexColor('#7cc4fa')); c.line(M + 90, yy - 3, W - M, yy - 3)
c.setFont('FB', 11); c.drawString(M, 40, 'MonParapente.fr'); c.setFont('F', 9); c.setFillColor(HexColor('#cfe2f2'))
c.drawString(M + 110, 40, 'Tout pour débuter le parapente · stage réservé via ResaParapente')
c.showPage()

# --- before the stage
y = header('Avant le stage', 'Chaque école envoie sa propre liste : si elle diffère de celle-ci, suis la sienne.')
y -= 6
for title, items in [
    ('À emporter (exemples courants)', ['Chaussures montantes, qui tiennent la cheville', 'Vêtements couvrants et adaptés à la météo du jour, coupe-vent', 'Gants fins, lunettes de soleil, casquette, crème solaire', 'Eau, en-cas, de quoi noter', 'Pièce d’identité et les documents demandés par l’école']),
    ('À vérifier avec l’école', ['Heure et lieu de rendez-vous, et que faire si la météo empêche de voler', 'Matériel prêté (aile, sellette, casque, radio) et matériel à apporter', 'Repas, hébergement, navettes', 'Âge, poids et conditions de santé demandés pour participer']),
]:
    c.setFont('FB', 11.5); c.setFillColor(DEEP); c.drawString(M, y, title); y -= 20
    for it in items: box(M, y, label=it); y -= 19
    y -= 10
y = para('Ce que tu peux te dire avant le départ', M, y, W - 2 * M, 11.5, 'FB', color=DEEP) - 4
y = para('Le parapente s’apprend par petits pas : gonfler l’aile au sol, apprendre à la contrôler, décoller et atterrir sur une pente-école, puis voler plus longtemps. Il n’est pas nécessaire d’être sportif de haut niveau. Il faut surtout écouter le moniteur, accepter de recommencer et respecter la météo.', M, y, W - 2 * M, 10)
footer(); c.showPage()

# --- skills
y = header('Mes repères', 'Des exemples d’objectifs d’un début de progression. Ton moniteur décide de ce que tu travailles et quand.')
y -= 6
for title, items in [
    ('Au sol', ['Je sais installer et vérifier mon équipement avec le moniteur', 'Je gonfle l’aile et je la contrôle au-dessus de ma tête', 'Je sais lire la direction du vent avec la manche à air']),
    ('Au décollage', ['Je suis la procédure de décollage donnée par le moniteur', 'Je décolle en ligne droite, sans me précipiter', 'J’écoute les consignes radio et je les applique tout de suite']),
    ('En vol et à l’atterrissage', ['Je garde une trajectoire simple et je regarde où je vais', 'Je prépare l’approche et j’atterris dans la zone prévue', 'Je range mon aile et je note mes impressions à chaud']),
]:
    c.setFont('FB', 11.5); c.setFillColor(DEEP); c.drawString(M, y, title); y -= 20
    for it in items: box(M, y, label=it); y -= 19
    y -= 8
footer(); c.showPage()

# --- logbook pages
cols = [('Date', 54), ('Site', 92), ('Météo / vent', 80), ('Exercice du jour', 110), ('Mon ressenti', 100)]
for p in range(1, 5):
    y = header(f'Journal de vol ({p}/4)', 'Après chaque journée : une ligne par vol ou par série. Ce que je retiens compte plus que la durée.')
    x0 = M; tw = W - 2 * M; scale = tw / sum(w for _, w in cols)
    c.setFillColor(TINT); c.rect(x0, y - 18, tw, 20, stroke=0, fill=1); c.setFont('FB', 8.5); c.setFillColor(DEEP)
    xx = x0
    for name, w in cols: c.drawString(xx + 4, y - 12, name); xx += w * scale
    y -= 18
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    for r in range(11):
        c.line(x0, y - 44, x0 + tw, y - 44); y -= 44
    xx = x0
    for name, w in cols:
        c.line(xx, y, xx, y + 44 * 11 + 18); xx += w * scale
    c.line(x0 + tw, y, x0 + tw, y + 44 * 11 + 18)
    para('Remarque du moniteur :', M, y - 16, 200, 9, 'FB', color=DEEP)
    c.line(M + 120, y - 18, W - M, y - 18)
    footer(); c.showPage()

# --- last page
y = header('Questions à poser, et après ?', None)
y -= 6
y = para('Questions à poser à mon moniteur', M, y, W - 2 * M, 11.5, 'FB', color=DEEP) - 4
for q in ['Qu’est-ce qui m’a le plus ralenti aujourd’hui, et comment le travailler ?', 'Quel est mon prochain objectif concret ?', 'Dans quelles conditions de vent ne dois-je pas voler seul ?', 'Quel stage me conseilles-tu ensuite ?']:
    y = para('• ' + q, M, y, W - 2 * M, 10) - 3
    c.setStrokeColor(LINE); c.line(M, y - 6, W - M, y - 6); y -= 22
y -= 6
y = para('Et après le stage ?', M, y, W - 2 * M, 11.5, 'FB', color=DEEP) - 4
y = para('MonParapente.fr réunit des conseils pour débuter : choisir son matériel, comprendre la météo, préparer la suite de la formation. Pour comparer les stages et le coût d’une formation jusqu’au brevet, rendez-vous sur ResaParapente.fr.', M, y, W - 2 * M, 10)
y -= 10
c.setFont('FB', 11); c.setFillColor(SKY); c.drawString(M, y, 'monparapente.fr'); c.drawString(M + 130, y, 'resaparapente.fr')
footer(); c.showPage()
c.save(); print('ok', page[0], 'pages')
