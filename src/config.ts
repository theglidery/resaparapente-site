import { getMarket, markets, brands } from '../markets.mjs';
import schoolsRaw from './data/schools.json';

// One place for every setting the developer or Philippe may need to change.

export const MARKET = getMarket(import.meta.env.PUBLIC_MARKET || 'FR');
export const isRegional = MARKET.code !== 'FR';
export const BRANDS = brands;
export const BRAND = brands[MARKET.brand as keyof typeof brands];
export const marketReady = !isRegional || schoolsRaw.some((s) =>
  (('country' in s ? s.country : null) || 'FR') === MARKET.code && (s.baptemes.length || s.stages.length));
export const marketLinks = [
  { ...markets.FR, code: 'FR', href: isRegional ? markets.FR.origin + '/' : '/' },
  ...(['CH', 'BE'] as const).map((code) => ({
    ...markets[code], code,
    href: MARKET.code === code ? '/' : (
      (code === 'CH' ? import.meta.env.PUBLIC_CH_LIVE : import.meta.env.PUBLIC_BE_LIVE) === '1'
        ? markets[code].origin + '/' : (isRegional ? markets.FR.origin : '') + markets[code].preview
    ),
  })),
];

export const SITE = {
  name: 'Resa Parapente',
  url: MARKET.origin,
  // Draft mode: shows a "maquette" banner and tells search engines not to index.
  // Set PUBLIC_DRAFT=0 in the build environment for the real launch.
  draft: import.meta.env.PUBLIC_DRAFT !== '0' || !marketReady,
  contactEmail: 'contact@resaparapente.fr', // placeholder
};

// Two kinds of contact, always named on the form so nobody fills it in under the wrong role.
export const CONTACT_TYPES = {
  bapteme: { code: 'bapteme-passenger', title: 'Passager volant' },
  stage: { code: 'student', title: 'Élève stagiaire' },
} as const;

// Booking form is enabled by default now that the Pages Function and Resend sender are configured.
export const BOOKING = { endpoint: '/api/booking-request', maxPassengers: 8, minDaysAhead: 0, enabled: import.meta.env.PUBLIC_BOOKING_ENABLED !== '0' };

// Where the form of the page "Pour les écoles" is sent (dates de stage, baptêmes, bon cadeau, promotion). Not built yet: the draft only shows a summary.
export const SCHOOL_SUBMISSION = { endpoint: '/api/school-submission' };

// Alt texts for the hero pictures (public/images/hero/<name>.jpg, see IMAGES.md).
export const HERO_ALT: Record<string, string> = {
  home: 'Décollage en parapente dans les Alpes',
  bapteme: 'Un pilote et son passager décollent en biplace, voile gonflée',
  stage: 'Un moniteur et un élève préparent le décollage, radio à la main',
};

// Shape of each header band (width / height). Default 3 / 1; a picture with a tall subject can ask for a taller band.
export const HERO_RATIO: Record<string, string> = { stage: '8 / 3' };
// Which part of the picture stays visible when the band crops it (CSS object-position).
export const HERO_POS: Record<string, string> = { stage: '50% 100%' };

// The calendar page is always on, even with no dated session yet. With fewer than minSessions dates the list of schools
// without published dates is opened by default.
export const CALENDAR = {
  minSessions: 5,
};

// Measurement and advertising. Leave the IDs empty and nothing is loaded and no consent banner is shown.
// Set them in the build environment (Cloudflare Pages > Settings > Variables) before launch:
//   PUBLIC_GA4_ID = G-XXXXXXXXXX            Google Analytics 4
//   PUBLIC_ADS_ID = AW-XXXXXXXXX            Google Ads account
//   PUBLIC_ADS_LEAD_LABEL = abcDEFghi123    conversion label of the "request sent" action
export const ANALYTICS = {
  ga4: (import.meta.env.PUBLIC_GA4_ID as string | undefined) ?? '',
  ads: (import.meta.env.PUBLIC_ADS_ID as string | undefined) ?? '',
  adsLeadLabel: (import.meta.env.PUBLIC_ADS_LEAD_LABEL as string | undefined) ?? '',
  get enabled() { return !!(this.ga4 || this.ads); },
};

// Customer reviews: sent to the server (not built yet), moderated by a person, published from the workbook sheet "Avis".
// A rating appears on school cards and in the "Mieux notées" sort only from minOnCard reviews (one review says nothing).
export const REVIEWS = { endpoint: '/api/review', minOnCard: 3, minTextLength: 40, maxShown: 5 };
