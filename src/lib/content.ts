// Builds the four information tabs shown for a chosen formula (practical info, school, flight/stage details, voucher).
// Order of fallback for each line: the formula's own column > the school's column > data already collected > generic text
// (editable in the workbook sheet "Textes génériques").
import generic from '../data/generic.json';
import { eur, type Gift, type Offer, type School } from './data';

const G = generic as Record<string, string>;
export const g = (k: string) => G[k] ?? '';
export type Item = { label: string; text: string };
export type Tab = { id: string; title: string; items: Item[]; link?: { href: string; label: string } };
const has = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const first = (...v: (string | null | undefined)[]) => v.find(has);
const item = (label: string, ...parts: (string | null | undefined)[]): Item | null => {
  const t = parts.filter(has).join('\n');
  return t ? { label, text: t } : null;
};
const clean = (xs: (Item | null)[]) => xs.filter((x): x is Item => !!x);

export function offerTabs(s: School, o: Offer, kind: 'bapteme' | 'stage', gifts: Gift[] = []): Tab[] {
  const f = o.fiche ?? {}, x = o.extra ?? {}, sf = s.fiche;
  const B = kind === 'bapteme';
  const k = B ? 'bapteme' : 'stage';
  const labels = sf?.labels ? `Labels et agréments : ${sf.labels}.` : null;
  const cancel = has(x.cancel) ? `Météo et annulation : ${x.cancel}` : null;

  const infos = B
    ? clean([
        item('Saison et jours d’ouverture', first(f.saison, o.period) ?? g('bapteme.infos.saison')),
        item('Conditions de participation',
          has(f.participation) ? f.participation : [o.age, has(o.weight) ? `Poids : ${o.weight}` : null].filter(has).join(' · '),
          has(f.participation) ? null : g('bapteme.infos.participation')),
        item('Temps à prévoir sur place', first(f.temps, x.timeTotal) ?? g('bapteme.infos.temps')),
        item('Tenue et affaires à prévoir', first(f.tenue, x.equipment) ?? g('bapteme.infos.tenue')),
        item('Langues parlées', first(f.langues, sf?.langues) ?? g('bapteme.infos.langues')),
        item('Bon à savoir', f.savoir, cancel, labels, has(f.savoir) ? null : g('bapteme.infos.savoir')),
      ])
    : clean([
        item('Saison et dates', first(f.saison, o.period) ?? g('stage.infos.saison')),
        item('Conditions de participation',
          has(f.participation) ? f.participation : [o.age, has(o.level) ? `Niveau : ${o.level}` : null].filter(has).join(' · '),
          has(f.participation) ? null : g('stage.infos.participation')),
        item('À apporter', first(f.apporter, x.equipment) ?? g('stage.infos.apporter')),
        item('Hébergement et repas', first(f.hebergement) ?? g('stage.infos.hebergement')),
        item('Bon à savoir', f.savoir, cancel, labels, has(f.savoir) ? null : g('stage.infos.savoir')),
      ]);

  const school = clean([
    item('Votre école', first(sf?.presentation, s.desc) ?? g('ecole.presentation'), labels),
    item('Aux commandes', sf?.commandes, g(B ? 'ecole.commandes' : 'stage.ecole.commandes')),
    item('L’appareil', first(sf?.appareil) ?? g(B ? 'ecole.appareil' : 'stage.ecole.appareil')),
  ]);

  const detail = B
    ? clean([
        item('Photos et vidéo',
          f.photos === 'Oui' ? g('bapteme.vol.photos.oui') : f.photos === 'Non' ? g('bapteme.vol.photos.non') : g('bapteme.vol.photos.inconnu')),
        item('Le vol', first(f.vol, o.program) ?? g('bapteme.vol.programme')),
        item('Inclus', o.included), item('Non compris', o.notIncluded), item('Options et suppléments', x.options),
      ])
    : clean([
        item('Programme', first(f.programme, o.program) ?? g('stage.detail.programme')),
        item('Nombre de vols', has(o.flights) ? String(o.flights) : null),
        item('Effectif', o.group),
        item('Inclus', o.included), item('Non compris', o.notIncluded), item('Options et suppléments', x.options),
      ]);

  const tabs: Tab[] = [
    { id: 'infos', title: 'Infos pratiques', items: infos },
    { id: 'ecole', title: 'Votre école et pilote', items: school },
    { id: 'detail', title: B ? 'Détails du vol' : 'Détails du stage', items: detail },
  ];
  // The school's own voucher, only when it announces one that covers this kind of formula. We link to its sales page.
  const gf = gifts.find((x) => !x.kind || x.kind === 'Montant libre' || x.kind === 'Baptême et stage' || x.kind === (B ? 'Baptême' : 'Stage'));
  if (gf) {
    tabs.push({
      id: 'bon', title: 'Bon cadeau de l’école', link: { href: gf.url, label: 'Voir le bon cadeau sur le site de l’école' },
      items: clean([
        item('Bon proposé par l’école', gf.name),
        item('Prix', gf.price ? `${eur(gf.price)} TTC` : 'Affiché par l’école sur sa page de vente.'),
        item('Validité', gf.validity ? `${gf.validity} mois` : null),
        item('Conditions essentielles', gf.conditions),
        item('Qui vend le bon ?', `Le bon est vendu et géré par ${s.name}. L’achat, le paiement et l’envoi du bon se font sur son site.`),
      ]),
    });
  }
  return tabs;
}
