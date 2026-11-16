// "Baptême, biplace, saut en parapente" guide: one page behind the two menu entries "Biplace" and "Saut en parapente".
// Written in our own words from school FAQ pages, tourist-office sheets and training guides (see docs/CONTENT-SOURCES.md).
// Prices of the page come from the schools' published prices (computed at build), never from this file.
import type { Article } from './article-types';

export const BAPTEME_GUIDE: Article = {
  slug: 'biplace-saut-en-parapente',
  title: 'Saut en parapente, baptême et vol biplace : tout savoir avant de voler',
  h1: 'Saut en parapente, baptême et vol biplace',
  lead: 'Trois noms pour un même vol : vous êtes installé devant un pilote professionnel, sous une seule voile. Voici comment se passe la journée, de l’inscription à l’atterrissage.',
  description: 'Saut en parapente, baptême ou vol biplace : déroulé du vol, sensations, âge et poids, tenue, photos, arrivée, météo, annulation et prix.',
  brief: [
    { k: 'Durée du vol', v: '10 à 20 minutes (découverte), 25 à 45 minutes ou plus (vol thermique)' },
    { k: 'Temps sur place', v: 'Prévoir une demi-journée : accueil, briefing, montée, vol, retour' },
    { k: 'Pour qui', v: 'Presque tout le monde : il suffit de pouvoir faire quelques pas de course' },
    { k: 'Réservation', v: 'Une demande gratuite à l’école, qui confirme le créneau selon la météo' },
  ],
  sections: [
    {
      id: 'meme-vol', h: 'Baptême, biplace, saut : le même vol',
      p: [
        'Les écoles disent « baptême de parapente » ou « vol biplace ». Le grand public dit souvent « saut en parapente » ou « vol en tandem ». Les quatre expressions désignent la même activité : un vol à deux sous une seule voile, avec un pilote professionnel qui décolle, pilote et atterrit pour vous.',
        'Le mot « saut » peut tromper : il n’y a ni saut dans le vide ni chute libre. La voile est gonflée au sol avant le décollage. Vous courez quelques pas, la voile vous porte, et vous êtes en vol dès les premiers mètres. Rien à voir avec le parachutisme, où l’on quitte un avion et où la voile s’ouvre après une phase de chute.',
      ],
    },
    {
      id: 'deroule', h: 'Le vol, étape par étape',
      steps: [
        { t: 'Accueil', d: 'Vous retrouvez le pilote au point de rendez-vous de l’école, souvent près de l’atterrissage. Il vérifie la météo du moment, vous présente le programme et répond à vos questions.' },
        { t: 'Montée au décollage', d: 'Une navette, une remontée mécanique ou un court trajet à pied vous conduit au décollage. Les écoles regroupent souvent plusieurs passagers dans la même montée.' },
        { t: 'Équipement et briefing', d: 'Vous enfilez un casque et un harnais avec protection dorsale, fournis par l’école. Le pilote explique ce que vous aurez à faire : courir quelques pas, ne pas vous asseoir avant son signal, et le reste du temps profiter.' },
        { t: 'Décollage', d: 'Le pilote gonfle la voile derrière vous. Au signal, vous courez sur quelques mètres. La voile vous soulève, puis vous vous installez dans le harnais, assis face au paysage.' },
        { t: 'Le vol', d: 'Le pilote vole en commentant le paysage. Selon la formule, le vol est calme et contemplatif ou plus dynamique, avec des virages engagés si vous le demandez. Beaucoup de pilotes proposent de tenir les commandes un moment.' },
        { t: 'Atterrissage', d: 'Le pilote vous prévient avant l’approche. L’atterrissage se fait face au vent sur un grand terrain dégagé, le plus souvent assis ou après quelques pas de marche.' },
      ],
    },
    {
      id: 'sensations', h: 'Ce que vous allez ressentir',
      p: [
        'Les passagers parlent surtout de calme et de liberté. Vous voyagez à une vitesse modérée, de l’ordre de 35 à 40 km/h, avec le bruit du vent et rien devant vous, si ce n’est le paysage. Comme vos pieds ne reposent sur aucune surface en hauteur, le vertige est rare : il naît de repères visuels contradictoires, qui disparaissent en vol.',
        'La plupart des passagers disent que le décollage est le moment le plus doux : on a l’impression d’être porté, pas d’être projeté. Les sensations fortes sont possibles (virages serrés, vols acrobatiques proposés par certaines écoles), mais elles sont toujours sur demande.',
      ],
      ul: [
        'Vol calme : idéal pour les enfants, les personnes inquiètes ou celles qui veulent surtout regarder.',
        'Vol dynamique : virages engagés et prises de vitesse, à demander au pilote ou à choisir dans une formule « sensation ».',
        'Si vous êtes sujet au mal des transports : choisissez un vol tôt le matin, quand l’air est calme, évitez les virages serrés et demandez conseil à un pharmacien.',
      ],
    },
    {
      id: 'pour-qui', h: 'Âge, poids, santé : qui peut voler ?',
      p: ['Chaque école fixe ses limites selon son matériel et son site. Les repères ci-dessous sont les plus fréquents ; la fiche de l’école et le pilote ont le dernier mot.'],
      table: [
        ['Âge minimum', 'Souvent entre 4 et 6 ans pour un vol calme ; parfois plus élevé pour les vols longs. Pas de limite supérieure tant que vous pouvez faire quelques pas de course.'],
        ['Poids', 'Un maximum fixé par l’école selon sa voile, généralement entre 90 et 120 kg. Il peut être plus bas le matin, quand le vent est faible et que la course de décollage est plus longue.'],
        ['Santé', 'Aucun certificat médical n’est demandé pour un baptême. Signalez à l’école les problèmes de dos, de cœur ou respiratoires, l’épilepsie et la grossesse : en cas de doute, demandez l’avis de votre médecin.'],
        ['Mineurs', 'Une autorisation parentale est demandée, avec l’accord de l’école pour l’âge et le poids de l’enfant.'],
        ['Mobilité réduite', 'Certaines écoles proposent un harnais adapté (vol « handi ») : posez la question à l’école avant de réserver.'],
      ],
    },
    {
      id: 'preparer', h: 'Bien se préparer : tenue et affaires à prévoir',
      ul: [
        'Des chaussures fermées qui tiennent la cheville (baskets montantes, chaussures de marche) : vous allez courir sur un terrain parfois en pente.',
        'Un pantalon long et un vêtement coupe-vent : l’air est plus frais en altitude et en vol, même en été.',
        'Des lunettes de soleil, une casquette est possible sous le casque selon la taille.',
        'Une petite bouteille d’eau si le rendez-vous est long ; pas de repas copieux juste avant.',
        'Le casque et le harnais sont fournis par l’école, pas besoin de matériel personnel.',
        'Laissez les objets fragiles ou de valeur à l’accueil, et ne gardez rien dans les poches (clés, portefeuille, téléphone non attaché).',
      ],
    },
    {
      id: 'photos', h: 'Photos et vidéo : comment garder un souvenir',
      p: [
        'Beaucoup de pilotes filment le vol avec leur propre caméra et proposent les photos et la vidéo en option payante. Certaines formules (souvent « prestige ») les incluent. La fiche de chaque formule indique si le souvenir est compris ; sinon, posez la question à l’école au moment de la demande.',
        'Si vous voulez filmer vous-même, demandez d’abord à l’école. Beaucoup d’écoles acceptent une petite caméra fixée à vous (poignet, poitrine), jamais sur le casque. Attachez toujours votre appareil et laissez le téléphone à l’accueil si possible : l’école n’est pas responsable d’un objet perdu en vol.',
      ],
    },
    {
      id: 's-inscrire', h: 'Comment s’inscrire',
      steps: [
        { t: 'Choisissez une école et une formule', d: 'Utilisez la recherche par région ou par ville, puis comparez les formules : durée, lieu, prix, photos incluses.' },
        { t: 'Cliquez sur « Réserver »', d: 'Indiquez vos coordonnées, la date souhaitée (avec, si vous voulez, deux dates de repli en cas de météo), le nombre de passagers et le poids de chacun.' },
        { t: 'L’école vous répond', d: 'Elle confirme le créneau, le prix TTC, le lieu de rendez-vous et les modalités de paiement. La demande est gratuite et sans engagement ; le contrat se fait avec l’école.' },
        { t: 'Le jour J', d: 'Vous recevez le dernier point météo de l’école, qui peut décaler ou reporter le vol.' },
      ],
      note: 'Pour offrir un vol, certaines écoles vendent leur propre bon cadeau : retrouvez-les sur la page « Bons cadeaux des écoles ».',
    },
    {
      id: 'arrivee', h: 'Combien de temps à l’avance arriver ?',
      p: [
        'L’école vous donne une heure de rendez-vous : respectez-la et prévoyez une marge. Le plus souvent, on demande d’arriver une quinzaine de minutes avant, pour l’accueil, le briefing et l’équipement. Prévoyez ensuite un créneau large : avec la montée, l’attente du bon moment pour décoller, le vol et le retour, comptez en général entre une heure et demie et trois heures sur place.',
        'Évitez les rendez-vous serrés juste avant ou après (train, restaurant, check-out) : le vol se fait au meilleur moment selon le vent et la thermique, et peut être décalé de quelques dizaines de minutes.',
      ],
    },
    {
      id: 'meteo', h: 'Et si la météo n’est pas bonne ?',
      p: [
        'Le pilote décide de voler ou non, toujours. La pluie, le vent trop fort ou mal orienté, les orages ou le brouillard au décollage conduisent à reporter. Ce n’est pas un caprice : une voile ne vole bien et en sécurité que dans un air adapté.',
        'Avant de réserver, regardez la politique de l’école : report gratuit à une autre date, avoir ou remboursement si aucun créneau ne convient. Proposer deux dates de repli à la réservation simplifie beaucoup les choses. Les vols du matin sont souvent les plus calmes, ceux de l’après-midi plus longs en thermique.',
      ],
      ul: [
        'Vérifiez vos messages le matin du vol : l’école confirme ou reporte.',
        'Si vous venez de loin, gardez une journée de marge dans votre séjour.',
        'Un vol reporté pour la météo ne s’annule pas à vos frais : l’école applique ses conditions, que vous pouvez lire avant de réserver.',
      ],
    },
    {
      id: 'securite', h: 'Est-ce sûr ?',
      p: [
        'Le parapente est une activité à risques, qui se pratique avec un encadrement professionnel. Les vols biplace commerciaux sont réalisés par des moniteurs diplômés d’État, avec un matériel homologué et révisé, et l’exploitant doit être couvert par une assurance de responsabilité civile professionnelle. Choisissez de préférence une école qui indique ses labels (par exemple le label FFVL) et son assurance.',
        'Le pilote vous explique les consignes avant le décollage et pendant le vol. Si la météo se dégrade ou si vous êtes mal à l’aise, il peut raccourcir ou interrompre le vol.',
      ],
    },
  ],
  faq: [
    { q: 'Quelle différence entre baptême, biplace et saut en parapente ?', a: 'Aucune : ce sont des expressions employées pour un vol en tandem avec un pilote professionnel. Le « saut » n’implique ni chute libre ni saut dans le vide.' },
    { q: 'Faut-il une expérience ou une condition physique particulière ?', a: 'Non. Il suffit de pouvoir faire quelques pas de course au décollage et de suivre les consignes du pilote.' },
    { q: 'Combien de temps dure le vol ?', a: 'De 10 à 20 minutes pour un vol découverte, de 25 à 45 minutes ou plus pour un vol thermique, selon l’école et les conditions du jour.' },
    { q: 'Puis-je choisir un vol plus calme ou plus sportif ?', a: 'Oui. Dites au pilote ce que vous préférez, ou choisissez une formule « découverte » (calme) ou « sensation » (dynamique).' },
    { q: 'Les photos et la vidéo sont-elles comprises ?', a: 'Cela dépend de la formule. Beaucoup d’écoles les proposent en option ; la fiche indique si elles sont incluses.' },
    { q: 'Qui me répond après ma demande ?', a: 'L’école que vous avez choisie. Elle confirme la date, le prix TTC et les modalités de paiement. ResaParapente ne perçoit aucun paiement.' },
  ],
  next: [
    { href: '/pourquoi-voler/les-plaisirs-du-parapente/', label: 'Les plaisirs du parapente', text: 'Vol calme, ascendances et sensations : choisir selon ses envies.' },
    { href: '/bapteme/', label: 'Trouver un baptême près de chez vous', text: 'Recherche par région et par ville, avec les prix publiés par les écoles.' },
    { href: '/bons-cadeaux/', label: 'Offrir un vol', text: 'Les bons cadeaux vendus directement par les écoles.' },
    { href: '/stage/initiation/', label: 'Aller plus loin : le stage d’initiation', text: 'Apprendre à piloter soi-même.' },
  ],
};
