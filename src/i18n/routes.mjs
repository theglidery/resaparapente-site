// Registry of the localized pages added in v11 (comparators, guides, gift, training path).
// One key per page; each language has its own slug (good for SEO in that language). French sits at the root, EN under /en/, DE under /de/.
export const LOCALES = ['fr', 'en', 'de'];
export const HTML_LANG = { fr: 'fr', en: 'en', de: 'de' };
export const PAGES = {
  home: { fr: '', en: '', de: '' },
  baptemeCompare: { fr: 'comparateur-baptemes-parapente', en: 'compare-tandem-paragliding-flights', de: 'tandemflug-gleitschirm-vergleich' },
  baptemeGuide: { fr: 'quel-bapteme-parapente-choisir', en: 'which-tandem-paragliding-flight', de: 'welcher-tandemflug-gleitschirm' },
  trainingCost: { fr: 'comparateur-prix-formation-parapente', en: 'paragliding-course-cost-comparison', de: 'gleitschirm-ausbildung-kosten-vergleich' },
  whenStart: { fr: 'quand-commencer-parapente', en: 'when-can-i-start-paragliding', de: 'wann-gleitschirm-kurs-beginnen' },
  trainingPath: { fr: 'cursus-brevets-parapente', en: 'paragliding-licence-pathway', de: 'gleitschirm-lizenz-ausbildungsweg' },
  giftChristmas: { fr: 'bon-cadeau-parapente-noel', en: 'paragliding-gift-voucher', de: 'gleitschirm-gutschein-geschenk' },
  jump: { fr: 'saut-en-parapente', en: 'tandem-paragliding-jump', de: 'gleitschirm-tandemsprung' },
  // School lists. French pages are regular files (bapteme/, stage/, calendrier/); other languages are generated.
  listBapteme: { fr: 'bapteme', en: 'tandem-paragliding-schools', de: '' },
  listStage: { fr: 'stage', en: 'paragliding-course-schools', de: '' },
  listCalendar: { fr: 'calendrier', en: 'paragliding-course-calendar', de: '' },
};
/** Pages whose French version is a regular file of the site: the generator only adds the other languages. */
export const FILE_BACKED = new Set(['home', 'listBapteme', 'listStage', 'listCalendar']);
/** School pages: /ecoles/<slug>/ in French, /en/schools/<slug>/ in English. Languages without school pages are not listed here. */
export const SCHOOL_DIR = { fr: 'ecoles', en: 'schools' };
export const schoolPath = (slug, locale) => `${locale === 'fr' ? '' : '/' + locale}/${SCHOOL_DIR[locale]}/${slug}/`;
export const pathOf = (page, locale) => {
  const slug = PAGES[page][locale];
  return `${locale === 'fr' ? '' : '/' + locale}/${slug ? slug + '/' : ''}` || '/';
};

/** Link to a school page in the visitor's language; languages without school pages (German) link to the French page. */
export const schoolHref = (slug, locale) => schoolPath(slug, SCHOOL_DIR[locale] ? locale : 'fr');
