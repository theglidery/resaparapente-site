import { PAGES, pathOf } from './routes.mjs';
import { MARKET } from '../config';

export type Locale = 'fr' | 'en' | 'de';
export const marketLocales: Locale[] = ['fr', 'en', 'de'];

/** Shared interface strings (navigation, footer, units). Page texts live in each view. */
export const UI = {
  fr: {
    skip: 'Aller au contenu', home: 'Accueil', tandem: 'Baptêmes', courses: 'Stages', calendar: 'Calendrier',
    compareTandem: 'Comparateur de baptêmes', courseCost: 'Coût de la formation', whenStart: 'Quand commencer ?',
    pathway: 'Parcours et brevets', gift: 'Bon cadeau', jump: 'Saut en parapente', guide: 'Quel baptême choisir ?',
    language: 'Langue', country: 'Choisir un pays', contact: 'Contacter ResaParapente', why: 'Pourquoi voler', firstStage: 'Préparer son premier stage',
    from: 'dès', perPerson: 'par personne', min: 'min', days: 'jours', day: 'jour', checked: 'Relevé le', toConfirm: 'à confirmer',
    seeOffer: 'Voir l’offre', seeSchool: 'Fiche de l’école', book: 'Réserver', included: 'Inclus', notIncluded: 'Non inclus', yes: 'Oui', no: 'Non',
    schoolSite: 'Sur le site de l’école', source: 'Source', sources: 'Sources', reset: 'Tout effacer', results: 'résultats', result: 'résultat',
    noResult: 'Aucune offre ne correspond à ces critères. Élargissez un filtre.', allRegions: 'Toutes les régions', sortBy: 'Trier par',
  },
  en: {
    skip: 'Skip to content', home: 'Home', tandem: 'Tandem flights', courses: 'Courses', calendar: 'Calendar',
    compareTandem: 'Tandem flight comparison', courseCost: 'Cost of the full training', whenStart: 'When can I start?',
    pathway: 'Pathway and licences', gift: 'Gift voucher', jump: 'Tandem paragliding jump', guide: 'Which flight to choose?',
    language: 'Language', country: 'Choose a country', contact: 'Contact ResaParapente', why: 'Why fly', firstStage: 'Preparing your first course',
    from: 'from', perPerson: 'per person', min: 'min', days: 'days', day: 'day', checked: 'Checked on', toConfirm: 'to be confirmed',
    seeOffer: 'See the offer', seeSchool: 'School page', book: 'Book', included: 'Included', notIncluded: 'Not included', yes: 'Yes', no: 'No',
    schoolSite: 'On the school’s website', source: 'Source', sources: 'Sources', reset: 'Clear all', results: 'results', result: 'result',
    noResult: 'No offer matches these criteria. Widen a filter.', allRegions: 'All regions', sortBy: 'Sort by',
  },
  de: {
    skip: 'Zum Inhalt', home: 'Startseite', tandem: 'Tandemflüge', courses: 'Kurse', calendar: 'Kalender',
    compareTandem: 'Tandemflug-Vergleich', courseCost: 'Kosten der Ausbildung', whenStart: 'Wann kann ich anfangen?',
    pathway: 'Ausbildungsweg und Lizenzen', gift: 'Geschenkgutschein', jump: 'Tandemsprung mit dem Gleitschirm', guide: 'Welcher Flug passt?',
    language: 'Sprache', country: 'Land wählen', contact: 'ResaParapente kontaktieren', why: 'Warum fliegen', firstStage: 'Den ersten Kurs vorbereiten',
    from: 'ab', perPerson: 'pro Person', min: 'Min.', days: 'Tage', day: 'Tag', checked: 'Geprüft am', toConfirm: 'zu bestätigen',
    seeOffer: 'Angebot ansehen', seeSchool: 'Seite der Schule', book: 'Buchen', included: 'Inklusive', notIncluded: 'Nicht inklusive', yes: 'Ja', no: 'Nein',
    schoolSite: 'Auf der Website der Schule', source: 'Quelle', sources: 'Quellen', reset: 'Alles löschen', results: 'Ergebnisse', result: 'Ergebnis',
    noResult: 'Kein Angebot passt zu diesen Kriterien. Lockern Sie einen Filter.', allRegions: 'Alle Regionen', sortBy: 'Sortieren nach',
  },
} as const;
export type UiKey = keyof typeof UI.fr;
export const ui = (l: Locale) => UI[l];

export const LANG_NAMES: Record<Locale, string> = { fr: 'Français', en: 'English', de: 'Deutsch' };
export const href = (page: keyof typeof PAGES, l: Locale) => pathOf(page, l);

/** Alternate-language links of a registry page, for hreflang and the language switcher. */
export function alternatesOf(page: keyof typeof PAGES) {
  return marketLocales.filter((l) => page === 'home' || (PAGES as any)[page][l]).map((l) => ({ locale: l, href: pathOf(page, l) }));
}
