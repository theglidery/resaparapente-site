// Lists the texts of the workbook data that still have no English translation.
// Usage: node scripts/i18n-extract.mjs [--countries CH,BE | FR | all] [--out data/i18n/todo.json] [--fields desc,name,...]
// Output: an array of { i, f, fr } sorted by field then text; translate with scripts/i18n-merge.mjs (see docs/TRADUCTION-EN.md).
import fs from 'node:fs';
import { ruleFor } from '../src/i18n/rules-en.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const countries = arg('countries', 'all'), out = arg('out', 'data/i18n/todo.json');
const only = arg('fields', '') ? arg('fields', '').split(',') : null;
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const dict = {};
for (const f of fs.readdirSync('src/data/i18n').filter((x) => /^en.*\.json$/.test(x))) Object.assign(dict, JSON.parse(fs.readFileSync('src/data/i18n/' + f, 'utf8')));
const schools = JSON.parse(fs.readFileSync('src/data/schools.json', 'utf8')).filter((s) => countries === 'all' || countries.split(',').includes(s.country));
const generic = JSON.parse(fs.readFileSync('src/data/generic.json', 'utf8'));
const want = new Map(); // text -> field
const add = (f, v) => {
  if (typeof v !== 'string' || v.trim().length < 2 || /^https?:/.test(v) || /^[\d\s.,€%/–-]+$/.test(v)) return;
  if (only && !only.includes(f)) return;
  const t = norm(v);
  if (dict[t] || ruleFor(f, t)) return;
  if (!want.has(t)) want.set(t, f);
};
for (const s of schools) {
  add('desc', s.desc); add('orig', s.orig?.text); add('region', s.region);
  for (const k of ['presentation', 'commandes', 'appareil', 'labels', 'langues']) add('fiche.' + k, s.fiche?.[k]);
  for (const o of [...s.baptemes, ...s.stages]) {
    for (const k of ['name', 'group', 'place', 'period', 'age', 'weight', 'level', 'levelName', 'program', 'included', 'notIncluded', 'priceLabel', 'durText', 'priceNature', 'voucherStatus', 'flights']) add(k, o[k]);
    for (const [k, v] of Object.entries(o.fiche ?? {})) add('offer.fiche.' + k, v);
    for (const [k, v] of Object.entries(o.extra ?? {})) add('extra.' + k, v);
    for (const k of ['todo', 'lift', 'mandatoryNature', 'rule', 'budget']) add('cmp.' + k, o.cmp?.[k]);
  }
}
const ids = new Set(schools.map((s) => s.id));
for (const x of JSON.parse(fs.readFileSync('src/data/sessions.json', 'utf8')).filter((x) => ids.has(x.schoolId))) { add('session.name', x.name); add('session.city', x.city); }
const read = (f) => JSON.parse(fs.readFileSync('src/data/' + f + '.json', 'utf8'));
for (const p of read('parcours').filter((x) => countries === 'all' || countries.split(',').includes(x.country))) for (const k of ['name', 'licence', 'material', 'covers', 'otherNature', 'feesNature', 'remains', 'duration', 'note']) add('parcours.' + k, p[k]);
for (const p of read('fees').filter((x) => countries === 'all' || countries.split(',').includes(x.country))) for (const k of ['item', 'body', 'period', 'applies', 'note']) add('fees.' + k, p[k]);
for (const p of read('assumptions').filter((x) => countries === 'all' || countries.split(',').includes(x.country))) for (const k of ['step', 'note', 'status']) add('assumptions.' + k, p[k]);
for (const g of read('gifts').filter((x) => ids.has(x.schoolId))) for (const k of ['name', 'kind', 'formulas', 'conditions']) add('gift.' + k, g[k]);
for (const g of read('promos').filter((x) => ids.has(x.schoolId))) for (const k of ['title', 'conditions']) add('promo.' + k, g[k]);
for (const g of read('goodies')) for (const k of ['name', 'note']) add('goodie.' + k, g[k]);
if (arg('generic', countries === 'all' ? '1' : '1') === '1') for (const v of Object.values(generic)) add('generic', v);
const rows = [...want].map(([fr, f]) => ({ f, fr })).sort((a, b) => a.f.localeCompare(b.f) || a.fr.length - b.fr.length).map((r, i) => ({ i, ...r }));
fs.mkdirSync('data/i18n', { recursive: true });
fs.writeFileSync(out, JSON.stringify(rows, null, 0));
const by = {}; for (const r of rows) { by[r.f] ??= [0, 0]; by[r.f][0]++; by[r.f][1] += r.fr.length; }
console.log(rows.length, 'texts,', rows.reduce((a, r) => a + r.fr.length, 0), 'characters'); console.table(by);
