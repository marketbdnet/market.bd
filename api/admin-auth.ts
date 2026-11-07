import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';

/**
 * Admin password check (server-side). The password is NOT in the website code;
 * it lives only in the Vercel Environment Variable ADMIN_PASSWORD.
 */
const attempts = new Map<string, number[]>();

export default function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(503).json({ ok: false, code: 'NOT_CONFIGURED' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 8) return res.status(429).json({ ok: false, code: 'TOO_MANY' });
  recent.push(now);
  attempts.set(ip, recent);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const given = Buffer.from(String(body.password || ''));
  const want = Buffer.from(expected);
  const ok = given.length === want.length && timingSafeEqual(given, want);
  return res.status(ok ? 200 : 401).json({ ok });
}
