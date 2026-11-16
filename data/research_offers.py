# Offres relevées sur les pages publiques des écoles (14/11/2026).
# kind: 'B' baptême, 'S' stage. prix None => « Prix sur demande » sur le site.
# (kind, école, formule, prix, nature, durée min, durée max, lieu, âge, poids, réservation, url, url réservation, note)
FP = 'À partir de'      # tarifs affichés « à partir de » ou « environ »
PP = 'Prix publié'
R = []
def add(*a): R.append(a)

# --- Airmax Parapente (S060) : tarifs « à partir de », réservation en ligne ou par téléphone
U = 'https://www.airmax-parapente.com/'
for f, p, a, b in [('Vol Enfant', 85, 10, 15), ('Vol Découverte', 95, 10, 15), ('Vol Ascendance', 125, 20, 30),
                   ('Vol Émotion', 100, 10, 10), ('Vol Sensation', 135, 20, 30), ('Vol Prestige', 165, 45, 45)]:
    add('B', 'S060', f, p, FP, a, b, 'Col de la Forclaz', 'À partir de 4 ans' if 'Enfant' in f else None, None,
        'Réservation en ligne depuis le site de l’école ou par téléphone', U, U, None)

# --- Jura Airlines (S184)
U = 'https://www.juraairlines.fr/baptemes-parapente-jura/'
add('B', 'S184', 'Faucon crécerelle', 90, PP, 15, 15, 'Site choisi la veille selon la météo (Poligny, Lons-le-Saunier, Salins-les-Bains, Champagnole…)', None, '90 kg maximum',
    'Réservation en ligne sur la page de l’école', U, 'https://www.juraairlines.fr/reservation/', 'Option vidéo : 30 €')
add('B', 'S184', 'Milan royal', 130, PP, 30, 30, 'Site choisi la veille selon la météo (Poligny, Lons-le-Saunier, Salins-les-Bains, Champagnole…)', None, '90 kg maximum',
    'Réservation en ligne sur la page de l’école', U, 'https://www.juraairlines.fr/reservation/', 'Durée selon les thermiques. Option vidéo : 30 €')

# --- Parapente Annecy / Adrénaline (S235) : prix annoncés « environ »
U = 'https://www.annecy-parapente.fr/en/quel-est-le-prix-dun-bapteme-de-parapente/'
for f, p, a, b in [('Vol Découverte', 100, 10, 15), ('Vol Ascendances', 130, 20, 30), ('Vol Sensations', 140, 15, 20),
                   ('Vol spécial enfant', 100, 10, 15), ('Vol Prestige', 170, 40, 40)]:
    add('B', 'S235', f, p, FP, a, b, 'Lac d’Annecy (Talloires-Montmin)', None, None,
        'Voir la page de l’école', U, U, 'Prix annoncé « environ » sur le site ; photos et vidéos du vol incluses selon l’école')

# --- Praloup Parapente (S267) : vols à ski en station
U = 'https://praloup-parapente.com/conditions-tarifs/'
add('B', 'S267', 'Vol Évasion (parapente à ski)', 90, PP, None, None, 'Sommet de la station → Clos du Serre (500 m de dénivelé)', 'À partir de 5 ans', None,
    'Réservation en ligne (bouton « Réserver »), par téléphone ou par e-mail ; confirmation par téléphone 48 h avant', U, U, 'Option photos et vidéos HD : 25 €. Prévoir matériel de ski ou chaussures de neige')
add('B', 'S267', 'Vol Exploration (parapente à ski)', 110, PP, None, None, 'Sommet de la station → front de pistes (800 m de dénivelé)', 'À partir de 5 ans', None,
    'Réservation en ligne (bouton « Réserver »), par téléphone ou par e-mail ; confirmation par téléphone 48 h avant', U, U, 'Option photos et vidéos HD : 25 €. Prévoir matériel de ski ou chaussures de neige')

# --- Serre Chevalier Parapente (S286)
U = 'https://serre-chevalier-parapente.fr/bi-places'
for f, p, a, ag, w in [('Aventure', 110, 15, '12 à 80 ans', '35 à 95 kg'), ('Durée', 150, 30, '12 ans et plus', '50 à 95 kg'),
                       ('Longue Durée', 185, 45, '12 ans et plus', '50 à 95 kg'), ('Enfant', 90, 10, '6 à 12 ans', '20 à 55 kg')]:
    add('B', 'S286', f, p, PP, a, a, 'Rendez-vous au parking des Carines, au pied du Col du Granon', ag, w,
        'Réservation en ligne : choix de la formule et du créneau, confirmation immédiate', U, U, 'Option vidéo : 25 €')
add('B', 'S286', 'Hiver', 130, FP, 30, 45, 'Au pied du Col du Granon (environ 1 000 m de dénivelé)', '12 ans et plus', '25 à 95 kg',
    'Réservation en ligne : choix de la formule et du créneau, confirmation immédiate', U, U, 'Prix annoncé « environ » ; option vidéo : 25 €')

# --- Ventoux Parapente (S314)
U = 'https://ventoux-parapente.com/bapteme-parapente/'
bk = 'Par la page contact, par téléphone ou par e-mail'
add('B', 'S314', 'Formule découverte (Pays de Sault)', 70, PP, 10, 10, 'Site choisi selon la météo (Pays de Sault)', None, '25 à 110 kg', bk, U, U, None)
add('B', 'S314', 'Formule évasion (Pays de Sault)', 90, PP, 20, 20, 'Saint-Jean-de-Sault', None, '25 à 110 kg', bk, U, U, None)
add('B', 'S314', 'Formule piou-piou (enfants)', 70, PP, None, None, None, 'À partir de 5 ans', 'À partir de 25 kg (voile adaptée)', bk, U, U, None)
add('B', 'S314', 'Vol du Mont Ventoux', 125, PP, 20, 30, 'Sommet du Mont Ventoux', None, '45 à 95 kg', bk, U, U, None)
add('B', 'S314', 'Vol VIP (du Ventoux à la vallée de Sault)', 225, PP, 30, 40, 'Sommet du Mont Ventoux, atterrissage dans la vallée de Sault', None, '45 à 95 kg', bk, U, U, None)

# --- Smiles Paragliding (S288)
U = 'https://www.smiles-parapente.com/en/bapteme-parapente'
LS = 'Télécabine du Pas du Lac 2 (Courchevel, Méribel) ou Activity Centre de Bozel'
for f, p, a, b, n in [('Vol Découverte', 120, 10, 20, None), ('Vol Ascendance', 150, 20, 30, None), ('Vol Prestige', 180, 30, 40, None),
                      ('Vol Enfant (Kids)', 100, 10, 15, None), ('Vol Horizon (hiver, à ski)', 140, 15, 20, 'Décollage à skis ou en snowboard'),
                      ('Vol Sensation (hiver)', 140, 10, 15, None), ('Vol Premium (hiver)', 180, 20, 30, None)]:
    add('B', 'S288', f, p, PP, a, b, LS, None, None, 'Réservation en ligne depuis la page de chaque vol', U, U, n)

# --- Taranis Parapente (S300) : durée non publiée
U = 'https://www.taranis-parapente.com/baptemes-parapente-ardeche/'
bk = 'Par téléphone, ou en ligne (ajout au panier sur la page de chaque formule)'
add('B', 'S300', 'Baptême Coccin’Ailes (enfants)', 80, PP, None, None, 'Sud Ardèche', 'Sans limite d’âge pour les baptêmes', None, bk, U, U, 'Vols calmes le matin. Photo et vidéo : 25 €')
add('B', 'S300', 'Baptême Découverte', 90, PP, None, None, 'Sud Ardèche', 'Sans limite d’âge pour les baptêmes', None, bk, U, U, 'Photo et vidéo : 25 €')
add('B', 'S300', 'Baptême Prestige', 140, PP, None, None, 'Sud Ardèche', 'Sans limite d’âge pour les baptêmes', None, bk, U, U, 'Photo et vidéo : 25 €')

# --- Parapente Luchon (S245)
U = 'https://www.parapente-luchon.com/copie-de-formules-tarifs-et-bon-cadeau'
bk = 'Par téléphone, pour choisir le vol et connaître son moniteur'
add('B', 'S245', 'Vol Découverte', 110, PP, 15, 25, 'Luchon', None, None, bk, U, U, 'Toute l’année ; durée selon la météo')
add('B', 'S245', 'Vol Découverte enfants', 110, PP, 15, 25, 'Luchon', 'Enfant en âge de demander à voler ; vols le matin', None, bk, U, U, 'Toute l’année')
add('B', 'S245', 'Vol Ascendances', 140, PP, 25, 40, 'Luchon', None, None, bk, U, U, 'D’avril à fin septembre')
add('B', 'S245', 'Vol Panoramique', 170, PP, 40, 60, 'Luchon', None, None, bk, U, U, 'D’avril à fin septembre')

# --- Parapente 07 (S229) : vols repris en avril 2027
U = 'https://www.parapente07.com/'
LS = 'Les Vans (Serre de Barre), Valgorge (Col de Meyrand) ou Saint-Paul-le-Jeune, selon le vent'
bk = 'Par le formulaire de contact ou par téléphone ; horaire et lieu confirmés la veille'
for f, p, a, b, ag, w in [('Vol Poussin', 85, 10, 15, 'Jusqu’à 10 ans', '25 kg minimum'), ('Vol Découverte', 95, 15, 25, None, '35 à 120 kg'),
                          ('Vol Sensation', 120, 20, 25, None, '40 à 120 kg'), ('Vol Balade', 130, 25, 35, None, '40 à 120 kg'),
                          ('Vol Performance', 160, 35, 45, None, '40 à 120 kg'), ('Vol Long Courrier', 200, 50, 60, None, '40 à 120 kg')]:
    add('B', 'S229', f, p, PP, a, b, LS, ag, w, bk, U, U, 'Navette au décollage incluse ; photos et vidéos en option (+20 €) ; vols repris en avril 2027')

# --- Offres sans tarif affiché (prix sur demande)
U = 'https://www.air-element.com/'
for f in ['Vol Zen', 'Vol Ascendance', 'Vol VIP', 'Vol No Limit']:
    add('B', 'S041', f, None, PP, None, None, 'Diois (Drôme)', None, None, 'Réservation par téléphone', U, U, 'Tarif non affiché sur le site')
add('S', 'S041', 'Stage initiation 5 jours', None, PP, 5, 5, 'Diois (Drôme)', None, None, 'Réservation par téléphone', U, U, 'Tarif non affiché sur le site')
add('S', 'S041', 'Stage progression 4 jours', None, PP, 4, 4, 'Diois (Drôme)', None, None, 'Réservation par téléphone', U, U, 'Tarif non affiché sur le site')

U = None  # URL = site officiel de l'école (Écoles)
CH = 'Chamonix'
add('B', 'S079', 'Vol découverte enfant', None, PP, None, None, 'Chamonix', 'À partir de 7 ans', '30 kg minimum', 'Réservation en ligne', U, U, 'Tarif non relevé')
add('B', 'S079', 'Vol découverte / sensation (hiver)', None, PP, 15, 20, 'Chamonix', None, '90 kg maximum', 'Réservation en ligne', U, U, 'Tarif non relevé')
add('B', 'S079', 'Vol du Plan de l’Aiguille', None, PP, None, None, 'Plan de l’Aiguille (2 300 m)', None, '90 kg maximum', 'Réservation en ligne', U, U, 'Tarif non relevé ; report ou remboursement si la météo est dangereuse')
add('B', 'S079', 'Vol XL', None, PP, 30, 45, 'Chamonix', None, '90 kg maximum', 'Réservation en ligne', U, U, 'Tarif non relevé')
add('B', 'S079', 'Vol XXL', None, PP, 45, 60, 'Chamonix', None, '90 kg maximum', 'Réservation en ligne', U, U, 'Tarif non relevé')
add('B', 'S079', 'Vol de l’Aiguille du Midi', None, PP, None, None, 'Aiguille du Midi (3 800 m)', None, None, 'Réservation en ligne', U, U, 'Tarif non relevé')

U = None
for f, a, b, ag in [('Trinity', 15, 15, 'Enfants et adultes à partir de 4 ans'), ('Everest', 30, 30, None), ('Crossrock', 60, 60, None), ('Émotion (hiver)', 5, 7, None)]:
    add('B', 'S080', f, None, PP, a, b, 'Col de la Loze, Courchevel', ag, None, 'Réservation en ligne', U, U, 'Tarif non relevé ; durée approximative')

U = None
add('B', 'S084', 'Baptême / vol découverte', None, PP, 20, 20, 'Crêtes du Hautacam', None, None, 'Par SMS ou par la page contact', U, U, 'Prix libre jusqu’au 14/12/2026 ; durée approximative')
add('B', 'S084', 'Vol ascendance', None, PP, 8, 40, 'Crêtes du Hautacam', None, None, 'Par SMS ou par la page contact', U, U, 'Prix libre jusqu’au 14/12/2026')
