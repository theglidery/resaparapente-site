// Consent (Google Consent Mode v2 values) and event tracking.
// - Nothing is loaded and nothing is sent before the visitor accepts. If no ID is configured, this file only exposes a no-op rpTrack().
// - Events are declared in the HTML with data-track="event_name" (+ data-school, data-offer, data-kind) or sent from scripts with rpTrack(name, params).
// Event plan (docs/SEA-PLAN.md): select_school, select_offer, begin_request, generate_lead, click_school_site, click_voucher, click_promo, click_school_cta, school_submission.
const KEY = 'rp-consent';
const cfgEl = document.getElementById('rp-analytics');
const cfg = cfgEl ? JSON.parse(cfgEl.textContent || '{}') : {};
const store = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch { /* private mode: the choice lasts for this page only */ } },
};
let granted = false, ready = false;
const queue = [];

function loadGoogle() {
  if (ready || (!cfg.ga4 && !cfg.ads)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.ga4 || cfg.ads)}`;
  document.head.appendChild(s);
  if (cfg.ga4) window.gtag('config', cfg.ga4, { anonymize_ip: true });
  if (cfg.ads) window.gtag('config', cfg.ads);
  ready = true;
  while (queue.length) send(...queue.shift());
}
function send(name, params) {
  if (!ready) return;
  window.gtag('event', name, params);
  if (name === 'generate_lead' && cfg.ads && cfg.adsLeadLabel) window.gtag('event', 'conversion', { send_to: `${cfg.ads}/${cfg.adsLeadLabel}`, ...params });
}
/** Send an event if the visitor accepted; otherwise do nothing. Also a DOM event for debugging and tests. */
window.rpTrack = function (name, params = {}) {
  document.dispatchEvent(new CustomEvent('rp:track', { detail: { name, params, sent: granted } }));
  if (granted) ready ? send(name, params) : queue.push([name, params]);
};

// Click events declared in the HTML
document.addEventListener('click', (e) => {
  const el = e.target instanceof Element ? e.target.closest('[data-track]') : null;
  if (!el) return;
  const d = el.dataset;
  window.rpTrack(d.track, { school_id: d.school, offer_id: d.offer, kind: d.kind, destination: (() => { try { const url = new URL(el.getAttribute('href'), location.origin); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : undefined; } catch { return undefined; } })() });
});

// Banner
const banner = document.getElementById('consent-banner');
const open = () => { if (banner) { banner.hidden = false; banner.querySelector('button')?.focus(); } };
const close = () => { if (banner) banner.hidden = true; };
function choose(v) { store.set(v); close(); if (v === 'granted') { granted = true; loadGoogle(); } else { granted = false; if (ready) { window.gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }); location.reload(); } } }
if (banner && (cfg.ga4 || cfg.ads)) {
  banner.querySelector('[data-consent="granted"]')?.addEventListener('click', () => choose('granted'));
  banner.querySelector('[data-consent="denied"]')?.addEventListener('click', () => choose('denied'));
  document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', open));
  const v = store.get();
  if (v === 'granted') { granted = true; loadGoogle(); } else if (!v) open();
}
