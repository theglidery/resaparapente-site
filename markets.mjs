// One entry per public market. `locales` = languages built for that market (French is always the default and lives at the root;
// English and German live under /en/ and /de/). `brand` = which logo/name the market uses (see `brands`).
export const markets = {
  FR: { origin: 'https://resaparapente.fr', locale: 'fr-FR', currency: 'EUR', label: 'France', preview: '/', locales: ['fr', 'en'], brand: 'fr' },
  CH: { origin: 'https://resaparapente.ch', locale: 'fr-CH', currency: 'CHF', label: 'Suisse romande', preview: '/suisse-romande/', locales: ['fr', 'en', 'de'], brand: 'ch' },
  BE: { origin: 'https://resaparapente.be', locale: 'fr-BE', currency: 'EUR', label: 'Belgique francophone', preview: '/belgique-francophone/', locales: ['fr', 'en', 'de'], brand: 'be' },
};

// Logos by brand. Drop the file in public/images/brand/ (same name as below) and it is used automatically; until then the default logo shows.
// A European domain (e.g. a German or English one) redirects to the central site with ?brand=de or ?brand=en; the page then keeps that logo
// (cookie rp_brand) so the visitor sees "their" brand all along. See docs/MULTILINGUE.md.
export const brands = {
  fr: { name: 'Resa Parapente', logo: 'logo.png', logo2x: 'logo@2x.png' },
  ch: { name: 'Resa Parapente Suisse', logo: 'logo-ch.png', logo2x: 'logo-ch@2x.png' },
  be: { name: 'Resa Parapente Belgique', logo: 'logo-be.png', logo2x: 'logo-be@2x.png' },
  // International brand "BookParaglide" (bookparaglide.com / .de / .ch / .fr). One logo for both languages: logo-bookparaglide.png.
  de: { name: 'BookParaglide', logo: 'logo-bookparaglide.png', logo2x: 'logo-bookparaglide@2x.png' },
  en: { name: 'BookParaglide', logo: 'logo-bookparaglide.png', logo2x: 'logo-bookparaglide@2x.png' },
};

// Domains owned (bought Nov. 2026). Each market origin above is served directly. The other domains only redirect (301) to a central
// market site, keep the visitor's query string (utm_*, gclid...) and optionally pass the brand (logo follows via cookie rp_brand).
//   to     = market code receiving the traffic     locale = language of the landing page ('fr' = no prefix)     brand = brands key (optional)
// Roles chosen by default (change here only, then redeploy):
//   bookparaglide.com -> English pages of the France site   (France has the most schools: the natural English entry point)
//   bookparaglide.de  -> German pages of the Swiss site     (no German school list yet: the CH site is the one with German pages today)
//   bookparaglide.ch  -> English pages of the Swiss site    (language switcher offers FR/DE)
//   bookparaglide.fr  -> French home page of the France site (French visitors expect French)
export const redirectDomains = {
  'bookparaglide.com': { to: 'FR', brand: 'en', locale: 'en' },
  'bookparaglide.de': { to: 'CH', brand: 'de', locale: 'de' },
  'bookparaglide.ch': { to: 'CH', brand: 'en', locale: 'en' },
  'bookparaglide.fr': { to: 'FR', locale: 'fr' },
};

export function getMarket(value = 'FR') {
  if (!Object.hasOwn(markets, value)) throw new Error('PUBLIC_MARKET doit valoir FR, CH ou BE.');
  return { ...markets[value], code: value };
}
