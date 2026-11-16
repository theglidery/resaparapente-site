// Text of the local landing pages, computed from the data so each page is different and always matches the workbook.
import { eur, dateFr } from './data';
import { statsOf, schoolsWithType, sessionsOf, pathOf, placesFor, typePagesFor, type Kind, type Place, type Stats } from './places';
import { PLACE_EXTRA } from '../data/places-extra';
import type { StageType } from '../data/stage-types';

const plural = (n: number, one: string, many = one + 's') => `${n} ${n > 1 ? many : one}`;
const range = (a: number | null, b: number | null) => (a == null ? '' : b == null || a === b ? eur(a) : `${eur(a)} à ${eur(b)}`);
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

export function localPage(kind: Kind, place: Place, type?: StageType) {
  const list = type ? schoolsWithType(place, type.key) : place.schools[kind];
  const st: Stats = statsOf(list, kind, type ? (o) => o.levelKey === type.key : () => true);
  const where = place.inName;
  const noun = kind === 'bapteme' ? 'baptême de parapente' : type ? `stage de parapente (${lc(type.menu)})` : 'stage de parapente';
  const h1 = kind === 'bapteme' ? `Baptême de parapente ${where}` : type ? `Stage de parapente ${where} : ${lc(type.menu)}` : `Stage de parapente ${where}`;
  const title = kind === 'bapteme'
    ? `Baptême de parapente ${where} : ${plural(st.n, 'école')}, ${st.min ? `dès ${eur(st.min)}` : 'formules et durées'}`
    : type ? `Stage de parapente ${lc(type.menu)} ${where} : écoles et prix`
    : `Stage de parapente ${where} : ${plural(st.n, 'école')} et prix`;
  const priceTxt = st.min != null ? `de ${range(st.min, st.max)} par personne` : '';
  const description = `${cap(noun)} ${where} : comparez ${plural(st.n, 'école')}${priceTxt ? `, ${priceTxt}` : ''}. Comparez les formules et contactez directement les écoles.`;

  // "En bref" tiles
  const brief: { k: string; v: string }[] = [{ k: 'Écoles', v: plural(st.n, 'école') }];
  if (st.min != null) brief.push({ k: 'Prix par personne', v: range(st.min, st.max) + (st.med ? ` (médiane ${eur(Math.round(st.med))})` : '') });
  if (kind === 'bapteme' && st.durMin) brief.push({ k: 'Durée du vol', v: st.durMin === st.durMax ? `${st.durMin} min` : `${st.durMin} à ${st.durMax} min` });
  if (kind === 'stage' && st.daysMin) brief.push({ k: 'Durée', v: st.daysMin === st.daysMax ? plural(st.daysMin, 'jour') : `${st.daysMin} à ${st.daysMax} jours` });
  if (kind === 'bapteme') brief.push({ k: 'Enfants', v: st.kids ? `${plural(st.kids, 'formule')} mentionnent les enfants` : 'Âge minimum selon l’école' });
  if (kind === 'stage' && type) brief.push({ k: 'Niveau', v: type.brief.public });

  // Introduction: hand-written context if we have it, then a data paragraph.
  const extra = PLACE_EXTRA[place.slug]?.[type ? 'stage' : kind];
  const intro: string[] = [];
  if (extra) intro.push(extra);
  else if (type) intro.push(`${plural(st.n, 'école')} ${where} proposent ce type de stage. ${type.lead}`);
  else intro.push(kind === 'bapteme'
    ? `${cap(plural(st.n, 'école'))} ${where} proposent un baptême de parapente en biplace, avec un pilote professionnel : vous n’avez rien à savoir faire avant de voler.`
    : `${cap(plural(st.n, 'école'))} ${where} proposent des stages de parapente, de l’initiation au perfectionnement, avec un moniteur diplômé.`);
  if (st.min != null) {
    intro.push(`Les ${plural(st.offers, 'formule')} relevées chez ces écoles coûtent ${priceTxt}${st.med ? `, avec un prix médian d’environ ${eur(Math.round(st.med))}` : ''}. ${st.checked ? `Prix relevés sur les sites des écoles, dernière vérification le ${dateFr(st.checked)}. ` : ''}Le prix varie avec la durée du vol ou du stage, le site de décollage, la saison et ce qui est inclus (photos, vidéo, navette).`);
  }

  // Questions
  const faq: { q: string; a: string }[] = [];
  if (st.min != null) faq.push({ q: `Combien coûte un ${lc(noun).replace(/ \(.*\)$/, '')} ${where} ?`, a: `Chez les ${plural(st.n, 'école')} répertoriées ${where}, les prix publiés vont ${priceTxt}${st.med ? ` (médiane d’environ ${eur(Math.round(st.med))})` : ''}. Chaque fiche indique ce que comprend le prix et la date à laquelle il a été relevé.` });
  if (kind === 'bapteme' && st.durMin) faq.push({ q: 'Combien de temps dure le vol ?', a: `Selon les formules, le vol dure de ${st.durMin === st.durMax ? `${st.durMin} minutes` : `${st.durMin} à ${st.durMax} minutes`}. Comptez en plus l’accueil, le briefing et la montée au décollage : prévoyez une demi-journée ou le créneau indiqué par l’école.` });
  if (kind === 'bapteme') faq.push({ q: 'Un enfant peut-il faire un baptême ?', a: st.kids ? `Certaines écoles ${where} acceptent les enfants : ${plural(st.kids, 'formule')} mentionnent les enfants ou un âge minimal réduit. L’âge et le poids minimum figurent sur la fiche de chaque formule ; en cas de doute, demandez à l’école.` : 'L’âge minimum et le poids minimum dépendent de l’école et de la voile utilisée. Ils figurent sur la fiche de chaque formule ; en cas de doute, demandez à l’école avant de réserver.' });
  if (kind === 'bapteme' && st.winter) faq.push({ q: 'Peut-on voler en hiver ?', a: `Certaines écoles proposent des vols hivernaux (${plural(st.winter, 'formule')} le mentionnent), parfois au départ d’une station. Le vol dépend toujours de la météo et des conditions de neige : l’école décide le jour même.` });
  if (kind === 'stage' && st.daysMin) faq.push({ q: `Combien de jours dure un stage ${type ? lc(type.menu) : 'de parapente'} ?`, a: `Les stages relevés ${where} durent de ${st.daysMin === st.daysMax ? plural(st.daysMin, 'jour') : `${st.daysMin} à ${st.daysMax} jours`}. Les dates et le nombre de places sont précisés par chaque école.` });
  if (kind === 'stage' && type) faq.push({ q: `Faut-il un niveau particulier pour un stage ${lc(type.menu)} ?`, a: type.prerequis[0] });
  faq.push({ q: 'Comment réserver ?', a: 'Choisissez une école et une formule. Selon la fiche, envoyez une demande gratuite ou consultez le site de l’école. Elle confirme le créneau et gère le paiement.' });
  faq.push({ q: 'Que se passe-t-il si la météo est mauvaise ?', a: 'Le vol dépend du vent et des conditions du jour : l’école reporte ou annule si elle juge que la sécurité n’est pas assurée. Les conditions de report ou de remboursement sont celles de l’école ; demandez-les au moment de la réservation.' });

  // Links
  const other = kind === 'bapteme' ? 'stage' : 'bapteme';
  const otherHas = placesFor(other).some((p) => p.slug === place.slug);
  const links: { href: string; label: string; text: string }[] = [];
  if (type) links.push({ href: pathOf('stage', place), label: `Tous les stages ${where}`, text: 'Tous les niveaux et toutes les écoles de la zone.' });
  if (type) links.push({ href: `/stage/${type.slug}/`, label: `Stage ${lc(type.menu)} : le guide`, text: 'Programme, prérequis, matériel, questions fréquentes.' });
  if (otherHas) links.push({ href: pathOf(other, place), label: other === 'stage' ? `Stages de parapente ${where}` : `Baptême de parapente ${where}`, text: other === 'stage' ? 'Apprendre à voler seul : écoles et prix.' : 'Voler en biplace avec un pilote professionnel.' });
  if (kind === 'bapteme') links.push({ href: '/bapteme/biplace-saut-en-parapente/', label: 'Baptême : tout savoir avant de voler', text: 'Déroulé, préparation, âge, poids, photos, météo.' });
  links.push({ href: kind === 'bapteme' ? '/prix-bapteme-parapente/' : '/prix-stage-parapente/', label: kind === 'bapteme' ? 'Prix d’un baptême de parapente' : 'Prix d’un stage de parapente', text: 'Tarifs relevés par région.' });

  const upcoming = kind === 'stage' ? sessionsOf(list, type?.key).slice(0, 6) : [];
  const types = kind === 'stage' && !type ? typePagesFor(place) : [];
  return { h1, title, description, brief, intro, faq, links, upcoming, types, list, st, noun, where };
}
