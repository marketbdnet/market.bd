import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Admin password check (server-side). The password is NOT in the website code;
 * it lives only in the environment variable ADMIN_PASSWORD.
 */
const attempts = new Map<string, number[]>();
const EPHEMERAL_SIGNING_KEY = randomBytes(32).toString('hex');

function getSigningKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    EPHEMERAL_SIGNING_KEY
  );
}

export function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function signAdminToken(ttlMs = 8 * 60 * 60 * 1000): string {
  const exp = Date.now() + ttlMs;
  const payload = `admin.${exp}`;
  const sig = createHmac('sha256', getSigningKey()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSig = createHmac('sha256', getSigningKey()).update(payload).digest('hex');
  return safeCompareStrings(parts[2], expectedSig);
}

export function verifyAdminRequest(req: any): boolean {
  const authHeader = String(req?.headers?.authorization || '').trim();
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (expected) {
    const headerPass = String(
      req?.headers?.['x-admin-password'] || req?.headers?.['x-admin-secret'] || ''
    ).trim();
    if (safeCompareStrings(headerPass, expected)) return true;
  }

  return false;
}

export default function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const configured = Boolean(process.env.ADMIN_PASSWORD);
    return res.status(200).json({
      ok: true,
      configured,
      canClaim: !configured,
      authenticated: verifyAdminRequest(req)
    });
  }

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
  const ok = safeCompareStrings(String(body.password || ''), expected);
  if (!ok) {
    return res.status(401).json({ ok: false });
  }
  return res.status(200).json({ ok: true, token: signAdminToken() });
}
