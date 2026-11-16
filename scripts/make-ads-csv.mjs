// Generates Google Ads Editor import files from the same data as the local pages, so ad text, prices and landing pages always match.
// Usage: node scripts/make-ads-csv.mjs [--budget 10] [--min-schools 3]   ->  ads/campagne-bapteme.csv, ads/campagne-stage.csv, ads/campagne-marque.csv, ads/RAPPORT.txt
// Everything is created PAUSED. Import in Google Ads Editor (Account > Import > From file), check, then enable one campaign at a time.
import fs from 'node:fs';
import { createServer } from 'vite';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const BUDGET = arg('budget', '10'), MIN = Number(arg('min-schools', '3'));
const SITE = 'https://resaparapente.fr';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true } });
const places = await vite.ssrLoadModule('/src/lib/places.ts');
const lc = await vite.ssrLoadModule('/src/lib/local-content.ts');
const data = await vite.ssrLoadModule('/src/lib/data.ts');
const { eur } = data;

const NEG = ['occasion', 'achat voile', 'achat aile', 'voile parapente occasion', 'fabricant', 'simulateur', 'jeu', 'emploi', 'formation moniteur', 'brevet moniteur', 'paramoteur', 'pendulaire', 'saut en parachute', 'parachute', 'wingsuit', 'canada', 'bali', 'prix voile', 'pdf', 'cours en ligne', 'location voile', 'chute libre'];
const COLS = ['Campaign', 'Campaign Status', 'Campaign Type', 'Campaign Daily Budget', 'Bid Strategy Type', 'Networks', 'Languages', 'Location', 'Ad Group', 'Ad Group Status', 'Max CPC', 'Keyword', 'Criterion Type', 'Ad type', ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`), ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`), 'Path 1', 'Path 2', 'Final URL', 'Status'];
const esc = (v) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const line = (o) => COLS.map((c) => esc(o[c])).join(';');
const warnings = [];
let dropped = 0;
const fit = (t, max) => { t = t.replace(/\s+/g, ' ').trim(); if (t.length <= max) return t; dropped++; return ''; }; // too long for Google's limit: left out, the other variants remain
const noAcc = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
const unique = (a) => [...new Set(a.filter(Boolean))];

function campaignRows(name, extra = {}) {
  return [
    { Campaign: name, 'Campaign Status': 'Paused', 'Campaign Type': 'Search', 'Campaign Daily Budget': BUDGET, 'Bid Strategy Type': 'Manual CPC', Networks: 'Google search', Languages: 'fr', ...extra },
    { Campaign: name, Location: 'France' },
    ...NEG.map((k) => ({ Campaign: name, Keyword: k, 'Criterion Type': 'Campaign negative phrase' })),
  ];
}

function groupRows(campaign, ad) {
  const rows = [{ Campaign: campaign, 'Ad Group': ad.group, 'Ad Group Status': 'Paused', 'Max CPC': '0.60' }];
  for (const k of ad.keywords) {
    rows.push({ Campaign: campaign, 'Ad Group': ad.group, Keyword: k.replace(/^\[|\]$/g, ''), 'Criterion Type': k.startsWith('[') ? 'Exact' : 'Phrase', 'Max CPC': '0.60' });
  }
  const r = { Campaign: campaign, 'Ad Group': ad.group, 'Ad type': 'Responsive search ad', 'Path 1': ad.path1, 'Path 2': ad.path2, 'Final URL': ad.url, Status: 'Paused' };
  ad.headlines.slice(0, 15).forEach((h, i) => (r[`Headline ${i + 1}`] = h));
  ad.descriptions.slice(0, 4).forEach((d, i) => (r[`Description ${i + 1}`] = d));
  rows.push(r);
  return rows;
}

function adFor(kind, place, type) {
  const c = lc.localPage(kind, place, type);
  const st = c.st; const n = st.n; const label = place.name;
  const nounH = kind === 'bapteme' ? 'Baptême parapente' : type ? `Stage parapente ${type.menu.split(',')[0].toLowerCase()}` : 'Stage parapente';
  const h = [];
  const H = (t, ctx) => h.push(fit(t, 30, `${place.slug} H`));
  H(`${nounH} ${label}`); H(`${nounH} à ${label}`);
  H(kind === 'bapteme' ? `Baptême ${label}` : `Stage ${label}`);
  H(`${n} écoles comparées`); H(`Comparez ${n} écoles`);
  if (st.min) { H(`Dès ${eur(st.min).replace(/\s/g, ' ')} par personne`); H(`Prix dès ${eur(st.min).replace(/\s/g, ' ')}`); }
  H('Demande gratuite'); H('Aucun paiement sur le site'); H('Prix relevés et datés'); H('Contact direct avec l’école'); H('Écoles indépendantes');
  if (kind === 'bapteme') { H('Enfants, vol d’hiver : filtres'); H('Durée et prix des vols'); }
  else H('Dates et niveaux comparés');
  const d = [];
  const D = (t, ctx) => d.push(fit(t, 90, `${place.slug} D`));
  D(`Comparez ${n} écoles de parapente ${place.inName} : prix datés, ${kind === 'bapteme' ? 'durée du vol, enfants.' : 'niveaux, dates.'}`.replace('  ', ' '));
  D('Trouvez une formule et contactez l’école pour confirmer la date et le tarif.');
  D('Prix relevés sur les sites des écoles, avec la date. Aucun paiement sur resaparapente.fr.');
  if (st.min && kind === 'bapteme') D(`Baptême dès ${eur(st.min)} par personne. Filtrez enfants et vol d’hiver, comparez les durées.`);
  else if (st.min) D(`Stage dès ${eur(st.min)} par personne selon le niveau. Comparez les écoles et les dates.`);
  const heads = unique(h);
  const k = [];
  const base = kind === 'bapteme' ? ['baptême parapente', 'vol biplace parapente'] : type ? [`stage parapente ${type.menu.split(',')[0].toLowerCase()}`] : ['stage parapente'];
  for (const b of base) { k.push(`${b} ${label.toLowerCase()}`); k.push(`[${b} ${label.toLowerCase()}]`); if (noAcc(b) !== b || noAcc(label) !== label) k.push(`${noAcc(b)} ${noAcc(label).toLowerCase()}`); }
  if (kind === 'bapteme') k.push(`prix baptême parapente ${label.toLowerCase()}`);
  return {
    group: `${kind === 'bapteme' ? 'Baptême' : 'Stage'} ${label}${type ? ' ' + type.menu.split(',')[0] : ''}`.slice(0, 60),
    keywords: unique(k), headlines: heads, descriptions: unique(d),
    path1: kind === 'bapteme' ? 'bapteme-parapente' : 'stage-parapente', path2: place.slug.slice(0, 15),
    url: SITE + places.pathOf(kind, place, type?.slug), n,
  };
}

fs.mkdirSync('ads', { recursive: true });
const report = []; let minH = 99;
for (const kind of ['bapteme', 'stage']) {
  const campaign = kind === 'bapteme' ? 'ResaParapente | Baptême | Destinations' : 'ResaParapente | Stage | Destinations';
  const rows = [...campaignRows(campaign)];
  let groups = 0, skipped = 0;
  for (const { place, type } of places.allLocalPages().filter((x) => x.kind === kind)) {
    const ad = adFor(kind, place, type);
    if (ad.n < MIN) { skipped++; continue; }
    minH = Math.min(minH, ad.headlines.length);
    if (ad.headlines.length < 5 || ad.descriptions.length < 2) { warnings.push(`${place.slug}: pas assez de titres ou descriptions`); continue; }
    rows.push(...groupRows(campaign, ad)); groups++;
    // criteria groups: the landing page opens with the filter already ticked
    if (kind === 'bapteme' && !type) {
      const lab = place.name.toLowerCase(), c2 = lc.localPage(kind, place);
      const crit = [['kids', c2.st.kids, 'enfant', ['baptême parapente enfant', 'baptême parapente enfants'], 'Enfants', 'Baptême parapente enfant', 'Accepte les enfants : filtre déjà réglé'], ['winter', c2.st.winter, 'hiver', ['baptême parapente hiver', 'vol parapente hiver'], 'Hiver', 'Baptême parapente en hiver', 'Vol en hiver : filtre déjà réglé']];
      for (const [flag, cnt, , kws, grp, head, desc] of crit) {
        if (cnt < 2) continue;
        const a2 = { ...ad, group: `${grp} ${place.name}`.slice(0, 60), url: `${ad.url}?${flag}=1`, keywords: unique(kws.flatMap((k) => [`${k} ${lab}`, `[${k} ${lab}]`])),
          headlines: unique([fit(`${head} ${place.name}`, 30), ...ad.headlines]), descriptions: unique([fit(`${desc.replace(' : filtre déjà réglé', '')} : comparez ${ad.n} écoles ${place.inName}. Demande gratuite.`, 90), ...ad.descriptions]), path2: `${flag === 'kids' ? 'enfants' : 'hiver'}`.slice(0, 15) };
        rows.push(...groupRows(campaign, a2)); groups++;
      }
    }
  }
  fs.writeFileSync(`ads/campagne-${kind}.csv`, '﻿' + [COLS.join(';'), ...rows.map(line)].join('\n'));
  report.push(`${kind}: ${groups} groupes d’annonces (${skipped} lieux ignorés : moins de ${MIN} écoles), ${rows.length} lignes`);
}
// brand campaign: protect our own name, nothing else
{
  const campaign = 'ResaParapente | Marque';
  const rows = [...campaignRows(campaign, { 'Campaign Daily Budget': '3' })];
  rows.push(...groupRows(campaign, { group: 'Marque', keywords: ['[resaparapente]', '[resa parapente]', 'resaparapente.fr'], headlines: ['Resa Parapente', 'Écoles de parapente comparées', 'Demande gratuite à l’école', 'Prix datés, sans paiement'], descriptions: ['Comparez les formules des écoles et contactez celle qui vous convient.', 'Baptême et stage de parapente : l’école vous répond et organise le paiement.'], path1: 'parapente', path2: '', url: SITE + '/' }));
  fs.writeFileSync('ads/campagne-marque.csv', '﻿' + [COLS.join(';'), ...rows.map(line)].join('\n'));
}
fs.writeFileSync('ads/RAPPORT.txt', [`Généré le ${new Date().toISOString().slice(0, 10)} (budget ${BUDGET} €/jour, tout en pause)`, ...report, '', `${dropped} titres ou descriptions trop longs ont été écartés (limites Google : 30 et 90 caractères) ; il reste au moins ${minH} titres par groupe.`, `${warnings.length} avertissements :`, ...warnings].join('\n'));
console.log(report.join('\n'), `\n${dropped} variantes écartées (trop longues), minimum ${minH} titres par groupe, ${warnings.length} avertissements`);
await vite.close();
