// English equivalent of src/data/learn.ts + src/data/first-stage.ts (/en/learn-paragliding/...).
import type { Article, Section } from './article-types';

const L = (id: string, h: string, ...p: string[]): Section => ({ id, h, p });

export const LEARN_ROOT_EN = '/en/learn-paragliding/';

export const FIRST_STAGE_EN: Article & { frSlug: string } = {
  slug: 'first-course',
  frSlug: 'premier-stage',
  title: 'Your first paragliding course: how to choose and prepare',
  h1: 'Preparing for your first paragliding course',
  lead: 'Starting from scratch? Compare the actual number of sessions, what gear is included and how the school adapts the week to weather and your personal pace.',
  photo: { src: '/images/hero/stage.jpg', alt: 'An instructor helping a paragliding student prepare for launch' },
  description: 'First paragliding course guide: training slope, radio-guided solo flight, loan equipment, total budget and questions to ask before booking.',
  parent: { href: LEARN_ROOT_EN, label: 'Learn paragliding' },
  sections: [
    {
      id: 'formats', h: 'Discovery, introductory course or refresher: pick your starting point',
      table: [
        ['Your situation', 'Format to look for', 'What to verify with the school'],
        ['Still unsure', '1-day discovery / training slope', 'Ground-handling time, optional instructional tandem'],
        ['Complete beginner', '5-day introductory course', 'Number of half-days and radio support on first high solo flights'],
        ['Returning after a break', 'Progression or refresher days', 'Check-flight assessment and prerequisites'],
      ],
    },
    {
      id: 'progression', h: 'From ground handling to your first solo flight',
      steps: [
        { t: 'Learn on the ground', d: 'On a gentle training slope, you discover the wing, practise clean inflations overhead and rehearse launch posture.' },
        { t: 'Prepare the flight plan', d: 'Together with your instructor, review wind conditions, approach geometry and landing target—sometimes preceded by short slope hops or a pedagogical tandem.' },
        { t: 'Fly solo with radio guidance', d: 'Once your ground control is solid and the air is calm, an instructor launches you while a second instructor guides your flight and landing over the radio.' },
      ],
      note: 'Your first high solo flight is a milestone, never a race: timing and flight count always follow safe weather and your comfort.',
    },
    {
      id: 'compare', h: 'How to compare two introductory quotes',
      ul: [
        'Sessions: compare half-days, morning/evening schedules and backup days.',
        'Supervision: ask how many students share one instructor and whether two instructors cover launch and landing.',
        'All-in budget: check loan equipment, site shuttles, compulsory federation licence/insurance and accommodation.',
        'Weather policy: ask how unflown days are credited, postponed or billed pro-rata.',
      ],
    },
    {
      id: 'packing', h: 'Before you arrive',
      p: [
        'Confirm required paperwork (medical note if applicable, federation registration), meeting time, ankle-supporting footwear and warm windproof layers. Let the school know your height and approximate weight so a wing and harness are sized for you.',
        'At the end of the week, ask your instructor for a clear logbook debrief: skills mastered, points to consolidate and which progression course suits you next.',
      ],
    },
  ],
  faq: [
    { q: 'Should I buy my own wing before an introductory course?', a: 'No—schools supply certified beginner wings, harnesses, helmets and radios. Wait until your instructor recommends the right wing size and EN category for your progression.' },
    { q: 'Can I split a course across weekends?', a: 'Yes, several schools run weekend formats alongside Monday–Friday courses. Check date flexibility if weather interrupts a weekend.' },
  ],
  next: [
    { href: '/en/courses/initiation/', label: 'Introductory course guide', text: 'Day-by-day programme, prerequisites and schools.' },
    { href: '/en/paragliding-course-calendar/?level=initiation', label: 'Upcoming introductory dates', text: 'Browse published sessions by month and region.' },
    { href: '/en/paragliding-course-prices/', label: 'Cost of paragliding training', text: 'Median prices and ranges across schools.' },
    { href: '/en/why-fly/', label: 'Tandem flight or course?', text: 'Choose the first experience that fits you best.' },
  ],
};

const HUB_EN: Article = {
  slug: '',
  title: 'Learn paragliding: the step-by-step pathway to becoming a pilot',
  h1: 'Learn paragliding',
  lead: 'From your very first tandem or training-slope hop to autonomous pilot ratings: stages, timeframes, licences and theory explained simply.',
  description: 'Learn paragliding: typical training pathway, introductory and progression courses, FFVL Initial, Pilot and Advanced Pilot licences, insurance and theory modules.',
  brief: [
    { k: 'Where to learn', v: 'At a certified school or club with qualified instructors' },
    { k: 'First course', v: 'Around 5 days for an introductory course' },
    { k: 'Ratings', v: 'Initial (green), Pilot (blue), Advanced Pilot (brown) / IPPI 2–5' },
    { k: 'Legal licence?', v: 'No state permit required in France, but aerial third-party insurance is essential' },
  ],
  sections: [
    {
      id: 'pathway', h: 'The typical pilot pathway',
      steps: [
        { t: 'An optional tandem flight to try', d: 'See the scenery and feel the air with an instructor before committing—helpful, though not required to join a beginner course.' },
        { t: 'Introductory course (Initiation)', d: 'Around five days to learn inflation, launch, basic steering and landing, culminating in your first radio-guided solo flights.' },
        { t: 'Progression course', d: 'Three to five days flying varied sites and wind conditions to build solo independence.' },
        { t: 'Advanced thermal & SIV courses', d: 'Active piloting, incident simulation over water (SIV) and your first sustained thermal flights.' },
        { t: 'Pilot rating (Brevet de pilote / IPPI 4)', d: 'The benchmark rating for autonomous solo pilots flying unfamiliar sites safely.' },
        { t: 'Cross-country & Advanced Pilot rating', d: 'Multi-hour thermal transitions, route planning, airspace mastery and strong-air safety.' },
      ],
    },
    {
      id: 'cost-time', h: 'How long does it take and what does it cost?',
      p: [
        'Each 5-day introductory or progression course typically costs several hundred euros with full loan equipment included. Annual federation membership with aerial liability insurance is added once per year. Personal gear (wing, harness, reserve parachute, helmet) represents a few thousand euros—best purchased only after your instructor’s guidance.',
        'Compare live published course prices by level in the "Book a Course" menu.',
      ],
    },
    {
      id: 'where', h: 'Where should you learn?',
      p: ['Choose an accredited professional school (such as EFVL in France, SHV/FSVL in Switzerland or FBVL in Belgium) with state-qualified instructors, small student groups, a forgiving training slope and clear weather postponement terms.'],
    },
  ],
  next: [
    { href: '/en/learn-paragliding/first-course/', label: 'Prepare your first course', text: 'How to compare introductory courses and get ready.' },
    { href: '/en/learn-paragliding/licences/', label: 'Licences & pilot ratings', text: 'Initial, Pilot and Advanced Pilot levels explained.' },
    { href: '/en/learn-paragliding/ffvl-licence-insurance/', label: 'Permits, federation & insurance', text: 'What the law requires and why aerial liability cover matters.' },
    { href: '/en/learn-paragliding/theory/', label: 'Theory modules', text: 'Six clear modules covering flight mechanics, weather, ground handling, launch, flight and safety.' },
    { href: '/en/paragliding-course-schools/', label: 'Find a course school', text: 'Compare schools and send a free booking enquiry.' },
  ],
};

const BREVETS_EN: Article & { frSlug: string } = {
  slug: 'licences',
  frSlug: 'brevets',
  title: 'Paragliding licences & ratings: Initial, Pilot and Advanced Pilot',
  h1: 'Paragliding licences & ratings',
  lead: 'Three progressive federation ratings structure pilot training in France (with international IPPI equivalents): Initial, Pilot and Advanced Pilot.',
  description: 'FFVL paragliding ratings explained: Initial (green), Pilot (blue) and Advanced Pilot (brown), exams, preparation and IPPI equivalence.',
  parent: { href: LEARN_ROOT_EN, label: 'Learn paragliding' },
  brief: [
    { k: 'Issued by', v: 'FFVL (France) / SHV-FSVL (Switzerland) / FBVL (Belgium) via certified instructors' },
    { k: 'Assessment', v: 'Multiple-choice theory test + practical in-flight evaluation' },
    { k: 'International', v: 'Maps to FAI IPPI ParaPro stages (IPPI 2 to IPPI 5)' },
    { k: 'Mandatory?', v: 'Optional by French law, required in Switzerland and requested on many sites/trips' },
  ],
  sections: [
    {
      id: 'overview', h: 'The three ratings at a glance',
      table: [
        ['Rating', 'What it validates', 'Recommended preparation'],
        ['Initial (green / IPPI 2–3)', 'Solo flight on a known school site in calm conditions', 'Introductory + early progression course'],
        ['Pilot (blue / IPPI 4)', 'Full autonomy across varied sites and thermal conditions', 'Progression, advanced thermal & SIV courses, regular solo airtime'],
        ['Advanced Pilot (brown / IPPI 5)', 'Mastery in strong thermals, cross-country planning, airspace & meteorology', 'XC courses, SIV and extensive solo experience'],
      ],
    },
    {
      id: 'exams', h: 'How are ratings assessed?',
      p: [
        'Each rating combines a multiple-choice theory questionnaire (aerology, flight mechanics, equipment, air law and human factors) with practical in-flight sign-offs by a qualified instructor.',
        'Your skills are logged progressively in your pilot training passport across multiple flights: pre-flight checks, reverse/forward launches, active piloting, landing accuracy and weather judgement.',
      ],
    },
    {
      id: 'why', h: 'Why earn your pilot ratings?',
      ul: [
        'They give clear, structured safety milestones as you become independent.',
        'Schools, clubs and guided trips use them (along with an IPPI card abroad) to verify your level.',
        'Tandem endorsements, competition entry and instructor pathways build on the Advanced Pilot rating.',
        'Studying for theory exams anchors essential airspace and weather knowledge.',
      ],
    },
  ],
  faq: [
    { q: 'How long does it take to reach the Pilot rating?', a: 'Typically one to two flying seasons after your introductory course, depending on weather and how often you fly.' },
    { q: 'Are French ratings recognised abroad?', a: 'Request an FAI IPPI card alongside your national federation licence so foreign sites (including Switzerland, Austria and Italy) recognise your stage immediately.' },
  ],
  next: [
    { href: '/en/learn-paragliding/licences/initial/', label: 'Initial rating (green)', text: 'The first solo milestone after initiation.' },
    { href: '/en/learn-paragliding/licences/pilot/', label: 'Pilot rating (blue)', text: 'The autonomous solo pilot benchmark.' },
    { href: '/en/learn-paragliding/licences/advanced-pilot/', label: 'Advanced Pilot rating (brown)', text: 'Thermal mastery, cross-country and advanced safety.' },
  ],
};

const INITIAL_EN: Article & { frSlug: string } = {
  slug: 'licences/initial',
  frSlug: 'brevets/initial',
  title: 'Initial paragliding rating (green level): exam, preparation & scope',
  h1: 'Initial paragliding rating (green level)',
  lead: 'The first federation rating following an introductory course: flying solo on a familiar site in calm conditions.',
  description: 'FFVL Initial paragliding rating (green level): skills validated, practical & theory tests, preparation and next steps.',
  parent: { href: '/en/learn-paragliding/licences/', label: 'Licences & ratings' },
  brief: [
    { k: 'Level', v: 'Green · 1st rating' },
    { k: 'Validates', v: 'Solo flight on a known site in calm air' },
    { k: 'Preparation', v: 'Introductory course (~5 days) + initial solo flights' },
    { k: 'Tests', v: 'Beginner theory QCM + instructor practical sign-off' },
  ],
  sections: [
    { id: 'scope', h: 'What does the Initial rating validate?', p: ['It confirms you can check your gear, inflate the wing, launch, follow a flight plan and land solo on a familiar school site in calm, predictable wind—without meaning you are ready for turbulent midday air on unknown mountains yet.'] },
    { id: 'tests', h: 'The assessment', p: ['A straightforward multiple-choice test on beginner weather, priority rules, gear checks and safety, paired with continuous practical assessment by your instructor during course flights.'] },
    { id: 'next-step', h: 'What comes next?', p: ['Move on to a progression course to discover new flying sites, reverse launches and gentle lift toward the blue Pilot rating.'] },
  ],
  next: [
    { href: '/en/courses/initiation/', label: 'Introductory courses', text: 'Find a beginner course to start your training.' },
    { href: '/en/learn-paragliding/licences/pilot/', label: 'Pilot rating (blue)', text: 'The next milestone toward full autonomy.' },
  ],
};

const PILOTE_EN: Article & { frSlug: string } = {
  slug: 'licences/pilot',
  frSlug: 'brevets/pilote',
  title: 'Pilot paragliding rating (blue level / IPPI 4): skills & preparation',
  h1: 'Pilot paragliding rating (blue level)',
  lead: 'The benchmark qualification of an autonomous solo pilot: flying safely across varied sites and thermal conditions.',
  description: 'FFVL Pilot rating (blue level / IPPI 4): competencies, theory & practical exams, preparation courses and progression.',
  parent: { href: '/en/learn-paragliding/licences/', label: 'Licences & ratings' },
  brief: [
    { k: 'Level', v: 'Blue · 2nd rating (≈ IPPI 4)' },
    { k: 'Typical timeframe', v: '1 to 2 seasons after Initial rating' },
    { k: 'Tests', v: 'Comprehensive theory exam + multi-site flight evaluation' },
    { k: 'Next step', v: 'Advanced Pilot rating (brown / IPPI 5)' },
  ],
  sections: [
    { id: 'scope', h: 'Core competencies', ul: ['Assess unfamiliar sites and weather windows independently.', 'Master both forward and reverse launches in light to moderate wind.', 'Fly safely in thermals while respecting right-of-way rules.', 'Execute rapid descents (big ears, 360s) and precision landings.', 'Understand airspace classifications relevant to free flight.'] },
    { id: 'prep', h: 'How to prepare', ul: ['Complete one or two progression / advanced thermal courses.', 'Log regular solo flights across varied sites.', 'Take an over-water SIV course to master active wing control.', 'Practise the official theory question bank.'] },
  ],
  next: [
    { href: '/en/courses/progression/', label: 'Progression courses', text: 'Build multi-site solo autonomy.' },
    { href: '/en/courses/siv/', label: 'SIV courses', text: 'Train incident recovery over water.' },
    { href: '/en/learn-paragliding/licences/advanced-pilot/', label: 'Advanced Pilot rating', text: 'Cross-country and strong-air mastery.' },
  ],
};

const CONFIRME_EN: Article & { frSlug: string } = {
  slug: 'licences/advanced-pilot',
  frSlug: 'brevets/pilote-confirme',
  title: 'Advanced Pilot paragliding rating (brown level / IPPI 5)',
  h1: 'Advanced Pilot rating (brown level)',
  lead: 'The third federation rating: strong-thermal mastery, cross-country route planning, meteorology and advanced airmanship.',
  description: 'FFVL Advanced Pilot rating (brown level / IPPI 5): prerequisites, XC & safety skills, exams and advanced courses.',
  parent: { href: '/en/learn-paragliding/licences/', label: 'Licences & ratings' },
  brief: [
    { k: 'Level', v: 'Brown · 3rd rating (≈ IPPI 5)' },
    { k: 'Prerequisite', v: 'Pilot rating (blue) and regular solo flying' },
    { k: 'Tests', v: 'In-depth theory exam + in-flight assessment' },
    { k: 'Opens access to', v: 'Cross-country competitions & federal qualifications' },
  ],
  sections: [
    { id: 'skills', h: 'What it validates', ul: ['Active piloting in turbulent thermals and valley breezes.', 'Cross-country flight preparation, transitions and safe out-landings.', 'Forecasting instability, convergence, foehn and over-development.', 'Full command of airspace charts, NOTAMs and reserve procedures.'] },
  ],
  next: [
    { href: '/en/courses/advanced/', label: 'Advanced & XC courses', text: 'Thermal and cross-country coaching.' },
    { href: '/en/courses/siv/', label: 'SIV & piloting', text: 'Master stalls and collapses over water.' },
  ],
};

const LICENCE_EN: Article & { frSlug: string } = {
  slug: 'ffvl-licence-insurance',
  frSlug: 'licence-ffvl',
  title: 'Do you need a permit to fly a paraglider? Federation licence & insurance',
  h1: 'Permits, federation licence & aerial insurance',
  lead: 'In France no government permit is legally required for solo foot-launched paragliding, whereas aerial third-party liability insurance is essential everywhere—and Switzerland requires an official SHV/FSVL licence.',
  description: 'Paragliding legal requirements, FFVL/SHV/FBVL federation licences, third-party aerial liability insurance, medical rules and IPPI cards.',
  parent: { href: LEARN_ROOT_EN, label: 'Learn paragliding' },
  brief: [
    { k: 'France', v: 'Aerial liability insurance required in schools/clubs; FFVL ratings strongly recommended' },
    { k: 'Switzerland', v: 'Official FSVL/SHV licence (or foreign licence + IPPI 4/5 for visitors) mandatory' },
    { k: 'Insurance', v: 'Dedicated third-party aviation liability (RCA) is indispensable' },
    { k: 'Abroad', v: 'Carry your national licence, IPPI card and insurance certificate in English' },
  ],
  sections: [
    { id: 'law', h: 'Permit vs. federation licence', p: ['When people mention a "paragliding licence" in France, they usually mean two separate things: (1) the annual federation membership (FFVL), which bundles mandatory third-party aviation liability insurance ("Responsabilité Civile Aérienne"), and (2) pilot skill ratings (Initial, Pilot, Advanced Pilot). In Switzerland, passing the official FSVL/SHV theoretical and practical exams is legally required to fly solo without an instructor.'] },
    { id: 'insurance', h: 'Why dedicated aerial insurance is non-negotiable', p: ['Standard household or travel policies almost always exclude air sports. Aviation third-party liability covers damage caused to third parties or property (such as power lines or vehicles), and optional personal-accident cover protects you. Schools arrange student cover when you start.'] },
  ],
  next: [
    { href: '/en/learn-paragliding/licences/', label: 'Pilot ratings', text: 'See the three progressive skill levels.' },
    { href: '/en/courses/initiation/', label: 'Introductory courses', text: 'Start with a certified school.' },
  ],
};

type Module = { slug: string; frSlug: string; menu: string; lead: string; lessons: Section[] };
const MODULES_EN: Module[] = [
  {
    slug: 'flight-theory-basics', frSlug: 'bases-theoriques', menu: 'Flight theory basics',
    lead: 'Understand why a soft wing flies: lift, glide ratio, airspeed, axes of motion and certified gear.',
    lessons: [
      L('flight-mechanics', 'Flight mechanics: lift, glide ratio and airspeed',
        'Air flowing around the inflated aerofoil generates aerodynamic lift balancing the weight of pilot and glider. A paraglider flies because it glides steadily forward through the air mass.',
        'Glide ratio is horizontal distance covered per unit of height lost in still air (around 8:1 to 10:1 on modern wings). What keeps the wing flying is airspeed—flying into a headwind reduces groundspeed, while a tailwind increases groundspeed without changing airspeed.',
        'Pulling brakes slows the wing and increases angle of attack; pushing the speed bar increases speed while reducing collapse resistance.'),
      L('axes', 'Pitch, roll and yaw',
        'Pitch is fore-and-aft surge (damped smoothly with the brakes). Roll is banking left or right into a turn. Yaw is rotation around the vertical axis.',
        'Clean turns combine weight-shift in the harness toward the inside of the turn with progressive inside brake while controlling outside bank.'),
      L('equipment', 'Paragliding equipment & EN categories',
        'A complete kit comprises the ram-air wing, suspension lines, risers, brake toggles, harness with certified back protector, reserve parachute, helmet and radio.',
        'Wings are certified from EN-A (maximum passive safety, ideal for beginners) through EN-B, EN-C and EN-D. Always fly a wing matched to your current annual airtime.'),
    ],
  },
  {
    slug: 'aerology-weather', frSlug: 'aerologie-meteo', menu: 'Aerology & weather',
    lead: 'Read wind, terrain, valley breezes and thermals so you know when and where to launch.',
    lessons: [
      L('wind', 'Wind direction and strength',
        'Observe windsocks, streamers, treetops and water ripples alongside anemometer readings. Beginners need smooth, laminar headwind on launch; gusty or cross-tail winds are a clear cue to wait or stand down.'),
      L('terrain-rotors', 'Terrain, ridge lift and lee-side rotors',
        'Wind flowing smoothly up a windward slope creates ridge lift. Behind obstacles, ridges, trees or buildings, air tumbles into turbulent lee-side rotors—always stay well upwind of lee areas.'),
      L('thermals-breezes', 'Thermals and valley breezes',
        'Sun-warmed ground releases rising bubbles and columns of warm air (thermals), marked by cumulus clouds and circling birds. Valley and slope breezes follow a daily solar cycle, strengthening mid-afternoon and reversing into katabatic down-slope flow in the evening.'),
      L('forecast-check', 'Checking forecasts before flying',
        'Cross-check mountain weather bulletins, wind altitude soundings, atmospheric stability and live station beacons. Vertical storm cloud build-up, foehn winds or rapid pressure shifts mean staying firmly on the ground.'),
    ],
  },
  {
    slug: 'ground-prep-inflation', frSlug: 'preparation-gonflage', menu: 'Ground prep & inflation',
    lead: 'Lay out, clear lines, clip in, run pre-flight checks and inflate cleanly overhead.',
    lessons: [
      L('line-check', 'Laying out the wing & clearing lines',
        'Spread the canopy in a horseshoe arc facing into the wind, sort A-to-brake lines cleanly on each side and verify risers are straight with unobstructed brake pulleys.'),
      L('harness-prevol', 'Harness buckle check & pre-flight routine',
        'Follow the same unhurried sequence before every single flight: leg straps and chest strap buckled, carabiners locked, reserve handle secure, helmet fastened, lines clear, airspace & launch clear.'),
      L('inflation-control', 'Inflation, centring and damping overhead',
        'Bring the wing up progressively using the A-risers and body movement rather than yanking with your arms. As it reaches zenith, apply a light check on the brakes to stop any surge, centre the wing above your head and visually inspect it before committing to launch.'),
    ],
  },
  {
    slug: 'take-off', frSlug: 'decollage', menu: 'Take-off',
    lead: 'Pick a clean cycle, commit to a progressive launch run and stay standing until airborne.',
    lessons: [
      L('launch-timing', 'Choosing the right launch window',
        'Launch only when wind is straight up the slope, smooth and free of thermal gusts, with clear airspace ahead and below. Patience on launch is the mark of a good pilot.'),
      L('launch-run', 'The launch run',
        'Accelerate smoothly down the slope with chest leaning forward, hands back and eyes ahead—never jump or sit into the harness early. If the wing comes up crooked, stop running immediately and brake symmetrically to abort safely on the slope.'),
    ],
  },
  {
    slug: 'flight-landing', frSlug: 'vol-atterrissage', menu: 'Flying & landing',
    lead: 'Steer smoothly, set up a clean landing circuit and respect air priority rules.',
    lessons: [
      L('approach', 'Flight plan and landing approach',
        'Keep the landing field within easy glide throughout your flight. Join the downwind leg, lose excess height with figure-8s or S-turns in the loss-of-altitude zone, turn base and roll onto a straight final leg into the wind with wings level.'),
      L('flare', 'Landing flare',
        'Fly at trim speed on final so the wing keeps full energy, then apply a smooth, progressive symmetric flare 1 metre above the ground to touch down gently on your feet.'),
      L('right-of-way', 'Right-of-way rules in the air',
        'Head-on: both pilots turn right. Ridge soaring: the pilot with the ridge on their right has priority. Thermalling: match the turn direction of the first pilot in the thermal. Landing: the lower pilot has priority.'),
    ],
  },
  {
    slug: 'safety-airspace', frSlug: 'securite-reglementation', menu: 'Safety & airspace',
    lead: 'Collapses, rapid descents, reserve parachute, airspace rules and human factors.',
    lessons: [
      L('incidents', 'Collapses, stalls & rapid descents',
        'Maintain heading first if one side of the wing deflates, and avoid over-braking the flying side into a stall. Learn big ears, spiral exits and collapse recovery over water during an SIV course.'),
      L('reserve', 'Reserve parachute care',
        'Check your reserve deployment pin before launch, repack your reserve every 6–12 months per manufacturer guidelines, and never hesitate to throw it if low and out of control.'),
      L('airspace-human', 'Airspace & human factors',
        'Check local CTR/TMA limits, nature-reserve wildlife zones and power-line cables before launching. Watch out for fatigue, dehydration or group pressure—choosing not to launch is always a valid pilot decision.'),
    ],
  },
];

const COURS_HUB_EN: Article & { frSlug: string } = {
  slug: 'theory',
  frSlug: 'cours',
  title: 'Paragliding theory course: 6 essential modules',
  h1: 'Paragliding theory modules',
  lead: 'Six concise modules to understand flight mechanics, mountain weather, ground handling and safety before and between your practical courses.',
  description: 'Online paragliding theory guide: flight mechanics, aerology & weather, ground prep & inflation, take-off, landing approaches and safety.',
  parent: { href: LEARN_ROOT_EN, label: 'Learn paragliding' },
  brief: [
    { k: 'Structure', v: '6 modules covering core pilot theory' },
    { k: 'Audience', v: 'Beginners preparing a course & pilots revising' },
    { k: 'Important', v: 'Theory complements—never replaces—certified school instruction' },
  ],
  sections: [{
    id: 'modules', h: 'The six modules',
    p: ['Each module summarises key concepts taught in certified schools so you arrive on the training slope familiar with the vocabulary and safety principles.'],
  }],
  next: MODULES_EN.map((m) => ({ href: `/en/learn-paragliding/theory/${m.slug}/`, label: m.menu, text: m.lead })),
};

const MODULE_PAGES_EN: (Article & { frSlug: string })[] = MODULES_EN.map((m) => ({
  slug: `theory/${m.slug}`,
  frSlug: `cours/${m.frSlug}`,
  title: `${m.menu}: paragliding theory`,
  h1: m.menu,
  lead: m.lead,
  description: `${m.lead} Topics: ${m.lessons.map((x) => x.h).join(', ')}.`,
  parent: { href: '/en/learn-paragliding/theory/', label: 'Theory modules' },
  sections: m.lessons,
  next: [
    { href: '/en/learn-paragliding/theory/', label: 'All theory modules', text: 'Back to the 6-module overview.' },
    { href: '/en/paragliding-course-schools/', label: 'Put it into practice: book a course', text: 'Learn hands-on with a certified instructor.' },
  ],
}));

export const LEARN_HUB_EN = HUB_EN;
export const LEARN_PAGES_EN = [FIRST_STAGE_EN, BREVETS_EN, INITIAL_EN, PILOTE_EN, CONFIRME_EN, LICENCE_EN, COURS_HUB_EN, ...MODULE_PAGES_EN];
export const LEARN_MENU_EN = [
  { href: '/en/paragliding-licence-pathway/', label: 'Pathway and licences' },
  { href: LEARN_ROOT_EN, label: 'Learn paragliding' },
  { href: '/en/learn-paragliding/first-course/', label: 'Prepare your first course' },
  { href: '/en/learn-paragliding/licences/', label: 'Licences & ratings' },
  { href: '/en/learn-paragliding/theory/', label: 'Theory modules' },
];
