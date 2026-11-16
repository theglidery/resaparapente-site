# Écoles, baptêmes et stages relevés pour la Suisse romande (CH, prix en CHF) et la Belgique francophone (BE).
# Sources : pages officielles des écoles et fiches des offices de tourisme, relevées le 14/11/2026.
# Montants saisis tels que publiés, dans la devise du pays. Aucune conversion.

# (id, pays, nom, adresse, code postal, ville, code région/canton/province, nom, région, lat, lng, site officiel, labels, langues, description)
SCHOOLS = [
 ('S334', 'CH', 'Paragliding Gruyère', 'Rue du Bourg 23', '1663', 'Gruyères', 'FR', 'Fribourg', 'Suisse romande', 46.5836, 7.0817,
  'https://www.paragliding-gruyere.ch/', None, 'Français',
  'Paragliding Gruyère, dirigée par Pierre-Alain Hayoz, propose des vols biplaces en Gruyère depuis Gruyères. Le baptême « Le rêve d’Icare » (120 CHF, environ 10 minutes) est ouvert toute l’année dès 6 ans ; le grand vol (190 CHF, environ 25 minutes) et le vol Premium acrobatique (220 CHF) sont proposés d’avril à septembre, et un vol enfant de 6 à 12 ans coûte 100 CHF. Le décollage se fait à Charmey, au Moléson ou à Grandvillard. Réservation en ligne, par e-mail ou par téléphone.'),
 ('S335', 'CH', 'Thalia Parapente', 'Les Charrières 3', '1637', 'Charmey', 'FR', 'Fribourg', 'Suisse romande', 46.6203, 7.1627,
  'https://www.thalia-parapente.ch/', None, 'Français, Anglais',
  'Thalia Parapente est une école et un centre de vols biplaces à Charmey, en Gruyère. Le rendez-vous est au pied de la télécabine de Vounetz, devant les caisses. Quatre vols sont proposés : Découverte (140 CHF, 10 minutes), Grand vol (190 CHF, 20 minutes), Sensation avec acrobatie en fin de vol (220 CHF, 20 à 30 minutes) et Découverte enfant (100 CHF). Aucune expérience n’est nécessaire, les vols ont lieu toute l’année quand les remontées sont ouvertes et une date de report se choisit à la réservation.'),
 ('S336', 'CH', 'Airpassion', 'Route du Lac 27', '1669', 'Montbovon', 'FR', 'Fribourg', 'Suisse romande', 46.4818, 7.0233,
  'https://www.airpassion.ch/', None, 'Français',
  'Airpassion est une école de parapente de Montbovon, en Gruyère, animée par Simon Brunetti. Elle propose trois vols biplaces : Powerplay (130 CHF, environ 10 minutes), Gotteron (160 CHF, 10 à 20 minutes, souvent en fin d’après-midi selon la météo) et Sprunger (190 CHF, 20 à 30 minutes). La réservation se fait en ligne. Le site présente aussi une page pour découvrir le parapente et une formation au brevet biplace.'),
 ('S337', 'CH', 'Yoofly', 'Chemin du Camping 20', '1667', 'Enney', 'FR', 'Fribourg', 'Suisse romande', 46.6133, 7.1100,
  'https://www.yoofly.ch/', None, 'Français, Anglais',
  'Yoofly, tenue par Olivier et Valentin à Enney, propose des vols biplaces en Gruyère au départ de Grandvillard, Charmey, Gstaad, Rougemont ou, en hiver, du Moléson. Les formules portent des noms de café : Ristretto (150 CHF, 5 à 10 minutes), Espresso (190 CHF, 20 minutes), Lungo (240 CHF, 40 minutes), Capuccino (290 CHF, 60 minutes) et Early Bird au lever du soleil (320 CHF). Le poids maximum est de 95 kg. Réservation en ligne ; bons cadeaux disponibles.'),
 ('S338', 'CH', 'Gruyère Parapente', 'Ch. du Fenil 20', '1663', 'Épagny', 'FR', 'Fribourg', 'Suisse romande', 46.5908, 7.0846,
  'https://www.gruyere-parapente.ch/', None, 'Français',
  'Gruyère Parapente, créée par Marc et Amandine Pugin à Épagny, est une école de parapente qui propose aussi des vols biplaces en Gruyère : Astuce pour un premier vol (130 CHF, environ 10 minutes), Thermique (190 CHF, environ 25 minutes), Acrobatique (250 CHF) et des vols en montagne précédés d’une marche, à partir de 250 CHF selon le sommet. Un tarif de groupe s’applique dès cinq personnes. Réservation en ligne ou par téléphone ; bons cadeaux disponibles.'),
 ('S339', 'CH', 'Flyin’high', None, '3963', 'Crans-Montana', 'VS', 'Valais', 'Suisse romande', 46.3115, 7.4770,
  'https://www.flyinhigh.ch/', None, 'Français, Allemand, Anglais',
  'Flyin’high propose des baptêmes de l’air en tandem à Crans-Montana, tous les jours de l’année sur rendez-vous. Trois vols sont proposés, de 5 à 95 ans et de 20 à 100 kg : Découverte (180 CHF, environ 15 minutes), Grand vol (210 CHF, 20 à 25 minutes, d’avril à novembre) et Vol magique (280 CHF, 30 à 35 minutes). Selon la saison, le décollage se fait de Bella Lui, du Cry d’Err, du Petit Bonvin, d’Aminona ou d’Aprily ; les remontées ne sont pas comprises. Réservation par formulaire ou par téléphone.'),
 ('S340', 'CH', 'Les Ailes du Léman', 'Prés des Fourches', '1845', 'Noville', 'VD', 'Vaud', 'Suisse romande', 46.3897, 6.8970,
  'https://lesailesduleman.ch/', None, 'Français, Anglais',
  'Les Ailes du Léman volent depuis Sonchaux, au-dessus de Villeneuve, avec rendez-vous au champ d’atterrissage de Noville. Les vols biplaces durent environ 15 minutes : Découverte et Sensation (190 CHF), Petit prince pour les 6 à 16 ans (150 CHF), tarif étudiant (150 CHF) et vol en couple (340 CHF). L’école forme aussi au parapente : stage d’initiation (900 CHF), formation complète (2 600 CHF) et journées découverte à 350 CHF. Réservation en ligne ou par téléphone.'),
 ('S341', 'CH', 'Fly Riviera', 'Rue des Pressoirs 8 bis', '1844', 'Villeneuve', 'VD', 'Vaud', 'Suisse romande', 46.3978, 6.9272,
  'https://flyriviera.ch/', None, 'Français',
  'Fly Riviera est une école de parapente de Villeneuve, sur la Riviera vaudoise. Elle forme au brevet, dispense des cours d’initiation et de théorie, et propose des vols biplaces au départ de Sonchaux, avec photos et vidéos : 230 CHF pour un adulte, 210 CHF pour un étudiant et 190 CHF pour un enfant. Le rendez-vous est au chemin du Pré des Fourches, à Noville. Les moins de 14 ans ont besoin d’une autorisation parentale ; 20 % de réduction avec le Lausanne City Pass. Réservation sur le site.'),
 ('S342', 'CH', 'Riviera Parapente', 'Ch. de la Gay 32', '1801', 'Le Mont-Pèlerin', 'VD', 'Vaud', 'Suisse romande', 46.4838, 6.8071,
  None, None, 'Français',
  'Riviera Parapente propose un vol biplace panoramique au-dessus de la Riviera vaudoise. On monte aux Pléiades (environ 1 310 m) par le train à crémaillère Vevey-Blonay–Les Pléiades, puis on vole environ 15 à 20 minutes selon la météo jusqu’à l’atterrissage à Blonay ou à Chailly. Le vol coûte à partir de 180 CHF, photos et vidéos en supplément. Il faut arriver 15 minutes avant l’heure, et la réservation se fait en ligne depuis la fiche de l’offre sur le site de Suisse Tourisme.'),
 ('S343', 'CH', 'Flyverbier', None, '1936', 'Verbier', 'VS', 'Valais', 'Suisse romande', 46.0967, 7.2285,
  'https://www.flyverbier.ch/', 'Pilotes biplace certifiés FSVL', 'Français',
  'Flyverbier est une école de parapente de Verbier, dans le Val de Bagnes, à environ 30 minutes de Martigny. Elle propose des vols biplaces toute l’année selon la météo, de 15 à 30 minutes, avec des pilotes certifiés par la Fédération suisse de vol libre, et des vols adaptés aux personnes à mobilité réduite sur demande. Le stage d’initiation coûte 910 CHF, à partir de 14 ans, avec un vol biplace de reconnaissance puis cinq premiers vols en solo. Réservation par téléphone, par e-mail ou sur le site.'),
 ('S344', 'CH', 'Zinal Grimentz Parapente', None, '3961', 'Zinal', 'VS', 'Valais', 'Suisse romande', 46.1344, 7.6258,
  'https://zinalgrimentzparapente.ch/', None, 'Français',
  'Zinal Grimentz Parapente propose des vols biplaces au-dessus de Zinal ou de Grimentz, dans le Val d’Anniviers, avec un décollage depuis l’Espace Weisshorn. L’équipe présente aussi une formation pour apprendre à voler. Son site n’affiche pas encore de tarif : demandez les prix, les durées et les créneaux à l’école en la contactant par e-mail ou par son formulaire.'),
 ('S345', 'CH', 'École de Vol Libre Philippe Briod', None, None, 'Mont Suchet', 'VD', 'Vaud', 'Suisse romande', 46.7967, 6.4630,
  'https://www.vol-libre.ch/', None, 'Français',
  'L’École de Vol Libre Philippe Briod enseigne le parapente et le delta depuis plus de 35 ans, avec l’objectif de rendre les élèves autonomes. Elle est basée au Suchet, dans le canton de Vaud, d’avril à décembre, puis à Zinal pendant la saison de ski. Son site présente des séances d’initiation d’un ou de plusieurs jours, la formation théorique et pratique, des vols biplaces, le speed flying et le treuillage. Les tarifs sont à demander à l’école.'),
 ('S346', 'CH', 'Paradelta', 'Route de Bossey 21b', '1256', 'Troinex', 'GE', 'Genève', 'Suisse romande', 46.1500, 6.1667,
  'https://www.paradelta.ch/', None, 'Français, Anglais',
  'Paradelta, installée à Troinex près de Genève, est une école de parapente qui propose des vols biplaces depuis le sommet du Salève : Bi-Cool, Découverte et Sensation, et le vol Premium (240 CHF, 25 à 35 minutes, photos et vidéo à 35 CHF). On se retrouve au champ d’atterrissage de Troinex puis un minibus monte au sommet. La réservation se fait par formulaire ou par téléphone, sans acompte. L’activité est fermée du 29 octobre au 1er mars.'),
 ('S347', 'CH', 'Bol d’Air', 'Chemin des Grandes Isles', '1865', 'Les Diablerets', 'VD', 'Vaud', 'Suisse romande', 46.3517, 7.1583,
  None, None, 'Français',
  'Bol d’Air propose un vol biplace au départ du sommet des Diablerets, dans les Alpes vaudoises, avec vue sur la vallée des Ormonts. Le vol dure environ 15 minutes et le transfert vers le décollage est compris. Le tarif part de 140 CHF, avec photos et courte vidéo en option à 30 CHF. Les vols sont possibles toute l’année selon la météo, et la réservation se fait en ligne depuis la fiche de l’offre sur le site de Suisse Tourisme.'),
 ('S348', 'CH', 'École Delta Parapente Christophe Smith', None, '1884', 'Villars-sur-Ollon', 'VD', 'Vaud', 'Suisse romande', 46.2993, 7.0549,
  None, None, 'Français',
  'L’École Delta Parapente Christophe Smith est installée à Villars, dans les Alpes vaudoises. Elle annonce plus de 25 ans d’expérience et une formation rapide et personnalisée, reconnue par l’Office fédéral de l’aviation civile et la Fédération suisse de vol libre. Des vols d’initiation partent de Villars. Les tarifs et les modalités de réservation ne sont pas publiés sur la fiche relevée : à demander directement à l’école.'),
 ('S349', 'CH', 'ACBFLY Dents du Midi', 'Les Coteaux 6', '1873', 'Val-d’Illiez', 'VS', 'Valais', 'Suisse romande', 46.2033, 6.9167,
  None, None, 'Français',
  'ACBFLY Dents du Midi, le pilote Basile Marclay, propose des vols biplaces avec un moniteur diplômé dans la région des Dents du Midi, à Val-d’Illiez et Champéry. Trois formules sont annoncées : Découverte (120 CHF) pour un panorama de montagne, Classique (140 CHF) pour profiter des ascendances, et Prestige (180 CHF) pour un long vol sur toute la région. Un bon cadeau est disponible. Basile Marclay présente aussi ses vols sous le nom de Champéry Parapente, avec un vol à 160 CHF.'),
 ('S350', 'CH', 'Fly Away Sport et Loisirs', 'Les Apics', '1873', 'Val-d’Illiez', 'VS', 'Valais', 'Suisse romande', 46.2033, 6.9167,
  'https://www.parafly.ch/', None, 'Français',
  'Fly Away est une école de parapente de Val-d’Illiez, dans les Portes du Soleil suisses. Elle propose une journée d’initiation, matériel compris (160 CHF), et des vols biplaces de 100 à 180 CHF selon l’altitude, au départ de Champoussin, des Crosets ou de Champéry. La réservation est obligatoire ; le paiement se fait en espèces ou par Twint. La carte Illiez Card donne 20 % de réduction sur le long vol biplace et la journée d’initiation.'),
 ('S351', 'CH', 'Val d’Illiair Parapente', 'Chemin du Plat 2', '1873', 'Val-d’Illiez', 'VS', 'Valais', 'Suisse romande', 46.2033, 6.9167,
  'https://valdilliair.com/', None, 'Français, Allemand, Anglais',
  'Val d’Illiair Parapente propose des vols biplaces depuis les sommets au-dessus de Champéry et de Val-d’Illiez, tous les jours de l’année, de 8 h à 17 h, selon la réservation et la météo. Deux vols sont proposés, photos et vidéos comprises : le Big Flight (190 CHF) et le vol Prestige (230 CHF). La réservation se fait en ligne et le paiement par carte, en espèces, par Apple Pay ou par Twint. La carte Illiez Card donne 15 % de réduction.'),
 ('S352', 'BE', 'Parapente Confluence', 'Chée de Nivelles 629', '6230', 'Buzet', 'HT', 'Hainaut', 'Wallonie', 50.5000, 4.3500,
  'https://www.parapenteconfluence.be/', 'Agréée par la Fédération belge de vol libre (FBVL)', 'Français',
  'Parapente Confluence est une école de parapente de Buzet, en Hainaut, agréée par la Fédération belge de vol libre, avec des moniteurs et des moniteurs fédéraux assistants. Elle propose la pente-école pour débuter, les premiers grands vols et la progression, des stages de perfectionnement, le SIV (simulation d’incidents de vol) et un stage de performance à Ölüdeniz. Un bon Découverte permet d’offrir une journée d’initiation. Le calendrier se télécharge sur le site ; on réserve par téléphone dès 11 h ou par e-mail.'),
 ('S353', 'BE', 'Fou d’L', None, '5530', 'Godinne', 'NA', 'Namur', 'Wallonie', 50.3650, 4.8900,
  'https://fou-d-l.be/', 'Agréée par la Fédération belge de vol libre (FBVL)', 'Français',
  'Fou d’L est une école de parapente de Godinne, dans la province de Namur, qui se dit l’une des seules écoles agréées pour toutes ses activités par la Fédération belge de vol libre. La pente-école est ouverte toute l’année sur rendez-vous, et des stages de grands vols guidés de 200 à 1 200 m sont organisés chaque mois. Le catalogue comprend aussi la progression, le cross, le pilotage, la randonnée-vol, le speed riding, un stage à la dune du Pilat et la formation biplace. Contact par e-mail ou par téléphone, sans SMS.'),
 ('S354', 'BE', 'Aéroloisirs', 'Quai Saint-Léonard 55/32', '4000', 'Liège', 'LG', 'Liège', 'Wallonie', 50.6564, 5.5880,
  'http://www.aeroloisirs.be/', 'Agréé par la Fédération belge de vol libre (FBVL)', 'Français',
  'Aéroloisirs est un club ou une école de parapente et de deltaplane de Liège, agréé par la Fédération belge de vol libre (FBVL). Son responsable est Olivier Georis. La fiche fédérale n’indique ni les formules, ni les lieux de vol, ni les tarifs : pour un stage ou un premier vol, contactez directement le club par téléphone ou par e-mail.'),
 ('S355', 'BE', 'X1X', 'Rue des Rossignols 4', '6900', 'Marche-en-Famenne', 'LX', 'Luxembourg', 'Wallonie', 50.2270, 5.3440,
  None, None, 'Français',
  'X1X est un club ou une école de parapente de Marche-en-Famenne, dans la province de Luxembourg, répertorié par la Fédération belge de vol libre (FBVL). Son responsable est Vincent Gillard. Le club n’a pas de site internet, seulement des pages sur les réseaux sociaux, et la fiche fédérale ne détaille ni les formules, ni les lieux de vol, ni les tarifs : contactez-le par e-mail.'),
 ('S356', 'BE', 'Paragliding Performance School', 'Rue Fontenelle 3a', '1350', 'Marilles', 'BW', 'Brabant wallon', 'Wallonie', 50.7000, 4.9900,
  'http://www.pps-parapente.com/', None, 'Français',
  'Paragliding Performance School est une école de parapente de Marilles, en Brabant wallon, dirigée par Olivier Gillot et répertoriée par la Fédération belge de vol libre (FBVL). Son intitulé précise qu’elle ne s’adresse pas aux débutants : elle vise les pilotes qui veulent progresser. La fiche fédérale ne détaille ni les formules, ni les lieux de vol, ni les tarifs : contactez l’école avant de vous inscrire.'),
]

# Offres. (type, école, formule, prix, nature, durée min, durée max, lieu, âge, poids, réservation, url, url de réservation, note, niveau)
# type 'B' = baptême (durée en minutes) ; 'S' = stage (durée en jours). prix None = « Prix sur demande ».
PP, FP = 'Prix publié', 'À partir de'
O = []
def add(*a): O.append(a)
W = 'Réservation en ligne, par e-mail ou par téléphone'

U = 'https://www.paragliding-gruyere.ch/'
G = 'Charmey, Moléson ou Grandvillard'
add('B', 'S334', 'Baptême « Le rêve d’Icare »', 120, PP, 10, 10, G, 'Dès 6 ans', None, W, U, U, 'Toute l’année ; durée approximative', None)
add('B', 'S334', 'Grand vol biplace « Le standard »', 190, PP, 25, 25, G, 'Dès 6 ans', None, W, U, U, 'D’avril à septembre ; durée approximative', None)
add('B', 'S334', 'Vol Premium « Le standard PLUS » (acrobatique)', 220, PP, None, None, G, 'Dès 6 ans', None, W, U, U, 'D’avril à septembre', None)
add('B', 'S334', 'Vol enfant (6 à 12 ans)', 100, PP, 10, 10, G, '6 à 12 ans', None, W, U, U, 'De mai à novembre ; durée approximative', None)

U = 'https://www.thalia-parapente.ch/'; UR = 'https://www.thalia-parapente.ch/vols-biplaces/parapente-charmey/'
L = 'Charmey – Vounetz (rendez-vous au pied de la télécabine)'
WT = 'Réservation en ligne ou par téléphone ; date de report choisie à la réservation'
add('B', 'S335', 'Vol Découverte', 140, PP, 10, 10, L, None, None, WT, U, UR, 'Toute l’année quand les remontées sont ouvertes. Option photo', None)
add('B', 'S335', 'Grand vol', 190, PP, 20, 20, L, None, None, WT, U, UR, 'Toute l’année quand les remontées sont ouvertes. Option photo', None)
add('B', 'S335', 'Vol Sensation (avec acrobatie en fin de vol)', 220, PP, 20, 30, L, None, None, WT, U, UR, 'Toute l’année quand les remontées sont ouvertes. Option photo', None)
add('B', 'S335', 'Vol Découverte enfant', 100, PP, None, None, L, 'Enfants', None, WT, U, UR, 'Toute l’année quand les remontées sont ouvertes. Option photo', None)

U = 'https://www.airpassion.ch/vols-biplace/'
add('B', 'S336', 'Vol Powerplay', 130, PP, 10, 10, 'Gruyère', None, None, 'Réservation en ligne', U, U, 'Durée approximative', None)
add('B', 'S336', 'Vol Gotteron', 160, PP, 10, 20, 'Gruyère', None, None, 'Réservation en ligne', U, U, 'Généralement en fin d’après-midi, selon la météo', None)
add('B', 'S336', 'Vol Sprunger', 190, PP, 20, 30, 'Gruyère', None, None, 'Réservation en ligne', U, U, 'Durée selon les conditions', None)

U = 'https://www.yoofly.ch/en/biplaces'; UR = 'https://www.yoofly.ch/en/reservation-vol-60min'
WY = 'Réservation en ligne ; paiement sur place en espèces'
for f, p, a, b, lieu, n in [
    ('Vol Ristretto', 150, 5, 10, 'Grandvillard', 'Toute l’année ; d’avril à octobre le matin seulement'),
    ('Vol Espresso', 190, 20, 20, 'Grandvillard, Charmey, Gstaad ou Rougemont', 'D’avril à octobre'),
    ('Vol Iced Coffee (hiver)', 190, 20, 20, 'Moléson, atterrissage à Grandvillard', 'De décembre à mars'),
    ('Vol Lungo', 240, 40, 40, 'Grandvillard, Charmey, Gstaad ou Rougemont', 'D’avril à octobre'),
    ('Vol Capuccino', 290, 60, 60, 'Grandvillard, Charmey, Gstaad ou Rougemont', 'D’avril à octobre'),
    ('Vol Early Bird (lever du soleil)', 320, None, None, 'Rougemont (sommet du Rodomont)', 'De mai à octobre ; rendez-vous à 5 h')]:
    add('B', 'S337', f, p, PP, a, b, lieu, None, '95 kg maximum', WY, U, UR, n + '. Option photos et vidéos : 30 CHF. Remontées non comprises', None)

U = 'https://www.gruyere-parapente.ch/fr/biplace/'; UR = 'https://www.gruyere-parapente.ch/fr/biplace/reservation-vol-biplace/'
WG = 'Réservation en ligne ou par téléphone'
add('B', 'S338', 'Vol Astuce', 130, PP, 10, 10, 'Gruyère', None, None, WG, U, UR, 'Vol doux pour un premier vol ; durée approximative', None)
add('B', 'S338', 'Vol Thermique', 190, PP, 25, 25, 'Gruyère', None, None, WG, U, UR, 'Tarif de groupe dès 5 personnes : 170 CHF par personne', None)
add('B', 'S338', 'Vol Acrobatique', 250, PP, 25, 25, 'Gruyère', None, None, WG, U, UR, 'Tarif de groupe dès 5 personnes : 230 CHF par personne', None)
add('B', 'S338', 'Vol Montagne (marche puis vol)', 250, FP, None, None, 'Sommets de Gruyère selon l’objectif', None, None, WG, U, UR,
    'Selon le sommet : Biffé 250, Vanil du Vent 250, Tsermont 270, Vanil Blanc 270, Pointe de Paray 300, Vanil de l’Écri 300, Grammont 400 CHF', None)

U = 'https://www.flyinhigh.ch/price'
LF = 'Crans-Montana (Bella Lui, Cry d’Err, Petit Bonvin, Aminona ou Aprily selon la saison)'
WF = 'Formulaire en ligne ou par téléphone ; rendez-vous fixé selon la météo'
add('B', 'S339', 'Vol Découverte', 180, PP, 15, 15, LF, '5 à 95 ans', '20 à 100 kg', WF, U, U, 'Remontée mécanique non comprise : 15 CHF', None)
add('B', 'S339', 'Grand vol', 210, PP, 20, 25, LF, '5 à 95 ans', '20 à 100 kg', WF, U, U, 'D’avril à novembre. Remontée mécanique non comprise : 15 CHF', None)
add('B', 'S339', 'Vol Magique', 280, PP, 30, 35, LF, '5 à 95 ans', '20 à 100 kg', WF, U, U, 'Remontées mécaniques non comprises : 30 CHF', None)

U = 'https://lesailesduleman.ch/biplace/parapente-biplace'; UR = 'https://lesailesduleman.ch/biplace/reserver-un-vol'
LL = 'Sonchaux, au-dessus de Villeneuve (rendez-vous à Noville)'
WL = 'Réservation en ligne ou par téléphone'
add('B', 'S340', 'Vol biplace Découverte', 190, PP, 15, 15, LL, None, 'Plus de 90 kg : prévenir l’école', WL, U, UR, 'Option photos : 40 CHF', None)
add('B', 'S340', 'Vol biplace Sensation', 190, PP, 15, 15, LL, None, 'Plus de 90 kg : prévenir l’école', WL, U, UR, 'Option photos : 40 CHF', None)
add('B', 'S340', 'Vol biplace Petit prince', 150, PP, 15, 15, LL, '6 à 16 ans', None, WL, U, UR, 'Option photos : 40 CHF', None)
add('B', 'S340', 'Vol biplace Découverte étudiant', 150, PP, 15, 15, LL, None, None, WL, U, UR, 'Option photos : 40 CHF', None)
add('B', 'S340', 'Vol biplace Découverte en couple', 340, PP, 15, 15, LL, None, None, WL, U, UR, 'Prix pour deux personnes. Option photos : 40 CHF par personne', None)
UF = 'https://lesailesduleman.ch/formations/formations-tarifs'
add('S', 'S340', 'Stage d’initiation parapente', 900, PP, None, None, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, 'Niveau 1', 'Initiation')
add('S', 'S340', 'Formation parapente niveaux 2 et 3', 1700, PP, None, None, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, 'Prix payable en trois mensualités', 'Progression et autonomie')
add('S', 'S340', 'Formation parapente complète (niveaux 1 à 3)', 2600, PP, None, None, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, None, 'Initiation')
add('S', 'S340', 'Journée découverte parapente', 350, PP, 1, 1, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, 'Matériel compris', 'Initiation')
add('S', 'S340', 'Journée découverte à skis', 350, PP, 1, 1, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, 'Matériel compris, forfait de ski non compris', 'Initiation')
add('S', 'S340', 'Mini-voile à pied ou à skis (avec matériel)', 250, PP, 1, 1, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, None, 'SIV et pilotage')
add('S', 'S340', 'Mini-voile à pied ou à skis (sans matériel)', 200, PP, 1, 1, 'Vaud (Villeneuve)', None, None, 'Contacter l’école', UF, UF, None, 'SIV et pilotage')

U = 'https://flyriviera.ch/'; UR = 'https://flyriviera.ch/reservations/'
for f, p in [('Vol biplace depuis Sonchaux (adulte)', 230), ('Vol biplace depuis Sonchaux (étudiant)', 210), ('Vol biplace depuis Sonchaux (enfant)', 190)]:
    add('B', 'S341', f, p, PP, None, None, 'Sonchaux, au-dessus de Villeneuve (rendez-vous à Noville)', 'Moins de 14 ans : autorisation parentale',
        None, 'Réservation en ligne', U, UR, 'Photos et vidéos incluses. 20 % de réduction avec le Lausanne City Pass', None)

U = 'https://www.myswitzerland.com/en/planning/offers/riviera-parapente-vol-biplace/'
add('B', 'S342', 'Vol biplace panoramique', 180, FP, 15, 20, 'Les Pléiades (environ 1 310 m), atterrissage à Blonay ou Chailly', None, None,
    'Réservation en ligne depuis la fiche de l’offre ; arriver 15 minutes avant', U, U, 'Photos et vidéos en supplément. Montée en train à crémaillère', None)

U = 'https://www.flyverbier.ch/'
add('B', 'S343', 'Vol biplace à Verbier', None, PP, 15, 30, 'Verbier, Val de Bagnes', None, None, 'Par téléphone, par e-mail ou sur le site', U, U, 'Tarif non relevé ; vols adaptés aux personnes à mobilité réduite sur demande', None)
add('S', 'S343', 'Stage d’initiation', 910, PP, None, None, 'Verbier', 'À partir de 14 ans', None, 'Contact par WhatsApp', 'https://www.flyverbier.ch/formations/', 'https://www.flyverbier.ch/formations/',
    '3 à 5 demi-journées de préférence ; pente-école, vol biplace de reconnaissance et 5 premiers vols en solo', 'Initiation')

U = 'https://zinalgrimentzparapente.ch/vols-biplace-parapente/'
add('B', 'S344', 'Vol biplace Zinal ou Grimentz', None, PP, None, None, 'Espace Weisshorn (Zinal, Grimentz)', None, None, 'Par e-mail ou par le formulaire du site', U, 'https://zinalgrimentzparapente.ch/contact/', 'Tarif non relevé', None)

add('B', 'S345', 'Vol biplace (parapente ou delta)', None, PP, None, None, 'Suchet (VD) ou Zinal (VS) selon la saison', None, None, 'Voir le site de l’école', 'https://www.vol-libre.ch/', 'https://www.vol-libre.ch/', 'Tarif non relevé', None)
add('S', 'S345', 'Initiation au parapente (un ou plusieurs jours)', None, PP, None, None, 'Suchet (VD) ou Zinal (VS) selon la saison', None, None, 'Voir le site de l’école', 'https://www.vol-libre.ch/formation/', 'https://www.vol-libre.ch/formation/', 'Tarif non relevé', 'Initiation')

U = 'https://www.paradelta.ch/en/tandem'
LP = 'Sommet du Salève (rendez-vous au champ d’atterrissage de Troinex)'
WP = 'Formulaire en ligne ou par téléphone ; pas d’acompte'
add('B', 'S346', 'Vol tandem Premium', 240, PP, 25, 35, LP, 'Pas de limite d’âge', 'Plus de 100 kg : contacter l’école', WP, U, U, 'Photos et vidéo : 35 CHF. 10 % de réduction pour les groupes de 4 et plus et pour les étudiants. Fermé du 29 octobre au 1er mars', None)
add('B', 'S346', 'Vol tandem Bi-Cool', None, PP, None, None, LP, None, None, WP, U, U, 'Tarif non relevé. Fermé du 29 octobre au 1er mars', None)
add('B', 'S346', 'Vol tandem Découverte et Sensation', None, PP, None, None, LP, None, None, WP, U, U, 'Tarif non relevé. Fermé du 29 octobre au 1er mars', None)

U = 'https://www.myswitzerland.com/en-ie/planning/offers/paragliding-flight-from-les-diablerets'
add('B', 'S347', 'Vol biplace depuis les Diablerets', 140, FP, 10, 15, 'Sommet des Diablerets (transfert compris)', None, None, 'Réservation en ligne depuis la fiche de l’offre', U, U, 'Photos et courte vidéo : 30 CHF', None)

U = 'https://www.alpesvaudoises.ch/en/service-providers/smith-paragliding'
add('B', 'S348', 'Vol d’initiation biplace', None, PP, None, None, 'Villars', None, None, 'Voir la fiche de l’école', U, U, 'Tarif non relevé', None)

U = 'https://www.regiondentsdumidi.ch/en/5120896-acbfly-dents-du-midi-paragliding-tandemflight-36020'
for f, p in [('Vol Découverte', 120), ('Vol Classique', 140), ('Vol Prestige', 180)]:
    add('B', 'S349', f, p, PP, None, None, 'Val-d’Illiez et Champéry (Dents du Midi)', None, None, 'Par téléphone ou par e-mail', U, U, 'Champéry Parapente, du même pilote, annonce un vol à 160 CHF', None)

U = 'https://www.regiondentsdumidi.ch/en/541760-fly-away-sport-et-loisirs-5138/'
add('B', 'S350', 'Vol biplace', 100, FP, None, None, 'Champoussin, Les Crosets ou Champéry', None, None, 'Réservation obligatoire', 'https://www.parafly.ch/', U, 'Entre 100 et 180 CHF selon l’altitude ; Illiez Card : 20 % de réduction sur le long vol', None)
add('S', 'S350', 'Journée d’initiation', 160, PP, 1, 1, 'Val-d’Illiez', None, None, 'Réservation obligatoire', 'https://www.parafly.ch/', U, 'Matériel compris ; Illiez Card : 20 % de réduction', 'Initiation')

U = 'https://www.regiondentsdumidi.ch/en/6071066-val-d-illiair-parapente-42665/'
add('B', 'S351', 'Vol Big Flight', 190, PP, None, None, 'Sommets au-dessus de Champéry et de Val-d’Illiez', None, None, 'Réservation en ligne', 'https://valdilliair.com/', U, 'Photos et vidéos comprises ; Illiez Card : 15 % de réduction', None)
add('B', 'S351', 'Vol Prestige', 230, PP, None, None, 'Sommets au-dessus de Champéry et de Val-d’Illiez', None, None, 'Réservation en ligne', 'https://valdilliair.com/', U, 'Photos et vidéos comprises ; Illiez Card : 15 % de réduction', None)

# --- Belgique : tarifs non publiés sur les pages relevées
U = 'https://www.parapenteconfluence.be/'
WC = 'Par téléphone dès 11 h (fermé le dimanche), par e-mail ou par le formulaire du site'
for f, lv in [('Pente école', 'Initiation'), ('Premiers grands vols et progression', 'Progression et autonomie'),
              ('Stage de perfectionnement', 'Perfectionnement, thermique et cross'), ('SIV (simulation d’incidents de vol)', 'SIV et pilotage'),
              ('Stage de performance à Ölüdeniz (2026)', 'Marche et vol, séjours et voyages')]:
    add('S', 'S352', f, None, PP, None, None, 'Belgique (calendrier téléchargeable sur le site)' if 'Ölü' not in f else 'Ölüdeniz (Turquie)', None, None, WC, U, U, 'Tarif non relevé', lv)

U = 'https://fou-d-l.be/'
WD = 'Par e-mail (voler@voler.be) ou par téléphone, sans SMS ni WhatsApp'
add('B', 'S353', 'Vol biplace', None, PP, None, None, 'Belgique', None, None, WD, U, U, 'Tarif non relevé', None)
for f, lv in [('Pente école', 'Initiation'), ('Grand vol et progression', 'Progression et autonomie'), ('Cross', 'Perfectionnement, thermique et cross'),
              ('Pilotage', 'SIV et pilotage'), ('Randonnée-vol', 'Marche et vol, séjours et voyages'), ('Stage à la dune du Pilat', 'Marche et vol, séjours et voyages')]:
    add('S', 'S353', f, None, PP, None, None, 'Belgique (pente-école) ou sites de vol guidés' if f in ('Pente école', 'Grand vol et progression') else 'Voir le site de l’école', None, None, WD, U, U, 'Tarif non relevé', lv)

# Villes de recherche à ajouter : (id, ville, pays, code, région/canton, lat, lng, rayon km)
CITIES = [
 ('VR-CH01', 'Gruyères', 'CH', 'FR', 'Suisse romande', 46.5836, 7.0817, 40), ('VR-CH02', 'Charmey', 'CH', 'FR', 'Suisse romande', 46.6203, 7.1627, 40),
 ('VR-CH03', 'Crans-Montana', 'CH', 'VS', 'Suisse romande', 46.3115, 7.4770, 50), ('VR-CH04', 'Villeneuve (VD)', 'CH', 'VD', 'Suisse romande', 46.3978, 6.9272, 50),
 ('VR-CH05', 'Montreux', 'CH', 'VD', 'Suisse romande', 46.4332, 6.9114, 50), ('VR-CH06', 'Verbier', 'CH', 'VS', 'Suisse romande', 46.0967, 7.2285, 50),
 ('VR-CH07', 'Val-d’Illiez', 'CH', 'VS', 'Suisse romande', 46.2033, 6.9167, 50), ('VR-CH08', 'Zinal', 'CH', 'VS', 'Suisse romande', 46.1344, 7.6258, 50),
 ('VR-CH09', 'Les Diablerets', 'CH', 'VD', 'Suisse romande', 46.3517, 7.1583, 50), ('VR-CH10', 'Villars-sur-Ollon', 'CH', 'VD', 'Suisse romande', 46.2993, 7.0549, 50),
 ('VR-CH11', 'Genève', 'CH', 'GE', 'Suisse romande', 46.2044, 6.1432, 50), ('VR-CH12', 'Lausanne', 'CH', 'VD', 'Suisse romande', 46.5197, 6.6323, 50),
 ('VR-BE01', 'Namur', 'BE', 'NA', 'Wallonie', 50.4674, 4.8720, 50), ('VR-BE02', 'Liège', 'BE', 'LG', 'Wallonie', 50.6326, 5.5797, 50),
 ('VR-BE03', 'Charleroi', 'BE', 'HT', 'Wallonie', 50.4108, 4.4446, 50), ('VR-BE04', 'Marche-en-Famenne', 'BE', 'LX', 'Wallonie', 50.2270, 5.3440, 50),
 ('VR-BE05', 'Bruxelles', 'BE', 'BRU', 'Bruxelles-Capitale', 50.8503, 4.3517, 60),
]
