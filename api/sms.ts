import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * MarketBD.Net Unified SMS & OTP Endpoint (runs on the server, never exposes raw API keys to browser).
 *
 * Supports major Bangladesh SMS Provider Companies:
 *  - bulksmsdhaka (BulkSMS Dhaka - bulksmsdhaka.net)
 *  - bulksmsbd    (BulkSMS BD - bulksmsbd.net)
 *  - greenweb     (GreenWeb BD - greenweb.com.bd)
 *  - alphasms     (Alpha SMS - sms.net.bd)
 *  - sslwireless  (SSL Wireless - sslwireless.com)
 *  - elitbuzz     (Elitbuzz / MIMSMS - elitbuzz-bd.com)
 *  - muthofun     (MuthoFun - muthofun.com)
 *  - custom       (Custom Provider Company & HTTP API URL)
 */

export type SmsProviderId =
  | 'bulksmsdhaka'
  | 'bulksmsbd'
  | 'greenweb'
  | 'alphasms'
  | 'sslwireless'
  | 'elitbuzz'
  | 'muthofun'
  | 'custom';

export interface SmsProviderPreset {
  id: SmsProviderId;
  companyName: string;
  defaultApiUrl: string;
  supportsBalance: boolean;
  requiresSid?: boolean;
}

export const SMS_PROVIDER_PRESETS: Record<SmsProviderId, SmsProviderPreset> = {
  bulksmsdhaka: {
    id: 'bulksmsdhaka',
    companyName: 'BulkSMS Dhaka (bulksmsdhaka.net)',
    defaultApiUrl: 'https://bulksmsdhaka.net/api',
    supportsBalance: true,
  },
  bulksmsbd: {
    id: 'bulksmsbd',
    companyName: 'BulkSMS BD (bulksmsbd.net)',
    defaultApiUrl: 'https://bulksmsbd.net/api',
    supportsBalance: true,
  },
  greenweb: {
    id: 'greenweb',
    companyName: 'GreenWeb BD (greenweb.com.bd)',
    defaultApiUrl: 'https://api.greenweb.com.bd/api.php',
    supportsBalance: false,
  },
  alphasms: {
    id: 'alphasms',
    companyName: 'Alpha SMS (sms.net.bd)',
    defaultApiUrl: 'https://api.sms.net.bd',
    supportsBalance: true,
  },
  sslwireless: {
    id: 'sslwireless',
    companyName: 'SSL Wireless (sslwireless.com)',
    defaultApiUrl: 'https://smsplus.sslwireless.com/api/v3/send-sms',
    supportsBalance: false,
    requiresSid: true,
  },
  elitbuzz: {
    id: 'elitbuzz',
    companyName: 'Elitbuzz / MIMSMS (elitbuzz-bd.com)',
    defaultApiUrl: 'https://msg.elitbuzz-bd.com/smsapi',
    supportsBalance: true,
  },
  muthofun: {
    id: 'muthofun',
    companyName: 'MuthoFun (muthofun.com)',
    defaultApiUrl: 'https://sysadmin.muthobarta.com/api/v1/send-sms',
    supportsBalance: false,
  },
  custom: {
    id: 'custom',
    companyName: 'Custom SMS Provider',
    defaultApiUrl: '',
    supportsBalance: false,
  },
};

export interface StoredGatewaySecrets {
  sms?: {
    providerId?: SmsProviderId;
    providerName?: string;
    apiUrl?: string;
    apiKey?: string;
    senderId?: string;
    sid?: string;
    maskingEnabled?: boolean;
    isLiveMode?: boolean;
    otpTemplate?: string;
    adminSecret?: string;
    updatedAt?: string;
  };
  payment?: Record<string, any>;
}

const SECRETS_FILE = path.join(process.cwd(), '.gateway_secrets.json');
const FIRESTORE_CFG_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents/settings/sms_config';
const DEFAULT_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';
const OTP_TTL_MS = 5 * 60 * 1000;

function readSecretsFile(): StoredGatewaySecrets {
  try {
    if (fs.existsSync(SECRETS_FILE)) {
      const raw = fs.readFileSync(SECRETS_FILE, 'utf-8');
      return JSON.parse(raw) || {};
    }
  } catch {
    // Fallback cleanly in read-only runtimes
  }
  return {};
}

function writeSecretsFile(next: StoredGatewaySecrets): boolean {
  try {
    const existing = readSecretsFile();
    const merged: StoredGatewaySecrets = {
      ...existing,
      ...next,
      sms: { ...(existing.sms || {}), ...(next.sms || {}) },
      payment: { ...(existing.payment || {}), ...(next.payment || {}) },
    };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function maskSecret(secret?: string): string {
  if (!secret) return '';
  const trimmed = secret.trim();
  if (trimmed.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(10, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

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

async function readRemoteConfig(): Promise<{
  template?: string;
  masking?: boolean;
  providerId?: SmsProviderId;
  providerName?: string;
  apiUrl?: string;
  senderId?: string;
  isLiveMode?: boolean;
}> {
  try {
    const r = await fetch(FIRESTORE_CFG_URL);
    if (!r.ok) return {};
    const j: any = await r.json();
    const f = j?.fields || {};
    return {
      template: f.otpTemplate?.stringValue,
      masking: f.maskingEnabled?.booleanValue,
      providerId: f.providerId?.stringValue as SmsProviderId | undefined,
      providerName: f.providerName?.stringValue,
      apiUrl: f.apiUrl?.stringValue,
      senderId: f.senderId?.stringValue,
      isLiveMode: f.isLiveMode?.booleanValue,
    };
  } catch {
    return {};
  }
}

const GATEWAY_HINTS: Record<string, string> = {
  '1018': 'API key দেওয়া হয়নি।',
  '1015': 'API key ভুল (Authorization failed)। Gateways ট্যাবে সঠিক API Key দিন।',
  '1014': 'গেটওয়ের সার্ভারে সমস্যা।',
  '1013': 'আপনার SMS প্যাকেজের মেয়াদ শেষ (Balance Validity)। রিচার্জ করুন।',
  '2001': 'ব্যালেন্স শেষ। রিচার্জ করুন।',
  '1012': 'মাসকিং SMS অবশ্যই বাংলা অক্ষরে পাঠাতে হয়।',
  '1011': 'এই Sender ID (ব্র্যান্ড নাম) আপনার একাউন্টে অনুমোদিত নেই।',
  '1010': 'আপনার SMS একাউন্ট বন্ধ করা আছে।',
  '1009': 'আপনার একাউন্ট এখনো ভেরিফাই হয়নি। প্রোভাইডারকে জানান।',
  '1008': 'IP whitelist চালু আছে। আপনার SMS প্যানেলে IP whitelist বন্ধ করুন।',
  '1006': 'মেসেজের লেখা গেটওয়ে গ্রহণ করেনি (Content Validation)।',
  '1005': 'SPAM হিসেবে ধরা পড়েছে।',
  '1003': 'রিকোয়েস্ট ব্যর্থ হয়েছে।',
};

function hintFor(g: { json: any; raw: string; httpStatus: number }): string {
  const code = String(g.json?.Status ?? g.json?.response_code ?? g.json?.error ?? '');
  const base = GATEWAY_HINTS[code];
  if (base) return `কোড ${code}: ${base}`;
  if (g.json?.Message || g.json?.error_message || g.json?.status_message) {
    return `কোড ${code || '?'}: ${g.json.Message || g.json.error_message || g.json.status_message}`;
  }
  return `গেটওয়ে অপ্রত্যাশিত উত্তর দিয়েছে (HTTP ${g.httpStatus}): ${String(g.raw).slice(0, 140)}`;
}

const isOk = (j: any, raw = '', httpStatus = 200): boolean => {
  if (j) {
    if (String(j.Success) === 'true' || String(j.Status) === '1000') return true;
    if (Number(j.response_code) === 202 || String(j.response_code) === '202') return true;
    if (j.error === 0 || String(j.status).toUpperCase() === 'SUCCESS') return true;
    if (j.status_code === 200 && String(j.status).toLowerCase() === 'success') return true;
  }
  if (httpStatus >= 200 && httpStatus < 300 && /ok:|sms submitted|success/i.test(raw)) {
    return true;
  }
  return false;
};

async function fetchGatewayUrl(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Keep raw text response
  }
  return { httpStatus: r.status, json, raw: text };
}

async function dispatchSmsByProvider(params: {
  providerId: SmsProviderId;
  apiUrl: string;
  apiKey: string;
  senderId: string;
  sid?: string;
  phone: string;
  message: string;
  isOtp: boolean;
}) {
  const { providerId, apiUrl, apiKey, senderId, sid, phone, message, isOtp } = params;
  const cleanBase = apiUrl.replace(/\/+$/, '');
  const intlPhone = phone.startsWith('88') ? phone : `88${phone}`;

  if (providerId === 'bulksmsdhaka') {
    const base = cleanBase || SMS_PROVIDER_PRESETS.bulksmsdhaka.defaultApiUrl;
    const endpoint = isOtp ? 'otpsend' : 'sendtext';
    const qs1 = new URLSearchParams({ apikey: apiKey, number: phone, message, callerID: senderId || '1234' }).toString();
    let g = await fetchGatewayUrl(`${base}/${endpoint}?${qs1}`);
    let usedCaller = senderId || '1234';
    if (!isOk(g.json, g.raw, g.httpStatus) && usedCaller !== '1234' && ['1011', '1012'].includes(String(g.json?.Status))) {
      const qs2 = new URLSearchParams({ apikey: apiKey, number: phone, message, callerID: '1234' }).toString();
      g = await fetchGatewayUrl(`${base}/${endpoint}?${qs2}`);
      usedCaller = '1234';
    }
    return { g, usedCaller };
  }

  if (providerId === 'bulksmsbd') {
    const base = cleanBase || SMS_PROVIDER_PRESETS.bulksmsbd.defaultApiUrl;
    const url = base.endsWith('smsapi') ? base : `${base}/smsapi`;
    const qs = new URLSearchParams({
      api_key: apiKey,
      type: 'text',
      number: intlPhone,
      senderid: senderId || '8809617613541',
      message,
    }).toString();
    const g = await fetchGatewayUrl(`${url}?${qs}`);
    return { g, usedCaller: senderId || 'default' };
  }

  if (providerId === 'greenweb') {
    const url = cleanBase || SMS_PROVIDER_PRESETS.greenweb.defaultApiUrl;
    const qs = new URLSearchParams({
      token: apiKey,
      to: intlPhone,
      message,
    }).toString();
    const g = await fetchGatewayUrl(`${url}?${qs}`);
    return { g, usedCaller: senderId || 'GreenWeb' };
  }

  if (providerId === 'alphasms') {
    const base = cleanBase || SMS_PROVIDER_PRESETS.alphasms.defaultApiUrl;
    const url = base.endsWith('sendsms') ? base : `${base}/sendsms`;
    const qs = new URLSearchParams({
      api_key: apiKey,
      msg: message,
      to: intlPhone,
      ...(senderId && senderId !== '1234' ? { sender_id: senderId } : {}),
    }).toString();
    const g = await fetchGatewayUrl(`${url}?${qs}`);
    return { g, usedCaller: senderId || 'AlphaSMS' };
  }

  if (providerId === 'sslwireless') {
    const url = cleanBase || SMS_PROVIDER_PRESETS.sslwireless.defaultApiUrl;
    const g = await fetchGatewayUrl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        api_token: apiKey,
        sid: sid || senderId || 'MARKETBD',
        msisdn: intlPhone,
        sms: message,
        csms_id: `MBD${Date.now()}`,
      }),
    });
    return { g, usedCaller: sid || senderId || 'SSLWireless' };
  }

  if (providerId === 'elitbuzz') {
    const url = cleanBase || SMS_PROVIDER_PRESETS.elitbuzz.defaultApiUrl;
    const qs = new URLSearchParams({
      api_key: apiKey,
      type: 'text',
      contacts: intlPhone,
      senderid: senderId || '8809612440000',
      msg: message,
    }).toString();
    const g = await fetchGatewayUrl(`${url}?${qs}`);
    return { g, usedCaller: senderId || 'Elitbuzz' };
  }

  if (providerId === 'muthofun') {
    const url = cleanBase || SMS_PROVIDER_PRESETS.muthofun.defaultApiUrl;
    const g = await fetchGatewayUrl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${apiKey}` },
      body: JSON.stringify({
        receiver: intlPhone,
        message,
        remove_duplicate: true,
        ...(senderId ? { sender_id: senderId } : {}),
      }),
    });
    return { g, usedCaller: senderId || 'MuthoFun' };
  }

  // Custom provider HTTP GET fallback supporting standard query conventions
  const qs = new URLSearchParams({
    apikey: apiKey,
    api_key: apiKey,
    number: phone,
    to: intlPhone,
    message,
    senderid: senderId || '1234',
    callerID: senderId || '1234',
  }).toString();
  const sep = cleanBase.includes('?') ? '&' : '?';
  const g = await fetchGatewayUrl(`${cleanBase}${sep}${qs}`);
  return { g, usedCaller: senderId || 'Custom' };
}

async function fetchBalanceByProvider(providerId: SmsProviderId, apiUrl: string, apiKey: string) {
  const cleanBase = apiUrl.replace(/\/+$/, '');
  if (providerId === 'bulksmsdhaka') {
    const base = cleanBase || SMS_PROVIDER_PRESETS.bulksmsdhaka.defaultApiUrl;
    const g = await fetchGatewayUrl(`${base}/getBalance?${new URLSearchParams({ apikey: apiKey })}`);
    return { ok: isOk(g.json, g.raw, g.httpStatus), balance: g.json?.Balance ?? null, g };
  }
  if (providerId === 'bulksmsbd') {
    const base = (cleanBase || SMS_PROVIDER_PRESETS.bulksmsbd.defaultApiUrl).replace(/\/smsapi$/, '');
    const g = await fetchGatewayUrl(`${base}/getBalanceApi?${new URLSearchParams({ api_key: apiKey })}`);
    return { ok: isOk(g.json, g.raw, g.httpStatus), balance: g.json?.balance ?? g.json?.Balance ?? null, g };
  }
  if (providerId === 'alphasms') {
    const base = (cleanBase || SMS_PROVIDER_PRESETS.alphasms.defaultApiUrl).replace(/\/sendsms$/, '');
    const g = await fetchGatewayUrl(`${base}/user/balance/?${new URLSearchParams({ api_key: apiKey })}`);
    return { ok: isOk(g.json, g.raw, g.httpStatus), balance: g.json?.data?.balance ?? g.json?.balance ?? null, g };
  }
  return {
    ok: false,
    balance: null,
    g: {
      httpStatus: 200,
      json: { Message: `${SMS_PROVIDER_PRESETS[providerId]?.companyName || 'এই প্রোভাইডার'} থেকে সরাসরি ব্যালেন্স API সমর্থিত নয় — প্রোভাইডার ড্যাশবোর্ডে দেখুন।` },
      raw: '',
    },
  };
}

function isAdminAuthorized(req: any, configuredSecret: string | undefined): boolean {
  const given = String(req.headers['x-admin-secret'] || '');
  if (!configuredSecret) return true; // Allows first-time setup before an admin secret is configured
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(configuredSecret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = String(body.action || '');
  const stored = readSecretsFile();
  const smsStored = stored.sms || {};

  const effectiveApiKey = (smsStored.apiKey || process.env.SMS_API_KEY || '').trim();
  const effectiveAdminSecret = (process.env.SMS_ADMIN_SECRET || smsStored.adminSecret || '').trim() || undefined;
  const otpSecret = (process.env.SMS_OTP_SECRET || effectiveApiKey || effectiveAdminSecret || 'marketbd_otp_fallback_key').trim();
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  try {
    // ---- 0a) Get non-secret SMS Gateway configuration -------------------
    if (action === 'get_config') {
      const remote = await readRemoteConfig();
      const providerId: SmsProviderId =
        smsStored.providerId || remote.providerId || 'bulksmsdhaka';
      const preset = SMS_PROVIDER_PRESETS[providerId] || SMS_PROVIDER_PRESETS.custom;

      return res.status(200).json({
        ok: true,
        config: {
          providerId,
          providerName: smsStored.providerName || remote.providerName || preset.companyName,
          apiUrl: smsStored.apiUrl || remote.apiUrl || preset.defaultApiUrl,
          senderId: smsStored.senderId || remote.senderId || process.env.SMS_CALLER_ID || 'MarketBD.Net',
          sid: smsStored.sid || '',
          maskingEnabled: smsStored.maskingEnabled ?? remote.masking ?? true,
          isLiveMode: smsStored.isLiveMode ?? remote.isLiveMode ?? true,
          otpTemplate: smsStored.otpTemplate || remote.template || process.env.SMS_OTP_TEMPLATE || DEFAULT_TEMPLATE,
          hasApiKey: effectiveApiKey.length > 0,
          maskedApiKey: maskSecret(effectiveApiKey),
          hasAdminSecret: Boolean(effectiveAdminSecret),
          presets: Object.values(SMS_PROVIDER_PRESETS),
        },
      });
    }

    // ---- 0b) Save SMS Provider & API Key configuration securely ---------
    if (action === 'save_config') {
      if (!isAdminAuthorized(req, effectiveAdminSecret)) {
        return res.status(401).json({
          ok: false,
          error: 'অ্যাডমিন সিক্রেট সঠিক নয়। সেভ করার আগে সঠিক অ্যাডমিন সিক্রেট লিখুন।',
        });
      }

      const providerId = (body.providerId as SmsProviderId) || smsStored.providerId || 'bulksmsdhaka';
      const preset = SMS_PROVIDER_PRESETS[providerId] || SMS_PROVIDER_PRESETS.custom;
      const nextApiKey =
        typeof body.apiKey === 'string' && body.apiKey.trim()
          ? body.apiKey.trim()
          : body.clearApiKey
          ? ''
          : smsStored.apiKey || '';
      const nextAdminSecret =
        typeof body.newAdminSecret === 'string' && body.newAdminSecret.trim()
          ? body.newAdminSecret.trim()
          : smsStored.adminSecret || '';

      const nextSms = {
        providerId,
        providerName: String(body.providerName || preset.companyName).trim(),
        apiUrl: String(body.apiUrl || preset.defaultApiUrl).trim(),
        apiKey: nextApiKey,
        senderId: String(body.senderId ?? smsStored.senderId ?? 'MarketBD.Net').trim(),
        sid: String(body.sid ?? smsStored.sid ?? '').trim(),
        maskingEnabled: typeof body.maskingEnabled === 'boolean' ? body.maskingEnabled : (smsStored.maskingEnabled ?? true),
        isLiveMode: typeof body.isLiveMode === 'boolean' ? body.isLiveMode : (smsStored.isLiveMode ?? true),
        otpTemplate: String(body.otpTemplate || smsStored.otpTemplate || DEFAULT_TEMPLATE).trim(),
        adminSecret: nextAdminSecret,
        updatedAt: new Date().toISOString(),
      };

      const persisted = writeSecretsFile({ sms: nextSms });
      const activeKey = (nextSms.apiKey || process.env.SMS_API_KEY || '').trim();

      return res.status(200).json({
        ok: true,
        persistedOnServer: persisted,
        config: {
          providerId: nextSms.providerId,
          providerName: nextSms.providerName,
          apiUrl: nextSms.apiUrl,
          senderId: nextSms.senderId,
          sid: nextSms.sid,
          maskingEnabled: nextSms.maskingEnabled,
          isLiveMode: nextSms.isLiveMode,
          otpTemplate: nextSms.otpTemplate,
          hasApiKey: activeKey.length > 0,
          maskedApiKey: maskSecret(activeKey),
          hasAdminSecret: Boolean(process.env.SMS_ADMIN_SECRET || nextSms.adminSecret),
        },
      });
    }

    // ---- 1) Send OTP to a customer -------------------------------------
    if (action === 'send_otp') {
      const phone = normalizePhone(body.phone);
      if (!phone) return res.status(400).json({ ok: false, error: 'সঠিক মোবাইল নম্বর দিন।' });
      if (tooMany(`ip:${ip}`, 8, 10 * 60 * 1000) || tooMany(`ph:${phone}`, 3, 10 * 60 * 1000)) {
        return res.status(429).json({ ok: false, error: 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' });
      }

      const remote = await readRemoteConfig();
      const isLive = smsStored.isLiveMode ?? remote.isLiveMode ?? true;
      const template = (smsStored.otpTemplate || remote.template || process.env.SMS_OTP_TEMPLATE || DEFAULT_TEMPLATE).trim();
      const masking = smsStored.maskingEnabled ?? remote.masking ?? !!process.env.SMS_CALLER_ID;
      const providerId: SmsProviderId = smsStored.providerId || remote.providerId || 'bulksmsdhaka';
      const preset = SMS_PROVIDER_PRESETS[providerId] || SMS_PROVIDER_PRESETS.custom;
      const apiUrl = smsStored.apiUrl || remote.apiUrl || preset.defaultApiUrl;
      const senderId = masking
        ? (smsStored.senderId || remote.senderId || process.env.SMS_CALLER_ID || 'MarketBD.Net')
        : '1234';

      const code = String(randomInt(100000, 1000000));
      const message = template.replace(/\{otp\}/gi, code);
      if (message.length > 70) {
        return res.status(500).json({ ok: false, error: 'OTP মেসেজ ৭০ অক্ষরের বেশি। অ্যাডমিন প্যানেলে টেমপ্লেট ছোট করুন।' });
      }

      if (isLive && !effectiveApiKey) {
        return res.status(503).json({
          ok: false,
          code: 'NOT_CONFIGURED',
          error: 'SMS API Key সেট করা নেই। অ্যাডমিন প্যানেলের Gateways ট্যাব থেকে প্রোভাইডার ও API Key সেট করুন।',
        });
      }

      if (isLive) {
        const { g } = await dispatchSmsByProvider({
          providerId,
          apiUrl,
          apiKey: effectiveApiKey,
          senderId,
          sid: smsStored.sid,
          phone,
          message,
          isOtp: true,
        });
        if (!isOk(g.json, g.raw, g.httpStatus)) {
          const hint = hintFor(g);
          console.error('SMS gateway failure:', hint, g.raw);
          const statusCode = String(g.json?.Status ?? g.httpStatus ?? 'N/A');
          return res.status(502).json({
            ok: false,
            error: `এসএমএস পাঠানো যায়নি (কোড ${statusCode})। প্রোভাইডার ও API Key যাচাই করুন।`,
            hint,
            gateway: g.json || g.raw,
          });
        }
      }

      const exp = Date.now() + OTP_TTL_MS;
      return res.status(200).json({
        ok: true,
        token: sign(otpSecret, phone, code, exp),
        exp,
        providerName: smsStored.providerName || preset.companyName,
        mode: isLive ? 'live' : 'sandbox',
      });
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
      if (!isAdminAuthorized(req, effectiveAdminSecret)) {
        return res.status(401).json({ ok: false, error: 'অ্যাডমিন সিক্রেট ভুল বা সেট করা নেই।' });
      }
      if (!effectiveApiKey) {
        return res.status(503).json({
          ok: false,
          code: 'NOT_CONFIGURED',
          error: 'SMS API Key সেট করা নেই। নিচের SMS API Key বক্সে আপনার কী দিয়ে সেভ করুন।',
        });
      }

      const remote = await readRemoteConfig();
      const providerId: SmsProviderId = smsStored.providerId || remote.providerId || 'bulksmsdhaka';
      const preset = SMS_PROVIDER_PRESETS[providerId] || SMS_PROVIDER_PRESETS.custom;
      const apiUrl = smsStored.apiUrl || remote.apiUrl || preset.defaultApiUrl;

      if (action === 'balance') {
        const resBal = await fetchBalanceByProvider(providerId, apiUrl, effectiveApiKey);
        return res.status(200).json({
          ok: resBal.ok,
          balance: resBal.balance,
          hint: resBal.ok ? undefined : hintFor(resBal.g),
          gateway: resBal.g.json || resBal.g.raw,
        });
      }

      const phone = normalizePhone(body.phone);
      const message = String(body.message || '').trim();
      if (!phone || !message) return res.status(400).json({ ok: false, error: 'নম্বর ও মেসেজ দিন।' });

      const masking = smsStored.maskingEnabled ?? remote.masking ?? !!process.env.SMS_CALLER_ID;
      const senderId = masking
        ? (smsStored.senderId || remote.senderId || process.env.SMS_CALLER_ID || 'MarketBD.Net')
        : '1234';
      const { g, usedCaller } = await dispatchSmsByProvider({
        providerId,
        apiUrl,
        apiKey: effectiveApiKey,
        senderId,
        sid: smsStored.sid,
        phone,
        message,
        isOtp: false,
      });
      const success = isOk(g.json, g.raw, g.httpStatus);
      return res.status(success ? 200 : 502).json({
        ok: success,
        usedCaller,
        providerName: smsStored.providerName || preset.companyName,
        hint: success ? undefined : hintFor(g),
        gateway: g.json || g.raw,
      });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err: any) {
    console.error('sms handler error', err);
    return res.status(500).json({ ok: false, error: 'সার্ভারে সমস্যা হয়েছে।' });
  }
}
