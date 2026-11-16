// Maps each registry page to its view and lists the static paths of the current market (French at the root for the main pages,
// /en/ and /de/ for the other languages). The French home page of each market is a regular page and is not generated here.
import { PAGES, FILE_BACKED, SCHOOL_DIR, pathOf } from './routes.mjs';
import { schools } from '../lib/data';
import { isRegional } from '../config';
import RegionalSchool from '../views/RegionalSchool.astro';
import RegionalList from '../views/RegionalList.astro';
import { marketLocales } from './ui';
import BaptemeCompare from '../views/BaptemeCompare.astro';
import TrainingCost from '../views/TrainingCost.astro';
import BaptemeGuide from '../views/BaptemeGuide.astro';
import WhenStart from '../views/WhenStart.astro';
import GiftChristmas from '../views/GiftChristmas.astro';
import TrainingPath from '../views/TrainingPath.astro';
import Jump from '../views/Jump.astro';
import Home from '../views/Home.astro';

export const views: Record<string, any> = {
  baptemeCompare: BaptemeCompare,
  trainingCost: TrainingCost,
  baptemeGuide: BaptemeGuide,
  whenStart: WhenStart,
  giftChristmas: GiftChristmas,
  trainingPath: TrainingPath,
  jump: Jump,
  home: Home,
  listBapteme: RegionalList,
  listStage: RegionalList,
  listCalendar: RegionalList,
  school: RegionalSchool,
};

export function buildPaths() {
  const out: { params: { slug: string | undefined }; props: { page: string; locale: string; school?: any } }[] = [];
  for (const page of Object.keys(views)) {
    if (page === 'school') continue;
    // List pages exist only in the regional builds (the French market has its own list pages).
    
    for (const locale of marketLocales) {
      if (FILE_BACKED.has(page) && locale === 'fr') continue; // the French version is a regular page of each build
      if (!(PAGES as any)[page][locale] && page !== 'home') continue;
      const path = pathOf(page as keyof typeof PAGES, locale).replace(/^\/|\/$/g, '');
      out.push({ params: { slug: path || undefined }, props: { page, locale } });
    }
  }
  // One page per school and language that has school pages (English).
  for (const locale of marketLocales) {
    if (!(SCHOOL_DIR as any)[locale] || locale === 'fr') continue;
    for (const school of schools.filter((x) => x.baptemes.length || x.stages.length)) {
      out.push({ params: { slug: `${locale}/${(SCHOOL_DIR as any)[locale]}/${school.slug}` }, props: { page: 'school', locale, school } });
    }
  }
  return out;
}
