// Machine-translates the texts of the workbook that still have no English version and stores them in src/data/i18n/en.auto.json.
// The site never needs this file: texts without translation stay in French (lang="fr"). Hand-made entries (en.json, en.*-hand.json) always win.
//
// Usage:
//   DEEPL_API_KEY=xxx node scripts/i18n-translate.mjs [--countries FR|CH,BE|all] [--fields desc,program,orig] [--limit 200] [--dry-run]
//   ANTHROPIC_API_KEY=xxx node scripts/i18n-translate.mjs --provider anthropic ...
// Providers: deepl (default when DEEPL_API_KEY is set; the free plan gives 500,000 characters a month, "...:fx" keys use the free host)
//            anthropic (ANTHROPIC_API_KEY; model from --model, default claude-haiku-4-5-20251001).
// The script is resumable: it skips what en.auto.json already holds, writes after every batch, and --limit caps the characters sent per run.
// Then: PUBLIC_DRAFT=1 node scripts/build-markets.mjs, and spot-check a few schools (docs/TRADUCTION-EN.md).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.includes('--' + k);
const countries = arg('countries', 'all'), fields = arg('fields', 'desc,program,orig,fiche.presentation').split(','), maxChars = Number(arg('limit', '1000000')), dry = flag('dry-run');
const provider = arg('provider', process.env.DEEPL_API_KEY ? 'deepl' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none');
const AUTO = 'src/data/i18n/en.auto.json';
const TMP = 'data/i18n/todo-auto.json';

const ex = spawnSync(process.execPath, ['scripts/i18n-extract.mjs', '--countries', countries, '--out', TMP, '--fields', fields.join(',')], { encoding: 'utf8' });
if (ex.status !== 0) { console.error(ex.stderr || ex.stdout); process.exit(1); }
const todo = JSON.parse(fs.readFileSync(TMP, 'utf8')).filter((r) => fields.includes(r.f));
const auto = fs.existsSync(AUTO) ? JSON.parse(fs.readFileSync(AUTO, 'utf8')) : {};
const rest = todo.filter((r) => !auto[r.fr]);
let budget = maxChars; const queue = [];
for (const r of rest) { if (r.fr.length > budget) break; budget -= r.fr.length; queue.push(r); }
console.log(`${todo.length} texts to translate in ${fields.join(', ')}; ${rest.length} not yet in en.auto.json; this run: ${queue.length} texts, ${queue.reduce((a, r) => a + r.fr.length, 0)} characters; provider: ${provider}`);
if (dry || !queue.length) process.exit(0);
if (provider === 'none') { console.error('Set DEEPL_API_KEY or ANTHROPIC_API_KEY (or pass --dry-run).'); process.exit(1); }

async function deepl(texts) {
  const key = process.env.DEEPL_API_KEY, host = key.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const res = await fetch(`https://${host}/v2/translate`, {
    method: 'POST', headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts, source_lang: 'FR', target_lang: 'EN-GB', formality: 'prefer_more', preserve_formatting: true }),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  return (await res.json()).translations.map((t) => t.text);
}
async function anthropic(texts) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: arg('model', 'claude-haiku-4-5-20251001'), max_tokens: 8000,
      system: 'You translate French paragliding-school texts into natural British English for a booking website. Keep proper names, place names and prices unchanged. "baptême" = tandem flight, "stage" = course, "pente-école" = training slope, "biplace" = tandem, "brevet" = licence, "moniteur" = instructor. Return ONLY a JSON array of strings, same length and order as the input.',
      messages: [{ role: 'user', content: JSON.stringify(texts) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const out = JSON.parse((await res.json()).content[0].text.trim().replace(/^```json\s*|```$/g, ''));
  if (!Array.isArray(out) || out.length !== texts.length) throw new Error('Unexpected answer length');
  return out;
}
const run = provider === 'deepl' ? deepl : anthropic;
const BATCH_CHARS = provider === 'deepl' ? 20000 : 6000, BATCH_N = provider === 'deepl' ? 50 : 15; // DeepL: max 50 texts / 128 KiB per request
for (let i = 0; i < queue.length;) {
  const batch = []; let n = 0;
  while (i < queue.length && batch.length < BATCH_N && n + queue[i].fr.length <= BATCH_CHARS) { n += queue[i].fr.length; batch.push(queue[i++]); }
  if (!batch.length) batch.push(queue[i++]); // a single very long text
  const out = await run(batch.map((r) => r.fr));
  batch.forEach((r, k) => { if (out[k] && out[k].trim()) auto[r.fr] = out[k].trim(); });
  fs.writeFileSync(AUTO, JSON.stringify(auto, null, 0));
  console.log(`  ${Math.min(i, queue.length)}/${queue.length}`);
}
console.log('Done. Rebuild the site: PUBLIC_DRAFT=1 node scripts/build-markets.mjs');
