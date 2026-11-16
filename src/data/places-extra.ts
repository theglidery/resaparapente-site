// Short hand-written context for the best-known places (shown on the local pages). Keep it factual and hedged;
// a certified instructor or a local school should validate each line before launch. Place slug -> text.
// Places without an entry get a generic introduction computed from the data (src/lib/local-content.ts).
export const PLACE_EXTRA: Record<string, { bapteme?: string; stage?: string }> = {
  'haute-savoie': {
    bapteme: 'La Haute-Savoie réunit le lac d’Annecy, la vallée de l’Arve et le massif du Mont-Blanc : c’est l’un des endroits où l’on trouve le plus d’écoles de parapente en France. Selon l’école, le vol part d’un site de moyenne montagne au-dessus d’un lac ou d’une vallée, ou d’une station.',
    stage: 'Beaucoup de stages se déroulent en Haute-Savoie, avec des pentes-écoles et des sites de décollage variés. Les écoles y accueillent aussi des pilotes confirmés pour du perfectionnement.',
  },
  annecy: {
    bapteme: 'Le lac d’Annecy et les montagnes qui l’entourent sont parmi les sites de vol les plus connus des Alpes. Plusieurs écoles volent autour du lac, avec un atterrissage souvent proche de l’eau, selon la formule et la météo.',
  },
  isere: {
    bapteme: 'L’Isère offre des vols en moyenne et haute montagne (Vercors, Chartreuse, Oisans) et abrite l’un des hauts lieux historiques du vol libre, à Saint-Hilaire-du-Touvet.',
    stage: 'L’Isère propose des stages dans les massifs du Vercors, de Chartreuse et de l’Oisans, avec des écoles à proximité de Grenoble.',
  },
  savoie: {
    bapteme: 'En Savoie, les vols partent des stations de Tarentaise et de Maurienne ou des environs du lac du Bourget, avec des décollages souvent accessibles en remontée mécanique.',
  },
  'hautes-alpes': {
    bapteme: 'Les Hautes-Alpes proposent des vols au-dessus du lac de Serre-Ponçon, autour d’Embrun, de Gap ou du Briançonnais, avec un ensoleillement souvent favorable.',
  },
  'alpes-de-haute-provence': {
    bapteme: 'Les Alpes-de-Haute-Provence sont connues pour les vols au-dessus des lacs et des gorges du Verdon, notamment autour de Saint-André-les-Alpes.',
  },
  'alpes-maritimes': {
    bapteme: 'Dans les Alpes-Maritimes, certains vols survolent la Méditerranée ou l’arrière-pays niçois, selon le site de décollage choisi par l’école.',
  },
  'la-reunion': {
    bapteme: 'À La Réunion, les vols survolent l’océan Indien et les reliefs de l’île ; la côte ouest autour de Saint-Leu est un site de parapente très fréquenté.',
  },
  gironde: {
    bapteme: 'En Gironde, la dune du Pilat, la plus haute dune d’Europe, attire des vols de pente au bord de l’océan. Les conditions et la réglementation locales s’appliquent : l’école vous indique ce qui est possible.',
  },
  aveyron: {
    bapteme: 'L’Aveyron et les causses autour de Millau offrent des vols au-dessus de paysages de plateaux et de gorges.',
  },
  'auvergne-rhone-alpes': {
    bapteme: 'Auvergne-Rhône-Alpes concentre la majorité des écoles répertoriées : Alpes du Nord, Vercors, Chartreuse, Massif central. On y vole en montagne comme en moyenne montagne, avec une grande variété de sites.',
  },
  occitanie: {
    bapteme: 'L’Occitanie réunit les Pyrénées, les causses et le littoral méditerranéen : des vols avec vue sur la chaîne pyrénéenne ou sur les plateaux, selon l’école.',
  },
  "provence-alpes-cote-d-azur": {
    bapteme: 'En Provence-Alpes-Côte d’Azur, on vole dans les Alpes du Sud, au-dessus des lacs, des gorges ou près de la mer, avec un climat souvent ensoleillé.',
  },
};
