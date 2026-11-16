// Translation of the texts that come from the workbook (school descriptions, offer names, programmes...).
// Order: rules for short repetitive fields, then the hand-made dictionary (en.json), then the machine-made one (en.auto.json).
// A text with no translation is shown in French, marked lang="fr" so that browsers and screen readers read it correctly.
import { ruleFor } from './rules-en.mjs';
import type { Locale } from './ui';

const files = import.meta.glob('../data/i18n/en*.json', { eager: true, import: 'default' }) as Record<string, Record<string, string>>;
const order = Object.keys(files).sort((a, b) => (a.includes('.auto') ? 1 : 0) - (b.includes('.auto') ? 1 : 0)); // hand-made first
const dict = new Map<string, string>();
for (const f of order.reverse()) for (const [k, v] of Object.entries(files[f])) dict.set(k, v); // later files overwritten by hand-made ones
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

export type Translated = { text: string; done: boolean };
/** Translate a workbook text. `field` enables the rules for short fields (priceLabel, durText). */
export function trx(s: string | null | undefined, locale: Locale, field?: string): Translated {
  if (!s) return { text: '', done: true };
  if (locale === 'fr') return { text: s, done: true };
  if (locale !== 'en') return { text: s, done: false }; // no German translation of workbook texts yet
  const r = field ? ruleFor(field, s) : null;
  if (r) return { text: r, done: true };
  const d = dict.get(norm(s));
  return d ? { text: d, done: true } : { text: s, done: false };
}
export const tr = (s: string | null | undefined, locale: Locale, field?: string) => trx(s, locale, field).text;
export const isDone = (s: string | null | undefined, locale: Locale, field?: string) => trx(s, locale, field).done;
export const dictSize = () => dict.size;
