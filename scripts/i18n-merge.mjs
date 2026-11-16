// Merges translations into src/data/i18n/en.json.
// Usage: node scripts/i18n-merge.mjs data/i18n/todo.json data/i18n/batch-01.json [--dest src/data/i18n/en.json]
// todo.json = output of i18n-extract ; batch = [[i, "English"], ...] (indexes of todo.json).
import fs from 'node:fs';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const di = process.argv.indexOf('--dest'); const dest = di > 0 ? process.argv[di + 1] : 'src/data/i18n/en.json';
const todo = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const byI = new Map(todo.map((r) => [r.i, r]));
const cur = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : {};
let n = 0, bad = 0;
for (const f of args.slice(1)) for (const [i, en] of JSON.parse(fs.readFileSync(f, 'utf8'))) {
  const r = byI.get(i); if (!r || typeof en !== 'string' || !en.trim()) { bad++; continue; }
  cur[r.fr] = en.trim(); n++;
}
fs.writeFileSync(dest, JSON.stringify(Object.fromEntries(Object.entries(cur).sort(([a], [b]) => a.localeCompare(b))), null, 1));
console.log('merged', n, 'rejected', bad, 'total', Object.keys(cur).length);
