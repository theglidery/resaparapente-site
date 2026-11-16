// Shows the Google Maps rating of the school, read live from our function when the block comes into view.
// Never stored (Google's terms). If the function is not available the block stays hidden.
const box = document.querySelector('.google-rating[data-place]');
if (box) {
  const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const load = async () => {
    try {
      const r = await fetch(`/api/google-rating?place=${encodeURIComponent(box.dataset.place)}`, { headers: { accept: 'application/json' } });
      if (!r.ok) return;
      const d = await r.json();
      if (typeof d.rating !== 'number') return;
      box.querySelector('.g-stars').textContent = '★'.repeat(Math.round(d.rating)) + '☆'.repeat(5 - Math.round(d.rating));
      box.querySelector('.g-val').textContent = `${fmt(d.rating)}/5`;
      box.querySelector('.g-count').textContent = d.count ? ` (${d.count} avis)` : '';
      const a = box.querySelector('a.g-link'); if (d.url) { a.href = d.url; a.hidden = false; }
      box.hidden = false;
      window.rpTrack?.('google_rating_shown', { school_id: box.dataset.school });
    } catch { /* stays hidden */ }
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en.some((e) => e.isIntersecting)) { io.disconnect(); load(); } });
    io.observe(box.parentElement || box);
  } else load();
}
