// Data-driven pieces of a school page: an introduction when the workbook has no description, nearby schools and local page links.
import { schools, eur, offerPrice, LEVELS, type School } from './data';
import { placesFor, pathOf, distanceKm, statsOf, type Kind } from './places';

const list = (t: string[]) => (t.length <= 1 ? t.join('') : `${t.slice(0, -1).join(', ')} et ${t[t.length - 1]}`);

/** Facts only (place, number of formulas, price range, flight length, stage levels). Never invented. */
export function schoolIntro(s: School): string {
  const parts: string[] = [];
  parts.push(`${s.name} est une école de parapente${s.city ? ` située à ${s.city}` : ''}${s.dept ? ` (${s.dept})` : ''}.`);
  const b = statsOf([s], 'bapteme'), st = statsOf([s], 'stage');
  if (s.baptemes.length) {
    const price = b.min != null ? (b.max && b.max !== b.min ? `, de ${eur(b.min)} à ${eur(b.max)} par personne` : `, à ${eur(b.min)} par personne`) : '';
    const dur = b.durMin ? ` Les vols durent ${b.durMin === b.durMax ? `${b.durMin} minutes` : `de ${b.durMin} à ${b.durMax} minutes`}.` : '';
    parts.push(`Elle propose ${s.baptemes.length > 1 ? `${s.baptemes.length} formules` : 'une formule'} de baptême en biplace${price}.${dur}`);
  }
  if (s.stages.length) {
    const levels = LEVELS.filter((l) => l.key !== 'autre' && s.stages.some((o) => o.levelKey === l.key)).map((l) => l.name.split(',')[0].toLowerCase());
    parts.push(`Côté stages, ${s.stages.length > 1 ? `${s.stages.length} formules` : 'une formule'}${levels.length ? ` (${list(levels.slice(0, 4))})` : ''}${st.min != null ? `, dès ${eur(st.min)}` : ''}.`);
  }
  if (s.fiche?.labels) parts.push(`Labels et agréments indiqués : ${s.fiche.labels}.`);
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
