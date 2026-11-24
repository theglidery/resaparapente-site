import type { Article } from './article-types';

export const WHY_ROOT_EN = '/en/why-fly/';
const parent = { href: WHY_ROOT_EN, label: 'Why fly' };
const pleasuresLink = { href: WHY_ROOT_EN + 'joys-of-paragliding/', label: 'The joys of paragliding', text: 'From calm scenic glides to thermal soaring and hike & fly.' };
const historyLink = { href: WHY_ROOT_EN + 'history-of-paragliding/', label: 'History of paragliding', text: 'From early flexible wings to the 1978 slope launches above Mieussy.' };
const tandemLink = { href: '/en/which-tandem-paragliding-flight/', label: 'Choose your tandem flight', text: 'Flight duration, options and practical points to check with the school.' };
const trainingLink = { href: '/en/learn-paragliding/first-course/', label: 'Prepare your first course', text: 'Pick the right format and get ready for your introductory week.' };
const chLink = { href: '/en/tandem-paragliding-schools/?pays=CH', label: 'Fly in Switzerland', text: 'Browse Swiss paragliding schools and published packages.' };
const beLink = { href: '/en/tandem-paragliding-schools/?pays=BE', label: 'Fly in Belgium', text: 'Browse Belgian paragliding schools and courses.' };
const destinationsLink = { href: '/en/compare-tandem-paragliding-flights/', label: 'Compare tandem flights', text: 'Compare schools, flight times, photo options and published prices.' };
const trainingSource = { href: 'https://www.ensm.sports.gouv.fr/wp-content/uploads/2024/07/Fiche-info-stage-appli-Init_V2023.pdf', label: 'École nationale des sports de montagne · Paragliding initiation sheet' };

export const WHY_MENU_EN = [
  { href: WHY_ROOT_EN, label: 'Why fly?' },
  { href: pleasuresLink.href, label: pleasuresLink.label },
  { href: historyLink.href, label: historyLink.label },
];

export const WHY_HUB_EN: Article = {
  slug: '',
  title: 'Why go paragliding? Discover free flight | Resa Parapente',
  h1: 'Why go paragliding?',
  lead: 'See a familiar landscape from the sky, let a certified tandem pilot take you up, or learn to steer your own wing: the first step depends on the experience you are looking for.',
  photo: { src: '/images/hero/bapteme.jpg', alt: 'A tandem pilot and passenger launching a paraglider in the mountains' },
  description: 'Why try paragliding? Discover what a tandem flight feels like, how beginner courses work and which questions to ask a school before booking.',
  sections: [
    {
      id: 'from-the-sky', h: 'Rediscover a landscape from the sky',
      p: [
        'In the air, distances and relief take on a new perspective. A mountain village sits at the foot of a ridge, a lake shifts colour with the light, and trails connect in ways you never see on foot. Even a 15-minute discovery flight is enough to feel that shift.',
        'Paragliding is flown seated comfortably in a harness beneath a soft, ram-air wing. Take-off happens on foot down a gentle slope—no jumping off a cliff. On a tandem flight, your instructor handles inflation, steering, air traffic and landing while you enjoy the view.',
      ],
    },
    {
      id: 'choose', h: 'Tandem flight or course: which first experience suits you?',
      table: [
        ['What you want', 'Format to look for', 'What to check'],
        ['Enjoy the scenery effortlessly', 'Discovery tandem flight', 'Airtime, total time on site and access to take-off'],
        ['Try steering in flight', 'Instructional tandem flight (if offered)', 'Whether calm conditions allow you to hold the brakes'],
        ['Learn to fly solo', 'Discovery ground day or 5-day introductory course', 'Number of sessions, loan gear and weather postponement policy'],
      ],
      note: 'A tandem flight is optional before a course: introductory courses start on the ground on a gentle training slope, adapted step by step by your instructor.',
    },
    {
      id: 'questions', h: 'Questions to ask before booking a flight',
      ul: [
        'How much total time should I plan on site, including shuttle or cable car to take-off?',
        'What are the minimum age, passenger weight range and footwear requirements?',
        'Can I ask for a calm morning glide if I am nervous or prone to motion sickness?',
        'When is the weather confirmed and how does rebooking work if wind or rain moves in?',
      ],
    },
    {
      id: 'first-step', h: 'Pick a flight that matches your pace',
      p: [
        'For your first flight, simply tell the pilot what excites you and any concerns you may have. A gentle morning glide in laminar air feels completely different from an afternoon thermal flight or dynamic wingovers. If you are giving a flight as a gift, check voucher validity and date-change terms with the school.',
      ],
    },
  ],
  faq: [
    { q: 'Do I need any prior experience for a tandem flight?', a: 'None at all. Tandem flights are designed for first-time passengers; your pilot briefs you before launch and guides the few steps needed on take-off and landing.' },
    { q: 'Can I start straight with a solo course?', a: 'Yes. Introductory courses welcome complete beginners and teach wing control from scratch on a gentle training slope.' },
  ],
  sources: [trainingSource],
  next: [pleasuresLink, historyLink, tandemLink, trainingLink, chLink, beLink],
};

export const WHY_PAGES_EN: (Article & { frSlug: string })[] = [
  {
    slug: 'joys-of-paragliding',
    frSlug: 'les-plaisirs-du-parapente',
    title: 'The joys of paragliding: scenic flight, thermals and hike & fly',
    h1: 'The joys of paragliding',
    lead: 'Watching mountain relief unfold beneath your feet, feeling your first rising thermal and eventually hiking up a peak to glide down: the pleasures of free flight evolve as you progress.',
    description: 'What does paragliding feel like? Explore calm scenic glides, thermal soaring, learning to pilot solo and hike & fly.',
    parent,
    sections: [
      {
        id: 'contemplation', h: 'Scenery and quiet time in the air',
        p: [
          'A calm discovery flight leaves plenty of time to look around: the shadow of the wing across alpine meadows, hiking trails below and the landing field ahead. With no engine, all you hear is the breeze in the lines and easy conversation with your pilot.',
          'When comparing school packages, check both stated airtime and total duration including shuttle or lift ride. Let the school know if you prefer a smooth, contemplative glide.',
        ],
      },
      {
        id: 'thermals', h: 'Thermals: staying aloft with rising air',
        p: [
          'As sun warms valleys and mountain faces unevenly, columns of warm air rise. Pilots circle in these thermals to gain altitude and extend the flight. On a tandem thermal flight, turns and air movement are livelier than on a morning sled ride.',
          'Flight duration always depends on the day’s aerology—ask the school how long thermal packages typically last and what happens if lift shuts down early.',
        ],
      },
      {
        id: 'piloting', h: 'The satisfaction of learning to pilot',
        p: ['On a course, the first breakthroughs happen on the ground: bringing the wing overhead cleanly, keeping it centred with small brake inputs and feeling the wing lift your weight. Soon comes your first solo flight from the high launch, guided calmly over the radio.'],
      },
      {
        id: 'hike-and-xc', h: 'Hike & fly, cross-country and club life',
        p: [
          'In hike & fly, pilots climb on foot with a lightweight rucksack and glide back to the valley. Cross-country (XC) pilots link thermals from ridge to ridge over tens or hundreds of kilometres, reading clouds and terrain continuously.',
          'Local clubs offer community and progression after school courses: sharing site briefings, weather observations and retrieve rides with experienced pilots.',
        ],
      },
    ],
    faq: [
      { q: 'Does a tandem flight involve acrobatics?', a: 'Only if you ask for it! Standard discovery flights are smooth and gentle; dynamic turns ("sensations") are always optional.' },
      { q: 'What is the difference between a glide and a thermal flight?', a: 'A morning glide descends steadily through calm air to the landing field, whereas an afternoon thermal flight uses rising air currents to climb and stay up longer.' },
    ],
    sources: [
      { href: 'https://www.fai.org/page/paragliding-xc-world-champions', label: 'World Air Sports Federation (FAI) · Cross-country paragliding' },
      trainingSource,
    ],
    next: [destinationsLink, trainingLink, historyLink],
  },
  {
    slug: 'history-of-paragliding',
    frSlug: 'histoire-du-paragliding' && 'histoire-du-parapente',
    title: 'History of paragliding: from flexible parachutes to Mieussy (1978)',
    h1: 'History of paragliding',
    lead: 'In the 1960s, aviation pioneers experimented with flexible gliding canopies. In June 1978, three skydivers foot-launched ram-air parachutes from a mountain slope above Mieussy in Haute-Savoie—sparking modern paragliding.',
    description: 'Origins of paragliding: David Barish’s Sailwing, Domina Jalbert’s Parafoil, the 1978 Pertuiset launches in Mieussy, Les Choucas and early world championships.',
    parent,
    sections: [
      {
        id: 'flexible-wings', h: 'The 1960s: gliding beneath a soft wing',
        p: ['In the United States, David Barish developed the single-surface Sailwing (originally researched for NASA capsule recovery) and demonstrated foot-launched slope gliding at Hunter Mountain, New York, in 1965. Around the same time, Domina Jalbert patented the ram-air multi-cell Parafoil, whose pressurized cells gave soft wings a true aerofoil profile.'],
      },
      {
        id: 'mieussy', h: 'June 1978: Le Pertuiset above Mieussy',
        p: [
          'French skydivers Jean-Claude Bétemps, André Bohn and Gérard Bosson tested whether square ram-air parachutes could be inflated and foot-launched directly from an alpine slope rather than jumped from an aircraft. Launching from Le Pertuiset above Mieussy (Haute-Savoie), they flew all the way down to the valley floor.',
          'While accounts vary between 25 and 27 June 1978 for the very first flight, Mieussy and those three pioneers became the cradle of "vol de pente"—soon named "parapente" (paragliding).',
        ],
      },
      {
        id: 'les-choucas', h: '1979–1980: the first club and structured teaching',
        p: ['In 1979, the world’s first paragliding club, Les Choucas, was founded in Mieussy, followed by the first structured training courses in 1980. Manufacturers soon designed wings specifically for foot-launching, with higher aspect ratios, non-porous fabrics and better glide performance than skydiving canopies.'],
      },
      {
        id: 'competition', h: 'From slope gliding to modern cross-country',
        p: ['The first FAI Paragliding World Championships took place in Kössen, Austria, in 1989, followed by Digne-les-Bains, France, in 1991. Today, wings are load- and flight-tested under EN/LTF certification categories (A to D), letting complete beginners learn on forgiving EN-A gliders on gentle training slopes.'],
      },
    ],
    sources: [
      { href: 'https://www.ushpa.org/USHPA_New/Public/LearnToFly/history-of-hang-gliding-and-paragliding.aspx', label: 'USHPA · David Barish and the origins of soft wings' },
      { href: 'https://patents.google.com/patent/US3131894A/en', label: 'Domina Jalbert · Multi-cell ram-air wing patent' },
      { href: 'https://www.ffp.asso.fr/en/comment-decouvrir/debuter-en-parapente/historique-du-parapente/', label: 'French Skydiving Federation · Chronology of slope flying' },
      { href: 'https://www.prazdelys-sommand.com/equipement/decollage-de-pertuiset/', label: 'Praz de Lys Sommand · Le Pertuiset historic launch site' },
      { href: 'https://old.fai.org/civl-events/civl-champions/161-civl/35707-fai-champions-of-the-past-paragliding', label: 'FAI · Paragliding World Championship archives' },
    ],
    next: [pleasuresLink, destinationsLink, { href: '/en/learn-paragliding/', label: 'Learn to fly today', text: 'The step-by-step pathway from beginner course to autonomous pilot.' }],
  },
];
