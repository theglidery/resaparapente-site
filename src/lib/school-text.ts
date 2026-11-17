// Data-driven pieces of a school page: an introduction when the workbook has no description, nearby schools and local page links.
import { schools, eur, offerPrice, LEVELS, type School } from './data';
import { placesFor, pathOf, distanceKm, statsOf, type Kind } from './places';

const list = (t: string[]) => (t.length <= 1 ? t.join('') : `${t.slice(0, -1).join(', ')} et ${t[t.length - 1]}`);

/** Facts only (place, activity, flying sites, labels, languages). Never lists formulas/prices already shown below. */
export function schoolIntro(s: School): string {
  const parts: string[] = [];
  const loc = [s.city, s.dept && s.dept !== 'À vérifier' ? s.dept : null, s.region && s.region !== 'À vérifier' ? s.region : null].filter(Boolean).join(', ');
  const acts = [s.baptemes.length ? 'des baptêmes en biplace' : null, s.stages.length ? 'des stages de parapente' : null].filter(Boolean);
  parts.push(`${s.name} est une école de parapente${loc ? ` située à ${loc}` : ''}${acts.length ? ` qui propose ${list(acts as string[])}` : ''}.`);
  if (s.sites?.length) parts.push(`Sites de vol : ${list(s.sites.slice(0, 5).map((x) => x.name))}.`);
  if (s.fiche?.labels) parts.push(`Labels et agréments : ${s.fiche.labels}.`);
  if (s.fiche?.langues) parts.push(`Langues parlées : ${s.fiche.langues}.`);
  if (acts.length) parts.push('Choisissez une formule ci-dessous et envoyez votre demande gratuite : l’école vous répond directement pour fixer le créneau selon la météo.');
  return parts.join(' ');
}

export function nearbySchools(s: School, kind: Kind | null, n = 6) {
  if (!s.lat || !s.lng) return [];
  return schools
    .filter((x) => x.id !== s.id && x.lat && x.lng && (kind ? (kind === 'bapteme' ? x.baptemes.length : x.stages.length) : x.baptemes.length || x.stages.length))
    .map((x) => ({ s: x, d: distanceKm({ lat: s.lat as number, lng: s.lng as number }, { lat: x.lat as number, lng: x.lng as number }) }))
    .filter((x) => x.d <= 60).sort((a, b) => a.d - b.d).slice(0, n);
}

/** Local pages that list this school: its département, and the nearest search city when it has a page. */
export function placeLinksFor(s: School) {
  const out: { href: string; label: string }[] = [];
  for (const kind of ['bapteme', 'stage'] as Kind[]) {
    if (!(kind === 'bapteme' ? s.baptemes.length : s.stages.length)) continue;
    const places = placesFor(kind);
    const dept = places.find((p) => p.type === 'dept' && p.name === s.dept && p.schools[kind].some((x) => x.id === s.id));
    const word = kind === 'bapteme' ? 'Baptême de parapente' : 'Stage de parapente';
    if (dept) out.push({ href: pathOf(kind, dept), label: `${word} ${dept.inName}` });
    if (s.lat && s.lng) {
      const city = places.filter((p) => p.type === 'city' && p.lat && p.schools[kind].some((x) => x.id === s.id))
        .sort((a, b) => distanceKm({ lat: s.lat as number, lng: s.lng as number }, { lat: a.lat as number, lng: a.lng as number }) - distanceKm({ lat: s.lat as number, lng: s.lng as number }, { lat: b.lat as number, lng: b.lng as number }))[0];
      if (city) out.push({ href: pathOf(kind, city), label: `${word} ${city.inName}` });
    }
  }
  return out;
}
export { offerPrice };
