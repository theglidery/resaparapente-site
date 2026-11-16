import type { Article } from './article-types';

export const WHY_ROOT = '/pourquoi-voler/';
const parent = { href: WHY_ROOT, label: 'Pourquoi voler' };
const pleasuresLink = { href: WHY_ROOT + 'les-plaisirs-du-parapente/', label: 'Les plaisirs du parapente', text: 'Du vol contemplatif au marche et vol.' };
const historyLink = { href: WHY_ROOT + 'histoire-du-parapente/', label: 'Histoire du parapente', text: 'Des premières voiles souples aux vols de pente de Mieussy.' };
const tandemLink = { href: '/bapteme/biplace-saut-en-parapente/', label: 'Préparer un baptême', text: 'Départ, durée en vol et conditions à vérifier avec l’école.' };
const trainingLink = { href: '/apprendre/premier-stage/', label: 'Préparer son premier stage', text: 'Choisir une formule et préparer sa semaine d’initiation.' };
const chLink = { href: '/suisse-romande/', label: 'Baptêmes et stages en Suisse romande', text: 'Les écoles romandes et leurs formules publiées.' };
const beLink = { href: '/belgique-francophone/', label: 'Baptêmes et stages en Belgique francophone', text: 'Les écoles wallonnes et bruxelloises référencées.' };
const destinationsLink = { href: '/bapteme-parapente/', label: 'Comparer les baptêmes par destination', text: 'Retrouvez les écoles, les formules et les prix publiés.' };
const trainingSource = { href: 'https://www.ensm.sports.gouv.fr/wp-content/uploads/2024/07/Fiche-info-stage-appli-Init_V2023.pdf', label: 'École nationale des sports de montagne · Fiche d’initiation au parapente' };

export const WHY_MENU = [
  { href: WHY_ROOT, label: 'Pourquoi voler' },
  ...[pleasuresLink, historyLink].map(({ href, label }) => ({ href, label })),
];

export const WHY_HUB: Article = {
  slug: '',
  title: 'Pourquoi faire du parapente ? Découvrir le vol libre',
  h1: 'Pourquoi voler en parapente ?',
  lead: 'Voir un lieu familier depuis le ciel, laisser un pilote vous emmener en tandem ou apprendre à voler vous-même : le premier pas dépend de ce que vous avez envie de vivre.',
  photo: { src: '/images/hero/bapteme.webp', alt: 'Un pilote et son passager prennent leur envol en parapente biplace' },
  description: 'Pourquoi essayer le parapente ? Découvrez les sensations d’un baptême, les premières étapes pour apprendre à piloter et les questions à poser à l’école.',
  sections: [
    {
      id: 'depuis-le-ciel', h: 'Redécouvrir un paysage depuis le ciel',
      p: [
        'En vol, les distances prennent un autre relief. Un village se dessine au pied d’une pente, un lac change de couleur selon l’angle et les chemins se rejoignent là où, à pied, on ne les voit jamais ensemble. Un vol court peut suffire à vivre ce changement de perspective.',
        'Le parapente de vol libre se pratique sous une aile souple, en position assise dans une sellette. Au décollage à pied, le pilote vous explique comment accompagner l’envol. En biplace, il gère l’aile, l’itinéraire et l’atterrissage.',
      ],
    },
    {
      id: 'choisir', h: 'Baptême ou stage : quelle première expérience choisir ?',
      table: [
        ['Votre envie', 'Le format à regarder', 'Le détail à vérifier'],
        ['Profiter du paysage', 'Baptême découverte en biplace', 'Durée annoncée en l’air, marche et accès au rendez-vous'],
        ['Découvrir les commandes', 'Biplace pédagogique, si l’école le propose', 'Ce que couvre la formule et ce que le pilote peut vous laisser essayer'],
        ['Apprendre à piloter', 'Séance découverte au sol ou stage d’initiation', 'Nombre de séances, matériel fourni, conditions de report'],
      ],
      note: 'Un baptême est facultatif avant un stage. L’initiation commence généralement au sol, avec un moniteur qui adapte la progression au groupe.',
    },
    {
      id: 'premier-contact', h: 'Les questions à poser avant de choisir un vol',
      ul: [
        'Combien de temps faut-il prévoir sur place, accès au décollage compris ?',
        'Quels sont l’âge minimum, les limites de poids et les conditions de participation ?',
        'Peut-on privilégier un vol calme si l’on est impressionné ou sujet au mal des transports ?',
        'Qui confirme le rendez-vous et que se passe-t-il si la météo change ?',
      ],
    },
    {
      id: 'premier-pas', h: 'Choisir une formule qui vous ressemble',
      p: [
        'Pour une première fois, dites simplement au pilote ce qui vous attire et ce qui vous inquiète. Une descente contemplative et un vol qui cherche les ascendances répondent à des envies différentes. Pour offrir le vol, vérifiez aussi la validité du bon et les modalités de changement de date directement auprès de l’école.',
      ],
    },
  ],
  faq: [
    { q: 'Faut-il avoir déjà volé pour réserver un baptême ?', a: 'Un baptême s’adresse à un passager accompagné. L’école vous indique les conditions de participation et le pilote explique le déroulement avant le départ.' },
    { q: 'Peut-on commencer directement par un stage ?', a: 'Oui, les stages d’initiation accueillent des débutants. Demandez à l’école les prérequis de sa formule, le programme et le matériel fourni.' },
  ],
  sources: [trainingSource],
  next: [pleasuresLink, historyLink, tandemLink, trainingLink, chLink, beLink],
};

export const WHY_PAGES: Article[] = [
  {
    slug: 'les-plaisirs-du-parapente',
    title: 'Les plaisirs du parapente : sensations, thermique et marche et vol',
    h1: 'Les plaisirs du parapente',
    lead: 'Observer le relief, partager un vol, sentir une ascendance et plus tard choisir son propre itinéraire : les plaisirs du parapente changent avec l’expérience.',
    description: 'Que ressent-on en parapente ? Découvrez le vol contemplatif, les ascendances, le marche et vol et les façons de découvrir ces sensations en biplace ou en stage.',
    parent,
    sections: [
      {
        id: 'contemplation', h: 'Le paysage et le temps en l’air',
        p: [
          'Un baptême découverte donne le temps de regarder où l’on se trouve : l’ombre de l’aile, les chemins repérés pendant la montée et l’atterrissage qui se rapproche. Le bruit de l’air et la conversation avec le pilote font partie du vol.',
          'Sur une fiche école, comparez la durée en l’air avec le temps total à prévoir. Un vol de quelques minutes peut demander une montée, un briefing et un retour en navette. Si vous voulez avant tout profiter de la vue, dites-le à l’école.',
        ],
      },
      {
        id: 'thermique', h: 'Les ascendances : sentir que le vol se prolonge',
        p: [
          'Lorsque le soleil réchauffe le sol de manière inégale, des volumes d’air plus chaud peuvent s’élever. Un pilote peut exploiter ces ascendances pour reprendre de l’altitude. En biplace, les virages et les variations de mouvement peuvent être plus marqués qu’en vol de descente.',
          'La durée dépend de ce que permet l’air ce jour-là. Une formule « ascendance » décrit le type de vol recherché. Demandez au pilote ce qui est prévu si les conditions ne permettent pas de le réaliser.',
        ],
      },
      {
        id: 'pilotage', h: 'Le plaisir d’apprendre à piloter',
        p: ['En stage, les premières réussites arrivent souvent au sol : faire monter l’aile, la garder au-dessus de soi et comprendre ce qui change quand le vent varie. Puis viennent les décisions prises avec le moniteur : quand refaire un exercice, quand l’interrompre et quand envisager le premier vol solo guidé.'],
      },
      {
        id: 'marche-et-distance', h: 'Marche et vol, distance et pratique en club',
        p: [
          'En marche et vol, le pilote monte à pied, transporte son équipement et choisit son itinéraire selon les conditions et les possibilités de décollage et d’atterrissage. Le vol de distance, ou cross, demande de préparer un trajet et de le réévaluer en route.',
          'Un club peut aussi offrir une autre façon de profiter du sport : revoir un site connu, partager les observations météo et apprendre à décider avec des pilotes plus expérimentés. Les sorties techniques et la distance s’abordent après les bases, avec un encadrement adapté.',
        ],
      },
    ],
    faq: [
      { q: 'Un baptême comporte-t-il toujours de la voltige ?', a: 'Les écoles distinguent généralement les formules contemplatives ou découverte des options sensations. Indiquez vos préférences au pilote avant le vol.' },
      { q: 'Quelle est la différence entre un thermique et un vol de descente ?', a: 'Un vol de descente rejoint progressivement l’atterrissage. Avec une ascendance exploitable, le pilote peut reprendre de l’altitude et prolonger le vol selon les conditions.' },
    ],
    sources: [
      { href: 'https://www.fai.org/page/paragliding-xc-world-champions', label: 'Fédération aéronautique internationale · Vol de distance en parapente' },
      trainingSource,
    ],
    next: [destinationsLink, trainingLink, historyLink],
  },
  {
    slug: 'histoire-du-parapente',
    title: 'Histoire du parapente : des voiles de parachute à Mieussy',
    h1: 'Histoire du parapente',
    lead: 'Dans les années 1960, des pionniers expérimentent avec des ailes souples. En juin 1978, trois parachutistes décollent d’une pente au-dessus de Mieussy et contribuent à faire naître une pratique nouvelle en France.',
    description: 'Les origines du parapente : la Sailwing de David Barish, les vols du Pertuiset à Mieussy en 1978, Les Choucas et les débuts de la compétition.',
    parent,
    sections: [
      {
        id: 'ailes-souples', h: 'Années 1960 : faire planer une aile souple',
        p: ['Aux États-Unis, David Barish expérimente le décollage depuis une pente avec la Sailwing. L’association américaine USHPA situe un vol en 1965 dans l’État de New York. En parallèle, le Parafoil de Domina Jalbert explore une autre architecture : des cellules se remplissent d’air et donnent sa forme à l’aile. Ces travaux ouvrent deux pistes dans l’histoire des voiles souples.'],
      },
      {
        id: 'mieussy', h: 'Juin 1978 : le Pertuiset, au-dessus de Mieussy',
        p: [
          'Jean-Claude Bétemps, André Bohn et Gérard Bosson, issus du milieu du parachutisme, utilisent des voiles de saut pour décoller de la pente du Pertuiset, en Haute-Savoie. L’activité est alors connue comme le vol de pente. Au lieu de quitter un avion, la voile est mise en forme et le pilote prend son départ au sol.',
          'Les récits divergent sur le jour exact, entre le 25 et le 27 juin. Le mois, le site et les trois noms se retrouvent dans les sources consultées.',
        ],
      },
      {
        id: 'les-choucas', h: '1979–1980 : le vol de pente s’enseigne',
        p: ['En 1979, le club des Choucas se forme à Mieussy. La Fédération française de parachutisme retrace l’organisation d’un stage expérimental en 1980. Le passage de quelques essais individuels à un enseignement organisé permet de transmettre la préparation du matériel et la pratique sur pente. Des ailes spécifiques au vol de pente se développent ensuite.'],
      },
      {
        id: 'competition', h: 'Du vol de pente à la compétition de distance',
        p: ['Les listes de championnats du monde de parapente citent une première édition à Kössen, en Autriche, en 1989, puis une seconde à Digne, en 1991. Le vol de distance organise la recherche d’ascendances et le choix d’un itinéraire autour d’un parcours sportif. Pour un débutant, la porte d’entrée reste plus proche de la pente école : découvrir l’aile, le terrain et l’air avec un moniteur.'],
      },
    ],
    sources: [
      { href: 'https://www.ushpa.org/USHPA_New/Public/LearnToFly/history-of-hang-gliding-and-paragliding.aspx', label: 'USHPA · David Barish et les origines des ailes souples' },
      { href: 'https://patents.google.com/patent/US3131894A/en', label: 'Domina Jalbert · Brevet d’une voile multicaissons' },
      { href: 'https://www.ffp.asso.fr/en/comment-decouvrir/debuter-en-parapente/historique-du-parapente/', label: 'Fédération française de parachutisme · Chronologie du vol de pente' },
      { href: 'https://www.prazdelys-sommand.com/equipement/decollage-de-pertuiset/', label: 'Praz de Lys Sommand Tourisme · Le site du Pertuiset' },
      { href: 'https://thollon-parapente.com/histoire/', label: 'Thollon Parapente · Récit de Jean-Claude Bétemps' },
      { href: 'https://old.fai.org/civl-events/civl-champions/161-civl/35707-fai-champions-of-the-past-paragliding', label: 'FAI · Archives des championnats du monde' },
    ],
    next: [pleasuresLink, destinationsLink, { href: '/apprendre/', label: 'Apprendre à voler aujourd’hui', text: 'Les étapes entre l’initiation et l’autonomie.' }],
  },
];
