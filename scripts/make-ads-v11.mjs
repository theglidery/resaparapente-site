// Google Ads Editor files for the v11 pages: tandem comparator, training-cost comparator, gift voucher (Christmas), "saut en parapente".
// Usage: node scripts/make-ads-v11.mjs [--market FR|CH|BE] [--budget 10]  ->  ads/v11-<market>.csv (all PAUSED) + ads/RAPPORT-v11-<market>.txt
// Run once per market (the data and the landing pages differ). Import in Google Ads Editor, check, enable one campaign at a time.
// "Conquête" campaigns: the same generic keywords that ecole-de-parapente.fr targets (école / stage / baptême / brevet / prix / saut / régions et villes),
// each sent to the closest page of ours. One optional, separate campaign bids on the competitor's own name (no name is ever used in ad text).
import fs from 'node:fs';
import { createServer } from 'vite';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const MARKET = (arg('market', 'FR')).toUpperCase(), BUDGET = arg('budget', '10'), BUDGET_CONQ = arg('budget-conq', '15');
process.env.PUBLIC_MARKET = MARKET;
const ORIGIN = { FR: 'https://resaparapente.fr', CH: 'https://resaparapente.ch', BE: 'https://resaparapente.be' }[MARKET];
const GEO = { FR: 'France', CH: 'Switzerland', BE: 'Belgium' }[MARKET];
const LANGS = { FR: ['fr'], CH: ['fr', 'de', 'en'], BE: ['fr', 'en'] }[MARKET];
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true }, envPrefix: ['VITE_', 'PUBLIC_'] });
const cmp = await vite.ssrLoadModule('/src/lib/compare.ts');
const places = await vite.ssrLoadModule('/src/lib/places.ts');
const routes = await vite.ssrLoadModule('/src/i18n/routes.mjs');
const data = await vite.ssrLoadModule('/src/lib/data.ts');
const { schools } = data;
const nTotal = schools.length, nStageSchools = schools.filter((x) => x.stages.length).length, nStages = schools.reduce((a, x) => a + x.stages.length, 0);
const lowStage = places.statsOf(schools, 'stage').min;
const rows = cmp.bapRows();
const nOffers = rows.length, nSchools = new Set(rows.map((r) => r.slug)).size;
const low = rows.length ? Math.round(rows[0].total) : null;
const cur = MARKET === 'CH' ? 'CHF' : '€';
const price = (n) => (cur === 'CHF' ? `${n} CHF` : `${n} €`);

const COLS = ['Campaign', 'Campaign Status', 'Campaign Type', 'Campaign Daily Budget', 'Bid Strategy Type', 'Networks', 'Languages', 'Location', 'Ad Group', 'Ad Group Status', 'Max CPC', 'Keyword', 'Criterion Type', 'Ad type', ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`), ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`), 'Path 1', 'Path 2', 'Final URL', 'Status'];
const esc = (v) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const line = (o) => COLS.map((c) => esc(o[c])).join(';');
let dropped = 0;
const fit = (t, max) => { t = String(t).replace(/\s+/g, ' ').trim(); if (t.length <= max) return t; dropped++; return ''; };
const unique = (a) => [...new Set(a.filter(Boolean))];
const noAcc = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const NEG = { fr: ['occasion', 'achat voile', 'achat aile', 'fabricant', 'simulateur', 'jeu', 'emploi', 'formation moniteur', 'brevet moniteur', 'paramoteur', 'pendulaire', 'saut en parachute', 'parachute', 'wingsuit', 'canada', 'bali', 'prix voile', 'pdf', 'cours en ligne', 'chute libre', 'parapente neuf', 'acheter parapente', 'achat parapente', 'sellette occasion'],
  de: ['occasion', 'gebraucht', 'kaufen schirm', 'hersteller', 'simulator', 'spiel', 'job', 'fallschirm', 'fallschirmsprung', 'wingsuit', 'paramotor', 'pdf', 'online kurs', 'freier fall'],
  en: ['used', 'second hand', 'buy wing', 'manufacturer', 'simulator', 'game', 'job', 'skydiving', 'parachute', 'wingsuit', 'paramotor', 'pdf', 'online course', 'free fall'] };
const dir = (page, l) => ORIGIN + routes.pathOf(page, l);

// Intent catalogue: keywords, headlines (<=30), descriptions (<=90) per language. {n}, {s}, {low} are filled from the data.
const T = {
  fr: {
    bap: [
      { g: 'Comparateur baptême', page: 'baptemeCompare', k: ['comparateur baptême parapente', 'comparateur prix baptême parapente', 'comparer baptême parapente', 'comparatif baptême parapente', 'comparateur parapente biplace'], h: ['Comparateur baptême parapente', '{n} baptêmes comparés', 'Prix, durée, photos, remontée', 'Total à prévoir affiché', 'Comparez avant de réserver', 'Réservation chez l’école'], d: ['Comparez {n} baptêmes de {s} écoles : prix, durée de vol, photo/vidéo, remontée.', 'Le total à prévoir est affiché quand l’école publie ses suppléments.', 'Prix relevés sur les sites des écoles, datés. Vous réservez chez l’école.'] },
      { g: 'Prix baptême', page: 'baptemeCompare', k: ['prix baptême parapente', 'tarif baptême parapente', 'combien coûte un baptême parapente', 'baptême parapente pas cher', 'prix vol biplace parapente'], h: ['Prix baptême parapente', 'Dès {low} le baptême', 'Combien coûte un baptême ?', 'Baptême parapente pas cher', 'Tous les prix comparés', 'Prix total, pas seulement le vol'], d: ['Prix des baptêmes de parapente dès {low}. Durée, photos et remontées comparées.', 'Filtrez par budget, durée ou région et voyez le total estimé de chaque vol.', 'Les suppléments connus sont ajoutés ; ceux à confirmer sont signalés.'] },
      { g: 'Photos et vidéo', page: 'baptemeCompare', q: 'photo=any', k: ['baptême parapente photos incluses', 'baptême parapente vidéo incluse', 'baptême parapente avec vidéo', 'baptême parapente avec photos', 'baptême parapente gopro'], h: ['Baptême parapente avec vidéo', 'Photos et vidéo : qui les inclut', 'Photo incluse ou en option ?', 'Comparez les options photo', '{n} baptêmes comparés'], d: ['Photo ou vidéo du vol : voyez les formules qui l’incluent et celles où elle est en option.', 'Prix de la photo ou vidéo affiché quand l’école l’a publié.'] },
      { g: 'Remontée incluse', page: 'baptemeCompare', q: 'lift=yes', k: ['baptême parapente remontée incluse', 'baptême parapente télécabine', 'baptême parapente téléphérique', 'baptême parapente télésiège'], h: ['Baptême remontée incluse', 'Remontée mécanique comprise ?', 'Comparez le prix total', '{n} baptêmes comparés', 'Prix du vol et de la remontée'], d: ['La remontée est-elle comprise ? Comparez les formules et leur prix total.', 'Filtre « remontée incluse » : prix publiés par les écoles, avec la date.'] },
      { g: 'Vol long', page: 'baptemeCompare', q: 'dur=3', k: ['baptême parapente 30 minutes', 'baptême parapente longue durée', 'baptême parapente vol long', 'baptême parapente 1 heure'], h: ['Baptême parapente vol long', 'Vols de plus de 30 minutes', 'Longue durée : comparez', '{n} baptêmes comparés', 'Durée et prix côte à côte'], d: ['Vols de plus de 30 minutes : durée annoncée et prix côte à côte.', 'Comparez les vols longs de {s} écoles et réservez chez l’école.'] },
      { g: 'Enfants', page: 'baptemeCompare', q: 'profile=Enfant', k: ['baptême parapente enfant', 'baptême parapente enfants', 'parapente enfant à partir de quel âge'], h: ['Baptême parapente enfant', 'Formules pour enfants', 'Vérifiez âge et poids', '{n} baptêmes comparés', 'Comparez avant de réserver'], d: ['Formules signalées pour enfants : l’âge et le poids minimum dépendent de l’école.', 'Comparez les prix et réservez chez l’école.'] },
      { g: 'Quel baptême choisir', page: 'baptemeGuide', k: ['quel baptême parapente choisir', 'quel vol parapente choisir', 'premier vol parapente conseils', 'baptême parapente que choisir'], h: ['Quel baptême choisir ?', 'Premier vol, enfant, budget', 'Le bon baptême pour lui', 'Conseils et formules', 'Comparez ensuite les prix'], d: ['Premier vol, enfant, sensations, budget : le baptême adapté à chaque personne.', 'Un lien vers les formules qui correspondent, et ce que chaque option change au prix.'] },
    ],
    stage: [
      { g: 'Comparateur écoles', page: 'trainingCost', k: ['comparateur école parapente', 'comparateur écoles de parapente', 'comparer écoles parapente', 'comparateur stage parapente'], h: ['Comparateur école parapente', 'Écoles comparées par prix', 'Coût total jusqu’au brevet', 'Classement par coût total', 'Réservation chez l’école'], d: ['Comparez les écoles de parapente par coût total jusqu’au brevet, pas seulement par stage.', 'Forfaits publiés ou cumul des stages : vous réglez le nombre de stages.'] },
      { g: 'Prix formation', page: 'trainingCost', k: ['prix formation parapente', 'comparateur prix formation parapente', 'combien coûte une formation parapente', 'coût formation parapente complète', 'prix brevet parapente', 'combien coûte le brevet de parapente', 'tarif formation parapente'], h: ['Prix formation parapente', 'Combien coûte le brevet ?', 'Formation complète : le prix', 'Comparez le coût total', 'Matériel et examens à part', 'Classement par coût total'], d: ['Combien coûte une formation de parapente jusqu’au brevet ? Comparez les écoles.', 'Forfaits publiés, cumul des stages et frais d’examens : le total, pas un prix isolé.', 'Le matériel n’est jamais estimé : vous saisissez votre budget.'] },
      { g: 'Quand commencer', page: 'whenStart', k: ['quand commencer le parapente', 'stage initiation parapente dates', 'prochaines dates stage initiation parapente', 'stage initiation parapente calendrier', 'débuter le parapente quand'], h: ['Quand commencer le parapente', 'Prochaines dates d’initiation', 'Stage d’initiation : dates', 'Prix d’initiation par école', 'Dates réunies, écoles comparées'], d: ['Les prochaines dates de stage d’initiation, réunies depuis les écoles.', 'Comparez le prix d’initiation de chaque école et réservez la date qui vous convient.'] },
      { g: 'Parcours et brevets', page: 'trainingPath', k: ['brevet parapente', 'parcours brevet parapente', 'comment devenir pilote de parapente', 'formation pilote parapente', 'passer le brevet de parapente'], h: ['Brevet de parapente', 'Devenir pilote : les étapes', 'Examens, vols, délais', 'Parcours de formation', 'Coût jusqu’au brevet'], d: ['Les étapes pour devenir pilote de parapente : vols, examens, délais, coûts.', 'D’après les sources officielles citées sur la page.'] },
    ],
    gift: [
      { g: 'Bon cadeau', page: 'giftChristmas', k: ['bon cadeau parapente', 'bon cadeau baptême parapente', 'carte cadeau parapente', 'chèque cadeau parapente', 'coffret cadeau parapente'], h: ['Bon cadeau parapente', 'Offrir un baptême parapente', 'Bon cadeau pour Noël', 'Choisissez la bonne formule', 'Bon vendu par l’école', 'Sachez ce que vous offrez'], d: ['Bon cadeau parapente : choisissez la formule, achetez le bon chez l’école.', 'Baptême, vol long ou initiation : on vous dit ce que chaque cadeau comprend.', 'ResaParapente n’encaisse rien : le bon est vendu et géré par l’école.'] },
      { g: 'Offrir un vol', page: 'giftChristmas', k: ['offrir un baptême parapente', 'offrir un vol en parapente', 'offrir parapente', 'offrir un baptême en parapente', 'offrir un saut en parapente'], h: ['Offrir un vol en parapente', 'Offrir un baptême parapente', 'Un cadeau qui marque', 'Bon cadeau chez l’école', 'Dès {low} le baptême'], d: ['Offrir un vol en parapente : comparez les formules et demandez le bon à l’école.', 'Premier vol, enfant, vol long, initiation : le bon cadeau adapté.'] },
      { g: 'Noël', page: 'giftChristmas', k: ['cadeau noël parapente', 'idée cadeau noël parapente', 'bon cadeau parapente noël', 'idée cadeau parapente', 'idée cadeau original baptême'], h: ['Cadeau de Noël parapente', 'Idée cadeau pour Noël', 'Bon cadeau parapente Noël', 'Offrez un vol à Noël', 'Contactez l’école tôt'], d: ['Idée cadeau pour Noël : un baptême de parapente. Le bon est vendu par l’école.', 'Délai d’envoi variable selon l’école : demandez-le tôt avant Noël.'] },
      { g: 'Stage cadeau', page: 'giftChristmas', k: ['bon cadeau stage parapente', 'offrir une initiation parapente', 'offrir un stage de parapente', 'cadeau stage parapente'], h: ['Bon cadeau stage parapente', 'Offrir une initiation', 'Pour apprendre à voler', 'Dès {low} le baptême'], d: ['Offrir un stage d’initiation au parapente : prix et dates, bon vendu par l’école.', 'Comparez les initiations et demandez le bon à l’école de votre choix.'] },
      { g: 'Réduction et promo', page: 'giftChristmas', k: ['bon de réduction parapente', 'code promo baptême parapente', 'promo baptême parapente', 'réduction baptême parapente', 'baptême parapente promotion'], h: ['Promos baptême parapente', 'Prix promo des écoles', 'Bon cadeau ou promotion', 'Promotions publiées par écoles', 'Comparez les prix'], d: ['Promotions publiées par les écoles partenaires, pendant leur période de validité.', 'Un bon cadeau n’est pas une réduction : comparez aussi les prix des baptêmes.'] },
    ],
    jump: [
      { g: 'Saut en parapente', page: 'jump', k: ['saut en parapente', 'saut parapente', 'saut en parapente prix', 'saut en parapente tandem', 'saut en parapente biplace', 'sauter en parapente', 'saut en parapente avis'], h: ['Saut en parapente', 'Saut en parapente : prix', 'Saut parapente tandem', 'Dès {low} le saut', '{n} formules comparées', 'Prix, durée, photos'], d: ['Saut en parapente (baptême biplace) : prix dès {low}, durée du vol, photos, remontée.', 'Comparez {n} formules de {s} écoles et réservez chez l’école.', 'Aucune expérience nécessaire : le pilote décolle, vole et atterrit pour vous.'] },
    ],
    pathStage: 'stage-parapente', pathBap: 'bapteme-parapente', ctaRegion: 'Saut en parapente', kwRegion: 'saut en parapente', hRegion: 'Saut en parapente', dRegion: 'Saut en parapente {place} : comparez les écoles, les prix et les durées.',
  },
  de: {
    bap: [
      { g: 'Tandemflug Vergleich', page: 'baptemeCompare', k: ['tandemflug gleitschirm vergleich', 'gleitschirm tandemflug preis', 'gleitschirm tandemflug schweiz', 'tandemflug gleitschirm kosten', 'gleitschirm tandem preisvergleich'], h: ['Gleitschirm-Tandemflug', 'Tandemflug-Vergleich', '{n} Flüge verglichen', 'Preis, Dauer, Foto, Bahn', 'Gesamtpreis auf einen Blick', 'Buchung bei der Schule'], d: ['{n} Tandemflüge von {s} Schulen vergleichen: Preis, Flugdauer, Foto/Video, Bergbahn.', 'Preise von den Schulen veröffentlicht und datiert. Sie buchen bei der Schule.'] },
      { g: 'Welcher Flug', page: 'baptemeGuide', k: ['welcher tandemflug gleitschirm', 'gleitschirm tandemflug erster flug', 'gleitschirm tandemflug kind'], h: ['Welcher Tandemflug passt?', 'Erstflug, Kind, Budget', 'Tipps und passende Flüge', '{n} Flüge verglichen'], d: ['Erstflug, Kind, Nervenkitzel, Budget: der passende Tandemflug für jede Person.', 'Mit Link zu den passenden Flügen und Preisen.'] },
    ],
    stage: [
      { g: 'Ausbildung Kosten', page: 'trainingCost', k: ['gleitschirmkurs kosten', 'gleitschirm ausbildung kosten', 'gleitschirm brevet kosten', 'gleitschirm ausbildung schweiz kosten', 'gleitschirm grundkurs preis'], h: ['Gleitschirm-Ausbildung Kosten', 'Was kostet das Brevet?', 'Kosten bis zum Brevet', 'Schulen nach Kosten verglichen', 'Ausrüstung und Prüfung extra'], d: ['Was kostet die Gleitschirmausbildung bis zum Brevet? Schulen im Vergleich.', 'Komplettpakete oder Kurssummen und Prüfungsgebühren: die Summe, nicht der Einzelpreis.'] },
      { g: 'Wann anfangen', page: 'whenStart', k: ['gleitschirm grundkurs termine', 'gleitschirm schnupperkurs termine', 'gleitschirm einsteigerkurs'], h: ['Gleitschirm-Grundkurs Termine', 'Nächste Einsteigerkurse', 'Preise je Schule', 'Termine gesammelt'], d: ['Die nächsten Einsteigerkurse, von den Schulen gesammelt, mit Preis.', 'Schulen vergleichen und den passenden Termin wählen.'] },
      { g: 'Brevet Weg', page: 'trainingPath', k: ['gleitschirm brevet schweiz', 'gleitschirm pilot werden schweiz', 'gleitschirm ausbildung schweiz'], h: ['Gleitschirm-Brevet Schweiz', 'Pilot werden: die Schritte', 'Prüfungen und Fristen', 'Kosten bis zum Brevet'], d: ['Die Schritte zum Gleitschirmpiloten in der Schweiz: Flüge, Prüfungen, Fristen.', 'Nach den SHV-Weisungen, mit Quellen auf der Seite.'] },
    ],
    gift: [
      { g: 'Gutschein', page: 'giftChristmas', k: ['gleitschirm gutschein', 'gleitschirm gutschein schweiz', 'tandemflug verschenken', 'gleitschirm geschenk', 'gleitschirm geschenkgutschein', 'tandemflug gutschein'], h: ['Gleitschirm-Gutschein', 'Tandemflug verschenken', 'Gutschein zu Weihnachten', 'Passendes Paket wählen', 'Gutschein von der Schule'], d: ['Gleitschirm-Gutschein: Paket wählen, Gutschein bei der Schule kaufen.', 'Tandemflug, langer Flug oder Kurs: wir zeigen, was jedes Geschenk enthält.', 'ResaParapente kassiert nichts: Die Schule verkauft den Gutschein.'] },
    ],
    jump: [
      { g: 'Tandemsprung', page: 'jump', k: ['gleitschirm tandemsprung', 'gleitschirm sprung', 'tandem gleitschirm sprung preis', 'gleitschirmfliegen tandem'], h: ['Gleitschirm-Tandemflug', 'Tandemsprung Gleitschirm', 'Preis ab {low}', '{n} Flüge verglichen'], d: ['Gleitschirm-Tandemflug: Preis ab {low}, Flugdauer, Fotos, Bergbahn im Vergleich.', 'Keine Erfahrung nötig: Der Pilot startet, fliegt und landet für Sie.'] },
    ],
  },
  en: {
    bap: [
      { g: 'Tandem comparison', page: 'baptemeCompare', k: ['tandem paragliding price comparison', 'tandem paragliding prices', 'compare tandem paragliding', 'tandem paragliding flight cost', 'paragliding tandem flight price'], h: ['Tandem paragliding prices', 'Compare tandem flights', '{n} flights compared', 'Price, duration, photos, lift', 'Total price at a glance', 'Book with the school'], d: ['Compare {n} tandem paragliding flights from {s} schools: price, flight time, photo/video.', 'Prices published by schools and dated. You book with the school.'] },
      { g: 'Which flight', page: 'baptemeGuide', k: ['which tandem paragliding flight', 'first paragliding flight tips', 'tandem paragliding for kids'], h: ['Which tandem flight to pick', 'First flight, child, budget', 'Advice and matching flights', '{n} flights compared'], d: ['First flight, child, thrill, budget: the right tandem flight for each person.', 'With links to matching flights and prices.'] },
    ],
    stage: [
      { g: 'Course cost', page: 'trainingCost', k: ['paragliding course cost', 'paragliding licence cost', 'how much does paragliding training cost', 'paragliding lessons price', 'paragliding school comparison'], h: ['Paragliding course cost', 'Cost of the licence', 'Training cost compared', 'Schools ranked by cost', 'Equipment and exams extra'], d: ['How much does paragliding training cost up to the licence? Compare schools.', 'Full packages or course totals plus exam fees: the total, not a single price.'] },
      { g: 'When to start', page: 'whenStart', k: ['paragliding beginner course dates', 'learn to paraglide', 'paragliding introductory course'], h: ['Paragliding beginner courses', 'Next course dates', 'Prices by school', 'Dates gathered'], d: ['The next introductory courses, gathered from schools, with prices.', 'Compare schools and pick the date that suits you.'] },
      { g: 'Licence pathway', page: 'trainingPath', k: ['paragliding licence', 'become a paraglider pilot', 'paragliding pilot licence switzerland'], h: ['Paragliding licence', 'Become a pilot: the steps', 'Exams and deadlines', 'Cost up to the licence'], d: ['The steps to become a paragliding pilot: flights, exams, deadlines, costs.', 'Based on official sources cited on the page.'] },
    ],
    gift: [
      { g: 'Gift voucher', page: 'giftChristmas', k: ['paragliding gift voucher', 'paragliding gift', 'tandem paragliding gift', 'paragliding gift card', 'give a paragliding flight'], h: ['Paragliding gift voucher', 'Give a tandem flight', 'Gift voucher for Christmas', 'Pick the right package', 'Voucher sold by the school'], d: ['Paragliding gift voucher: pick the package, buy the voucher from the school.', 'Tandem flight, long flight or course: we show what each gift includes.', 'ResaParapente collects nothing: the school sells the voucher.'] },
    ],
    jump: [
      { g: 'Tandem jump', page: 'jump', k: ['tandem paragliding jump', 'paragliding jump', 'tandem paragliding', 'paragliding tandem flight'], h: ['Tandem paragliding', 'Paragliding tandem jump', 'From {low}', '{n} flights compared'], d: ['Tandem paragliding: from {low}, flight time, photos and lifts compared.', 'No experience needed: the pilot takes off, flies and lands for you.'] },
    ],
  },
};

// ---- "Conquête": same generic keywords as the competitor directory, each routed to our closest page.
// `only` limits a group to some markets; `path` is a French-only page (learn, stage types); `{pays}` is replaced per market and language.
const PAYS = { fr: { FR: 'france', CH: 'suisse', BE: 'belgique' }, de: { CH: 'schweiz', FR: 'frankreich', BE: 'belgien' }, en: { FR: 'france', CH: 'switzerland', BE: 'belgium' } };
const CONQ = {
  fr: [
    { g: 'École de parapente', page: 'home', k: ['école de parapente', 'ecole de parapente', 'écoles de parapente', 'école de parapente {pays}', 'écoles de parapente {pays}', 'meilleure école de parapente', 'école de parapente près de chez moi', 'trouver une école de parapente', 'annuaire école de parapente', 'liste des écoles de parapente', 'comparer les écoles de parapente'], h: ['École de parapente : comparez', '{t} écoles de parapente', 'Trouvez votre école', 'Stage et baptême en ligne', 'Prix relevés et datés', 'Demande gratuite à l’école', 'Comparez avant de choisir', 'Écoles de parapente {PAYS}'], d: ['{t} écoles de parapente : comparez les prix, les dates et les formules.', 'Stage, baptême ou formation : demande gratuite à l’école de votre choix.', 'Prix relevés sur les sites des écoles, avec la date. Vous réservez chez l’école.'] },
    { g: 'École de parapente FFVL', only: ['FR'], page: 'home', k: ['école de parapente ffvl', 'école de parapente label ffvl', 'école ffvl parapente', 'écoles de parapente agréées'], h: ['École de parapente FFVL', 'Écoles de parapente : comparez', 'Label et agrément affichés', '{t} écoles de parapente', 'Demande gratuite à l’école'], d: ['Comparez les écoles de parapente : les labels et agréments sont indiqués sur chaque fiche.', 'Prix relevés et datés. Aucun paiement sur le site : vous réservez chez l’école.'] },
    { g: 'Stage de parapente', path: '/stage/', k: ['stage de parapente', 'stages de parapente', 'stage parapente', 'stage parapente {pays}', 'stage parapente prix', 'stage parapente pas cher', 'prochains stages parapente', 'stage parapente 2027', 'stage parapente calendrier', 'stage de parapente débutant'], h: ['Stage de parapente', '{ns} stages comparés', 'Dates, niveaux et prix', 'Stage parapente dès {lows}', 'Initiation, perfectionnement, SIV', 'Réservation chez l’école', 'Demande gratuite à l’école'], d: ['Stage de parapente : {ns} stages de {st} écoles, avec dates, niveaux et prix relevés.', 'Initiation, perfectionnement, SIV, cross : comparez puis contactez l’école.'] },
    { g: 'Initiation', only: ['FR'], path: '/stage/initiation/', k: ['stage initiation parapente', 'initiation parapente', 'initiation au parapente', 'stage parapente débutant', 'apprendre le parapente stage', 'premier stage parapente'], h: ['Stage d’initiation parapente', 'Apprendre à piloter', 'Prix et dates comparés', 'Programme et niveau requis', 'Écoles qui le proposent', 'Réservation chez l’école'], d: ['Stage d’initiation au parapente : programme, prix relevés et écoles qui le proposent.', 'Contactez gratuitement l’école de votre choix. Aucun paiement sur le site.'] },
    { g: 'Perfectionnement et cross', only: ['FR'], path: '/stage/perfectionnement/', k: ['stage perfectionnement parapente', 'perfectionnement parapente', 'stage cross parapente', 'stage thermique parapente', 'stage de cross parapente', 'stage parapente cross et thermique'], h: ['Stage perfectionnement', 'Thermique et cross', 'Prix et dates comparés', 'Programme et niveau requis', 'Écoles qui le proposent', 'Réservation chez l’école'], d: ['Perfectionnement, thermique, cross : programme, prix et écoles qui le proposent.', 'Contactez gratuitement l’école de votre choix. Aucun paiement sur le site.'] },
    { g: 'Pilote confirmé', only: ['FR'], path: '/stage/progression/', k: ['stage pilote confirmé parapente', 'stage parapente pilote confirmé', 'stage progression parapente', 'stage parapente autonomie'], h: ['Stage pilote confirmé', 'Progression et autonomie', 'Prix et dates comparés', 'Programme et niveau requis', 'Écoles qui le proposent'], d: ['Progression et autonomie : programme, prix relevés et écoles qui proposent le stage.', 'Contactez gratuitement l’école de votre choix. Aucun paiement sur le site.'] },
    { g: 'SIV', only: ['FR'], path: '/stage/siv/', k: ['stage siv', 'stage siv parapente', 'siv parapente', 'stage de pilotage parapente', 'stage siv prix'], h: ['Stage SIV parapente', 'SIV : programme et prix', 'Prix et dates comparés', 'Niveau requis', 'Écoles qui le proposent', 'Réservation chez l’école'], d: ['Stage SIV : programme, niveau requis, prix relevés et écoles qui le proposent.', 'Contactez gratuitement l’école de votre choix. Aucun paiement sur le site.'] },
    { g: 'Découverte et mini-stage', only: ['FR'], path: '/stage/decouverte/', k: ['mini stage parapente', 'stage découverte parapente', 'journée découverte parapente', 'essai parapente piloter'], h: ['Mini-stage parapente', 'Stage découverte', 'Piloter soi-même', 'Prix et dates comparés', 'Écoles qui le proposent'], d: ['Mini-stage ou journée découverte : piloter soi-même sans s’engager sur un stage complet.', 'Prix relevés sur les sites des écoles. Contactez l’école de votre choix.'] },
    { g: 'Stages à l’étranger', only: ['FR'], path: '/stage/sejours-et-voyages/', k: ['stage parapente étranger', 'stage de parapente à l’étranger', 'séjour parapente', 'voyage parapente', 'stage parapente espagne'], h: ['Séjours et stages parapente', 'Stage parapente à l’étranger', 'Séjours : prix comparés', 'Écoles qui les proposent', 'Réservation chez l’école'], d: ['Séjours et voyages parapente : écoles qui les proposent et prix relevés.', 'Contactez gratuitement l’école de votre choix. Aucun paiement sur le site.'] },
    { g: 'Baptême de parapente', page: 'baptemeCompare', k: ['baptême de parapente', 'baptême parapente', 'baptême en parapente', 'baptême parapente {pays}', 'baptême parapente biplace', 'vol biplace parapente', 'vol en parapente', 'parapente tandem', 'parapente biplace', 'baptême parapente près de chez moi', 'baptême parapente 2027'], h: ['Baptême de parapente', '{n} baptêmes comparés', 'Dès {low} le baptême', 'Prix, durée, photos, remontée', 'Total à prévoir affiché', 'Réservation chez l’école', 'Comparez avant de réserver'], d: ['Baptême de parapente : {n} formules de {s} écoles, prix, durée, photo/vidéo, remontée.', 'Prix relevés sur les sites des écoles, datés. Vous réservez chez l’école.'] },
    { g: 'Prix du parapente', page: 'baptemeCompare', k: ['prix du parapente', 'prix parapente', 'tarif parapente', 'combien coûte le parapente', 'combien coûte un vol en parapente', 'prix vol parapente', 'prix parapente biplace'], h: ['Prix du parapente', 'Dès {low} le baptême', 'Combien coûte un vol ?', 'Tous les prix comparés', 'Prix total, pas seulement le vol', '{n} baptêmes comparés'], d: ['Prix du baptême de parapente dès {low} : durée, photos et remontées comparées.', 'Stage, brevet : le coût total aussi, comparateur de formation sur le site.'] },
    { g: 'Brevets FFVL', only: ['FR'], path: '/apprendre/brevets/', k: ['brevet parapente', 'brevets parapente', 'brevet ffvl parapente', 'passer son brevet de parapente', 'comment avoir son brevet de parapente', 'brevet de pilote parapente', 'test de connaissances parapente'], h: ['Brevet de parapente', 'Les trois brevets FFVL', 'Épreuves et préparation', 'Brevet initial, pilote, confirmé', 'Coût jusqu’au brevet', 'Écoles pour le préparer'], d: ['Brevet initial, pilote, pilote confirmé : épreuves, préparation et durée.', 'Puis comparez le coût total de la formation jusqu’au brevet.'] },
    { g: 'Brevet initial', only: ['FR'], path: '/apprendre/brevets/initial/', k: ['brevet initial parapente', 'brevet initial ffvl', 'brevet initial parapente épreuves'], h: ['Brevet initial parapente', 'Épreuves et préparation', 'Premier niveau FFVL', 'Écoles pour le préparer'], d: ['Brevet initial : le premier niveau, en fin d’initiation. Épreuves et préparation.', 'Comparez ensuite les stages et les écoles.'] },
    { g: 'Brevet de pilote', only: ['FR'], path: '/apprendre/brevets/pilote/', k: ['brevet de pilote parapente', 'brevet pilote parapente', 'brevet pilote ffvl', 'devenir pilote de parapente'], h: ['Brevet de pilote parapente', 'Le diplôme de l’autonomie', 'Épreuves et préparation', 'Écoles pour le préparer'], d: ['Brevet de pilote : le diplôme de l’autonomie. Épreuves, préparation, durée.', 'Comparez ensuite les stages et le coût jusqu’au brevet.'] },
    { g: 'Pilote confirmé brevet', only: ['FR'], path: '/apprendre/brevets/pilote-confirme/', k: ['brevet pilote confirmé parapente', 'brevet de pilote confirmé', 'pilote confirmé ffvl'], h: ['Brevet pilote confirmé', 'Thermique et cross', 'Sécurité avancée', 'Épreuves et préparation'], d: ['Brevet de pilote confirmé : thermique, cross et sécurité avancée.', 'Épreuves et préparation expliquées, avec les écoles qui proposent le stage.'] },
    { g: 'Licence et permis', only: ['FR'], path: '/apprendre/licence-ffvl/', k: ['permis parapente', 'licence parapente', 'licence ffvl parapente', 'licence ffvl', 'assurance parapente', 'faut-il un permis pour le parapente'], h: ['Licence FFVL parapente', 'Permis, licence, assurance', 'Ce qui est obligatoire', 'Ce qui ne l’est pas', 'Pourquoi la licence compte'], d: ['Permis, licence et assurance en parapente : ce qui est obligatoire, ce qui ne l’est pas.', 'Sources officielles citées sur la page.'] },
    { g: 'Cours de parapente', only: ['FR'], path: '/apprendre/cours/', k: ['cours de parapente', 'cours théorique parapente', 'apprendre le parapente', 'aérologie parapente', 'bases théoriques parapente', 'apprendre à voler en parapente'], h: ['Cours de parapente', 'Six modules de théorie', 'Aérologie, météo, gonflage', 'Décollage, vol, sécurité', 'Puis un stage avec une école'], d: ['Cours de parapente : six modules de théorie, de l’aérologie à la sécurité.', 'Mettez ensuite en pratique : comparez les stages des écoles.'] },
    { g: 'Brevet {pays}', only: ['CH', 'BE'], page: 'trainingPath', k: ['brevet parapente {pays}', 'licence parapente {pays}', 'brevet de parapente', 'devenir pilote de parapente {pays}', 'formation parapente {pays}'], h: ['Brevet de parapente {PAYS}', 'Devenir pilote : les étapes', 'Examens, vols, délais', 'Coût jusqu’au brevet'], d: ['Les étapes pour devenir pilote de parapente : vols, examens, délais et coûts.', 'D’après les sources officielles citées sur la page.'] },
  ],
  de: [
    { g: 'Gleitschirmschule', page: 'home', k: ['gleitschirmschule', 'gleitschirmschulen', 'gleitschirmschule schweiz', 'gleitschirmschulen schweiz', 'beste gleitschirmschule', 'gleitschirmschule in der nähe', 'gleitschirm schule', 'flugschule gleitschirm', 'gleitschirmschule vergleich'], h: ['Gleitschirmschule finden', '{t} Schulen im Vergleich', 'Kurse und Tandemflüge', 'Preise geprüft und datiert', 'Anfrage kostenlos', 'Buchung bei der Schule'], d: ['{t} Gleitschirmschulen vergleichen: Preise, Termine und Angebote.', 'Kostenlose Anfrage direkt an die Schule. Keine Zahlung auf dieser Website.'] },
    { g: 'Gleitschirmkurs', page: 'whenStart', k: ['gleitschirmkurs', 'gleitschirm kurs', 'gleitschirmkurs schweiz', 'gleitschirm grundkurs', 'gleitschirm anfängerkurs', 'gleitschirm kurs anfänger', 'gleitschirm kurs preise'], h: ['Gleitschirmkurs Schweiz', 'Nächste Kurstermine', 'Preise je Schule', 'Termine gesammelt', 'Anfrage kostenlos'], d: ['Die nächsten Gleitschirmkurse, von den Schulen gesammelt, mit Preis.', 'Schulen vergleichen und den passenden Termin wählen.'] },
    { g: 'Tandemflug', page: 'baptemeCompare', k: ['gleitschirm tandemflug', 'tandem gleitschirm', 'tandemflug schweiz', 'gleitschirm tandem', 'tandemflug preis', 'gleitschirmfliegen tandem schweiz', 'tandemflug gleitschirm buchen'], h: ['Gleitschirm-Tandemflug', 'Tandemflug-Vergleich', '{n} Flüge verglichen', 'Preis, Dauer, Foto, Bahn', 'Buchung bei der Schule'], d: ['{n} Tandemflüge von {s} Schulen vergleichen: Preis, Flugdauer, Foto/Video, Bergbahn.', 'Preise von den Schulen veröffentlicht und datiert. Sie buchen bei der Schule.'] },
    { g: 'Brevet', page: 'trainingPath', k: ['gleitschirm brevet', 'gleitschirm brevet machen', 'gleitschirm lizenz', 'gleitschirm pilot werden', 'gleitschirm ausbildung'], h: ['Gleitschirm-Brevet', 'Pilot werden: die Schritte', 'Prüfungen und Fristen', 'Kosten bis zum Brevet'], d: ['Die Schritte zum Gleitschirmpiloten: Flüge, Prüfungen, Fristen und Kosten.', 'Nach den SHV-Weisungen, mit Quellen auf der Seite.'] },
  ],
  en: [
    { g: 'Paragliding school', page: 'home', k: ['paragliding school', 'paragliding schools', 'paragliding school {pays}', 'paragliding schools {pays}', 'best paragliding school', 'paragliding school near me', 'paragliding lessons', 'paragliding lessons {pays}', 'learn paragliding {pays}'], h: ['Find a paragliding school', '{t} schools compared', 'Courses and tandem flights', 'Prices checked and dated', 'Free request to the school', 'Book with the school'], d: ['Compare {t} paragliding schools: prices, dates and packages.', 'Free request straight to the school. Nothing is paid on this site.'] },
    { g: 'Paragliding course', page: 'whenStart', k: ['paragliding course', 'paragliding courses', 'paragliding course {pays}', 'beginner paragliding course', 'paragliding course price', 'paragliding training'], h: ['Paragliding courses', 'Next course dates', 'Prices by school', 'Dates gathered', 'Free request'], d: ['The next paragliding courses, gathered from schools, with prices.', 'Compare schools and pick the date that suits you.'] },
    { g: 'Tandem paragliding', page: 'baptemeCompare', k: ['tandem paragliding {pays}', 'paragliding {pays}', 'paragliding tandem flight {pays}', 'tandem paraglider flight', 'paragliding flight price'], h: ['Tandem paragliding', 'Compare tandem flights', '{n} flights compared', 'Price, duration, photos, lift', 'Book with the school'], d: ['Compare {n} tandem paragliding flights from {s} schools: price, flight time, photo/video.', 'Prices published by schools and dated. You book with the school.'] },
    { g: 'Licence', page: 'trainingPath', k: ['paragliding licence {pays}', 'paragliding pilot licence', 'how to become a paragliding pilot', 'paragliding certificate'], h: ['Paragliding licence', 'Become a pilot: the steps', 'Exams and deadlines', 'Cost up to the licence'], d: ['The steps to become a paragliding pilot: flights, exams, deadlines, costs.', 'Based on official sources cited on the page.'] },
  ],
};
// Optional: the competitor's own name as a keyword. Separate campaign, paused, easy to delete. The ad text never uses the name.
const BRAND_CONQ = { fr: [{ g: 'Recherche du site concurrent', only: ['FR'], page: 'home', k: ['ecole-de-parapente.fr', 'ecole de parapente fr', 'ecole-de-parapente', 'annuaire ecole de parapente fr'], h: ['Comparez les écoles', '{t} écoles de parapente', 'Prix relevés et datés', 'Stage et baptême', 'Demande gratuite à l’école'], d: ['{t} écoles de parapente : comparez les prix, les dates et les formules.', 'Demande gratuite à l’école de votre choix. Aucun paiement sur le site.'] }] };

// Local groups mirroring the regions and cities of the competitor directory, each routed to our closest local page.
// [label shown in the ad, search wording, slugs of our pages in order of preference]
const LOCAL = [
  ['Annecy', 'annecy', ['annecy']], ['Chambéry', 'chambéry', ['chambery']], ['Aix-les-Bains', 'aix-les-bains', ['aix-les-bains']], ['Chamonix', 'chamonix', ['chamonix-mont-blanc']], ['Grenoble', 'grenoble', ['grenoble']],
  ['Courchevel', 'courchevel', ['savoie']], ['Méribel', 'méribel', ['savoie']], ['La Plagne', 'la plagne', ['savoie']], ['Les Arcs', 'les arcs', ['savoie']], ['La Clusaz', 'la clusaz', ['annecy', 'haute-savoie']],
  ['Morzine', 'morzine', ['haute-savoie']], ['Les Gets', 'les gets', ['haute-savoie']], ['Les Deux Alpes', 'les deux alpes', ['isere']], ['Luchon', 'luchon', ['bagneres-de-luchon']], ['Saint-Lary', 'saint-lary', ['hautes-pyrenees']],
  ['Marseille', 'marseille', ['provence-alpes-cote-d-azur']], ['Nice', 'nice', ['nice']], ['Côte d’Azur', 'côte d’azur', ['alpes-maritimes']], ['Millau', 'millau', ['aveyron']], ['Puy de Dôme', 'puy de dôme', ['puy-de-dome']],
  ['La Réunion', 'la réunion', ['la-reunion']], ['Saint-Leu', 'saint-leu réunion', ['la-reunion']], ['Guadeloupe', 'guadeloupe', ['guadeloupe', 'outre-mer']], ['Martinique', 'martinique', ['outre-mer']], ['Dune du Pilat', 'dune du pilat', ['gironde']],
  ['Alpes du Nord', 'alpes du nord', ['haute-savoie', 'savoie']], ['Alpes du Sud', 'alpes du sud', ['hautes-alpes', 'alpes-de-haute-provence']], ['Pyrénées', 'pyrénées', ['hautes-pyrenees', 'haute-garonne']], ['Massif central', 'massif central', ['puy-de-dome', 'aveyron']],
  ['Nouvelle-Aquitaine', 'nouvelle-aquitaine', ['nouvelle-aquitaine']], ['Occitanie', 'occitanie', ['occitanie']], ['Provence', 'provence', ['provence-alpes-cote-d-azur']], ['Vosges et Grand Est', 'vosges', ['grand-est']], ['Jura', 'jura', ['jura']],
  ['Bretagne', 'bretagne', ['bretagne']], ['Normandie', 'normandie', ['normandie']], ['Outre-mer', 'dom-tom', ['outre-mer']], ['Paris', 'paris', []], ['Corse', 'corse', []],
];
const localGroups = () => {
  const out = [];
  for (const [label, kw, slugs] of LOCAL) {
    for (const kind of ['stage', 'bapteme']) {
      const pool = places.placesFor(kind);
      const pl = slugs.map((sl) => pool.find((x) => x.slug === sl)).find(Boolean);
      const other = places.placesFor(kind === 'stage' ? 'bapteme' : 'stage');
      if (!pl) { if (kind === 'bapteme' && !places.placesFor('stage').some((x) => slugs.includes(x.slug)) && !pool.some((x) => slugs.includes(x.slug))) report.push(`LOCAL « ${label} » : aucune page locale (${slugs.join(', ') || 'pas de page prévue'}) : groupes ignorés. À créer si des écoles existent là.`); continue; }
      const n = pl.schools[kind].length, st = places.statsOf(pl.schools[kind], kind);
      const lowK = st.min ? price(Math.round(st.min)) : '';
      const nm = noAcc(kw);
      const k = kind === 'stage' ? [`école de parapente ${kw}`, `stage de parapente ${kw}`, `stage parapente ${kw}`, `écoles de parapente ${kw}`] : [`baptême parapente ${kw}`, `baptême de parapente ${kw}`, `parapente ${kw}`, `vol en parapente ${kw}`, `vol parapente ${kw}`];
      if (nm !== kw) k.push(...k.map((x) => noAcc(x)));
      const word = kind === 'stage' ? 'Stage de parapente' : 'Baptême parapente';
      out.push({ g: `${kind === 'stage' ? 'Stage' : 'Baptême'} ${label}`, url: ORIGIN + places.pathOf(kind, pl), k, h: [`${word} ${label}`, kind === 'stage' ? `École de parapente ${label}` : `Vol en parapente ${label}`, `${n} écoles comparées`, kind === 'stage' ? 'Dates, niveaux et prix' : 'Durée, photos, remontée', lowK ? `Dès ${lowK} par personne` : '', 'Demande gratuite à l’école', 'Prix relevés et datés'], d: [`${n} écoles ${pl.inName} : prix et formules relevés sur leurs sites.`, `${word} ${label} : comparez avant de choisir.`, 'Demande gratuite : l’école vous répond directement. Aucun paiement sur le site.'] });
    }
  }
  return out;
};

const fill = (t, lang = 'fr') => t.replaceAll('{n}', nOffers).replaceAll('{s}', nSchools).replaceAll('{t}', nTotal).replaceAll('{st}', nStageSchools).replaceAll('{ns}', nStages).replaceAll('{low}', low ? price(low) : '').replaceAll('{lows}', lowStage ? price(Math.round(lowStage)) : '').replaceAll('{pays}', PAYS[lang][MARKET]).replaceAll('{PAYS}', PAYS[lang][MARKET].replace(/^./, (c) => c.toUpperCase())).replace(/\s{2,}/g, ' ');
const report = [];
const files = [];
const rowsOut = [];
const seenGlobal = new Set();
let dupDropped = 0;
for (const lang of LANGS) {
  const K = T[lang]; const neg = NEG[lang] ?? NEG.fr;
  const geoLang = { fr: 'fr', de: 'de', en: 'en' }[lang];
  const inMarket = (g) => !g.only || g.only.includes(MARKET);
  const intents = {
    'Comparateur baptêmes': { groups: K.bap }, 'Comparateur formation': { groups: K.stage }, 'Bon cadeau': { groups: K.gift }, 'Saut en parapente': { groups: K.jump },
    'Conquête écoles et stages': { conq: true, groups: (CONQ[lang] ?? []).filter((g) => inMarket(g) && /^(École|Stage|Initiation|Perfectionnement|Pilote confirmé$|SIV|Découverte|Stages à|Gleitschirmschule|Gleitschirmkurs|Paragliding school|Paragliding course)/.test(g.g)) },
    'Conquête baptême et prix': { conq: true, groups: (CONQ[lang] ?? []).filter((g) => inMarket(g) && /^(Baptême|Prix du|Tandemflug|Tandem paragliding)/.test(g.g)) },
    'Conquête brevets et cours': { conq: true, groups: (CONQ[lang] ?? []).filter((g) => inMarket(g) && /^(Brevet|Pilote confirmé brevet|Licence|Cours de)/.test(g.g)) },
    'Conquête lieux': { conq: true, groups: lang === 'fr' && MARKET === 'FR' ? localGroups() : [] },
    'Conquête marque concurrent (optionnel)': { conq: true, groups: (BRAND_CONQ[lang] ?? []).filter(inMarket) },
  };
  for (const [name, { groups, conq: isConq }] of Object.entries(intents)) {
    if (!groups?.length) continue;
    const campaign = `ResaParapente | ${name} | ${MARKET} | ${lang}`;
    const CPC = isConq ? '0.80' : '0.60';
    rowsOut.push({ Campaign: campaign, 'Campaign Status': 'Paused', 'Campaign Type': 'Search', 'Campaign Daily Budget': isConq ? BUDGET_CONQ : BUDGET, 'Bid Strategy Type': 'Manual CPC', Networks: 'Google search', Languages: geoLang });
    rowsOut.push({ Campaign: campaign, Location: GEO });
    for (const k of neg) rowsOut.push({ Campaign: campaign, Keyword: k, 'Criterion Type': 'Campaign negative phrase' });
    const all = [...groups];
    // regional "saut en parapente" groups (French only: the region names are French)
    if (name === 'Saut en parapente' && lang === 'fr' && MARKET === 'FR') { // the regional place pages are built for France only
      for (const p of places.placesFor('bapteme').filter((x) => x.type === 'region' && x.schools.bapteme.length >= 3).slice(0, 12)) {
        all.push({ g: `Saut ${p.name}`, url: ORIGIN + places.pathOf('bapteme', p), k: [`saut en parapente ${p.name.toLowerCase()}`, `[saut en parapente ${p.name.toLowerCase()}]`, `saut parapente ${p.name.toLowerCase()}`, `saut en parapente ${noAcc(p.name).toLowerCase()}`], h: [`Saut en parapente ${p.name}`, `Saut parapente ${p.name}`, `${p.schools.bapteme.length} écoles comparées`, 'Prix, durée, photos', 'Demande gratuite à l’école'], d: [`Saut en parapente ${p.inName} : comparez ${p.schools.bapteme.length} écoles, prix et durées.`, 'Prix relevés sur les sites des écoles, datés. Réservation chez l’école.'] });
      }
    }
    for (const gr of all) {
      const gname = fill(gr.g, lang);
      const heads = unique(gr.h.map((t) => fit(fill(t, lang), 30))), descs = unique(gr.d.map((t) => fit(fill(t, lang), 90)));
      if (heads.length < 3 || descs.length < 2) { report.push(`SKIP ${campaign} / ${gname}: pas assez de titres (${heads.length}) ou descriptions (${descs.length})`); continue; }
      const url = gr.url ?? (gr.path ? ORIGIN + gr.path : dir(gr.page, lang) + (gr.q ? '?' + gr.q : ''));
      // a keyword is used once per market and language: the first campaign that carries it keeps it (no internal auction against ourselves)
      const kws = unique(gr.k.map((kw) => fill(kw, lang))).filter((kw) => { const key = lang + '|' + kw.replace(/^\[|\]$/g, '').toLowerCase(); if (seenGlobal.has(key)) { dupDropped++; return false; } seenGlobal.add(key); return true; });
      if (!kws.length) { report.push(`SKIP ${campaign} / ${gname}: tous les mots-clés sont déjà dans une autre campagne`); continue; }
      rowsOut.push({ Campaign: campaign, 'Ad Group': gname, 'Ad Group Status': 'Paused', 'Max CPC': CPC });
      for (const kw of kws) rowsOut.push({ Campaign: campaign, 'Ad Group': gname, Keyword: kw.replace(/^\[|\]$/g, ''), 'Criterion Type': kw.startsWith('[') ? 'Exact' : 'Phrase', 'Max CPC': CPC });
      const ad = { Campaign: campaign, 'Ad Group': gname, 'Ad type': 'Responsive search ad', 'Path 1': noAcc(name).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '').slice(0, 15), 'Path 2': lang, 'Final URL': url, Status: 'Paused' };
      heads.slice(0, 15).forEach((h, i) => (ad[`Headline ${i + 1}`] = h)); descs.slice(0, 4).forEach((d, i) => (ad[`Description ${i + 1}`] = d));
      rowsOut.push(ad);
    }
  }
}
fs.mkdirSync('ads', { recursive: true });
fs.writeFileSync(`ads/v11-${MARKET}.csv`, '﻿' + [COLS.join(';'), ...rowsOut.map(line)].join('\n'));
const groupsN = rowsOut.filter((r) => r['Ad Group Status']).length, campN = rowsOut.filter((r) => r['Campaign Status']).length;
fs.writeFileSync(`ads/RAPPORT-v11-${MARKET}.txt`, [`Généré le ${new Date().toISOString().slice(0, 10)} · marché ${MARKET} · budget ${BUDGET}/jour par campagne (conquête : ${BUDGET_CONQ}/jour) · tout en pause`, `${campN} campagnes, ${groupsN} groupes d’annonces, ${nOffers} baptêmes comparés, ${nSchools} écoles, dès ${low}`, `${dropped} titres ou descriptions trop longs écartés (limites 30 et 90 caractères)`, `${dupDropped} mots-clés en double écartés (un mot-clé n’est porté que par une seule campagne)`, ...report].join('\n'));
console.log(`${MARKET}: ${campN} campagnes, ${groupsN} groupes, ${dropped} variantes écartées`, report.join('\n'));
await vite.close();
