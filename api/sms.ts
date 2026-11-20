import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import fs from 'fs';
import os from 'os';
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
const TMP_SECRETS_FILE = path.join(os.tmpdir(), '.marketbd_gateway_secrets.json');
const FIRESTORE_CFG_URL =
  'https://firestore.googleapis.com/v1/projects/quantum-heading-1mbw7/databases/ai-studio-marketbd-58cc526e-10d5-498a-b77b-be2f1e9c76d1/documents/settings/sms_config';
const DEFAULT_TEMPLATE = 'Your MarketBD.Net OTP is {otp}';
const OTP_TTL_MS = 5 * 60 * 1000;

function readJsonSafe(filePath: string): StoredGatewaySecrets {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) || {};
    }
  } catch {
    // Ignore unreadable file
  }
  return {};
}

function readSecretsFile(): StoredGatewaySecrets {
  const base = readJsonSafe(SECRETS_FILE);
  const tmp = TMP_SECRETS_FILE !== SECRETS_FILE ? readJsonSafe(TMP_SECRETS_FILE) : {};
  const baseSmsTs = Date.parse(base.sms?.updatedAt || '') || 0;
  const tmpSmsTs = Date.parse(tmp.sms?.updatedAt || '') || 0;
  const sms = tmpSmsTs > baseSmsTs ? { ...(base.sms || {}), ...(tmp.sms || {}) } : { ...(tmp.sms || {}), ...(base.sms || {}) };
  const basePayTs = Date.parse(base.payment?.updatedAt || '') || 0;
  const tmpPayTs = Date.parse(tmp.payment?.updatedAt || '') || 0;
  const payment =
    tmpPayTs > basePayTs
      ? { ...(base.payment || {}), ...(tmp.payment || {}) }
      : { ...(tmp.payment || {}), ...(base.payment || {}) };
  return {
    ...(Object.keys(sms).length ? { sms } : {}),
    ...(Object.keys(payment).length ? { payment } : {}),
  };
}

function writeSecretsFile(next: StoredGatewaySecrets): { permanent: boolean; temp: boolean } {
  const existing = readSecretsFile();
  const merged: StoredGatewaySecrets = {
    ...existing,
    ...next,
    sms: { ...(existing.sms || {}), ...(next.sms || {}) },
    payment: { ...(existing.payment || {}), ...(next.payment || {}) },
  };
  const payload = JSON.stringify(merged, null, 2);

  try {
    fs.writeFileSync(SECRETS_FILE, payload, 'utf-8');
    return { permanent: true, temp: false };
  } catch {
    try {
      fs.writeFileSync(TMP_SECRETS_FILE, payload, 'utf-8');
      return { permanent: false, temp: true };
    } catch {
      return { permanent: false, temp: false };
    }
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

function sanitizeCallerId(raw?: string): string {
  const t = String(raw || '').trim();
  if (!t) return '';
  const cleaned = t.replace(/\s*\(.*$/, '').trim();
  return /^[\x20-\x7E]+$/.test(cleaned) ? cleaned : (cleaned.match(/\d{4,15}/)?.[0] || '');
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
  const rawStr = String(g.raw || '');
  if (/not whitelisted|access denied/i.test(rawStr)) {
    return 'গেটওয়ে সার্ভারের IP ব্লক করেছে (IP Whitelist চালু আছে)। BulkSMS Dhaka ড্যাশবোর্ডে গিয়ে IP Whitelist বন্ধ (OFF) করুন।';
  }
  const code = String(g.json?.Status ?? g.json?.response_code ?? g.json?.error_code ?? '');
  const base = GATEWAY_HINTS[code];
  if (base) return `কোড ${code}: ${base}`;
  if (g.httpStatus === 401) {
    return `কোড 401: API Key ভুল অথবা মেয়াদ শেষ (${g.json?.error || 'Unauthenticated'})।`;
  }
  if (g.json?.Message || g.json?.error_message || g.json?.status_message || g.json?.error || g.json?.message) {
    return `কোড ${code || g.httpStatus || '?'}: ${g.json.Message || g.json.error_message || g.json.status_message || g.json.error || g.json.message}`;
  }
  return `গেটওয়ে অপ্রত্যাশিত উত্তর দিয়েছে (HTTP ${g.httpStatus}): ${rawStr.slice(0, 140)}`;
}

const isOk = (j: any, raw = '', httpStatus = 200): boolean => {
  if (j && typeof j === 'object') {
    if (String(j.Success).toLowerCase() === 'false' || j.success === false) return false;
    if (String(j.Success).toLowerCase() === 'true' || j.success === true || String(j.Status) === '1000') return true;
    if (Number(j.response_code) === 202 || String(j.response_code) === '202') return true;
    if (j.error === 0 || String(j.status).toUpperCase() === 'SUCCESS') return true;
    if (j.status_code === 200 && String(j.status).toLowerCase() === 'success') return true;
    return false;
  }
  if (httpStatus >= 200 && httpStatus < 300 && /(?:^|\s)ok:|sms submitted|sms sent successfully/i.test(raw)) {
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

function isFatalGatewayStop(g: { httpStatus: number; json: any; raw: string }): boolean {
  if (g.httpStatus === 401) return true;
  const code = String(g.json?.Status ?? g.json?.response_code ?? '');
  if (['1015', '1018', '1013', '2001', '1010', '1009', '1008'].includes(code)) return true;
  if (/not whitelisted|unauthenticated|invalid api key/i.test(String(g.raw || ''))) return true;
  return false;
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
  otpCode?: string;
}) {
  const { providerId, apiUrl, apiKey, senderId, sid, phone, message, isOtp, otpCode } = params;
  const cleanBase = apiUrl.replace(/\/+$/, '');
  const intlPhone = phone.startsWith('88') ? phone : `88${phone}`;

  if (providerId === 'bulksmsdhaka') {
    const base = cleanBase || SMS_PROVIDER_PRESETS.bulksmsdhaka.defaultApiUrl;
    let usedEndpoint = isOtp ? 'otpsend' : 'sendtext';
    let usedCaller = senderId || '1234';

    const qs1 = new URLSearchParams({ apikey: apiKey, number: phone, message, callerID: usedCaller }).toString();
    let g = await fetchGatewayUrl(`${base}/${usedEndpoint}?${qs1}`);

    // 1) If masking/custom senderId fails on non-fatal error, immediately retry Non-Masking callerID '1234'
    if (!isOk(g.json, g.raw, g.httpStatus) && !isFatalGatewayStop(g) && usedCaller !== '1234') {
      const qs2 = new URLSearchParams({ apikey: apiKey, number: phone, message, callerID: '1234' }).toString();
      const g2 = await fetchGatewayUrl(`${base}/${usedEndpoint}?${qs2}`);
      if (isOk(g2.json, g2.raw, g2.httpStatus) || !isFatalGatewayStop(g2)) {
        g = g2;
        usedCaller = '1234';
      }
    }

    // 2) For OTP: if multiline/custom template is rejected by otpsend, retry clean single-line standard format
    const cleanOtpCode = otpCode || (message.match(/\b(\d{4,8})\b/)?.[1] ?? '');
    const cleanSingleLineOtp = cleanOtpCode ? `Your MarketBD.Net OTP is ${cleanOtpCode}` : message.replace(/\s+/g, ' ').trim();
    if (
      isOtp &&
      !isOk(g.json, g.raw, g.httpStatus) &&
      !isFatalGatewayStop(g) &&
      cleanSingleLineOtp !== message
    ) {
      const qs3 = new URLSearchParams({ apikey: apiKey, number: phone, message: cleanSingleLineOtp, callerID: '1234' }).toString();
      const g3 = await fetchGatewayUrl(`${base}/otpsend?${qs3}`);
      g = g3;
      usedCaller = '1234';
      usedEndpoint = 'otpsend';
    }

    // 3) If otpsend still fails for non-fatal reasons, fall back cleanly to sendtext with callerID '1234'
    if (isOtp && !isOk(g.json, g.raw, g.httpStatus) && !isFatalGatewayStop(g)) {
      const qs4 = new URLSearchParams({ apikey: apiKey, number: phone, message: cleanSingleLineOtp, callerID: '1234' }).toString();
      const g4 = await fetchGatewayUrl(`${base}/sendtext?${qs4}`);
      g = g4;
      usedCaller = '1234';
      usedEndpoint = 'sendtext';
    }

    return { g, usedCaller, usedEndpoint };
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

  const effectiveApiKey = (
    smsStored.apiKey ||
    process.env.SMS_API_KEY ||
    process.env.BULKSMS_API_KEY ||
    process.env.SMS_TOKEN ||
    ''
  ).trim();
  const effectiveAdminSecret = (process.env.SMS_ADMIN_SECRET || smsStored.adminSecret || '').trim() || undefined;
  const otpSecret = (process.env.SMS_OTP_SECRET || effectiveApiKey || effectiveAdminSecret || 'marketbd_otp_fallback_key').trim();
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  const resolveActiveConfig = async () => {
    const remote = await readRemoteConfig();
    const envProviderRaw = (process.env.SMS_PROVIDER_ID || process.env.SMS_PROVIDER || '').trim() as SmsProviderId | '';
    const envProviderId = envProviderRaw && SMS_PROVIDER_PRESETS[envProviderRaw] ? envProviderRaw : undefined;
    const providerId: SmsProviderId = smsStored.providerId || envProviderId || remote.providerId || 'bulksmsdhaka';
    const preset = SMS_PROVIDER_PRESETS[providerId] || SMS_PROVIDER_PRESETS.custom;

    const envApiUrl = (process.env.SMS_API_URL || '').trim();
    const apiUrl = smsStored.apiUrl || envApiUrl || (!envProviderId ? remote.apiUrl : '') || preset.defaultApiUrl;

    const envSenderId = sanitizeCallerId(process.env.SMS_SENDER_ID || process.env.SMS_CALLER_ID);
    const storedSenderId = sanitizeCallerId(smsStored.senderId);
    const remoteSenderId = sanitizeCallerId(remote.senderId);
    const envMasking =
      process.env.SMS_MASKING_ENABLED === 'false'
        ? false
        : process.env.SMS_MASKING_ENABLED === 'true'
        ? true
        : undefined;
    const masking =
      smsStored.maskingEnabled ??
      envMasking ??
      (envSenderId ? envSenderId !== '1234' : undefined) ??
      remote.masking ??
      false;

    const nonMaskingSender =
      (storedSenderId && storedSenderId !== 'MarketBD.Net' ? storedSenderId : '') ||
      (envSenderId && envSenderId !== 'MarketBD.Net' ? envSenderId : '') ||
      '1234';
    const senderId = masking
      ? (storedSenderId || envSenderId || remoteSenderId || 'MarketBD.Net')
      : nonMaskingSender;

    const envLive =
      process.env.SMS_LIVE_MODE === 'false'
        ? false
        : process.env.SMS_LIVE_MODE === 'true'
        ? true
        : undefined;
    const isLive = smsStored.isLiveMode ?? envLive ?? remote.isLiveMode ?? true;

    const envTemplate = (process.env.SMS_OTP_TEMPLATE || '').replace(/\\n/g, '\n').trim();
    const otpTemplate = (smsStored.otpTemplate || envTemplate || remote.template || DEFAULT_TEMPLATE).trim();
    const sid = (smsStored.sid || process.env.SMS_SID || '').trim();

    return {
      providerId,
      preset,
      providerName: smsStored.providerName || preset.companyName,
      apiUrl,
      senderId,
      sid,
      masking,
      isLive,
      otpTemplate,
    };
  };

  try {
    // ---- 0a) Get non-secret SMS Gateway configuration -------------------
    if (action === 'get_config') {
      const cfg = await resolveActiveConfig();

      return res.status(200).json({
        ok: true,
        config: {
          providerId: cfg.providerId,
          providerName: cfg.providerName,
          apiUrl: cfg.apiUrl,
          senderId: cfg.senderId,
          sid: cfg.sid,
          maskingEnabled: cfg.masking,
          isLiveMode: cfg.isLive,
          otpTemplate: cfg.otpTemplate,
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
        senderId: sanitizeCallerId(body.senderId ?? smsStored.senderId ?? '1234') || '1234',
        sid: String(body.sid ?? smsStored.sid ?? '').trim(),
        maskingEnabled: typeof body.maskingEnabled === 'boolean' ? body.maskingEnabled : (smsStored.maskingEnabled ?? true),
        isLiveMode: typeof body.isLiveMode === 'boolean' ? body.isLiveMode : (smsStored.isLiveMode ?? true),
        otpTemplate: String(body.otpTemplate || smsStored.otpTemplate || DEFAULT_TEMPLATE).trim(),
        adminSecret: nextAdminSecret,
        updatedAt: new Date().toISOString(),
      };

      const persisted = writeSecretsFile({ sms: nextSms });
      const hasEnvApiKey = Boolean(
        (process.env.SMS_API_KEY || process.env.BULKSMS_API_KEY || process.env.SMS_TOKEN || '').trim()
      );
      const tryingNewApiKey = typeof body.apiKey === 'string' && body.apiKey.trim().length > 0;
      const activeKey = (nextSms.apiKey || process.env.SMS_API_KEY || process.env.BULKSMS_API_KEY || process.env.SMS_TOKEN || '').trim();

      const readOnlyWarning =
        hasEnvApiKey && !tryingNewApiKey
          ? 'আপনার SMS_API_KEY Vercel-এ ইতিমধ্যেই সেট করা আছে ✅। বর্তমান সার্ভার সেশনে নতুন সেটিংস চালু হয়েছে; রিস্টার্ট বা পরের ডিপ্লয়ের পরও স্থায়ী রাখতে Vercel → Project Settings → Environment Variables-এ SMS_MASKING_ENABLED, SMS_CALLER_ID এবং SMS_OTP_TEMPLATE যোগ করুন।'
          : 'এই হোস্টিংয়ের ফাইল সিস্টেম Read-Only (যেমন Vercel)। বর্তমান সেশনে চালু থাকলেও স্থায়ীভাবে সংরক্ষণ করতে Vercel → Project Settings → Environment Variables-এ SMS_API_KEY (এবং চাইলে SMS_MASKING_ENABLED, SMS_CALLER_ID, SMS_OTP_TEMPLATE) যোগ করে Redeploy করুন।';

      return res.status(200).json({
        ok: true,
        persistedOnServer: persisted.permanent,
        savedInSession: persisted.temp,
        ...(persisted.permanent ? {} : { warning: readOnlyWarning }),
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

      const cfg = await resolveActiveConfig();
      const code = String(randomInt(100000, 1000000));
      let message = cfg.otpTemplate.replace(/\{otp\}/gi, code);
      if (message.length > 70) {
        message = `Your MarketBD.Net OTP is ${code}`;
      }

      if (cfg.isLive && !effectiveApiKey) {
        return res.status(503).json({
          ok: false,
          code: 'NOT_CONFIGURED',
          error: 'SMS API Key সেট করা নেই। অ্যাডমিন প্যানেলের Gateways ট্যাব থেকে প্রোভাইডার ও API Key সেট করুন।',
        });
      }

      let usedCaller = cfg.senderId;
      let usedEndpoint = 'otpsend';

      if (cfg.isLive) {
        const dispatched = await dispatchSmsByProvider({
          providerId: cfg.providerId,
          apiUrl: cfg.apiUrl,
          apiKey: effectiveApiKey,
          senderId: cfg.senderId,
          sid: cfg.sid,
          phone,
          message,
          isOtp: true,
          otpCode: code,
        });
        const g = dispatched.g;
        usedCaller = dispatched.usedCaller;
        usedEndpoint = (dispatched as any).usedEndpoint || 'otpsend';

        if (!isOk(g.json, g.raw, g.httpStatus)) {
          const hint = hintFor(g);
          console.error('SMS gateway failure:', hint, g.raw);
          const statusCode = String(g.json?.Status ?? g.httpStatus ?? 'N/A');
          return res.status(502).json({
            ok: false,
            error: `এসএমএস পাঠানো যায়নি (${hint || `কোড ${statusCode}`})।`,
            hint,
            usedCaller,
            usedEndpoint,
            gateway: g.json || g.raw,
          });
        }
      }

      const exp = Date.now() + OTP_TTL_MS;
      return res.status(200).json({
        ok: true,
        token: sign(otpSecret, phone, code, exp),
        exp,
        providerName: cfg.providerName,
        usedCaller,
        usedEndpoint,
        mode: cfg.isLive ? 'live' : 'sandbox',
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
    if (action === 'admin_test_otp') {
      if (!isAdminAuthorized(req, effectiveAdminSecret)) {
        return res.status(401).json({ ok: false, error: 'অ্যাডমিন সিক্রেট ভুল বা সেট করা নেই।' });
      }
      const phone = normalizePhone(body.phone);
      if (!phone) return res.status(400).json({ ok: false, error: 'সঠিক মোবাইল নম্বর দিন।' });

      const cfg = await resolveActiveConfig();
      const testKey = (typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : effectiveApiKey).trim();
      const testProviderId = (body.providerId as SmsProviderId) || cfg.providerId;
      const testPreset = SMS_PROVIDER_PRESETS[testProviderId] || SMS_PROVIDER_PRESETS.custom;
      const testApiUrl = String(body.apiUrl || cfg.apiUrl || testPreset.defaultApiUrl).trim();
      const testMasking = typeof body.maskingEnabled === 'boolean' ? body.maskingEnabled : cfg.masking;
      const rawTestSender = sanitizeCallerId(body.senderId) || cfg.senderId;
      const testSender = testMasking
        ? (rawTestSender || 'MarketBD.Net')
        : (rawTestSender && rawTestSender !== 'MarketBD.Net' ? rawTestSender : '1234');
      const testTemplate = String(body.otpTemplate || cfg.otpTemplate || DEFAULT_TEMPLATE).trim();
      const testIsLive = typeof body.isLiveMode === 'boolean' ? body.isLiveMode : cfg.isLive;

      if (testIsLive && !testKey) {
        return res.status(503).json({
          ok: false,
          code: 'NOT_CONFIGURED',
          error: 'Vercel Environment Variables-এ SMS_API_KEY সেট করা নেই (অথবা উপরের SMS API Key বক্সে কী দিয়ে টেস্ট করুন)।',
        });
      }

      const code = String(randomInt(100000, 1000000));
      let message = testTemplate.replace(/\{otp\}/gi, code);
      if (message.length > 70) {
        message = `Your MarketBD.Net OTP is ${code}`;
      }

      let usedCaller = testSender;
      let usedEndpoint = 'otpsend';
      if (testIsLive) {
        const dispatched = await dispatchSmsByProvider({
          providerId: testProviderId,
          apiUrl: testApiUrl,
          apiKey: testKey,
          senderId: testSender,
          sid: String(body.sid ?? cfg.sid ?? '').trim(),
          phone,
          message,
          isOtp: true,
          otpCode: code,
        });
        const g = dispatched.g;
        usedCaller = dispatched.usedCaller;
        usedEndpoint = (dispatched as any).usedEndpoint || 'otpsend';

        if (!isOk(g.json, g.raw, g.httpStatus)) {
          const hint = hintFor(g);
          return res.status(502).json({
            ok: false,
            error: `টেস্ট OTP পাঠানো যায়নি (${hint})।`,
            hint,
            usedCaller,
            usedEndpoint,
            gateway: g.json || g.raw,
          });
        }
      }

      return res.status(200).json({
        ok: true,
        providerName: testPreset.companyName,
        usedCaller,
        usedEndpoint,
        mode: testIsLive ? 'live' : 'sandbox',
      });
    }

    if (action === 'balance' || action === 'send_text') {
      if (!isAdminAuthorized(req, effectiveAdminSecret)) {
        return res.status(401).json({ ok: false, error: 'অ্যাডমিন সিক্রেট ভুল বা সেট করা নেই।' });
      }
      if (!effectiveApiKey) {
        return res.status(503).json({
          ok: false,
          code: 'NOT_CONFIGURED',
          error: 'SMS API Key সেট করা নেই। Vercel Settings → Environment Variables-এ SMS_API_KEY যোগ করুন।',
        });
      }

      const cfg = await resolveActiveConfig();

      if (action === 'balance') {
        const resBal = await fetchBalanceByProvider(cfg.providerId, cfg.apiUrl, effectiveApiKey);
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

      const { g, usedCaller } = await dispatchSmsByProvider({
        providerId: cfg.providerId,
        apiUrl: cfg.apiUrl,
        apiKey: effectiveApiKey,
        senderId: cfg.senderId,
        sid: cfg.sid,
        phone,
        message,
        isOtp: false,
      });
      const success = isOk(g.json, g.raw, g.httpStatus);
      return res.status(success ? 200 : 502).json({
        ok: success,
        usedCaller,
        providerName: cfg.providerName,
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
