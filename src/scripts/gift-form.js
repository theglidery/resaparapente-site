// Gift request (option B): the visitor picks a school and a formula; the server relays the request to the school's professional address.
// Region filter of the school vouchers is handled here too.
const region = document.getElementById('gift-region');
if (region) {
  const items = [...document.querySelectorAll('#gift-board li')];
  region.addEventListener('input', () => { const v = region.elements.region.value; items.forEach((li) => (li.hidden = !!v && li.dataset.region !== v)); });
}
const form = document.getElementById('gift-form');
if (form) {
  const status = document.getElementById('gift-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    if (!d.schoolId || !d.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '') || !form.elements.consent.checked) { form.reportValidity(); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true; status.textContent = form.dataset.sending;
    const body = { schoolId: d.schoolId, kind: d.kind, formula: d.formula, recipient: d.recipient, contact: { name: d.name, email: d.email, phone: d.phone }, message: d.message, consent: true, website: d.website, requestId: crypto.randomUUID(), market: form.dataset.market, lang: document.documentElement.lang };
    try {
      const r = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(String(r.status));
      status.textContent = form.dataset.ok; form.reset();
      window.rpTrack?.('gift_request_sent', { school_id: body.schoolId });
    } catch {
      const school = form.elements.schoolId.selectedOptions[0]?.textContent || '';
      const text = `${school}\n${d.kind} ${d.formula || ''}\n${d.name} <${d.email}>\n${d.message || ''}`;
      status.innerHTML = '';
      const a = document.createElement('a'); a.href = `mailto:${form.dataset.contact}?subject=${encodeURIComponent('Bon cadeau : ' + school)}&body=${encodeURIComponent(text)}`; a.textContent = form.dataset.mail;
      status.append(form.dataset.fail + ' ', a);
    } finally { btn.disabled = false; }
  });
}
