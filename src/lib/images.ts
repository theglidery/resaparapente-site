// Finds images at build time. Nothing is required: every image slot has a fallback.
// Folders (inside /public): see IMAGES.md.
import fs from 'node:fs';
import path from 'node:path';
import photosRaw from '../data/photos.json';
import { SITE } from '../config';

const PUB = path.resolve(process.cwd(), 'public');
const EXT = ['avif', 'webp', 'jpg', 'jpeg', 'png', 'svg'];

export function findImage(rel: string): string | null {
  for (const e of EXT) if (fs.existsSync(path.join(PUB, `${rel}.${e}`))) return `/${rel}.${e}`;
  return null;
}

export type LibraryPhoto = { id: string; file: string; type: string; place: string | null; alt: string | null; credit: string | null; licence: string | null; defaultFor: string | null };
const library = photosRaw as unknown as LibraryPhoto[];
const libSrc = (p: LibraryPhoto) => `/images/library/${p.file.replace(/^.*library\//, '')}`;

export type Pic = { src: string; alt: string; credit?: string | null; own?: boolean };

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function heroImage(name: string) {
  const desktop = findImage(`images/hero/${name}`);
  const mobile = findImage(`images/hero/${name}-mobile`);
  return desktop ? { desktop, mobile } : null;
}

type SchoolLike = { slug: string; name: string; logoShow: boolean; photoMainId: string | null; photoExtraIds: string[]; photoCredit: string | null; baptemes: unknown[]; stages: unknown[] };

export function schoolImages(s: SchoolLike) {
  // Logo: the file public/schools/<slug>/logo.*, shown unless the workbook says "Afficher le logo" = Non.
  const logoFile = findImage(`schools/${s.slug}/logo`);
  const logo = logoFile && s.logoShow ? logoFile : null;

  // Main picture: the school's own file, else the library photo named in the workbook,
  // else an automatic pick from the library (same type, stable for a given school).
  const own = findImage(`schools/${s.slug}/main`);
  let main: Pic | null = null;
  if (own) main = { src: own, alt: `${s.name} : photo de l’école`, credit: s.photoCredit, own: true };
  else {
    let p = s.photoMainId ? library.find((x) => x.id === s.photoMainId) : undefined;
    if (!p) {
      const type = s.baptemes.length ? 'Baptême' : 'Stage';
      const pool = library.filter((x) => x.type === type);
      if (pool.length) p = pool[hash(s.slug) % pool.length];
    }
    if (p) main = { src: libSrc(p), alt: p.alt ?? '', credit: p.credit };
  }

  // Up to three smaller pictures: school files photo-2..4.*, else library ids from the workbook.
  const extras: Pic[] = [];
  for (const n of [2, 3, 4]) {
    const f = findImage(`schools/${s.slug}/photo-${n}`);
    if (f) extras.push({ src: f, alt: `${s.name} : photo ${n}`, own: true });
  }
  for (const id of s.photoExtraIds) {
    const p = library.find((x) => x.id === id);
    if (p && extras.length < 3) extras.push({ src: libSrc(p), alt: p.alt ?? '', credit: p.credit });
  }
  return { logo, main, extras: extras.slice(0, 3) };
}

/** School video: an own file public/schools/<slug>/video.mp4, or a YouTube / Vimeo URL from the workbook. Loaded only on click (no third party before). */
export function schoolVideo(s: { slug: string; video?: string | null; name: string }) {
  if (fs.existsSync(path.join(PUB, `schools/${s.slug}/video.mp4`))) return { kind: 'file' as const, src: `/schools/${s.slug}/video.mp4`, title: `${s.name} : vidéo` };
  const u = s.video; if (!u) return null;
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: 'embed' as const, src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`, thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`, title: `${s.name} : vidéo` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: 'embed' as const, src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`, thumb: null, title: `${s.name} : vidéo` };
  return /\.mp4($|\?)/i.test(u) ? { kind: 'file' as const, src: u, title: `${s.name} : vidéo` } : null;
}
