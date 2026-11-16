// robots.txt is generated: draft mode blocks everything, the launch build (PUBLIC_DRAFT=0) allows crawling and points to the sitemap.
import { SITE } from '../config';
export function GET() {
  const body = SITE.draft
    ? '# Draft: nothing indexed. Build with PUBLIC_DRAFT=0 for the launch.\nUser-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
