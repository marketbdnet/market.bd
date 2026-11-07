import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';

/**
 * MarketBD.Net SMS endpoint (runs on the server, never in the browser).
 *
 * Required Vercel Environment Variables:
 *   SMS_API_KEY       -> your bulksmsdhaka.net API key (kept secret here)
 *   SMS_ADMIN_SECRET  -> a long random password only the admin knows
 *                        (protects "send message" and "balance")
 * Optional:
 *   SMS_CALLER_ID     -> masking brand name. If empty -> non-masking "1234"
 *   SMS_OTP_SECRET    -> secret used to sign OTP tokens (defaults to SMS_API_KEY)
 *   SMS_OTP_TEMPLATE  -> fallback OTP text, use {otp} as the code placeholder
 */

const GATEWAY = 'https://bulksmsdhaka.net/api';
const FIRESTORE_CFG_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents/settings/sms_config';
const DEFAULT_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';
const OTP_TTL_MS = 5 * 60 * 1000;

// Very small in-memory throttle (per server instance) to limit SMS abuse.
const hits = new Map<string, number[]>();
function tooMany(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

function sign(secret: string, phone: string, code: string, exp: number): string {
  return createHmac('sha256', secret).update(`${phone}|${code}|${exp}`).digest('hex');
}

function normalizePhone(raw: string): string | null {
  const digits = String(raw || '').replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('880')) local = local.slice(2);
  if (local.length === 10 && local.startsWith('1')) local = '0' + local;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

async function readRemoteConfig(): Promise<{ template?: string; masking?: boolean }> {
  try {
    const r = await fetch(FIRESTORE_CFG_URL);
    if (!r.ok) return {};
    const j: any = await r.json();
    const f = j?.fields || {};
    return {
      template: f.otpTemplate?.stringValue,
      masking: f.maskingEnabled?.booleanValue
    };
  } catch {
    return {};
  }
}

async function callGateway(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${GATEWAY}/${path}?${qs}`);
  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* keep raw */ }
  return { httpStatus: r.status, json, raw: text };
}

const GATEWAY_HINTS: Record<string, string> = {
  '1018': 'API key দেওয়া হয়নি।',
  '1015': 'API key ভুল (Authorization failed)। Vercel-এ SMS_API_KEY ঠিক আছে কিনা দেখুন।',
  '1014': 'গেটওয়ের সার্ভারে সমস্যা।',
  '1013': 'আপনার SMS প্যাকেজের মেয়াদ শেষ (Balance Validity)। রিচার্জ করুন।',
  '2001': 'ব্যালেন্স শেষ। রিচার্জ করুন।',
  '1012': 'মাসকিং SMS অবশ্যই বাংলা অক্ষরে পাঠাতে হয়।',
  '1011': 'এই Sender ID (ব্র্যান্ড নাম) আপনার একাউন্টে অনুমোদিত নেই।',
  '1010': 'আপনার bulksmsdhaka একাউন্ট বন্ধ করা আছে।',
  '1009': 'আপনার একাউন্ট এখনো ভেরিফাই হয়নি। bulksmsdhaka-কে জানান।',
  '1008': 'IP whitelist চালু আছে। bulksmsdhaka প্যানেলে whitelist বন্ধ করুন (Vercel-এর IP বদলায়)।',
  '1006': 'মেসেজের লেখা গেটওয়ে গ্রহণ করেনি (Content Validation)।',
  '1005': 'SPAM হিসেবে ধরা পড়েছে।',
  '1003': 'রিকোয়েস্ট ব্যর্থ হয়েছে।'
};

function hintFor(g: { json: any; raw: string; httpStatus: number }): string {
  const code = String(g.json?.Status ?? '');
  const base = GATEWAY_HINTS[code];
  if (base) return `কোড ${code}: ${base}`;
  if (g.json?.Message) return `কোড ${code || '?'}: ${g.json.Message}`;
  return `গেটওয়ে অপ্রত্যাশিত উত্তর দিয়েছে (HTTP ${g.httpStatus}): ${String(g.raw).slice(0, 120)}`;
}

const isOk = (j: any) => !!j && (String(j.Success) === 'true' || String(j.Status) === '1000');

// Try with the masking name first; if the gateway rejects the sender id (1011)
// or the language rule (1012), retry once as normal non-masking (callerID 1234).
async function sendWithFallback(path: string, base: Record<string, string>, callerID: string) {
  let g = await callGateway(path, { ...base, callerID });
  let usedCaller = callerID;
  if (!isOk(g.json) && callerID !== '1234' && ['1011', '1012'].includes(String(g.json?.Status))) {
    g = await callGateway(path, { ...base, callerID: '1234' });
    usedCaller = '1234';
  }
  return { g, usedCaller };
}

function isAdmin(req: any, adminSecret: string | undefined): boolean {
  const given = String(req.headers['x-admin-secret'] || '');
  if (!adminSecret || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(adminSecret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ ok: false, code: 'NOT_CONFIGURED', error: 'SMS service is not configured on the server.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = String(body.action || '');
  const otpSecret = process.env.SMS_OTP_SECRET || apiKey;
  const adminSecret = process.env.SMS_ADMIN_SECRET;
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  try {
    // ---- 1) Send OTP to a customer -------------------------------------
    if (action === 'send_otp') {
      const phone = normalizePhone(body.phone);
      if (!phone) return res.status(400).json({ ok: false, error: 'সঠিক মোবাইল নম্বর দিন।' });
      if (tooMany(`ip:${ip}`, 8, 10 * 60 * 1000) || tooMany(`ph:${phone}`, 3, 10 * 60 * 1000)) {
        return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' });
      }

      const cfg = await readRemoteConfig();
      const template = (cfg.template || process.env.SMS_OTP_TEMPLATE || DEFAULT_TEMPLATE).trim();
      const masking = cfg.masking ?? !!process.env.SMS_CALLER_ID;
      const callerID = masking && process.env.SMS_CALLER_ID ? process.env.SMS_CALLER_ID : '1234';

      const code = String(randomInt(100000, 1000000));
      const message = template.replace(/\{otp\}/gi, code);
      if (message.length > 70) {
        return res.status(500).json({ ok: false, error: 'OTP মেসেজ ৭০ অক্ষরের বেশি। অ্যাডমিন প্যানেলে টেমপ্লেট ছোট করুন।' });
      }

      const { g } = await sendWithFallback('otpsend', { apikey: apiKey, number: phone, message }, callerID);
      if (!isOk(g.json)) {
        const hint = hintFor(g);
        console.error('SMS gateway failure:', hint, g.raw);
        const statusCode = String(g.json?.Status ?? 'N/A');
        return res.status(502).json({ ok: false, error: `এসএমএস পাঠানো যায়নি (কোড ${statusCode})। কিছুক্ষণ পর আবার চেষ্টা করুন।`, hint, gateway: g.json || g.raw });
      }

      const exp = Date.now() + OTP_TTL_MS;
      // The code itself is NEVER sent back to the browser, only a signed token.
      return res.status(200).json({ ok: true, token: sign(otpSecret, phone, code, exp), exp });
    }

    // ---- 2) Verify the OTP typed by the customer ------------------------
    if (action === 'verify_otp') {
      const phone = normalizePhone(body.phone);
      const code = String(body.code || '').trim();
      const exp = Number(body.exp);
      const token = String(body.token || '');
      if (!phone || !/^\d{6}$/.test(code) || !exp || !token) return res.status(400).json({ ok: false, error: 'অবৈধ অনুরোধ।' });
      if (tooMany(`vf:${phone}`, 10, 10 * 60 * 1000)) return res.status(429).json({ ok: false, error: 'অনেকবার ভুল চেষ্টা। কিছুক্ষণ পর আবার চেষ্টা করুন।' });
      if (Date.now() > exp) return res.status(400).json({ ok: false, expired: true, error: 'ওটিপির মেয়াদ শেষ। নতুন কোড নিন।' });

      const expected = sign(otpSecret, phone, code, exp);
      const a = Buffer.from(expected);
      const b = Buffer.from(token);
      const valid = a.length === b.length && timingSafeEqual(a, b);
      return res.status(valid ? 200 : 400).json({ ok: valid, error: valid ? undefined : 'ভুল ওটিপি কোড।' });
    }

    // ---- Admin-only actions ---------------------------------------------
    if (action === 'balance' || action === 'send_text') {
      if (!isAdmin(req, adminSecret)) return res.status(401).json({ ok: false, error: 'অ্যাডমিন সিক্রেট ভুল বা সেট করা নেই।' });

      if (action === 'balance') {
        const g = await callGateway('getBalance', { apikey: apiKey });
        return res.status(200).json({ ok: isOk(g.json), balance: g.json?.Balance ?? null, hint: isOk(g.json) ? undefined : hintFor(g), gateway: g.json || g.raw });
      }

      const phone = normalizePhone(body.phone);
      const message = String(body.message || '').trim();
      if (!phone || !message) return res.status(400).json({ ok: false, error: 'নম্বর ও মেসেজ দিন।' });
      const cfg = await readRemoteConfig();
      const masking = cfg.masking ?? !!process.env.SMS_CALLER_ID;
      const callerID = masking && process.env.SMS_CALLER_ID ? process.env.SMS_CALLER_ID : '1234';
      const { g, usedCaller } = await sendWithFallback('sendtext', { apikey: apiKey, number: phone, message }, callerID);
      const success = isOk(g.json);
      return res.status(success ? 200 : 502).json({
        ok: success,
        usedCaller,
        hint: success ? undefined : hintFor(g),
        gateway: g.json || g.raw
      });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err: any) {
    console.error('sms handler error', err);
    return res.status(500).json({ ok: false, error: 'সার্ভারে সমস্যা হয়েছে।' });
  }
}
