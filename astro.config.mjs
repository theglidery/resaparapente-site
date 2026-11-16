import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createRequire } from 'node:module';
import { getMarket } from './markets.mjs';

const require = createRequire(import.meta.url);
const schools = require('./src/data/schools.json');
const market = getMarket(process.env.PUBLIC_MARKET);
const regional = market.code !== 'FR';
const local = schools.filter((s) => (s.country || 'FR') === market.code);
const hasOffers = (s) => s.baptemes.length || s.stages.length;
const ready = !regional || local.some(hasOffers);
const thin = new Set(local.filter((s) => !hasOffers(s)).map((s) => `/ecoles/${s.slug}/`));

export default defineConfig({
  site: market.origin,
  ...(regional ? { srcDir: './regional', outDir: `./dist-${market.code.toLowerCase()}` } : {}),
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: ready && process.env.PUBLIC_DRAFT === '0' ? [
    sitemap({ filter: (page) => {
      const path = new URL(page).pathname;
      if (regional && path === '/bapteme/' && !local.some((s) => s.baptemes.length)) return false;
      if (regional && ['/stage/', '/calendrier/'].includes(path) && !local.some((s) => s.stages.length)) return false;
      return !thin.has(path) && !['/404/', '/404', '/suisse-romande/', '/belgique-francophone/'].includes(path)
        && !path.startsWith('/utiliser-mon-bon') && !path.startsWith('/merci/');
    } }),
  ] : [],
});
