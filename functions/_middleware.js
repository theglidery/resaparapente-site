import { markets, redirectDomains } from '../markets.mjs';
import { PAGES, LOCALES } from '../src/i18n/routes.mjs';

const marketByHost = Object.fromEntries(Object.entries(markets).flatMap(([code, market]) => {
  const host = new URL(market.origin).hostname;
  return [[host, code], ['www.' + host, code]];
}));

const privatePath = /^\/_markets(?:\/|$)/;
// Localized pages (comparators, guides, gift, pathway) are generated from the route registry, so a new page needs no change here.
const slugs = [...new Set(Object.values(PAGES).flatMap((p) => Object.values(p)).filter(Boolean))].join('|');
const langs = LOCALES.filter((l) => l !== 'fr').join('|');
const regionalPage = new RegExp(`^/(?:$|(?:bapteme|stage|calendrier)/?$|ecoles/[^/]+/?$|(?:${langs})/schools/[^/]+/?$|robots\\.txt$|sitemap-(?:index|\\d+)\\.xml$|(?:${langs})/?$|(?:(?:${langs})/)?(?:${slugs})/?$)`);

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return new Response('URL invalide', { status: 400 }); }
  if (privatePath.test(path)) return new Response('Page introuvable', { status: 404 });
  // Extra domains (see markets.mjs) only redirect to a central market site. Query string is kept (campaign tags) and the brand is added when set.
  const bare = url.hostname.replace(/^www\./, '');
  const alias = Object.hasOwn(redirectDomains, bare) ? redirectDomains[bare] : null;
  if (alias) {
    const target = new URL(markets[alias.to].origin);
    const prefixed = alias.locale && alias.locale !== 'fr' && path !== `/${alias.locale}` && !path.startsWith(`/${alias.locale}/`);
    target.pathname = prefixed ? `/${alias.locale}${url.pathname}` : url.pathname;
    target.search = url.search;
    if (alias.brand) target.searchParams.set('brand', alias.brand);
    return Response.redirect(target, 301);
  }
  const market = Object.hasOwn(marketByHost, url.hostname) ? marketByHost[url.hostname] : null;
  if (market && url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url, 308);
  }
  if (market === 'FR') return next();
  if (!market) {
    const response = new Response(await next());
    response.headers.set('X-Robots-Tag', 'noindex');
    return response;
  }
  if (path.startsWith('/api/')) return new Response('Page introuvable', { status: 404 });
  if (/^\/(?:_astro|images|documents)\//.test(path) || ['/favicon.png', '/apple-touch-icon.png'].includes(path)) return next();
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });

  const prefix = '/_markets/' + market.toLowerCase();
  const asset = async (pathname, init = {}) => {
    const target = new URL(url);
    target.pathname = prefix + pathname;
    target.search = '';
    return env.ASSETS.fetch(new Request(target, { method: request.method, ...init }));
  };
  if (regionalPage.test(path)) {
    if (!path.endsWith('/') && !path.includes('.')) {
      url.pathname += '/';
      return Response.redirect(url, 308);
    }
    if (path.endsWith('/') || path === '/robots.txt' || path.endsWith('.xml')) {
      const response = await asset(path);
      if (response.status === 200) return response;
    }
  }
  const missing = await asset('/404.html');
  return new Response(missing.status === 200 ? missing.body : request.method === 'HEAD' ? null : 'Page introuvable', {
    status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}
