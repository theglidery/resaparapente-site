import type { Article } from './article-types';

export const FIRST_STAGE_LINK = {
  href: '/apprendre/premier-stage/',
  label: 'Préparer son premier stage',
  text: 'Comparer les séances, le matériel et ce que l’école prévoit en cas de météo défavorable.',
};

export const FIRST_STAGE: Article = {
  slug: 'premier-stage',
  title: 'Premier stage de parapente : choisir et préparer son initiation',
  h1: 'Préparer son premier stage de parapente',
  lead: 'Vous débutez ? Comparez le nombre réel de séances, ce qui est compris et la façon dont l’école adapte le programme à la météo et à votre progression.',
  photo: { src: '/images/hero/stage.webp', alt: 'Un moniteur accompagne un élève en préparation du vol' },
  description: 'Premier stage de parapente : pente école, vol solo guidé, équipement, coût total et liste des questions à poser avant de réserver.',
  parent: { href: '/apprendre/', label: 'Apprendre le parapente' },
  sections: [
    {
      id: 'formats', h: 'Découverte, initiation ou reprise : choisissez votre point de départ',
      table: [
        ['Votre situation', 'Format à rechercher', 'À vérifier auprès de l’école'],
        ['Vous hésitez encore', 'Séance découverte ou pente école', 'Contenu au sol, biplace pédagogique éventuel'],
        ['Vous partez de zéro', 'Stage d’initiation', 'Nombre de séances et accompagnement prévu pour les premiers grands vols'],
        ['Vous avez déjà volé ou fait une pause', 'Reprise ou progression', 'Évaluation du niveau et prérequis'],
      ],
    },
    {
      id: 'deroule', h: 'Du maniement de l’aile au premier vol solo',
      steps: [
        { t: 'Apprendre au sol', d: 'La pente école sert à découvrir le matériel et à travailler la mise en forme de l’aile et la gestuelle d’envol.' },
        { t: 'Préparer le vol', d: 'Avec le moniteur, vous abordez la météo, le plan de vol et les consignes. Le programme peut inclure de petits vols sur pente école ou un biplace pédagogique.' },
        { t: 'Voler sous encadrement', d: 'Le premier grand vol solo se fait lorsque le moniteur juge les bases acquises et les conditions adaptées. La radio peut guider le stagiaire selon le dispositif de l’école.' },
      ],
      note: 'Le premier grand vol est un objectif pédagogique. Son moment et le nombre de vols dépendent des conditions et de votre progression.',
    },
    {
      id: 'comparer', h: 'Comparer deux devis d’initiation',
      ul: [
        'Séances : comparez le nombre de demi-journées, les horaires et les jours de réserve éventuels.',
        'Encadrement : demandez la taille du groupe et le dispositif prévu pendant les premiers vols.',
        'Coût total : vérifiez le prêt du matériel, les navettes, la licence ou l’assurance demandées, ainsi que l’hébergement si vous venez de loin.',
        'Météo : demandez comment sont traitées les séances non effectuées et quand l’école vous prévient.',
      ],
    },
    {
      id: 'valise', h: 'Avant le départ',
      p: [
        'Contactez l’école pour les justificatifs demandés, le lieu de rendez-vous, les vêtements et les chaussures adaptés. Vérifiez quel équipement est prêté et si vous devez le réserver à votre taille.',
        'Après le stage, demandez un bilan concret : les exercices acquis, les points à retravailler et le prochain format adapté à votre niveau. Si votre structure utilise le Passeport de vol libre de la FFVL, profitez-en pour faire noter les compétences travaillées.',
      ],
    },
  ],
  faq: [
    { q: 'Faut-il acheter sa voile avant l’initiation ?', a: 'Demandez d’abord ce que l’école fournit. Le matériel est prêté dans les exemples de stages cités ci-dessous. Vous pourrez décider avec votre moniteur quand vous équiper et quel matériel conviendrait à votre progression.' },
    { q: 'Puis-je réserver un stage sur plusieurs week-ends ?', a: 'Certaines écoles proposent un format réparti sur plusieurs week-ends. Vérifiez que votre disponibilité couvre toutes les dates et renseignez-vous sur les séances à reprendre si la météo interrompt le programme.' },
  ],
  sources: [
    { href: 'https://www.ensm.sports.gouv.fr/wp-content/uploads/2024/07/Fiche-info-stage-appli-Init_V2023.pdf', label: 'École nationale des sports de montagne · Exemple de parcours d’initiation' },
    { href: 'https://www.epvl.fr/stages/stage-parapente-debutant-pyrenees/', label: 'EPVL · Séances, équipement et programme débutant' },
    { href: 'https://www.ffvl.fr/Apprendre/Passeport_et_brevets.html', label: 'FFVL · Passeport de vol libre et brevets' },
  ],
  next: [
    { href: '/stage/initiation/', label: 'Comprendre le stage d’initiation', text: 'Le public, le déroulement et les questions fréquentes.' },
    { href: '/calendrier/?level=initiation', label: 'Dates des stages d’initiation', text: 'Voir les sessions publiées et filtrer par mois ou région.' },
    { href: '/prix-stage-parapente/', label: 'Comparer les prix des stages', text: 'Repères issus des tarifs publiés par les écoles.' },
    { href: '/pourquoi-voler/', label: 'Hésiter entre baptême et stage', text: 'Choisir la première expérience qui correspond à votre envie.' },
  ],
};
