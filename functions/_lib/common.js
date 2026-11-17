// Shared helpers for Cloudflare Pages Functions (validation, Resend email + D1 logging, HMAC action tokens, Turnstile).

export const respond = (status, body) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const text = (v, max) =>
  typeof v === 'string' && v.trim().length <= max ? v.trim() : '';

export const isoDate = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

export const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function readJsonBody(request, maxBytes = 16384) {
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return { error: respond(403, { error: 'Origine non autorisée.' }) };
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    return { error: respond(415, { error: 'Format invalide.' }) };
  }
  try {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let raw = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { error: respond(413, { error: 'Demande trop longue.' }) };
      }
      raw += decoder.decode(value, { stream: true });
    }
    const data = JSON.parse(raw + decoder.decode());
    if (!data || typeof data !== 'object') {
      return { error: respond(400, { error: 'Demande invalide.' }) };
    }
    return { data };
  } catch {
    return { error: respond(400, { error: 'Demande illisible.' }) };
  }
}

export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (typeof token !== 'string' || !token.trim()) return false;
  try {
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token.trim(),
      ...(ip ? { remoteip: ip } : {}),
    });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    const out = await res.json();
    return Boolean(out?.success);
  } catch {
    return false;
  }
}

export async function sendEmail({
  env,
  db,
  to,
  bcc,
  replyTo,
  subject,
  textBody,
  htmlBody,
  idempotencyKey,
  relatedType,
  relatedId,
  template,
}) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length || !env.RESEND_API_KEY || !env.BOOKING_FROM) {
    return { ok: false, providerId: null };
  }
  const payload = {
    from: env.BOOKING_FROM,
    to: recipients,
    ...(bcc && bcc.length ? { bcc } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject,
    text: textBody,
    ...(htmlBody ? { html: htmlBody } : {}),
  };
  let ok = false;
  let providerId = null;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    const out = await res.json().catch(() => ({}));
    ok = res.ok;
    providerId = typeof out?.id === 'string' ? out.id : null;
  } catch {
    ok = false;
  }
  if (db && relatedType && relatedId) {
    try {
      await db
        .prepare(
          'INSERT INTO email_logs (id, related_type, related_id, recipient, template, status, provider_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          crypto.randomUUID(),
          relatedType,
          relatedId,
          recipients.join(','),
          template || 'email',
          ok ? 'sent' : 'failed',
          providerId,
          new Date().toISOString()
        )
        .run();
    } catch {
      // Best-effort audit log; never block the primary response.
    }
  }
  return { ok, providerId };
}

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const unb64url = (str) => {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signActionToken(secret, payload) {
  const data = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64url(sig)}`;
}

export async function verifyActionToken(secret, token) {
  if (!secret || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.', 2);
  if (!data || !sig) return null;
  try {
    const key = await importHmacKey(secret);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      unb64url(sig),
      new TextEncoder().encode(data)
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(unb64url(data)));
    if (!payload || typeof payload !== 'object') return null;
    if (typeof payload.exp === 'number' && Date.now() > payload.exp) return { expired: true };
    return payload;
  } catch {
    return null;
  }
}
