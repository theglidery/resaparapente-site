import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PAGES, LOCALES } from '../src/i18n/routes.mjs';

// Top-level folders of the localized pages (from the route registry) copied to the market folder.
const localizedDirs = [...new Set([...Object.values(PAGES).flatMap((p) => Object.values(p)).filter(Boolean), ...LOCALES.filter((l) => l !== 'fr')])];

const temporary = ['dist-ch', 'dist-be'];
for (const path of ['dist', ...temporary]) rmSync(path, { recursive: true, force: true });
for (const market of ['FR', 'CH', 'BE']) {
  const build = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    stdio: 'inherit', env: { ...process.env, PUBLIC_MARKET: market },
  });
  if (build.status !== 0) throw new Error(`Compilation ${market} échouée.`);
}
function mergeAssets(source, destination) {
  if (!existsSync(source)) return;
  mkdirSync(destination, { recursive: true });
  for (const item of readdirSync(source)) {
    const from = `${source}/${item}`, to = `${destination}/${item}`;
    if (statSync(from).isDirectory()) mergeAssets(from, to);
    else if (!existsSync(to)) cpSync(from, to);
    else if (!readFileSync(from).equals(readFileSync(to))) throw new Error(`Collision d’asset : ${item}`);
  }
}
for (const region of ['ch', 'be']) {
  const source = `dist-${region}`, destination = `dist/_markets/${region}`;
  mkdirSync(destination, { recursive: true });
  for (const name of ['index.html', '404.html', 'robots.txt', 'bapteme', 'stage', 'calendrier', 'ecoles', ...localizedDirs, ...readdirSync(source).filter((file) => /^sitemap-.*\.xml$/.test(file))]) {
    if (existsSync(`${source}/${name}`)) cpSync(`${source}/${name}`, `${destination}/${name}`, { recursive: true });
  }
  mergeAssets(`${source}/_astro`, 'dist/_astro');
}
for (const path of temporary) rmSync(path, { recursive: true, force: true });
