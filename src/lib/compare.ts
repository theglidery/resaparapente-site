// Data layer of the comparators (tandem flights, cost of the training up to the licence, first dates).
// Everything comes from the workbook (v11) through data.ts; nothing is estimated that a school did not publish,
// except the step-based training estimate, whose stage counts are explicit, editable hypotheses (sheet "Hypothèses parcours").
import { MARKET } from '../config';
import { schools, sessions, offerPrice, type Offer, type School, type Session } from './data';
import parcoursRaw from '../data/parcours.json';
import feesRaw from '../data/fees.json';
import assumptionsRaw from '../data/assumptions.json';
import { tr } from '../i18n/tr';

export type Loc = 'fr' | 'en' | 'de';
/** Workbook text in the visitor's language (French when there is no translation). */
const T = (v: string | null | undefined, l: Loc, f?: string): string | null => (v ? (l === 'en' ? tr(v, 'en', f) : v) : (v ?? null));
const Tobj = <O extends Record<string, any>>(o: O, keys: (keyof O)[], l: Loc): O => (l === 'en' ? ({ ...o, ...Object.fromEntries(keys.map((k) => [k, T(o[k], l)])) } as O) : o);
export type Tri = 'yes' | 'extra' | 'unknown';
export type BapRow = {
  id: string; school: string; slug: string; city: string | null; region: string | null; offer: string; price: number | null;
  durMin: number | null; durMax: number | null; photo: Tri; photoPrice: number | null; lift: Tri; liftPrice: number | null;
  total: number | null; complete: boolean; todo: string | null; profiles: string[]; langs: string[]; url: string | null; bookUrl: string | null;
  checked: string | null; perMin: number | null; place: string | null;
};

const photoOf = (o: Offer): Tri => (o.cmp?.photo === 'Incluse' ? 'yes' : o.cmp?.photo === 'En supplément' ? 'extra' : 'unknown');
const liftOf = (o: Offer): Tri => {
  const l = o.cmp?.lift;
  if (!l) return 'unknown';
  if (/^Inclus/i.test(l)) return 'yes';
  if (/^Non inclus/i.test(l)) return 'extra';
  return 'unknown';
};

export function bapRows(l: Loc = 'fr'): BapRow[] {
  const rows: BapRow[] = [];
  for (const s of schools) for (const o of s.baptemes) {
    const price = offerPrice(o);
    if (price == null || price <= 0) continue; // no comparable per-person price: shown on the school page only
    const c = o.cmp ?? ({} as NonNullable<Offer['cmp']>);
    const total = c.total ?? price;
    rows.push({
      id: o.id, school: s.name, slug: s.slug, city: s.city, region: s.region && s.region !== 'À vérifier' ? T(s.region, l) : null, offer: T(o.name, l) as string, price,
      durMin: o.durMin ?? null, durMax: o.durMax ?? o.durMin ?? null, photo: photoOf(o), photoPrice: c.photoPrice ?? null, lift: liftOf(o), liftPrice: c.liftPrice ?? null,
      total, complete: !c.todo, todo: T(c.todo, l), profiles: c.profiles ?? [], langs: c.langs ?? [], url: o.url, bookUrl: o.bookUrl, checked: o.checked,
      perMin: o.durMin ? Math.round((total / o.durMin) * 10) / 10 : null, place: T(o.place, l),
    });
  }
  return rows.sort((a, b) => (a.total ?? 1e9) - (b.total ?? 1e9));
}

// ---------- Cost of the training up to the licence -------------------------------------------------------------------------------
export type Step = 'initiation' | 'progression' | 'perfectionnement';
export const STEPS: Step[] = ['initiation', 'progression', 'perfectionnement'];
export type Assumption = { country: string; step: string; key: Step; defaultStages: number; maxStages: number; daysMin: number; daysMax: number; status: string; note: string };
export const assumptions = (assumptionsRaw as unknown as Assumption[]).filter((a) => a.country === MARKET.code);
export const asm = (k: Step) => assumptions.find((a) => a.key === k) ?? { key: k, step: k, defaultStages: 1, maxStages: 3, daysMin: 3, daysMax: 7, status: 'À valider', note: '' } as Assumption;

export type Package = {
  id: string; schoolId: string; country: string; currency: string; name: string; licence: string | null; flights: number | null; price: number | null; material: string | null;
  covers: string | null; suppElsewhere: number | null; other: number | null; otherNature: string | null; exams: number | null; fees: number | null; feesNature: string | null;
  remains: string | null; total: number | null; totalElsewhere: number | null; validity: number | null; duration: string | null; url: string; checked: string; offerId: string | null; note: string | null;
};
export const packages = (parcoursRaw as unknown as Package[]).filter((p) => p.country === MARKET.code);
export const packagesL = (l: Loc) => packages.map((p) => Tobj(p, ['name', 'licence', 'material', 'covers', 'otherNature', 'feesNature', 'remains', 'duration', 'note'], l));

export type Fee = { country: string; body: string | null; item: string; group: string | null; amount: number; currency: string; period: string | null; applies: string | null; source: string | null; checked: string | null; status: string; note: string | null };
export const fees = (feesRaw as unknown as Fee[]).filter((f) => f.country === MARKET.code);
/** Fees the pupil must pay to the federation to obtain the licence (exams): only the ones verified at the source. */
export const examFees = fees.filter((f) => f.group === 'Examens' && f.status === 'Vérifié – publiable');
export const examFeesL = (l: Loc) => examFees.map((f) => Tobj(f, ['item', 'body', 'period', 'applies', 'note'], l));
export const examTotal = examFees.reduce((a, f) => a + f.amount, 0);

export type StepPrice = { price: number; days: number | null; offer: string; url: string | null; checked: string | null };
export type PathRow = {
  schoolId: string; school: string; slug: string; city: string | null; region: string | null; deptCode: string | null;
  steps: Partial<Record<Step, StepPrice>>; pkgs: Package[];
};
const daysOf = (o: Offer) => (o.durUnit === 'jour' || o.durUnit === 'jours' ? o.durMin ?? o.durMax ?? null : null);

/** Cheapest published stage of each level (3 to 7 days, one price per person) for one school. */
export function stepPrices(s: School, l: Loc = 'fr'): Partial<Record<Step, StepPrice>> {
  const out: Partial<Record<Step, StepPrice>> = {};
  for (const k of STEPS) {
    const a = asm(k);
    const cands = s.stages.filter((o) => o.levelKey === k).map((o) => ({ o, p: offerPrice(o), d: daysOf(o) }))
      .filter((x) => x.p != null && x.p > 0 && x.d != null && x.d >= a.daysMin && x.d <= a.daysMax)
      .sort((x, y) => (x.p as number) - (y.p as number));
    if (cands[0]) out[k] = { price: cands[0].p as number, days: cands[0].d, offer: T(cands[0].o.name, l) as string, url: cands[0].o.url ?? cands[0].o.bookUrl, checked: cands[0].o.checked };
  }
  return out;
}

export function pathRows(l: Loc = 'fr'): PathRow[] {
  const rows: PathRow[] = [];
  for (const s of schools) {
    const steps = stepPrices(s, l);
    const pkgs = packagesL(l).filter((p) => p.schoolId === s.id);
    if (!Object.keys(steps).length && !pkgs.length) continue;
    rows.push({ schoolId: s.id, school: s.name, slug: s.slug, city: s.city, region: s.region && s.region !== 'À vérifier' ? T(s.region, l) : null, deptCode: s.deptCode, steps, pkgs });
  }
  return rows;
}
export const estimate = (r: PathRow, n: Record<Step, number>): number | null =>
  STEPS.every((k) => n[k] === 0 || r.steps[k]) && STEPS.some((k) => n[k] > 0) ? STEPS.reduce((a, k) => a + n[k] * (r.steps[k]?.price ?? 0), 0) : null;
export const defaults = (): Record<Step, number> => ({ initiation: asm('initiation').defaultStages, progression: asm('progression').defaultStages, perfectionnement: asm('perfectionnement').defaultStages });

// ---------- First dates ----------------------------------------------------------------------------------------------------------
export type Start = Session & { levelKey: string | null; offerName: string; region2: string | null };
const today = () => new Date().toISOString().slice(0, 10);
export function startDates(l: Loc = 'fr'): Start[] {
  const byOffer = new Map<string, Offer>();
  for (const s of schools) for (const o of s.stages) byOffer.set(o.id, o);
  return sessions.filter((x) => x.start >= today()).map((x) => {
    const o = byOffer.get(x.offerId);
    return { ...x, city: x.city ? (T(x.city, l) as string) : x.city, levelKey: o?.levelKey ?? null, offerName: T(o?.name ?? x.name, l) as string, region2: x.region && x.region !== 'À vérifier' ? T(x.region, l) : null };
  }).filter((x) => x.levelKey === 'initiation' || x.levelKey === 'decouverte').sort((a, b) => a.start.localeCompare(b.start));
}

// ---------- Display helpers ------------------------------------------------------------------------------------------------------
const INTL: Record<Loc, string> = { fr: MARKET.locale, en: 'en-GB', de: MARKET.code === 'CH' ? 'de-CH' : 'de-DE' };
export const money = (n: number, l: Loc = 'fr') => new Intl.NumberFormat(INTL[l], { style: 'currency', currency: MARKET.currency, maximumFractionDigits: 0 }).format(n);
export const dateLoc = (iso: string, l: Loc = 'fr', opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(INTL[l], opts).format(new Date(iso + 'T12:00:00'));
export const median = (v: number[]) => { const a = [...v].sort((x, y) => x - y); return a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null; };
export const host = (u: string | null) => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : ''; } catch { return ''; } };
