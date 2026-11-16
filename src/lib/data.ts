import { MARKET } from '../config';
import schoolsRaw from '../data/schools.json';
import sessionsRaw from '../data/sessions.json';
import citiesRaw from '../data/cities.json';
import giftsRaw from '../data/gifts.json';
import promosRaw from '../data/promos.json';
import reviewsRaw from '../data/reviews.json';

export type Offer = {
  id: string; name: string; price: number | null; priceMax: number | null; priceNature: string | null;
  unitCode: string; perPerson: number | null; sortPrice: number | null; manualOrder: number | null; priceLabel: string | null;
  url: string | null; bookUrl: string | null; checked: string | null; place: string | null; age: string | null;
  program: string | null; included: string | null; notIncluded: string | null; level: string | null;
  durMin?: number | null; durMax?: number | null; durText?: string | null; durUnit?: string | null;
  period?: string | null; weight?: string | null; flights?: string | null; group?: string | null;
  fiche?: Record<string, string | null>; extra?: Record<string, string | null>;
  levelName?: string; levelKey?: string; levelOrder?: number;
  cmp?: { photo?: string | null; photoPrice?: number | null; lift?: string | null; liftPrice?: number | null; mandatory?: number | null; mandatoryNature?: string | null; total?: number | null; todo?: string | null; profiles?: string[]; profilesChecked?: boolean; langs?: string[]; access?: string | null; totalTime?: string | null; rule?: string | null };
};
export type School = {
  id: string; name: string; slug: string; country?: 'FR' | 'CH' | 'BE'; currency?: 'EUR' | 'CHF'; desc: string | null; orig: { text: string | null; url: string | null } | null; address: string | null; zip: string | null;
  city: string | null; dept: string | null; deptCode: string | null; region: string | null;
  lat: number | null; lng: number | null; website: string | null;
  mode: string; featured: boolean;
  fiche?: { presentation: string | null; commandes: string | null; appareil: string | null; labels: string | null; langues: string | null; assurance: boolean };
  mainCity: string | null; nearCities: string[]; logoShow: boolean;
  photoMainId: string | null; photoExtraIds: string[]; photoCredit: string | null;
  googlePlaceId?: string | null;
  video?: string | null; rating?: { value: number; count: number; source: string; url: string | null } | null;
  baptemes: Offer[]; stages: Offer[]; sites: { name: string; status: string }[]; sessions: string[];
};
export type Session = {
  id: string; schoolId: string; school: string; slug: string; offerId: string; name: string; start: string; end: string;
  days: number | null; price: number | null; places: number | null; priceLabel: string | null; status: string; visible: boolean;
  source: string | null; checked: string | null; fresh: string | null; dept: string | null; region: string | null;
  lat: number | null; lng: number | null; city: string | null; note: string | null;
};
/** A gift voucher sold by the school itself: we only link to its sales page. */
export type Gift = {
  id: string; schoolId: string; name: string | null; url: string; source: string | null; checked: string | null; kind: string | null;
  formulas: string | null; price: number | null; validity: number | null; conditions: string | null;
};
/** A promotional price published by a partner school for a period. */
export type Promo = {
  id: string; schoolId: string; offerId: string | null; title: string | null; price: number; regular: number | null;
  start: string; end: string; conditions: string | null; url: string | null;
};
/** A customer review, moderated and published (sheet "Avis"). */
export type Review = {
  id: string; schoolId: string; rating: number; title: string | null; text: string; author: string; kind: string | null;
  experience: string | null; published: string; verified: boolean; reply: string | null; replyDate: string | null;
};
export type City = { name: string; dept: string; region: string; lat: number; lng: number; radius: number };

export const schools = (schoolsRaw as unknown as School[]).filter((s) => (s.country || 'FR') === MARKET.code);
export const cities = (citiesRaw as unknown as (City & { country?: string })[]).filter((c) => (c.country || 'FR') === MARKET.code).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

const marketSchoolIds = new Set(schools.map((s) => s.id));
export const sessions = (sessionsRaw as unknown as Session[]).filter((s) => marketSchoolIds.has(s.schoolId) && s.visible && ['Actif', 'Complet'].includes(s.status));

export const eur = (n: number) =>
  new Intl.NumberFormat(MARKET.locale, { style: 'currency', currency: MARKET.currency, maximumFractionDigits: 0 }).format(n);

export const dateFr = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('fr-FR', opts).format(new Date(iso + 'T12:00:00'));

/** Comparable per-person price of an offer, or null. */
export const offerPrice = (o: Offer): number | null => o.sortPrice ?? o.perPerson ?? (o.unitCode === 'PERSONNE' ? o.price : null);

export function fromPrice(s: School, kind: 'bapteme' | 'stage'): number | null {
  const list = kind === 'bapteme' ? s.baptemes : s.stages;
  const vals = list.map(offerPrice).filter((v): v is number => typeof v === 'number');
  return vals.length ? Math.min(...vals) : null;
}

export const LEVELS = [
  { key: 'decouverte', name: 'Découverte et mini-stage', order: 1 },
  { key: 'initiation', name: 'Initiation', order: 2 },
  { key: 'progression', name: 'Progression et autonomie', order: 3 },
  { key: 'perfectionnement', name: 'Perfectionnement, thermique et cross', order: 4 },
  { key: 'siv', name: 'SIV et pilotage', order: 5 },
  { key: 'encadre', name: 'Vols encadrés et séances', order: 6 },
  { key: 'marche-vol', name: 'Marche et vol', order: 7 },
  { key: 'voyage', name: 'Séjours et voyages', order: 8 },
  { key: 'autre', name: 'Autres stages', order: 9 },
];

/** Baptêmes: cheapest first. Variants of one formula (same group, e.g. "Prestige – matin / après-midi") stay together,
 *  and a group sits where its cheapest variant falls. A manual order in the workbook wins when present. */
export function sortBaptemes(list: Offer[]): Offer[] {
  const p = (o: Offer) => offerPrice(o) ?? o.price ?? Infinity;
  if (list.some((o) => o.manualOrder != null))
    return [...list].sort((a, b) => (a.manualOrder ?? 9999) - (b.manualOrder ?? 9999) || p(a) - p(b));
  const groups = new Map<string, Offer[]>();
  for (const o of list) { const k = o.group ?? o.name; groups.set(k, [...(groups.get(k) ?? []), o]); }
  const min = (g: Offer[]) => Math.min(...g.map(p));
  return [...groups.entries()]
    .sort((a, b) => min(a[1]) - min(b[1]) || a[0].localeCompare(b[0], 'fr'))
    .flatMap(([, g]) => g.sort((a, b) => p(a) - p(b) || a.name.localeCompare(b.name, 'fr')));
}

/** Stages: by level of progression (discovery, initiation, progression…), then price inside a level. */
export function sortStages(list: Offer[]): Offer[] {
  const p = (o: Offer) => offerPrice(o) ?? o.price ?? Infinity;
  return [...list].sort((a, b) =>
    (a.levelOrder ?? 8) - (b.levelOrder ?? 8) || (a.manualOrder ?? 9999) - (b.manualOrder ?? 9999) || p(a) - p(b) || a.name.localeCompare(b.name, 'fr'));
}

export const withOffers = (kind: 'bapteme' | 'stage') =>
  schools.filter((s) => (kind === 'bapteme' ? s.baptemes.length : s.stages.length));

export function regionCounts(kind: 'bapteme' | 'stage') {
  const m = new Map<string, number>();
  for (const s of withOffers(kind)) {
    const r = s.region && s.region !== 'À vérifier' ? s.region : null;
    if (r) m.set(r, (m.get(r) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Stage levels with the number of schools offering them. */
export function levelCounts() {
  return LEVELS.map((l) => ({ ...l, n: withOffers('stage').filter((s) => s.stages.some((o) => o.levelKey === l.key)).length })).filter((l) => l.n > 0);
}

export const bookingLabel = (mode: string) =>
  mode === 'Paiement' ? 'Réserver et payer' : mode === 'Demande' ? 'Faire une demande' : 'Réserver sur le site de l’école';

const todayIso = () => new Date().toISOString().slice(0, 10);
export const gifts = giftsRaw as unknown as Gift[];
export const giftsOf = (schoolId: string) => gifts.filter((g) => g.schoolId === schoolId);
/** Promotions running today (the page also hides them in the browser once the end date has passed). */
export const promos = (promosRaw as unknown as Promo[]).filter((p) => p.start <= todayIso() && p.end >= todayIso());
export const promosOf = (schoolId: string) => promos.filter((p) => p.schoolId === schoolId);
export const schoolsWithGifts = () => schools.filter((s) => giftsOf(s.id).length);

export const reviews = reviewsRaw as unknown as Review[];
const byRev = new Map<string, Review[]>();
for (const r of reviews) byRev.set(r.schoolId, [...(byRev.get(r.schoolId) ?? []), r]);
export const reviewsOf = (schoolId: string) => byRev.get(schoolId) ?? [];
/** Average and count of the published reviews of a school (null without review). */
export function reviewStats(schoolId: string) {
  const l = reviewsOf(schoolId); if (!l.length) return null;
  return { count: l.length, avg: Math.round((l.reduce((a, r) => a + r.rating, 0) / l.length) * 10) / 10, verified: l.filter((r) => r.verified).length };
}

export const sessionHref = (s: Session) =>
  `/ecoles/${s.slug}/?${new URLSearchParams({ parcours: 'stage', offre: s.offerId, date: s.start })}#offre-${encodeURIComponent(s.offerId)}`;
