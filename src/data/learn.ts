// "Apprendre le parapente": path to become a pilot, the three FFVL brevets, licence and insurance, and the theory course
// (6 modules, 28 lessons). Written in our own words after reading FFVL material, school training pages and training
// guides (see docs/CONTENT-SOURCES.md). General teaching only: a real course always goes through a diplomaed instructor.
import { FIRST_STAGE, FIRST_STAGE_LINK } from './first-stage';
import type { Article, Section } from './article-types';

const FFVL = { href: 'https://www.ffvl.fr/', label: 'Fédération française de vol libre (FFVL)' };
const L = (id: string, h: string, ...p: string[]): Section => ({ id, h, p });

export const LEARN_ROOT = '/apprendre/';

const HUB: Article = {
  slug: '',
  title: 'Apprendre le parapente : le parcours pour devenir pilote',
  h1: 'Apprendre le parapente',
  lead: 'Du premier vol en biplace au brevet de pilote confirmé : les étapes, les durées, les brevets et la théorie, expliqués simplement.',
  description: 'Apprendre le parapente en France : parcours type, stages d’initiation et de perfectionnement, brevets FFVL initial, pilote et confirmé, licence, assurance et cours de théorie.',
  brief: [
    { k: 'Où apprendre', v: 'En école ou en club, avec un moniteur diplômé' },
    { k: 'Premier stage', v: 'Environ 5 jours pour l’initiation' },
    { k: 'Brevets', v: 'Initial (vert), pilote (bleu), pilote confirmé (marron)' },
    { k: 'Obligatoire ?', v: 'Aucun permis imposé par la loi ; la licence et l’assurance sont indispensables' },
  ],
  sections: [
    {
      id: 'parcours', h: 'Le parcours type',
      steps: [
        { t: 'Un baptême pour essayer (facultatif)', d: 'Un vol biplace pour voir le paysage et sentir si l’activité vous plaît. Il n’est pas obligatoire pour s’inscrire en stage.' },
        { t: 'Le stage d’initiation', d: 'Environ cinq jours pour apprendre à gonfler, décoller, piloter et atterrir, et réaliser vos premiers vols avec une radio. La progression se poursuit ensuite selon les acquis et la météo.' },
        { t: 'Le stage de progression', d: 'Trois à cinq jours pour voler sur d’autres sites et dans des conditions plus variées, jusqu’à l’autonomie.' },
        { t: 'Le perfectionnement et le SIV', d: 'Pilotage actif, incidents de vol (au-dessus d’un lac), premiers thermiques. Il prépare le brevet de pilote.' },
        { t: 'Le brevet de pilote', d: 'Un repère d’autonomie dans le parcours fédéral. Le moment de l’évaluation dépend des compétences acquises.' },
        { t: 'Thermique, cross et brevet de pilote confirmé', d: 'Voler plus longtemps, plus loin et dans des conditions plus fortes, avec un bagage météo et sécurité solide.' },
      ],
    },
    {
      id: 'combien', h: 'Combien de temps et combien ça coûte ?',
      p: [
        'Les repères varient selon les écoles, la région et la météo. Un stage d’initiation et un stage de progression ou de perfectionnement coûtent chacun plusieurs centaines d’euros, matériel prêté compris dans la plupart des cas. La licence fédérale (assurance incluse) s’ajoute chaque année. Le matériel personnel (voile, sellette, parachute de secours) représente un investissement de plusieurs milliers d’euros, qu’il vaut mieux faire après avoir volé et reçu les conseils de son moniteur.',
        'Les prix publiés par les écoles sont affichés sur chaque page de stage : choisissez votre niveau dans le menu « Stage ».',
      ],
    },
    {
      id: 'ou', h: 'Où apprendre ?',
      p: ['En école (professionnelle, avec des moniteurs diplômés d’État) ou en club affilié à la FFVL (avec des moniteurs fédéraux). Les deux peuvent valider vos brevets. Cherchez le label de l’école, la taille du groupe, le site d’entraînement et les conditions météo de report.'],
    },
  ],
  next: [
    FIRST_STAGE_LINK,
    { href: '/apprendre/brevets/', label: 'Les trois brevets FFVL', text: 'Initial, pilote et pilote confirmé : épreuves, préparation, durée.' },
    { href: '/apprendre/licence-ffvl/', label: 'Licence et assurance', text: 'Ce qui est obligatoire, ce qui ne l’est pas, et pourquoi la licence compte.' },
    { href: '/apprendre/cours/', label: 'Cours de parapente', text: 'Six modules de théorie : aérologie, météo, gonflage, décollage, vol, sécurité.' },
    { href: '/stage/', label: 'Trouver un stage', text: 'Comparer les écoles et envoyer une demande.' },
  ],
};

const BREVETS: Article = {
  slug: 'brevets',
  title: 'Brevets de parapente : initial, pilote et pilote confirmé',
  h1: 'Les brevets de parapente',
  lead: 'Trois niveaux fédéraux jalonnent la progression : le brevet initial, le brevet de pilote et le brevet de pilote confirmé.',
  description: 'Les trois brevets de parapente de la FFVL : brevet initial (vert), brevet de pilote (bleu), brevet de pilote confirmé (marron). Épreuves, préparation, durée, utilité.',
  parent: { href: LEARN_ROOT, label: 'Apprendre le parapente' },
  brief: [
    { k: 'Qui délivre', v: 'La FFVL, par l’intermédiaire de moniteurs habilités' },
    { k: 'Épreuves', v: 'Un questionnaire théorique et une évaluation pratique en vol' },
    { k: 'Suivi', v: 'Les compétences sont notées au fil du temps dans le passeport de vol libre' },
    { k: 'Obligation', v: 'Aucune loi, mais souvent demandé par les écoles et les clubs' },
  ],
  sections: [
    {
      id: 'ensemble', h: 'Les trois brevets en un coup d’œil',
      table: [
        ['Brevet', 'Ce qu’il valide', 'Préparation conseillée'],
        ['Initial (vert)', 'Voler seul sur un site connu, le plus souvent le site-école, par conditions calmes', 'Stage d’initiation'],
        ['Pilote (bleu)', 'Autonomie sur des sites et dans des conditions variés, thermique en sécurité', 'Progression, perfectionnement, SIV, vols réguliers'],
        ['Pilote confirmé (marron)', 'Pilotage maîtrisé en thermique, préparation d’un vol de distance, culture météo et sécurité', 'Stage pilote confirmé, cross, SIV'],
      ],
    },
    {
      id: 'epreuves', h: 'Comment se passent les épreuves ?',
      p: [
        'Chaque brevet comporte une partie théorique et une partie pratique. La théorie prend la forme d’un questionnaire à choix multiples sur la météo, la mécanique de vol, le matériel, la règlementation et la sécurité, plus approfondi à chaque niveau. Elle est passée en école ou en club.',
        'La pratique est évaluée en vol par un moniteur habilité, sur plusieurs vols : préparation, décollage, pilotage, approche, atterrissage et prise de décision. Au fil de votre progression, les compétences sont validées dans le passeport de vol libre, qui garde la trace de votre parcours.',
      ],
    },
    {
      id: 'pourquoi', h: 'Pourquoi passer ses brevets ?',
      ul: [
        'Ils structurent la progression et donnent des objectifs concrets.',
        'Ils rassurent les écoles et les clubs sur votre niveau, et sont souvent demandés pour louer du matériel, voler sur certains sites encadrés ou participer à un voyage organisé.',
        'Certaines qualifications fédérales (par exemple la qualification biplace) et la compétition passent par le brevet de pilote confirmé.',
        'Ils fixent un socle de connaissances en météo et en sécurité que l’on oublie facilement seul.',
      ],
    },
    {
      id: 'obligation', h: 'Les brevets sont-ils obligatoires ?',
      p: ['Non : aucune loi n’impose un permis pour voler en parapente en France. Le brevet est fortement recommandé, et la licence fédérale avec son assurance de responsabilité civile est le vrai passage obligé pour voler en club ou en école.'],
    },
  ],
  faq: [
    { q: 'Combien de temps pour passer le brevet de pilote ?', a: 'En général une à deux saisons après le brevet initial, selon le nombre de vols et la météo.' },
    { q: 'Les brevets sont-ils valables partout ?', a: 'Ils sont délivrés par la FFVL. Certains pays demandent une carte de compétence internationale (IPPI) pour voler sur leurs sites.' },
    { q: 'Puis-je préparer mon brevet en club ?', a: 'Oui. La préparation peut se faire en club, mais l’évaluation pratique est réalisée par un moniteur habilité selon les règles de la FFVL.' },
  ],
  next: [
    { href: '/apprendre/brevets/initial/', label: 'Brevet initial', text: 'Le premier niveau, en fin d’initiation.' },
    { href: '/apprendre/brevets/pilote/', label: 'Brevet de pilote', text: 'Le diplôme de l’autonomie.' },
    { href: '/apprendre/brevets/pilote-confirme/', label: 'Brevet de pilote confirmé', text: 'Thermique, cross et sécurité avancée.' },
  ],
};

const INITIAL: Article = {
  slug: 'brevets/initial',
  title: 'Brevet initial de parapente (niveau vert) : épreuves, préparation, durée',
  h1: 'Le brevet initial de parapente',
  lead: 'Le premier brevet FFVL, en fin de stage d’initiation : voler seul sur un site connu, par conditions calmes.',
  description: 'Brevet initial de parapente FFVL (niveau vert) : ce qu’il valide, épreuves, préparation, durée, stage d’initiation et suite du parcours.',
  parent: { href: '/apprendre/brevets/', label: 'Les brevets' },
  brief: [
    { k: 'Niveau', v: 'Vert, premier brevet' },
    { k: 'Ce qu’il valide', v: 'Voler seul sur un site connu par conditions calmes' },
    { k: 'Préparation', v: 'Stage d’initiation (environ 5 jours)' },
    { k: 'Épreuves', v: 'Questionnaire théorique et évaluation pratique par un moniteur' },
  ],
  sections: [
    { id: 'valide', h: 'Que valide le brevet initial ?', p: ['Il atteste que vous savez préparer votre matériel, gonfler la voile, décoller, piloter et atterrir en autonomie sur un site que vous connaissez, le plus souvent le site-école, quand les conditions sont calmes. Il ne vous autorise pas à vous lancer seul dans n’importe quelles conditions : c’est une première étape.'] },
    { id: 'epreuves', h: 'Les épreuves', p: ['La partie théorique est un questionnaire à choix multiples sur les bases : météo utile au débutant, matériel, règles de l’air, consignes de sécurité. La partie pratique est évaluée par un moniteur au fil de vos vols du stage : préparation et contrôles, gonflage, décollage, pilotage, approche et atterrissage.'] },
    { id: 'preparer', h: 'Comment le préparer ?', ul: ['Faire un stage d’initiation en école ou en club.', 'Revoir la théorie entre les vols et lors des journées de mauvais temps.', 'Demander à l’école si l’évaluation pratique est comprise dans le stage ou à part.', 'Prendre une licence FFVL, souvent proposée à l’inscription.'] },
    { id: 'apres', h: 'Et après ?', p: ['Le brevet initial ouvre le stage de progression, qui vous fait voler sur d’autres sites, puis le perfectionnement et le brevet de pilote.'] },
  ],
  faq: [
    { q: 'Est-il obligatoire ?', a: 'Non, mais il structure la progression et les écoles le demandent souvent pour les stages suivants.' },
    { q: 'Quel âge faut-il ?', a: 'Les âges minimums dépendent des écoles et de la fédération, avec autorisation parentale pour les mineurs. Renseignez-vous auprès de l’école.' },
  ],
  next: [
    { href: '/stage/initiation/', label: 'Stage d’initiation', text: 'Le stage qui prépare ce brevet.' },
    { href: '/apprendre/brevets/pilote/', label: 'Brevet de pilote', text: 'L’étape suivante.' },
  ],
};

const PILOTE: Article = {
  slug: 'brevets/pilote',
  title: 'Brevet de pilote de parapente (niveau bleu) : prérequis, épreuves, préparation',
  h1: 'Le brevet de pilote de parapente',
  lead: 'Le diplôme de référence du pilote autonome : voler en sécurité sur des sites variés et dans des conditions variées, thermique compris.',
  description: 'Brevet de pilote de parapente FFVL (niveau bleu) : compétences, épreuves, préparation, durée, utilité et suite vers le brevet de pilote confirmé.',
  parent: { href: '/apprendre/brevets/', label: 'Les brevets' },
  brief: [
    { k: 'Niveau', v: 'Bleu, deuxième brevet' },
    { k: 'Délai habituel', v: 'Une à deux saisons après le brevet initial' },
    { k: 'Épreuves', v: 'Questionnaire plus complet et évaluation en vol sur plusieurs sites' },
    { k: 'Suite', v: 'Brevet de pilote confirmé' },
  ],
  sections: [
    { id: 'valide', h: 'Que valide le brevet de pilote ?', p: ['Il certifie que vous pouvez voler seul, en sécurité, sur des sites différents et dans des conditions variées, y compris en thermique. C’est le diplôme de référence du parapentiste autonome.'] },
    { id: 'competences', h: 'Les compétences visées', ul: ['Choisir un site et un créneau adaptés à la météo et à son niveau.', 'Décoller face à la voile et dos à la voile, dans des vents variés.', 'Voler en thermique en sécurité et partager l’air avec les autres pilotes.', 'Gérer les incidents courants et savoir utiliser le parachute de secours.', 'Atterrir avec précision sur des terrains différents.', 'Connaître les règles d’espace aérien qui concernent le vol libre.'] },
    { id: 'epreuves', h: 'Les épreuves', p: ['Le questionnaire théorique va plus loin que celui du brevet initial : météo, aérologie, mécanique de vol, matériel, règlementation, facteurs humains et sécurité. L’évaluation pratique est conduite par un moniteur habilité, sur plusieurs vols et sur plusieurs sites, et les acquis sont notés dans le passeport de vol libre.'] },
    { id: 'preparer', h: 'Comment le préparer ?', ul: ['Un ou deux stages de perfectionnement.', 'Des vols réguliers, en école ou en club, sur des sites et par des conditions variés.', 'Un stage SIV pour apprendre à gérer les incidents de vol.', 'Une révision de la théorie, en particulier météo et sécurité.'] },
    { id: 'apres', h: 'Et après ?', p: ['Le brevet de pilote confirmé valide le vol thermique soutenu, le vol de distance et une culture météo plus fine.'] },
  ],
  faq: [
    { q: 'Est-il obligatoire ?', a: 'Non, mais il est fortement recommandé et souvent demandé par les clubs, les écoles et pour certaines activités.' },
    { q: 'Quelle différence avec le brevet confirmé ?', a: 'Le brevet de pilote valide l’autonomie. Le brevet confirmé valide le thermique et le vol de distance dans des conditions plus fortes.' },
  ],
  next: [
    { href: '/stage/perfectionnement/', label: 'Perfectionnement et thermique', text: 'Stages pour préparer ce brevet.' },
    { href: '/stage/siv/', label: 'Stage SIV', text: 'Apprendre à gérer les incidents de vol.' },
    { href: '/apprendre/brevets/pilote-confirme/', label: 'Brevet de pilote confirmé', text: 'L’étape suivante.' },
  ],
};

const CONFIRME: Article = {
  slug: 'brevets/pilote-confirme',
  title: 'Brevet de pilote confirmé de parapente (niveau marron) : prérequis, épreuves, préparation',
  h1: 'Le brevet de pilote confirmé de parapente',
  lead: 'Le troisième brevet FFVL : maîtrise du thermique, préparation d’un vol de distance, culture météo et sécurité.',
  description: 'Brevet de pilote confirmé de parapente FFVL (niveau marron) : prérequis, compétences, épreuves, préparation, stages thermique et cross, débouchés.',
  parent: { href: '/apprendre/brevets/', label: 'Les brevets' },
  brief: [
    { k: 'Niveau', v: 'Marron, troisième brevet' },
    { k: 'Prérequis', v: 'Brevet de pilote et pratique régulière' },
    { k: 'Épreuves', v: 'Questionnaire approfondi et évaluation en vol par un moniteur habilité' },
    { k: 'Débouchés', v: 'Certaines qualifications fédérales, la compétition' },
  ],
  sections: [
    { id: 'valide', h: 'Que valide le brevet confirmé ?', p: ['Un pilotage maîtrisé en thermique soutenu et en air turbulent, la préparation d’un vol de distance, une bonne culture de la météo et de la sécurité, et la capacité de choisir seul ses sites, ses créneaux et ses limites.'] },
    { id: 'competences', h: 'Les compétences', ul: ['Pilotage actif : garder le contrôle de la voile dans l’air turbulent.', 'Cross : préparer un itinéraire, enchaîner les thermiques, choisir un atterrissage en campagne.', 'Météo : anticiper l’évolution de la journée, les brises, l’instabilité et les risques.', 'Sécurité : gérer les incidents de vol, dont l’usage du parachute de secours.', 'Règlementation : respecter les espaces aériens et les règles de l’air.'] },
    { id: 'epreuves', h: 'Les épreuves', p: ['Un questionnaire théorique approfondi (météo, aérologie, mécanique de vol, règlementation, pilotage, sécurité) et une évaluation en vol par un moniteur habilité, en conditions variées. Les compétences sont validées dans le passeport de vol libre.'] },
    { id: 'preparer', h: 'Comment le préparer ?', ul: ['Avoir le brevet de pilote et voler régulièrement.', 'Accumuler de l’expérience sur plusieurs sites et par des conditions variées.', 'Suivre un stage pilote confirmé : thermique, cross, météo avancée.', 'Faire un stage SIV si ce n’est pas déjà fait.', 'Réviser la théorie, surtout sécurité et règlementation.'] },
    { id: 'apres', h: 'Et après ?', p: ['Le brevet ouvre l’accès à certaines qualifications fédérales, comme la qualification biplace, et à la compétition selon les règles de la FFVL.'] },
  ],
  faq: [
    { q: 'Quel est le prérequis ?', a: 'Le brevet de pilote (niveau bleu) et une pratique régulière.' },
    { q: 'À quoi sert-il ?', a: 'Il atteste d’un haut niveau d’autonomie et ouvre l’accès à certaines qualifications et à la compétition.' },
  ],
  next: [
    { href: '/stage/perfectionnement/', label: 'Stages thermique et cross', text: 'Pour préparer ce brevet.' },
    { href: '/stage/siv/', label: 'Stage SIV', text: 'La sécurité au-dessus de l’eau.' },
  ],
};

const LICENCE: Article = {
  slug: 'licence-ffvl',
  title: 'Faut-il un permis pour voler en parapente ? Licence FFVL et assurance',
  h1: 'Permis, licence et assurance en parapente',
  lead: 'Aucun permis n’est imposé par la loi pour voler en parapente en France, mais la licence fédérale et son assurance sont indispensables en pratique.',
  description: 'Permis de parapente : ce que la loi impose, licence FFVL, assurance de responsabilité civile, brevets, certificat médical et carte internationale IPPI.',
  parent: { href: LEARN_ROOT, label: 'Apprendre le parapente' },
  brief: [
    { k: 'Permis légal', v: 'Aucun en France' },
    { k: 'Licence', v: 'Annuelle, auprès de la FFVL (club ou école)' },
    { k: 'Assurance', v: 'La responsabilité civile aérienne est indispensable pour voler' },
    { k: 'Brevets', v: 'Recommandés, souvent demandés' },
  ],
  sections: [
    { id: 'permis', h: 'Faut-il un permis ?', p: ['Aucune loi n’impose de permis pour voler en parapente en France. Quand on parle de « permis de parapente », on parle en réalité des brevets de la FFVL (initial, pilote, pilote confirmé), qui valident un niveau de compétence mais ne sont pas obligatoires.'] },
    { id: 'licence', h: 'La licence fédérale', p: ['La licence FFVL est annuelle. Elle donne accès à la pratique en club ou en école et reste le moyen le plus simple de souscrire l’assurance de responsabilité civile aérienne, indispensable pour voler. Des garanties complémentaires (dommages corporels, rapatriement) peuvent s’y ajouter. Son prix dépend de la formule et des garanties choisies : l’école ou la FFVL donne le tarif de l’année.'] },
    { id: 'assurance', h: 'L’assurance', p: ['Voler sans assurance de responsabilité civile adaptée est une imprudence grave : si vous blessez quelqu’un ou endommagez un bien, les dommages peuvent être très élevés. En stage, la licence est souvent proposée à l’inscription. Pour le matériel personnel, pensez aussi à une assurance dédiée.'] },
    { id: 'medical', h: 'Certificat médical', p: ['Les écoles et clubs peuvent demander un certificat médical de non-contre-indication à la pratique du parapente, ou la licence en cours de validité. Demandez à l’école ce qu’elle exige avant de réserver.'] },
    { id: 'etranger', h: 'Voler à l’étranger', p: ['Certains pays et sites demandent une carte de compétence internationale (IPPI) en plus de vos brevets et de votre assurance. Renseignez-vous avant de partir.'] },
  ],
  faq: [
    { q: 'Puis-je voler sans brevet ?', a: 'Oui, la loi ne l’impose pas, mais beaucoup de sites, de clubs et d’écoles le demandent.' },
    { q: 'La licence est-elle valable un an ?', a: 'Oui, la licence est annuelle.' },
  ],
  next: [
    { href: '/apprendre/brevets/', label: 'Les brevets', text: 'Les trois niveaux fédéraux.' },
    { href: '/stage/initiation/', label: 'Stage d’initiation', text: 'Commencer par un stage.' },
  ],
};

// ----- Theory course: 6 modules, 28 lessons -----
type Module = { slug: string; menu: string; lead: string; lessons: Section[] };
const MODULES: Module[] = [
  {
    slug: 'bases-theoriques', menu: 'Bases théoriques',
    lead: 'Comprendre pourquoi une voile vole : forces, vitesses, axes de mouvement et matériel.',
    lessons: [
      L('mecanique-de-vol', 'Mécanique de vol : portance, finesse et vitesses',
        'L’air qui s’écoule autour de la voile crée une force de portance qui s’oppose au poids du pilote et de la voile. Le parapente ne tombe pas parce qu’il avance : il glisse dans l’air en descendant doucement, et c’est cette descente qui entretient son écoulement d’air.',
        'La finesse est le rapport entre la distance parcourue et la hauteur perdue : une finesse de 8 signifie 8 mètres parcourus pour 1 mètre perdu, dans l’air calme. La vitesse qui compte est celle de l’air autour de la voile (vitesse air) : face au vent, la vitesse par rapport au sol est plus faible ; avec le vent dans le dos, elle est plus forte.',
        'Les freins ralentissent la voile et augmentent son angle ; relâchés, la voile retrouve sa vitesse normale. L’accélérateur augmente la vitesse, mais réduit la marge avant une fermeture.'),
      L('axes-et-angles', 'Axes et angles : tangage, roulis et lacet',
        'Une voile bouge autour de trois axes. Le tangage est le balancement avant-arrière. Le roulis est l’inclinaison d’un côté ou de l’autre, qui sert à virer. Le lacet est la rotation autour d’un axe vertical.',
        'Un virage propre combine une action sur le frein côté virage et un déplacement du poids dans le même sens. Savoir lire ces mouvements aide à garder la voile au-dessus de soi et à corriger avant que le mouvement ne s’amplifie.'),
      L('materiel', 'Le matériel de parapente',
        'Le parapente se compose d’une voile (caissons gonflés, bord d’attaque, bord de fuite), de suspentes réunies en élévateurs, de commandes (poignées de frein), d’une sellette avec protection dorsale, d’un parachute de secours, d’un casque et souvent d’une radio.',
        'Les voiles sont classées par catégories d’homologation (de A à D) selon le comportement et l’exigence de pilotage. Les débutants volent sur des voiles de catégorie A. Un matériel adapté à votre niveau, révisé régulièrement, est la meilleure assurance.'),
    ],
  },
  {
    slug: 'aerologie-meteo', menu: 'Aérologie et météo',
    lead: 'Lire le vent, le relief, les thermiques et la météo pour savoir quand et où voler.',
    lessons: [
      L('vent', 'Sens et intensité du vent',
        'Le vent se juge à la manche à air, aux rubans, aux arbres et aux mouvements de l’eau, et se mesure avec un anémomètre. Un vent faible et régulier, de face au décollage, facilite le gonflage. Un vent trop fort ou irrégulier se traduit par des rafales qui rendent le vol dangereux, surtout pour un débutant.',
        'Le vent est souvent plus fort et plus irrégulier à quelques dizaines de mètres au-dessus du sol qu’au décollage. Une prévision qui annonce un vent qui forcit doit toujours conduire à avancer ou annuler le vol.'),
      L('relief', 'Forme et choix du relief',
        'Quand le vent rencontre une montagne, il accélère sur les crêtes et se creuse de turbulences à l’abri du relief : ce sont les rotors, à éviter absolument. Un relief bien orienté face au vent crée une zone de portance dynamique qui permet de voler en longeant la pente.',
        'Choisir son site suppose de lire la forme du terrain : face au vent, dégagé, sans obstacles, avec un atterrissage accessible.'),
      L('thermiques-et-brises', 'Thermiques et brises',
        'Un thermique est une masse d’air chaud qui monte, chauffée par le soleil sur un sol plus chaud que ses voisins. Il se repère aux cumulus qui se forment au-dessus, aux rapaces qui spiralent et au comportement de la voile. Il est porteur, mais turbulent, surtout à son entrée et en été.',
        'Les brises de pente suivent le cycle du jour : montantes l’après-midi sous l’effet du soleil, descendantes en fin de journée. Bien connaître l’heure du site évite de décoller dans un air qui change.'),
      L('meteo-avant-de-voler', 'Lire la météo avant de voler',
        'Avant de partir, on consulte plusieurs sources : bulletin météo montagne, modèles de prévision de vent, observations en direct. On regarde le vent à différentes altitudes, l’évolution de la journée, la couverture nuageuse, le risque d’orage et la stabilité de l’air.',
        'Un ciel qui se charge de cumulus en tour verticale ou un vent qui change brutalement sont des signaux d’alerte. Quand les sources ne s’accordent pas, on renonce, ou on vole tôt et on atterrit avant la dégradation.'),
      L('vent-et-relief', 'Vent et relief : bien choisir son décollage',
        'Un bon décollage est orienté face au vent, avec une pente régulière, assez dégagé pour étaler la voile, sans obstacles sur la trajectoire de course. On vérifie aussi que l’atterrissage est accessible quelles que soient les conditions.',
        'Quand les conditions changent, on change de décollage ou on ne vole pas : un site qu’on connaît reste un avantage énorme.'),
    ],
  },
  {
    slug: 'preparation-gonflage', menu: 'Au sol : préparer et gonfler',
    lead: 'Étaler, démêler, s’équiper, contrôler et gonfler : tout ce qui se joue avant de quitter le sol.',
    lessons: [
      L('demelage', 'Le démêlage d’un parapente',
        'On étale la voile en arc de cercle, intrados vers le haut, puis on reprend les suspentes une à une, groupe par groupe, sans nœud ni boucle. On vérifie que les élévateurs ne sont pas vrillés et que les suspentes de frein sont libres. Un démêlage fait avec soin évite les incidents au gonflage.'),
      L('sellette', 'Installation de la sellette',
        'On enfile la sellette, on ajuste les cuissardes et la ventrale, on vérifie que le dossier est bien réglé et on clippe les mousquetons aux élévateurs, en contrôlant visuellement leur fermeture. Une sellette bien réglée est confortable, sécurisante et facilite le pilotage.'),
      L('prise-des-commandes', 'La prise des commandes',
        'Les poignées de frein se tiennent à la main, les élévateurs sont tenus avec précaution pour éviter de les croiser. On apprend à tenir tout ce qu’il faut sans tirer sur les freins avant le gonflage.'),
      L('prevol', 'La prévol : la check-list avant le vol',
        'Avant chaque vol, on suit la même liste dans le même ordre : voile ouverte et sans accroc, suspentes sans nœud, élévateurs dans le bon ordre, sellette et casque bouclés, vent et espace de décollage libres. La répétition d’un geste routinier est la meilleure protection contre l’oubli.'),
      L('actions-vitales', 'Les actions vitales',
        'Ce sont les derniers contrôles juste avant de gonfler : sangles bouclées, mousquetons fermés, élévateurs non croisés, suspentes dégagées, poignées en main, vent et espace libres. On ne gonfle pas si un seul point est douteux.'),
      L('gonflage', 'Le gonflage de l’aile',
        'On gonfle en accompagnant la voile avec les élévateurs avant (les « A »), en poussant avec les jambes plutôt qu’en tirant avec les bras. La voile monte au-dessus de la tête, régulièrement. Un gonflage progressif évite que la voile ne dépasse le pilote ou ne retombe.'),
      L('recentrage', 'Le recentrage',
        'Une fois la voile au-dessus, on la maintient au centre au-dessus de soi par de petites corrections des freins et du corps. On regarde la voile pour contrôler qu’elle est bien ouverte, avant de décider de décoller ou d’abandonner.'),
      L('freinage-final', 'Le freinage final',
        'Juste avant la course, on stabilise la voile avec un léger freinage pour qu’elle ne dépasse pas, puis on relâche pour accélérer. Un freinage trop fort fait caler la voile ; trop faible, elle part devant.'),
      L('preparation-materiel', 'Préparer son matériel : la prévol pas à pas',
        'Étaler, démêler, vérifier, s’équiper, contrôler, gonfler : la préparation suit toujours le même enchaînement. Les écoles apprennent un ordre et une phrase mnémotechnique pour ne rien oublier, et on la fait à chaque vol, même après mille vols.'),
    ],
  },
  {
    slug: 'decollage', menu: 'Le décollage',
    lead: 'Choisir le bon moment, courir droit et décoller proprement.',
    lessons: [
      L('choix-du-moment', 'Le choix du moment de décollage',
        'On décolle quand le vent est dans l’axe, que l’air est propre et que l’espace devant soi est libre. On attend la bonne rafale, ou on renonce si les conditions changent. Le meilleur pilote est celui qui sait attendre.'),
      L('course-denvol', 'La course d’envol',
        'On accélère progressivement, en gardant la voile au-dessus de soi, la tête haute, sans regarder ses pieds. On n’interrompt pas la course et on ne s’assoit pas avant d’être complètement porté. Si la voile part de travers ou que quelque chose cloche, on freine et on arrête dès le début.'),
    ],
  },
  {
    slug: 'vol-atterrissage', menu: 'Voler et atterrir',
    lead: 'Piloter, préparer l’approche, se poser et respecter les règles de priorité.',
    lessons: [
      L('pilotage', 'Piloter en vol : virages, vitesse et tangage',
        'On vire en combinant frein et poids du corps. On contrôle le tangage en amortissant les balancements plutôt qu’en les accompagnant. On joue sur la vitesse avec les freins et l’accélérateur. Un pilotage fluide, sans à-coups, garde la voile stable.'),
      L('plan-de-vol', 'Plan de vol et approche',
        'On prépare l’atterrissage dès le décollage : on repère le terrain, la direction du vent, les obstacles. L’approche se fait en U ou en S, avec une marge d’altitude pour ajuster, et le dernier virage doit laisser assez de place pour poser face au vent.'),
      L('atterrissage', 'L’atterrissage',
        'On pose face au vent, à faible vitesse, en freinant progressivement au dernier moment pour arrondir la trajectoire. On garde les jambes souples, on court quelques pas si nécessaire, puis on neutralise la voile.'),
      L('priorite', 'Les règles de priorité en vol',
        'Quand deux pilotes se croisent face à face, chacun s’écarte par la droite. Le long d’un relief, le pilote qui a la pente à sa droite est prioritaire. En thermique, on tourne dans le même sens que le pilote arrivé le premier. En approche, le pilote le plus bas est prioritaire. Un moniteur vous les fait pratiquer en situation.'),
    ],
  },
  {
    slug: 'securite-reglementation', menu: 'Sécurité et réglementation',
    lead: 'Incidents, descentes rapides, parachute de secours, espaces aériens et facteurs humains.',
    lessons: [
      L('incidents-de-vol', 'Les incidents de vol',
        'Une fermeture est une partie de la voile qui se replie sous l’effet de la turbulence ou d’une erreur de pilotage. Un décrochage est une perte de portance par excès de frein. Savoir les reconnaître et les corriger s’apprend avec un moniteur, de préférence en stage SIV, au-dessus d’un lac.'),
      L('descentes-rapides', 'Les descentes rapides',
        'Les grandes oreilles, la spirale et le 360 permettent de perdre de l’altitude rapidement, par exemple pour fuir un nuage. Ces techniques ont chacune leurs risques et se pratiquent d’abord sous la supervision d’un moniteur, avec de la hauteur.'),
      L('parachute-de-secours', 'Le parachute de secours',
        'Le parachute de secours est le dernier recours si la voile ne peut plus être pilotée. On apprend où se trouve la poignée, comment la lancer vigoureusement et loin des suspentes, puis comment atterrir. Il se replie à la fréquence prévue par le fabricant et doit être contrôlé régulièrement.'),
      L('reglementation', 'Règlementation et espaces aériens',
        'Voler en parapente suppose de respecter les règles de l’air et les espaces aériens : zones réglementées, zones protégées, terrains d’aviation, parcs naturels. On vérifie les cartes aéronautiques et les consignes locales avant de voler sur un site, et on s’assure d’une assurance de responsabilité civile en cours.'),
      L('facteurs-humains', 'Facteurs humains et prise de décision',
        'Fatigue, stress, pression du groupe, envie de ne pas rater la journée : les facteurs humains sont à l’origine de beaucoup d’accidents. On apprend à prendre des décisions simples avant de décoller, à savoir renoncer sans honte, à s’hydrater et à ne pas voler quand on n’est pas en forme.'),
    ],
  },
];

const COURS_HUB: Article = {
  slug: 'cours',
  title: 'Cours de parapente : théorie en 6 modules',
  h1: 'Cours de parapente',
  lead: 'Six modules pour comprendre le vol, la météo, le matériel et la sécurité, avant et entre vos stages.',
  description: 'Cours de parapente en ligne : bases théoriques, aérologie et météo, préparation et gonflage, décollage, vol et atterrissage, sécurité et règlementation.',
  parent: { href: LEARN_ROOT, label: 'Apprendre le parapente' },
  brief: [
    { k: 'Modules', v: '6 modules, 28 leçons' },
    { k: 'Pour qui', v: 'Débutants et pilotes qui révisent' },
    { k: 'Important', v: 'Ces pages complètent un stage, elles ne le remplacent pas' },
    { k: 'Mise à jour', v: 'Contenus généraux, à valider avec votre école' },
  ],
  sections: [{
    id: 'modules', h: 'Les six modules',
    p: ['Chaque module regroupe plusieurs leçons courtes. Ces textes sont des repères pédagogiques généraux : seule la pratique encadrée par un moniteur diplômé apprend à voler, et chaque école a ses méthodes.'],
  }],
  next: MODULES.map((m) => ({ href: `/apprendre/cours/${m.slug}/`, label: m.menu, text: m.lead })),
};

const MODULE_PAGES: Article[] = MODULES.map((m) => ({
  slug: `cours/${m.slug}`,
  title: `${m.menu} : cours de parapente`,
  h1: m.menu,
  lead: m.lead,
  description: `${m.lead} Cours de parapente : ${m.lessons.map((x) => x.h).join(', ')}.`,
  parent: { href: '/apprendre/cours/', label: 'Cours de parapente' },
  sections: m.lessons,
  next: [{ href: '/apprendre/cours/', label: 'Tous les modules', text: 'Retour au sommaire du cours.' }, { href: '/stage/', label: 'Mettre en pratique : un stage', text: 'La théorie se complète sur le terrain avec un moniteur.' }],
}));

export const LEARN_HUB = HUB;
export const LEARN_PAGES: Article[] = [FIRST_STAGE, BREVETS, INITIAL, PILOTE, CONFIRME, LICENCE, COURS_HUB, ...MODULE_PAGES];
export const LEARN_MENU = [
  { href: LEARN_ROOT, label: 'Le parcours pour devenir pilote' },
  FIRST_STAGE_LINK,
  { href: '/apprendre/brevets/', label: 'Les trois brevets' },
  { href: '/apprendre/brevets/initial/', label: 'Brevet initial' },
  { href: '/apprendre/brevets/pilote/', label: 'Brevet de pilote' },
  { href: '/apprendre/brevets/pilote-confirme/', label: 'Brevet de pilote confirmé' },
  { href: '/apprendre/licence-ffvl/', label: 'Permis, licence et assurance' },
  { href: '/apprendre/cours/', label: 'Cours de parapente' },
];
export const FFVL_LINK = FFVL;
