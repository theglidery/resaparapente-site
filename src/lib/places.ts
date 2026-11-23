// Local landing pages: /bapteme-parapente/<place>/, /stage-parapente/<place>/ and /stage-parapente/<place>/<type>/.
// A place is a region, a département or a search city. Everything is computed from the workbook data at build time.
// A page exists only when enough schools back it up (MIN_SCHOOLS), so no thin page is generated.
import { schools, cities, sessions, offerPrice, LEVELS, eur, type School, type Offer } from './data';
import { STAGE_TYPES } from '../data/stage-types';

export type Kind = 'bapteme' | 'stage';
export type PlaceType = 'region' | 'dept' | 'city';
export type Place = {
  slug: string; name: string; type: PlaceType; region: string | null;
  lat?: number; lng?: number; radius?: number;
  /** "en Haute-Savoie", "dans les Hautes-Alpes", "près d’Annecy" */
  inName: string;
  /** schools with an offer of the kind, per kind */
  schools: Record<Kind, School[]>;
};

export const MIN_SCHOOLS = 2;
const MIN_CITY_SCHOOLS = 3;
const MIN_TYPE_SCHOOLS = 2;

export const slugify = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const REGION_IN: Record<string, string> = {
  'Auvergne-Rhône-Alpes': 'en Auvergne-Rhône-Alpes', 'Occitanie': 'en Occitanie', "Provence-Alpes-Côte d'Azur": 'en Provence-Alpes-Côte d’Azur',
  'Outre-mer': 'en Outre-mer', 'Nouvelle-Aquitaine': 'en Nouvelle-Aquitaine', 'Grand Est': 'dans le Grand Est', 'Bretagne': 'en Bretagne',
  'Normandie': 'en Normandie', 'Bourgogne-Franche-Comté': 'en Bourgogne-Franche-Comté', 'Corse': 'en Corse',
};
const DEPT_IN: Record<string, string> = {
  'Haute-Savoie': 'en Haute-Savoie', 'Isère': 'en Isère', 'Savoie': 'en Savoie', 'La Réunion': 'à La Réunion', 'Hautes-Alpes': 'dans les Hautes-Alpes',
  'Hautes-Pyrénées': 'dans les Hautes-Pyrénées', 'Alpes-Maritimes': 'dans les Alpes-Maritimes', 'Aveyron': 'dans l’Aveyron', 'Drôme': 'dans la Drôme',
  'Haute-Garonne': 'en Haute-Garonne', 'Alpes-de-Haute-Provence': 'dans les Alpes-de-Haute-Provence', 'Gironde': 'en Gironde',
  'Pyrénées-Orientales': 'dans les Pyrénées-Orientales', 'Guadeloupe': 'en Guadeloupe', 'Puy-de-Dôme': 'dans le Puy-de-Dôme',
  'Pyrénées-Atlantiques': 'dans les Pyrénées-Atlantiques', "Côtes-d'Armor": 'dans les Côtes-d’Armor', 'Ariège': 'en Ariège', 'Calvados': 'dans le Calvados',
  'Gard': 'dans le Gard', 'Cantal': 'dans le Cantal', 'Haut-Rhin': 'dans le Haut-Rhin', 'Bouches-du-Rhône': 'dans les Bouches-du-Rhône', 'Lot': 'dans le Lot',
  'Jura': 'dans le Jura', 'Marne': 'dans la Marne', 'Ain': 'dans l’Ain', 'Corrèze': 'en Corrèze', 'Creuse': 'dans la Creuse', 'Haute-Loire': 'en Haute-Loire',
  'Var': 'dans le Var', 'Vosges': 'dans les Vosges',
  'Corse-du-Sud': 'en Corse-du-Sud', 'Haute-Corse': 'en Haute-Corse', 'Martinique': 'en Martinique', 'Guyane': 'en Guyane',
  'Polynésie française': 'en Polynésie française', 'Nouvelle-Calédonie': 'en Nouvelle-Calédonie',
};
const cityIn = (n: string) => (/^[AEIOUÉÈÊÎÔ]/.test(n) ? `près d’${n}` : `près de ${n}`);

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
export const distanceKm = km;

const withKind = (kind: Kind, list: School[]) => list.filter((s) => (kind === 'bapteme' ? s.baptemes.length : s.stages.length));
const valid = (s: School) => s.region && s.region !== 'À vérifier';

function build(): Place[] {
  const out: Place[] = [];
  const used = new Set<string>();
  const mk = (p: Omit<Place, 'schools'>, pool: School[]) => {
    const sch = { bapteme: withKind('bapteme', pool), stage: withKind('stage', pool) };
    out.push({ ...p, schools: sch }); used.add(p.slug);
    return sch;
  };
  for (const r of [...new Set(schools.filter(valid).map((s) => s.region as string))]) {
    mk({ slug: slugify(r), name: r, type: 'region', region: r, inName: REGION_IN[r] ?? `en ${r}` }, schools.filter((s) => s.region === r));
  }
  const depts = new Map<string, School[]>();
  for (const s of schools) if (s.dept && valid(s)) depts.set(s.dept, [...(depts.get(s.dept) ?? []), s]);
  const deptSets: Record<Kind, Set<string>[]> = { bapteme: [], stage: [] };
  for (const [d, pool] of depts) {
    const slug = slugify(d); if (used.has(slug)) continue;
    const sch = mk({ slug, name: d, type: 'dept', region: pool[0].region, inName: DEPT_IN[d] ?? `dans le département : ${d}` }, pool);
    (['bapteme', 'stage'] as Kind[]).forEach((k) => deptSets[k].push(new Set(sch[k].map((s) => s.id))));
  }
  // Cities: schools within the search radius, kept only when the set differs enough from every département page (no duplicate content).
  const BIG = new Set(['Grenoble', 'Annecy', 'Chamonix-Mont-Blanc', 'Chambéry', 'Lyon', 'Nice', 'Marseille', 'Toulouse', 'Bordeaux']); // always get a page when they have schools
  for (const c of cities) {
    if (/suisse|belgique|italie|espagne/i.test(`${c.name} ${c.region}`)) continue; // French destinations only
    const slug = slugify(c.name); if (used.has(slug)) continue;
    const pool = schools.filter((s) => s.lat && s.lng && valid(s) && (km({ lat: c.lat, lng: c.lng }, { lat: s.lat as number, lng: s.lng as number }) <= (c.radius || 50) || s.nearCities.includes(c.name)));
    const sch = { bapteme: withKind('bapteme', pool), stage: withKind('stage', pool) };
    const distinct = (k: Kind) => {
      if (sch[k].length < MIN_CITY_SCHOOLS) return false;
      if (BIG.has(c.name)) return true;
      const set = new Set(sch[k].map((s) => s.id));
      return !deptSets[k].some((d) => { const inter = [...set].filter((x) => d.has(x)).length; return inter / (set.size + d.size - inter) >= 0.75; });
    };
    if (!distinct('bapteme') && !distinct('stage')) continue;
    mk({ slug, name: c.name, type: 'city', region: c.region, lat: c.lat, lng: c.lng, radius: c.radius || 50, inName: cityIn(c.name) }, pool);
    // a city is kept for a kind only if distinct for that kind
    const last = out[out.length - 1];
    (['bapteme', 'stage'] as Kind[]).forEach((k) => { if (!distinct(k)) last.schools[k] = []; });
  }
  return out;
}

const ALL = build();
const minFor = (p: Place) => (p.type === 'city' ? MIN_CITY_SCHOOLS : p.region === 'Corse' || p.region === 'Outre-mer' ? 1 : MIN_SCHOOLS);
/** Places that have a page for this kind. */
export const placesFor = (kind: Kind) => ALL.filter((p) => p.schools[kind].length >= minFor(p));
export const placeBy = (kind: Kind, slug: string) => placesFor(kind).find((p) => p.slug === slug);

/** Schools of a place offering a stage type (key from LEVELS). */
export const schoolsWithType = (p: Place, key: string) => p.schools.stage.filter((s) => s.stages.some((o) => o.levelKey === key));
export const typePagesFor = (p: Place) => STAGE_TYPES.filter((t) => schoolsWithType(p, t.key).length >= (p.type === 'city' ? 3 : MIN_TYPE_SCHOOLS));

/** Every page to generate: [kind, place, optional stage type]. */
export function allLocalPages() {
  const pages: { kind: Kind; place: Place; type?: (typeof STAGE_TYPES)[number] }[] = [];
  for (const kind of ['bapteme', 'stage'] as Kind[]) {
    for (const place of placesFor(kind)) {
      pages.push({ kind, place });
      if (kind === 'stage') for (const type of typePagesFor(place)) pages.push({ kind, place, type });
    }
  }
  return pages;
}

export const pathOf = (kind: Kind, place: Place, typeSlug?: string) =>
  `/${kind === 'bapteme' ? 'bapteme' : 'stage'}-parapente/${place.slug}/${typeSlug ? typeSlug + '/' : ''}`;

// ---- statistics of a set of schools
const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null; };
export type Stats = { n: number; min: number | null; med: number | null; max: number | null; offers: number; durMin: number | null; durMax: number | null; daysMin: number | null; daysMax: number | null; kids: number; winter: number; checked: string | null };
export const KIDS_RE = /enfant|moins de \d+ ans|(d[eè]s|à partir de|a partir de) ([3-9]|1[0-2]) ans|\b([3-9]|1[0-2]) ?(à|-|–) ?\d{1,2} ans/i;
export const kidsOf = (o: Offer) => KIDS_RE.test([o.name, o.age, o.fiche?.participation].filter(Boolean).join(' '));
export const winterOf = (o: Offer) => /hiver|ski/i.test(`${o.name} ${o.period ?? ''}`);
export function statsOf(list: School[], kind: Kind, offerFilter: (o: Offer) => boolean = () => true): Stats {
  const offers = list.flatMap((s) => (kind === 'bapteme' ? s.baptemes : s.stages)).filter(offerFilter);
  const prices = offers.map(offerPrice).filter((v): v is number => typeof v === 'number' && v > 0);
  const durs = kind === 'bapteme' ? offers.flatMap((o) => (o.durUnit && o.durUnit !== 'min' ? [] : [o.durMin, o.durMax])).filter((v): v is number => typeof v === 'number' && v > 0) : [];
  const days = kind === 'stage' ? offers.flatMap((o) => (o.durUnit === 'jour' ? [o.durMin, o.durMax] : [])).filter((v): v is number => typeof v === 'number' && v > 0) : [];
  const dates = offers.map((o) => o.checked).filter((d): d is string => !!d).sort();
  return {
    n: list.length, offers: offers.length,
    min: prices.length ? Math.min(...prices) : null, med: median(prices), max: prices.length ? Math.max(...prices) : null,
    durMin: durs.length ? Math.min(...durs) : null, durMax: durs.length ? Math.max(...durs) : null,
    daysMin: days.length ? Math.min(...days) : null, daysMax: days.length ? Math.max(...days) : null,
    kids: offers.filter(kidsOf).length, winter: offers.filter(winterOf).length, checked: dates.length ? dates[dates.length - 1] : null,
  };
}

/** Upcoming dated sessions of the schools of a place. */
export const sessionsOf = (list: School[], key?: string) => {
  const ids = new Set(list.map((s) => s.id)); const today = new Date().toISOString().slice(0, 10);
  return sessions.filter((x) => ids.has(x.schoolId) && x.start >= today).filter((x) => !key || list.find((s) => s.id === x.schoolId)?.stages.find((o) => o.id === x.offerId)?.levelKey === key).sort((a, b) => a.start.localeCompare(b.start));
};

export const roundEur = (n: number) => eur(Math.round(n / 5) * 5);
export const LEVEL_NAME = Object.fromEntries(LEVELS.map((l) => [l.key, l.name]));
