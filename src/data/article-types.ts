// Shared shape of the editorial pages (baptême guide, learning pages, brevets, courses).
// Sections are rendered in this order by src/components/Sections.astro: p, ul, steps, table, note.
export type Section = {
  id: string; h: string;
  p?: string[]; ul?: string[]; steps?: { t: string; d: string }[]; table?: string[][]; note?: string;
};
export type Article = {
  slug: string;                       // path under its section, e.g. 'brevets/initial'
  title: string;                      // <title> and H1
  h1?: string; lead: string; description: string;
  brief?: { k: string; v: string }[]; // the "En bref" tiles
  sections: Section[];
  faq?: { q: string; a: string }[];
  next?: { href: string; label: string; text: string }[]; // "Pour aller plus loin"
  photo?: { src: string; alt: string };
  sources?: { href: string; label: string }[];
  parent?: { href: string; label: string };
};
