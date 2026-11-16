// Rule-based French -> English for the short, highly repetitive fields of an offer (price label, duration).
// Everything that is not matched here goes through the dictionary (src/data/i18n/en.json, then en.auto.json).
const grp = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-GB', { maximumFractionDigits: 2 }) : n);
const CUR = { '€': (n) => `€${grp(n)}`, CHF: (n) => `CHF ${grp(n)}` };
const num = (s) => s.replace(/\s+/g, '').replace(',', '.');
const pl = (n, one, many) => (Number(n) === 1 ? one : many);
const money = (m) => { const x = /^(\d[\d\s.,]*?)\s*(€|CHF)$/.exec(m.trim()); return x ? CUR[x[2]](num(x[1]).replace(/\.0+$/, '')) : null; };

export function priceLabelEn(s) {
  if (!s) return null;
  const t = s.trim();
  const fixed = { 'Prix à confirmer': 'Price to be confirmed', 'Prix sur demande': 'Price on request', 'Sur devis': 'On quote' };
  if (fixed[t]) return fixed[t];
  const m = /^(À partir de\s+)?(\d[\d\s.,]*?\s*(?:€|CHF))\s*(?:\/\s*(jour|vol|séance|demi-journée)|\((forfait)\)|pour\s+(\d+)\s*personnes?)?(?:\s*pour\s+(\d+)\s*personnes?)?$/.exec(t);
  if (!m) return null;
  const amount = money(m[2]); if (!amount) return null;
  const unit = { jour: 'day', vol: 'flight', 'séance': 'session', 'demi-journée': 'half-day' }[m[3]];
  const people = m[5] || m[6];
  return `${m[1] ? 'From ' : ''}${amount}${unit ? ` / ${unit}` : ''}${m[4] ? ' (package)' : ''}${people ? ` for ${people} people` : ''}`;
}

const TAIL = [
  [/^(\d+)\s*[–-]\s*(\d+)\s*min$/i, (a, b) => `${a}–${b} min`],
  [/^(\d+)\s*à\s*(\d+)\s*min$/i, (a, b) => `${a}–${b} min`],
  [/^[Ee]nviron\s+(\d+)\s*min$/, (a) => `About ${a} min`],
  [/^[Ee]nviron\s+(\d+)\s*[–-]\s*(\d+)\s*min$/, (a, b) => `About ${a}–${b} min`],
  [/^[Ee]nviron\s+(\d+)\s*à\s*(\d+)\s*min$/, (a, b) => `About ${a}–${b} min`],
  [/^(\d+)\s*min(?:utes)?$/, (a) => `${a} min`],
  [/^(\d+)\s*min minimum$/, (a) => `At least ${a} min`],
  [/^(\d+)\s*h minimum$/, (a) => `At least ${a} h`],
  [/^(\d+)\s*(?:jours?|j)(?:\(s\))?$/, (a) => `${a} ${pl(a, 'day', 'days')}`],
  [/^(\d+)\s*jours calendaires selon session$/, (a) => `${a} calendar days, depending on the session`],
  [/^(\d+)\s*à\s*(\d+)\s*jours$/, (a, b) => `${a}–${b} days`],
  [/^(\d+)\s*[–-]\s*(\d+)\s*jours$/, (a, b) => `${a}–${b} days`],
  [/^(\d+)\s*jours,\s*lundi[–-]vendredi$/, (a) => `${a} days, Monday–Friday`],
  [/^(\d+)\s*jours,\s*dimanche[–-]jeudi$/, (a) => `${a} days, Sunday–Thursday`],
  [/^(\d+)\s*jours\s*[—-]\s*lundi à vendredi$/, (a) => `${a} days, Monday to Friday`],
  [/^(\d+)\s*journées?$/, (a) => `${a} ${pl(a, 'day', 'days')}`],
  [/^(\d+)\s*séances?$/, (a) => `${a} ${pl(a, 'session', 'sessions')}`],
  [/^(\d+)\s*vols?$/, (a) => `${a} ${pl(a, 'flight', 'flights')}`],
  [/^(\d+)\s*vol encadré$/, (a) => `${a} guided flight`],
  [/^(\d+)\s*h$/, (a) => `${a} h`],
  [/^(\d+)\s*week-ends?$/, (a) => `${a} ${pl(a, 'weekend', 'weekends')}`],
  [/^(\d+)\s*demi-journées?(?:\(s\))?$/, (a) => `${a} half-${pl(a, 'day', 'days')}`],
  [/^(\d+)\s*matinées?$/, (a) => `${a} ${pl(a, 'morning', 'mornings')}`],
  [/^[Jj]usqu’à\s+(\d+)\s*min$/, (a) => `Up to ${a} min`],
  [/^(\d+)\s*[–-]\s*(\d+)\s*min par passager$/, (a, b) => `${a}–${b} min per passenger`],
  [/^(\d+)\s*[–-]\s*(\d+)\s*min par personne$/, (a, b) => `${a}–${b} min per person`],
  [/^Jusqu’à (\d+) min ; selon conditions$/, (a) => `Up to ${a} min, depending on conditions`],
  [/^(\d+)\s*séances de (\d+)\s*h$/, (a, b) => `${a} sessions of ${b} h`],
  [/^(\d+)\s*séances de (\d+)\s*heures$/, (a, b) => `${a} sessions of ${b} hours`],
  [/^À la carte$/, () => 'À la carte'],
  [/^Demi-journée$/, () => 'Half-day'],
  [/^Une demi-journée$/, () => 'One half-day'],
  [/^À la journée$/, () => 'By the day'],
  [/^Nombre de jours à convenir$/, () => 'Number of days to be agreed'],
  [/^Semaine ou deux week-ends consécutifs$/, () => 'One week or two consecutive weekends'],
];
export function durTextEn(s) {
  if (!s) return null;
  const t = s.trim();
  for (const [re, f] of TAIL) { const m = re.exec(t); if (m) return f(...m.slice(1)); }
  return null;
}

// Templated school descriptions (directory listings without offers).
const CANTON = { Berne: 'Bern', Schwytz: 'Schwyz', 'Saint-Gall': 'St. Gallen', Grisons: 'Graubünden', Glaris: 'Glarus', Soleure: 'Solothurn', Obwald: 'Obwalden', Nidwald: 'Nidwalden', Tessin: 'Ticino', Lucerne: 'Lucerne', Genève: 'Geneva', 'Appenzell Rhodes-Extérieures': 'Appenzell Ausserrhoden', 'Appenzell Rhodes-Intérieures': 'Appenzell Innerrhoden', Argovie: 'Aargau', Thurgovie: 'Thurgau', Uri: 'Uri', Zoug: 'Zug', Bâle: 'Basel' };
const DESC = [
  [/^(.+?) est (?:répertoriée|répertorié) pour la formation au parapente à (.+?), dans le canton (?:de |d’|du |des )?(.+?)\. Les coordonnées de la fiche permettent de s’adresser à l’école pour connaître son programme et les modalités d’inscription\.$/,
    (n, c, k) => `${n} is listed as a paragliding training school in ${c}, canton of ${CANTON[k] ?? k}. Use the contact details on its listing to ask about its programme and how to register.`],
  [/^(.+?) est un club de parapente répertorié par la Fédération belge de vol libre\. L’adresse de contact publiée par la fédération se situe à (.+?)\. Contacter le club pour connaître ses activités et les conditions d’adhésion\.$/,
    (n, c) => `${n} is a paragliding club listed by the Belgian Free Flight Federation (FBVL). The contact address published by the federation is in ${c}. Contact the club to ask about its activities and how to join.`],
];
export function descEn(s) {
  if (!s) return null;
  for (const [re, f] of DESC) { const m = re.exec(s.trim()); if (m) return f(...m.slice(1)); }
  return null;
}
// Ages ("Dès 5 ans", "4–12 ans", "Moins de 12 ans").
const AGE = [
  [/^Dès (\d+) ans$/, (a) => `From ${a} years`],
  [/^À partir de (\d+) ans$/, (a) => `From ${a} years`],
  [/^(\d+) ans et plus$/, (a) => `${a} years and over`],
  [/^(\d+)\s*[–-]\s*(\d+) ans$/, (a, b) => `${a}–${b} years`],
  [/^(\d+) à (\d+) ans$/, (a, b) => `${a}–${b} years`],
  [/^Moins de (\d+) ans$/, (a) => `Under ${a} years`],
  [/^Jusqu’à (\d+) ans$/, (a) => `Up to ${a} years`],
  [/^Adultes$/, () => 'Adults'],
  [/^Enfants et adultes$/, () => 'Children and adults'],
  [/^À confirmer$/, () => 'To be confirmed'],
];
export function ageEn(s) {
  if (!s) return null;
  for (const [re, f] of AGE) { const m = re.exec(s.trim()); if (m) return f(...m.slice(1)); }
  return null;
}
const WEIGHT = [
  [/^(\d+)\s*[–-]\s*(\d+) kg$/, (a, b) => `${a}–${b} kg`],
  [/^(\d+) à (\d+) kg$/, (a, b) => `${a}–${b} kg`],
  [/^(\d+) kg (?:max\.|maximum)$/, (a) => `Up to ${a} kg`],
  [/^(\d+) kg minimum$/, (a) => `At least ${a} kg`],
  [/^Dès (\d+) kg$/, (a) => `From ${a} kg`],
  [/^À partir de (\d+) kg$/, (a) => `From ${a} kg`],
  [/^Moins de (\d+) kg$/, (a) => `Under ${a} kg`],
  [/^Environ (\d+) kg minimum$/, (a) => `About ${a} kg minimum`],
];
export function weightEn(s) {
  if (!s) return null;
  for (const [re, f] of WEIGHT) { const m = re.exec(s.trim()); if (m) return f(...m.slice(1)); }
  return null;
}
// "Équipe citée par l’école : Anne, Paul (directeur technique)." -> English roles inside the parentheses; names stay untouched.
const ROLE = { 'accueil': 'reception', 'directeur technique': 'technical director', 'directrice technique': 'technical director', 'prénoms publiés': 'first names published', 'prénom publié': 'first name published', 'prénoms et surnoms publiés': 'first names and nicknames published',
  'fondateur': 'founder', 'fondatrice': 'founder', 'élève moniteur': 'trainee instructor', 'élève monitrice': 'trainee instructor', 'élève-moniteur': 'trainee instructor', 'élèves moniteurs': 'trainee instructors', 'créateur et directeur technique': 'creator and technical director',
  'moniteur diplômé d’État, prénom publié': 'state-qualified instructor, first name published', 'directeur et moniteur': 'director and instructor', 'fondateur et pilote biplace professionnel': 'founder and professional tandem pilot', 'fondateur et dirigeant': 'founder and manager',
  'directeur technique, moniteur, biplaceur et treuilleur': 'technical director, instructor, tandem pilot and winch operator', 'treuilleur': 'winch operator', 'président': 'president', 'moniteurs indépendants présentés sur le site': 'independent instructors presented on the site',
  'pilotes': 'pilots', 'chauffeur': 'driver', 'logistique': 'logistics', 'coordinatrice': 'coordinator', 'direction': 'management', 'dirigeants': 'managers', 'directeur': 'director', 'directrice': 'director', 'navette': 'shuttle', 'staff administratif': 'administrative staff',
  'Lulu, co-gérante': 'Lulu, co-manager', 'parapente': 'paragliding' };
export function commandesEn(s) {
  const m = /^Équipe citée par l’école : (.+)$/.exec((s || '').trim());
  return m ? 'Team named by the school: ' + m[1].replace(/\(([^)]*)\)/g, (all, x) => `(${ROLE[x] ?? x})`) : null;
}
export const ruleFor = (field, s) => (field === 'fiche.commandes' ? commandesEn(s) : field === 'weight' ? weightEn(s) : field === 'priceLabel' ? priceLabelEn(s) : field === 'durText' ? durTextEn(s) : field === 'desc' ? descEn(s) : field === 'age' ? ageEn(s) : null);
