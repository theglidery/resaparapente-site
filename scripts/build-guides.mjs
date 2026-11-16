// Builds the two free guides offered on the thank-you pages: public/documents/guide-passager-parapente.pdf and guide-stagiaire-parapente.pdf.
// The texts are those of the site (src/data/*.ts: baptême guide, first course, theory course, licences), so editing the site texts and
// running `node scripts/build-guides.mjs` updates the PDFs. Needs Python with reportlab (as for the logbook).
import { createServer } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

process.env.PUBLIC_MARKET = 'FR';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true }, envPrefix: ['VITE_', 'PUBLIC_'] });
const { BAPTEME_GUIDE } = await vite.ssrLoadModule('/src/data/bapteme-guide.ts');
const { LEARN_PAGES } = await vite.ssrLoadModule('/src/data/learn.ts');
await vite.close();
const page = (slug) => LEARN_PAGES.find((p) => p.slug === slug);
const modules = LEARN_PAGES.filter((p) => p.slug.startsWith('cours/'));
const ORIGIN = 'https://resaparapente.fr';
const link = (href, label) => ({ href: href.startsWith('/') ? ORIGIN + href : href, label });
const guides = {
  passager: {
    file: 'public/documents/guide-passager-parapente.pdf',
    title: 'Mon baptême de parapente : le guide du passager',
    lead: 'Tout ce qu’il faut savoir pour bien préparer votre vol biplace : le déroulé, la tenue, ce que vous allez ressentir, la météo et les questions que l’on se pose avant de voler.',
    note: 'Ce guide est général. Les consignes de votre école et de votre pilote passent toujours avant : lieu de rendez-vous, horaires, tenue et conditions sont précisés par l’école qui confirme votre demande.',
    parts: [{ h: '', articles: [BAPTEME_GUIDE] }],
    more: [
      link('/comparateur-baptemes-parapente/', 'Comparer les baptêmes : prix, durée, photos'),
      link('/quel-bapteme-parapente-choisir/', 'Quel baptême choisir ?'),
      link('/bon-cadeau-parapente-noel/', 'Offrir un baptême : bon cadeau'),
      link('/apprendre/', 'Et si vous passiez à l’étape suivante : apprendre à piloter'),
      link('/pourquoi-voler/', 'Pourquoi voler : bienfaits et sensations'),
    ],
  },
  stagiaire: {
    file: 'public/documents/guide-stagiaire-parapente.pdf',
    title: 'Mon stage de parapente : le guide du stagiaire',
    lead: 'De la préparation du premier stage à la licence : choisir, se préparer, comprendre la théorie (vent, météo, matériel, décollage, atterrissage, sécurité) et savoir comment progresser jusqu’au brevet.',
    note: 'Ce guide complète votre stage, il ne le remplace pas. Seule la pratique encadrée par un moniteur diplômé apprend à voler : en cas de doute, la consigne de votre moniteur prime toujours.',
    parts: [
      { h: 'Partie 1 · Préparer son stage', articles: [page('premier-stage')] },
      { h: 'Partie 2 · La théorie, module par module', articles: modules.filter((m) => m.slug !== 'cours') },
      { h: 'Partie 3 · Brevets et licence', articles: ['brevets', 'brevets/initial', 'brevets/pilote', 'brevets/pilote-confirme', 'licence-ffvl'].map(page) },
    ],
    more: [
      link('/apprendre/', 'Le parcours pour devenir pilote'),
      link('/apprendre/cours/', 'Le cours de parapente en ligne (6 modules)'),
      link('/apprendre/brevets/', 'Les trois brevets'),
      link('/apprendre/licence-ffvl/', 'La licence FFVL'),
      link('/comparateur-prix-formation-parapente/', 'Combien coûte la formation jusqu’au brevet ?'),
      link('/calendrier/', 'Prochains stages publiés par les écoles'),
      link('https://www.ffvl.fr/', 'Fédération française de vol libre (FFVL)'),
      link('https://monparapente.fr/', 'Matériel et goodies : MonParapente.fr'),
    ],
  },
};
mkdirSync('data', { recursive: true });
writeFileSync('data/guides-source.json', JSON.stringify(guides));
const run = spawnSync('python3', ['scripts/build-guides-pdf.py', 'data/guides-source.json'], { stdio: 'inherit' });
process.exit(run.status ?? 1);
